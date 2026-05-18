import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Share,
  Linking,
  Animated,
  Vibration,
} from 'react-native';
import Toast from 'react-native-toast-message';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  X,
  ChevronDown,
  Calendar,
  FileText,
  ScanText,
  Camera,
  Eye,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ScanLine,
} from 'lucide-react-native';

import { useSupplier } from '../../hooks/useSupplier';
import { canUseFeature } from '../../utils/subscriptionHelpers';
import { loadSubscription } from '../../store/slices/subscriptionSlice';
import type { AppDispatch } from '../../store';
import { getMimeType } from '../../utils/helpers';
import { CreateSupplierModal } from '../../screens/home/Suppliers';
import type { Account, Category, Supplier, ExpenseItem, ExpenseFormValues } from '../../types/expense.types';
import { PAYMENT_METHODS } from '../../types/invoice.types';
import { styles } from '../../styles/expenses.styles';
import { CATEGORY_KEY_MAP, resolveCategoryKey } from '../../utils/expense.helpers';
import { useUpgradeWebView } from '../../utils/upgradeWebView';
import { showPremiumToast } from '../../utils/premiumToast';
import PremiumSuccessCelebration from '../common/PremiumSuccessCelebration';
import { SuccessMorphButton } from '../common/PremiumMotion';
import { OCR_EXPENSE_ENDPOINT } from '../../config';

const OCR_API_URL = OCR_EXPENSE_ENDPOINT;

const expenseSchema = yup.object({
  date: yup.string().required('Date is required'),
  amountTTC: yup
    .string()
    .required('Amount TTC is required')
    .test('is-positive', 'Amount must be greater than 0', v => parseFloat(v ?? '0') > 0),
  amountTVA: yup
    .string()
    .default('0')
    .test('is-non-negative', 'TVA must be ≥ 0', v => !v || parseFloat(v) >= 0),
  accountId: yup
    .string()
    .typeError('Payment method is required')
    .required('Payment method is required'),
  categoryId: yup
    .number()
    .typeError('Category is required')
    .required('Category is required')
    .positive('Category is required'),
  supplierId: yup.number().typeError('Supplier is required').required('Supplier is required').positive('Supplier is required'),
  expenseReference: yup.string().nullable().optional(),
  description: yup.string().nullable().optional(),
});

type OcrItem = {
  name?: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
};

type OcrSuggestion = {
  date?: string;
  amountTTC?: string;
  amountTVA?: string;
  paymentMethod?: string;
  supplierName?: string;
  categoryName?: string;
  confidenceScore?: number;
  warnings?: string[];
  reference?: string;
  description?: string;
  items?: OcrItem[];
  duplicateWarning?: string;
  supplierData?: any;
};

interface CreateExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  suppliers: Supplier[];
  customerId: number;
  onCreated: () => void;
  onSave: (payload: any) => Promise<{ success: boolean; error?: string }>;
  editItem?: ExpenseItem;
  onUpdate?: (id: number, payload: any) => Promise<{ success: boolean; error?: string }>;
  onSuppliersRefresh?: () => void;
  defaultSupplierId?: number;
  expenses?: ExpenseItem[];
  ocrSupplierData?: any;
}

const normalizeText = (value: any) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const includesAny = (text: string, keywords: string[]) =>
  keywords.some(k => text.includes(normalizeText(k)));

const pickFirst = (...values: any[]) =>
  values.find(value => value !== undefined && value !== null && String(value).trim() !== '');

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
  visible,
  onClose,
  accounts,
  categories,
  suppliers,
  customerId,
  onCreated,
  onSave,
  editItem,
  onUpdate,
  onSuppliersRefresh,
  defaultSupplierId,
  expenses = [],
  ocrSupplierData,
}) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { getSuppliers } = useSupplier();
  const dispatch = useDispatch<AppDispatch>();
  const { openUpgradeWebView, upgradeWebViewElement } = useUpgradeWebView(onClose);
  const subscription = useSelector((state: any) => state.subscription.data);
  const storageExhausted = (subscription?.usage?.storage?.remaining_mb ?? 1) <= 0;
  const upgradeUrl = subscription?.upgrade_url;

  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>(suppliers);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [removedExistingDocument, setRemovedExistingDocument] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
  const ACCEPTED_OCR_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
  const ACCEPTED_OCR_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [pendingSupplierName, setPendingSupplierName] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [ocrSuggestion, setOcrSuggestion] = useState<OcrSuggestion | null>(null);
  const [ocrRaw, setOcrRaw] = useState<any>(null);
  const [ocrApplied, setOcrApplied] = useState(false);
  const [ocrSuccessVisible, setOcrSuccessVisible] = useState(false);
  const [ocrLoadingStep, setOcrLoadingStep] = useState(0);
  const ocrPulse = useRef(new Animated.Value(1)).current;
  const ocrScanLine = useRef(new Animated.Value(0)).current;
  const [supplierPrefillValues, setSupplierPrefillValues] = useState<any>(undefined);
  const [applyingOCRSupplier, setApplyingOCRSupplier] = useState(false);
  const appliedRouteOcrSupplierKey = useRef<string | null>(null);

  const [showSupplierSearch, setShowSupplierSearch] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [supplierSearchResults, setSupplierSearchResults] = useState<Supplier[] | null>(null);
  const [supplierSearchLoading, setSupplierSearchLoading] = useState(false);
  const supplierSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ExpenseFormValues & { expenseReference?: string; description?: string }>({
    resolver: yupResolver(expenseSchema) as any,
    mode: 'onChange',
    defaultValues: {
      date: '',
      amountTTC: '',
      amountTVA: '',
      accountId: undefined,
      categoryId: undefined,
      supplierId: undefined,
      expenseReference: '',
      description: '',
    },
  });

  const watchedDate = watch('date');
  const watchedAmountTTC = watch('amountTTC') ?? '';
  const watchedAmountTVA = watch('amountTVA') ?? '';
  const watchedAccountId = watch('accountId');
  const watchedCategoryId = watch('categoryId');
  const watchedSupplierId = watch('supplierId');

  const selectedPaymentMethod = PAYMENT_METHODS.find(p => p.key === watchedAccountId) ?? null;
  const pmLabel = (p: { key: string; fr: string; en: string; ar: string }) =>
    i18n.language.startsWith('ar') ? p.ar : i18n.language.startsWith('fr') ? p.fr : p.en;
  const selectedCategory = (categories as Category[]).find(c => c.id === watchedCategoryId) ?? null;
  const selectedSupplier = localSuppliers.find(s => s.id === watchedSupplierId) ?? null;

  const ttcDisplay = parseFloat(watchedAmountTTC) || 0;
  const tvaDisplay = parseFloat(watchedAmountTVA) || 0;

  const normalizeAmount = (value: any) => {
    if (value === null || value === undefined) return '';
    return String(value).replace(',', '.').replace(/[^\d.]/g, '');
  };

  const normalizeDate = (value: any) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const frMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (frMatch) {
      const [, d, m, y] = frMatch;
      return `${y}-${m}-${d}`;
    }
    return raw;
  };

  const triggerLightHaptic = () => {
    Vibration.vibrate(Platform.OS === 'ios' ? 10 : 18);
  };

  const showSupplierSelectedFeedback = () => {
    triggerLightHaptic();
    Toast.show({
      type: 'success',
      text1: t('success_title'),
      text2: t('ocr_supplier_detected_selected', { defaultValue: 'Supplier detected and selected' }),
    });
  };

  const getOcrData = (response: any) =>
    response?.extracted ||
    response?.data ||
    response?.result ||
    response?.expense ||
    response;

  const getOcrSupplierSource = (data: any) =>
    data?.supplier && typeof data.supplier === 'object'
      ? { ...data.supplier, ...data }
      : data;

  const buildSupplierPrefillFromOcr = (rawData: any) => {
    const data = getOcrSupplierSource(rawData ?? {});
    const supplierName = pickFirst(
      data?.supplier_name,
      data?.supplierName,
      data?.vendor_name,
      data?.merchant_name,
      typeof data?.supplier === 'string' ? data.supplier : '',
      data?.vendor,
      data?.merchant
    );
    const companyName = pickFirst(
      data?.company_name,
      data?.legal_name,
      data?.companyName,
      data?.legalName,
      data?.supplier_company_name,
      supplierName
    );

    return {
      supplierName: supplierName ? String(supplierName) : '',
      companyName: companyName ? String(companyName) : '',
      ice: String(pickFirst(data?.ice, data?.ICE) ?? ''),
      ifNumber: String(pickFirst(data?.ifNumber, data?.if, data?.IF, data?.if_number, data?.tax_id, data?.identifiant_fiscal) ?? ''),
      commercialRegister: String(pickFirst(data?.commercialRegister, data?.rc, data?.RC, data?.commercial_register, data?.registre_commerce) ?? ''),
      cnss: String(pickFirst(data?.cnss, data?.CNSS) ?? ''),
      telephone: String(pickFirst(data?.telephone, data?.phone, data?.tel, data?.mobile) ?? ''),
      email: String(pickFirst(data?.email, data?.mail) ?? ''),
      address: String(pickFirst(data?.address, data?.adresse, data?.billing_address, data?.street) ?? ''),
      city: String(pickFirst(data?.city, data?.ville) ?? ''),
      postalCode: String(pickFirst(data?.postalCode, data?.postal_code, data?.zip) ?? ''),
    };
  };

  const getCreatedSupplierId = (createdSupplier: any) =>
    createdSupplier?.id ??
    createdSupplier?.supplier?.id ??
    createdSupplier?.data?.id ??
    createdSupplier?.data?.supplier?.id;

  const normalizeCreatedSupplier = (createdSupplier: any): Supplier | null => {
    const source = createdSupplier?.supplier ?? createdSupplier?.data?.supplier ?? createdSupplier?.data ?? createdSupplier;
    const id = getCreatedSupplierId(source);
    if (!id) return null;
    return {
      id,
      name: source?.name || source?.supplier_name || source?.company_name || pendingSupplierName || supplierPrefillValues?.supplierName || '',
    };
  };

  const isAcceptedOcrFile = (file: any) => {
    const fileName = String(file?.name || file?.fileName || '').toLowerCase();
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    const mime = String(file?.type || getMimeType(fileName) || '').toLowerCase();

    return (
      ACCEPTED_OCR_MIME_TYPES.includes(mime) ||
      (!!extension && ACCEPTED_OCR_EXTENSIONS.includes(extension))
    );
  };

  const validateOcrFile = (file: any) => {
    const fileSize = file?.size ?? file?.fileSize;
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      triggerLightHaptic();
      setFileSizeError(true);
      Alert.alert(t('error_title'), t('error_file_too_large'));
      return false;
    }
    if (!isAcceptedOcrFile(file)) {
      Alert.alert(
        t('error_title'),
        t('ocr_unsupported_file_type', { defaultValue: 'Please upload a JPG, PNG, WEBP, or PDF file.' })
      );
      return false;
    }
    setFileSizeError(false);
    if (String(file?.type || '').toLowerCase() === 'application/pdf' || String(file?.name || '').toLowerCase().endsWith('.pdf')) {
      triggerLightHaptic();
      showPremiumToast('info', t('ocr_pdf_accepted_title', { defaultValue: 'PDF accepted' }), t('ocr_pdf_accepted_message', { defaultValue: 'We will analyze it with OCR.' }));
    }
    return true;
  };

  const getCategoryKeywordsTarget = (sourceText: string) => {
    const text = normalizeText(sourceText);

    const rules: Array<{ keywords: string[]; targets: string[] }> = [
      {
        keywords: ['restaurant', 'restauration', 'brunch', 'cafe', 'coffee', 'beldi', 'meal', 'meals', 'entertainment', 'hotel', 'food', 'snack'],
        targets: ['Restaurant', 'Meals and Entertainment', 'Meals & Entertainment'],
      },
      {
        keywords: ['carburant', 'fuel', 'essence', 'diesel', 'station', 'shell', 'afriquia', 'totalenergies', 'winxo'],
        targets: ['Carburant / Transport', 'Carburant', 'Transport'],
      },
      {
        keywords: ['taxi', 'transport', 'train', 'oncf', 'tram', 'bus', 'parking', 'peage', 'autoroute'],
        targets: ['Transport', 'Carburant / Transport'],
      },
      {
        keywords: ['internet', 'telecom', 'orange', 'inwi', 'maroc telecom', 'wifi', 'fibre'],
        targets: ['Internet'],
      },
      {
        keywords: ['logiciel', 'software', 'cloud', 'hosting', 'serveur', 'subscription', 'abonnement', 'openai', 'google cloud', 'aws', 'azure', 'saas'],
        targets: ['Logiciels / Abonnements', 'Cloud Services'],
      },
      {
        keywords: ['marketing', 'publicite', 'ads', 'facebook', 'instagram', 'meta', 'google ads', 'tiktok'],
        targets: ['Marketing / Publicités'],
      },
      {
        keywords: ['fourniture', 'fournitures', 'papier', 'stylo', 'office', 'bureau', 'printer', 'imprimante'],
        targets: ['Fournitures', 'Office Supplies'],
      },
      {
        keywords: ['loyer', 'rent', 'bail'],
        targets: ['Loyer'],
      },
      {
        keywords: ['eau', 'electricite', 'lydec', 'onee', 'radeema'],
        targets: ['Eau / Électricité'],
      },
      {
        keywords: ['salaire', 'salaires', 'paie', 'cnss'],
        targets: ['Salaires'],
      },
      {
        keywords: ['banque', 'assurance', 'bank', 'insurance', 'frais bancaire'],
        targets: ['Banque / Assurance'],
      },
      {
        keywords: ['comptable', 'juridique', 'avocat', 'notaire', 'honoraire', 'legal'],
        targets: ['Comptable / Juridiques'],
      },
      {
        keywords: ['impot', 'taxe', 'taxes', 'dgi'],
        targets: ['Impôts / Taxes'],
      },
      {
        keywords: ['maintenance', 'reparation', 'repair', 'entretien'],
        targets: ['Maintenance / Réparation'],
      },
    ];

    const matchedRule = rules.find(rule => includesAny(text, rule.keywords));
    return matchedRule?.targets ?? ['Autres dépenses', 'Autre'];
  };

  const findCategoryByOcr = (categoryName?: string, supplierName?: string, description?: string) => {
    if (!categories?.length) return null;

    const categoryText = normalizeText(categoryName);
    const searchText = `${categoryName ?? ''} ${supplierName ?? ''} ${description ?? ''}`;

    const exactOrContains = categories.find((c: any) => {
      const name = normalizeText(c.name);
      return name === categoryText || name.includes(categoryText) || categoryText.includes(name);
    });

    if (exactOrContains && categoryText && categoryText !== 'autre') return exactOrContains;

    const targetNames = getCategoryKeywordsTarget(searchText);
    for (const target of targetNames) {
      const targetNorm = normalizeText(target);
      const found = categories.find((c: any) => {
        const name = normalizeText(c.name);
        return name === targetNorm || name.includes(targetNorm) || targetNorm.includes(name);
      });
      if (found) return found;
    }

    const fallback = categories.find((c: any) => {
      const name = normalizeText(c.name);
      return ['autres depenses', 'autre'].includes(name);
    });

    return fallback ?? null;
  };

  const findSupplier = (supplierName?: string) => {
    if (!supplierName || !localSuppliers?.length) return null;
    const supplier = normalizeText(supplierName);

    return localSuppliers.find((s: any) => {
      const name = normalizeText(s.name || s.supplier_name || s.company_name);
      return name === supplier || name.includes(supplier) || supplier.includes(name);
    }) ?? null;
  };

  const findPayment = (paymentMethod?: string) => {
    if (!paymentMethod) return null;
    const payment = normalizeText(paymentMethod);

    return PAYMENT_METHODS.find(p => {
      const key = normalizeText(p.key);
      const fr = normalizeText(p.fr);
      const en = normalizeText(p.en);

      const synonyms: Record<string, string[]> = {
        cash: ['cash', 'espece', 'espèces', 'liquide'],
        carte: ['carte', 'card', 'cb', 'visa', 'mastercard', 'tpe'],
        virement: ['virement', 'transfer', 'bank transfer', 'wire'],
      };

      const values = [key, fr, en, ...(synonyms[key] ?? [])].map(normalizeText);
      return values.some(v => v && (payment === v || payment.includes(v) || v.includes(payment)));
    }) ?? null;
  };

  const buildDescriptionFromItems = (data: any) => {
    const items = data?.items || data?.articles || data?.line_items || data?.products || [];
    if (data?.description) return String(data.description);

    if (Array.isArray(items) && items.length > 0) {
      return items
        .map((item: any) => {
          const name = item?.name || item?.label || item?.description || 'Article';
          const qty = item?.quantity || item?.qty || 1;
          const total = item?.total || item?.amount || item?.price || '';
          return `- ${name} x${qty}${total ? ` — ${total} MAD` : ''}`;
        })
        .join('\n');
    }

    return data?.supplier_name ? `Dépense chez ${data.supplier_name}` : '';
  };

  const detectDuplicate = (date?: string, amount?: string, supplierName?: string) => {
    if (!expenses?.length || !date || !amount) return '';

    const amountNumber = parseFloat(normalizeAmount(amount)) || 0;
    const supplierNorm = normalizeText(supplierName);

    const found = expenses.find((expense: any) => {
      const expenseDate = String(expense.date || '').split('T')[0];
      const expenseAmount = parseFloat(String(expense.ttc || expense.total_ttc || 0)) || 0;
      const expenseSupplier = normalizeText(expense.supplier?.name || expense.supplier_name || expense.supplier?.company_name);

      const sameDate = expenseDate === date;
      const sameAmount = Math.abs(expenseAmount - amountNumber) < 0.01;
      const sameSupplier = !supplierNorm || !expenseSupplier || expenseSupplier.includes(supplierNorm) || supplierNorm.includes(expenseSupplier);

      return sameDate && sameAmount && sameSupplier;
    });

    return found ? 'Dépense potentiellement déjà ajoutée : même date, même montant et même fournisseur.' : '';
  };

  const buildOcrSuggestion = (response: any, file?: any): OcrSuggestion => {
    const data = getOcrData(response);
    const supplierPrefill = buildSupplierPrefillFromOcr(data);

    const date = normalizeDate(
      data?.date ||
      data?.invoice_date ||
      data?.expense_date ||
      data?.document_date
    );

    const amountTTC = normalizeAmount(
      data?.amountTTC ||
      data?.amount_ttc ||
      data?.total_ttc ||
      data?.ttc ||
      data?.amount ||
      data?.total ||
      data?.total_amount
    );

    const amountTVA = normalizeAmount(
      data?.amountTVA ??
      data?.amount_tva ??
      data?.total_tva ??
      data?.tva ??
      data?.vat ??
      data?.tax ??
      0
    );

    const supplierName =
      supplierPrefill.supplierName ||
      (typeof data?.supplier === 'string' ? data.supplier : '') ||
      data?.vendor ||
      data?.merchant ||
      '';

    const categoryName =
      data?.category_label ||
      data?.category ||
      data?.category_name ||
      data?.expense_category ||
      '';

    const description = buildDescriptionFromItems(data);
    const reference =
      data?.reference ||
      data?.invoice_reference ||
      data?.receipt_number ||
      file?.name ||
      file?.fileName ||
      '';

    return {
      date,
      amountTTC,
      amountTVA,
      paymentMethod: data?.payment_method || data?.paymentMethod || data?.mode_paiement || data?.payment || '',
      supplierName,
      categoryName,
      confidenceScore: typeof data?.confidence_score === 'number' ? data.confidence_score : undefined,
      warnings: Array.isArray(data?.warnings) ? data.warnings : [],
      reference,
      description,
      items: data?.items || data?.articles || data?.line_items || data?.products || [],
      duplicateWarning: detectDuplicate(date, amountTTC, supplierName),
      supplierData: supplierPrefill,
    };
  };

  const applySupplierFromOcr = (rawSupplierData: any, fallbackName?: string) => {
    const prefill = {
      ...buildSupplierPrefillFromOcr(rawSupplierData),
      ...(rawSupplierData?.supplierName || rawSupplierData?.supplier_name ? {} : { supplierName: fallbackName ?? '' }),
    };
    const detectedName = prefill.supplierName || fallbackName;

    if (!detectedName) return;

    const matchedSupplier = findSupplier(detectedName);
    if (matchedSupplier) {
      setValue('supplierId', matchedSupplier.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      showSupplierSelectedFeedback();
      return;
    }

    setPendingSupplierName(String(detectedName));
    setSupplierPrefillValues({
      ...prefill,
      companyName: prefill.companyName || String(detectedName),
      supplierName: prefill.supplierName || String(detectedName),
    });
    triggerLightHaptic();
    setShowCreateSupplierModal(true);
  };

  const applyOcrSuggestionToForm = (suggestion: OcrSuggestion) => {
    if (suggestion.date) {
      setValue('date', suggestion.date, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setTempDate(new Date(suggestion.date));
    }

    if (suggestion.amountTTC !== undefined && suggestion.amountTTC !== '') {
      setValue('amountTTC', suggestion.amountTTC, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }

    if (suggestion.amountTVA !== undefined && suggestion.amountTVA !== '') {
      setValue('amountTVA', suggestion.amountTVA, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }

    if (suggestion.reference) {
      setValue('expenseReference' as any, suggestion.reference, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }

    if (suggestion.description) {
      setValue('description' as any, suggestion.description, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }

    const matchedPayment = findPayment(suggestion.paymentMethod);
    if (matchedPayment) {
      setValue('accountId', matchedPayment.key, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }

    const matchedCategory = findCategoryByOcr(suggestion.categoryName, suggestion.supplierName, suggestion.description);
    if (matchedCategory) {
      setValue('categoryId', matchedCategory.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }

    applySupplierFromOcr(suggestion.supplierData, suggestion.supplierName);

    setOcrApplied(true);
    setOcrSuccessVisible(true);
    setTimeout(() => setOcrSuccessVisible(false), 2400);
  };

  const applyOcrDataToForm = (response: any, file?: any) => {
    console.log('🔥 OCR FULL RESPONSE:', JSON.stringify(response, null, 2));

    const suggestion = buildOcrSuggestion(response, file);
    setOcrSuggestion(suggestion);
    setOcrRaw(response);
    setOcrApplied(false);

    applyOcrSuggestionToForm(suggestion);
  };

  const sendToOcr = async (file: any) => {
    try {
      setOcrLoading(true);

      console.log('🚀 OCR START');
      console.log('📄 OCR FILE:', JSON.stringify(file, null, 2));

      const fileUri = file.uri ?? file.fileCopyUri;
      const fileName = file.name || file.fileName || `document_${Date.now()}.jpg`;
      const fileType = file.type || getMimeType(fileName) || 'application/octet-stream';

      console.log('📦 OCR NORMALIZED FILE:', { uri: fileUri, name: fileName, type: fileType });

      const formData = new FormData();

      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);

      const response = await fetch(OCR_API_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 OCR HTTP STATUS:', response.status);

      const rawText = await response.text();
      console.log('📨 OCR RAW RESPONSE:', rawText);

      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.log('❌ OCR JSON PARSE ERROR:', jsonError);
        Alert.alert(t('ocr_error_title'), t('ocr_error_invalid_response'));
        return;
      }

      console.log('✅ OCR JSON RESPONSE:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.log('❌ OCR BACKEND ERROR:', data);
        Alert.alert(t('ocr_error_title'), data?.error || data?.message || t('ocr_error_failed'));
        return;
      }

      applyOcrDataToForm(data, { ...file, name: fileName });

      showPremiumToast('success', t('ocr_success_title'), t('ocr_success_message'));
    } catch (e: any) {
      console.log('❌ OCR FETCH ERROR:', e?.message || e);
      Alert.alert(t('ocr_error_title'), e?.message || t('ocr_error_failed'));
    } finally {
      setOcrLoading(false);
    }
  };

  useEffect(() => {
    setLocalSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    if (!visible) return;
    setShowDatePicker(false);
    setSaving(false);
    setOcrLoading(false);
    setOcrSuggestion(null);
    setOcrRaw(null);
    setOcrApplied(false);
    setOcrSuccessVisible(false);
    setPendingSupplierName('');
    setRemovedExistingDocument(false);
    setFileSizeError(false);
    setShowSuccessCelebration(false);
    setSupplierPrefillValues(undefined);
    appliedRouteOcrSupplierKey.current = null;

    if (editItem) {
      const datePart = editItem.date.split('T')[0];
      const [ey, em, ed] = datePart.split('-').map(Number);
      setTempDate(new Date(ey, em - 1, ed));
      const cat = (categories as Category[]).find(c => c.id === editItem.category_id) ?? null;
      const sup = localSuppliers.find(s => s.id === editItem.supplier_id) ?? null;

      if (editItem.file) {
        const fileName = editItem.file.split('/').pop() ?? 'document';
        setDocument({ name: fileName, isExisting: true });
      } else {
        setDocument(null);
      }

      reset({
        date: datePart,
        amountTTC: editItem.ttc,
        amountTVA: editItem.tva,
        accountId: editItem.payment_method ?? undefined,
        categoryId: cat?.id ?? undefined,
        supplierId: sup?.id ?? undefined,
        expenseReference: (editItem as any).reference ?? (editItem as any).expense_reference ?? '',
        description: (editItem as any).description ?? (editItem as any).notes ?? '',
      } as any);
    } else {
      const today = new Date();
      const y = today.getFullYear();
      const mo = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');

      setDocument(null);
      setTempDate(today);

      reset({
        date: `${y}-${mo}-${d}`,
        amountTTC: '',
        amountTVA: '',
        accountId: undefined,
        categoryId: undefined,
        supplierId: defaultSupplierId ?? undefined,
        expenseReference: '',
        description: '',
      } as any);
    }
  }, [visible]);

  useEffect(() => {
    if (!ocrLoading) {
      ocrPulse.setValue(1);
      ocrScanLine.setValue(0);
      setOcrLoadingStep(0);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ocrPulse, { toValue: 0.82, duration: 900, useNativeDriver: true }),
        Animated.timing(ocrPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(ocrScanLine, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(ocrScanLine, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();
    scan.start();
    const textTimer = setInterval(() => {
      setOcrLoadingStep(step => (step + 1) % 3);
    }, 1400);
    return () => {
      pulse.stop();
      scan.stop();
      clearInterval(textTimer);
    };
  }, [ocrLoading]);

  useEffect(() => {
    const prefill = buildSupplierPrefillFromOcr(ocrSupplierData);
    const supplierKey = normalizeText(prefill.supplierName);
    if (!visible || !supplierKey || appliedRouteOcrSupplierKey.current === supplierKey) return;

    appliedRouteOcrSupplierKey.current = supplierKey;
    setApplyingOCRSupplier(true);
    requestAnimationFrame(() => {
      applySupplierFromOcr(prefill, prefill.supplierName);
      setApplyingOCRSupplier(false);
    });
  }, [visible, ocrSupplierData, localSuppliers]);


  useEffect(() => {
    if (supplierSearchTimer.current) clearTimeout(supplierSearchTimer.current);
    if (!supplierSearchQuery.trim()) {
      setSupplierSearchResults(null);
      setSupplierSearchLoading(false);
      return;
    }
    setSupplierSearchLoading(true);
    supplierSearchTimer.current = setTimeout(async () => {
      try {
        const result = await getSuppliers({ like: supplierSearchQuery.trim() });
        if (result.success) {
          const mapped: Supplier[] = (result.suppliers ?? []).map((s: any) => ({
            id: s.id,
            name: s.supplier_name || s.name || s.company_name || '',
          }));
          setSupplierSearchResults(mapped);
        } else {
          setSupplierSearchResults([]);
        }
      } catch {
        setSupplierSearchResults([]);
      } finally {
        setSupplierSearchLoading(false);
      }
    }, 350);
    return () => {
      if (supplierSearchTimer.current) clearTimeout(supplierSearchTimer.current);
    };
  }, [supplierSearchQuery]);

  const closeSupplierPicker = () => {
    setShowSupplierPicker(false);
    setShowSupplierSearch(false);
    setSupplierSearchQuery('');
    setSupplierSearchResults(null);
  };

  const handlePreviewDocument = async () => {
    const uri = document?.fileCopyUri ?? document?.uri;
    if (!uri) return;
    try {
      if (Platform.OS === 'ios') {
        await Share.share({ url: uri });
      } else {
        await ReactNativeBlobUtil.android.actionViewIntent(
          uri.replace('file://', ''),
          document?.type ?? 'application/octet-stream'
        );
      }
    } catch {}
  };

  const handlePickDocument = async () => {
    try {
      Alert.alert(
        t('document_picker_title'),
        t('document_picker_subtitle'),
        [
          { text: t('button_gallery'), onPress: handlePickFromGallery },
          { text: t('button_files'), onPress: handlePickFromFiles },
          { text: t('button_cancel'), style: 'cancel' },
        ],
      );
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert(t('error_title'), t('error_select_file'));
    }
  };

  const handlePickFromGallery = async () => {
    if (storageExhausted) {
      Alert.alert(t('error_title'), t('error_storage_full'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
      ]);
      return;
    }
    try {
      const response = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.9 });
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      const file = {
        uri: asset.uri,
        fileCopyUri: asset.uri,
        name: asset.fileName ?? `gallery_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
        size: asset.fileSize,
        fileSize: asset.fileSize,
      };
      if (!validateOcrFile(file)) return;
      const remainingBytes = (subscription?.usage?.storage?.remaining_mb ?? Infinity) * 1024 * 1024;
      if (file.size && file.size > remainingBytes) {
        Alert.alert(t('error_title'), t('error_file_exceeds_storage'), [
          { text: t('button_maybe_later'), style: 'cancel' },
          { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
        ]);
        return;
      }
      setFileSizeError(false);
      setDocument(file);
      if (canUseFeature(subscription, 'ocr')) {
        await sendToOcr(file);
      }
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert(t('error_title'), t('error_select_file'));
    }
  };

  const handlePickFromFiles = async () => {
    if (storageExhausted) {
      Alert.alert(t('error_title'), t('error_storage_full'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
      ]);
      return;
    }
    try {
      const [file] = await pick({ type: [types.pdf, types.images] });
      if (!validateOcrFile(file)) return;
      const remainingBytes = (subscription?.usage?.storage?.remaining_mb ?? Infinity) * 1024 * 1024;
      if (file.size && file.size > remainingBytes) {
        Alert.alert(t('error_title'), t('error_file_exceeds_storage'), [
          { text: t('button_maybe_later'), style: 'cancel' },
          { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
        ]);
        return;
      }
      setFileSizeError(false);
      setDocument(file);
      if (canUseFeature(subscription, 'ocr')) {
        await sendToOcr(file);
      }
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert(t('error_title'), t('error_select_file'));
    }
  };

  const handleTakePhoto = async () => {
    if (storageExhausted) {
      Alert.alert(t('error_title'), t('error_storage_full'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
      ]);
      return;
    }
    launchCamera({ mediaType: 'photo', saveToPhotos: false, quality: 0.8 }, async response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      const photoFile = {
        uri: asset.uri,
        fileCopyUri: asset.uri,
        name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
        fileSize: asset.fileSize,
      };

      if (!validateOcrFile(photoFile)) return;

      setDocument(photoFile);
      if (canUseFeature(subscription, 'ocr')) {
        await sendToOcr(photoFile);
      }
    });
  };

  const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  const confirmDate = () => {
    const y = tempDate.getFullYear();
    const m = String(tempDate.getMonth() + 1).padStart(2, '0');
    const d = String(tempDate.getDate()).padStart(2, '0');
    setValue('date', `${y}-${m}-${d}`, { shouldValidate: true });
    setShowDatePicker(false);
  };

  const onSubmit = async (data: ExpenseFormValues & { expenseReference?: string; description?: string }) => {
    if (ocrSuggestion?.duplicateWarning) {
      Alert.alert(
        t('ocr_duplicate_title'),
        ocrSuggestion.duplicateWarning,
        [
          { text: t('button_cancel'), style: 'cancel' },
          { text: t('button_continue'), onPress: () => submitExpense(data) },
        ],
      );
      return;
    }

    await submitExpense(data);
  };

  const submitExpense = async (data: ExpenseFormValues & { expenseReference?: string; description?: string }) => {
    if (saving || ocrLoading) return;
    if (fileSizeError) return;

    if (!editItem && !canUseFeature(subscription, 'expenses')) {
      Alert.alert(t('subscription_limit_title'), t('subscription_limit_expenses'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
      ]);
      return;
    }

    setSaving(true);
    try {
      const ttc = parseFloat(data.amountTTC) || 0;
      const tva = parseFloat(data.amountTVA) || 0;
      const payload = {
        customer_id: customerId,
        date: data.date,
        ttc,
        tva,
        payment_method: data.accountId,
        category_id: data.categoryId,
        supplier_id: data.supplierId ?? null,
        total_ttc: ttc,
        total_tva: tva,
        reference: data.expenseReference ?? '',
        expense_reference: data.expenseReference ?? '',
        notes: data.description ?? '',
        description: data.description ?? '',
        is_ocr: ocrRaw ? 1 : 0,
        ocr_raw: ocrRaw,
        ocr_confidence_score: ocrSuggestion?.confidenceScore ?? null,
        ocr_warnings: ocrSuggestion?.warnings ?? [],
        ocr_items: ocrSuggestion?.items ?? [],
        document: document?.isExisting ? null : document,
        remove_document: !document && removedExistingDocument ? 1 : 0,
      };

      if (editItem && onUpdate) {
        const result = await onUpdate(editItem.id, payload);
        if (result.success) {
          dispatch(loadSubscription() as any);
          showPremiumToast('success', t('success_title'), t('success_expense_updated'));
          onCreated();
          onClose();
        } else {
          Alert.alert(t('error_title'), result.error ?? t('error_generic'));
        }
      } else {
        const result = await onSave(payload);
        if (result.success) {
          dispatch(loadSubscription() as any);
          onCreated();
          setShowSuccessCelebration(true);
        } else {
          Alert.alert(t('error_title'), result.error ?? t('error_generic'));
        }
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        t('error_generic');
      Alert.alert(t('error_title'), message);
    } finally {
      setSaving(false);
    }
  };

  const confidencePercent = ocrSuggestion?.confidenceScore !== undefined
    ? Math.round((ocrSuggestion.confidenceScore ?? 0) * 100)
    : null;
  const confidenceTone =
    confidencePercent === null ? 'neutral' :
      confidencePercent >= 85 ? 'high' :
        confidencePercent >= 60 ? 'medium' : 'low';
  const confidenceLabel =
    confidenceTone === 'high' ? t('ocr_confidence_high', { defaultValue: 'High confidence' }) :
      confidenceTone === 'medium' ? t('ocr_confidence_medium', { defaultValue: 'Review recommended' }) :
        confidenceTone === 'low' ? t('ocr_confidence_low', { defaultValue: 'Low confidence' }) :
          t('ocr_confidence_unknown', { defaultValue: 'Needs review' });
  const ocrLoadingMessages = [
    t('ocr_loading_analyzing', { defaultValue: 'Analyzing document...' }),
    t('ocr_loading_detecting_supplier', { defaultValue: 'Detecting supplier...' }),
    t('ocr_loading_extracting_accounting', { defaultValue: 'Extracting accounting data...' }),
    t('ocr_loading_preparing_expense', { defaultValue: 'Preparing your expense...' }),
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>{t('button_cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editItem ? t('title_edit_expense') : t('title_create_expense')}
            </Text>
            <SuccessMorphButton
              style={[styles.modalConfirmBtn, !isValid && styles.modalConfirmBtnDisabled]}
              onPress={handleSubmit(onSubmit as any)}
              disabled={!isValid || saving || ocrLoading || showSuccessCelebration}
              loading={saving || ocrLoading}
              success={showSuccessCelebration}
              label={t('modal_confirm_text')}
              successLabel={t('success_title')}
              textStyle={styles.modalConfirmText}
            />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              {ocrLoading && (
                <View style={styles.ocrLoadingCard}>
                  <Animated.View style={[styles.ocrIconWrap, { opacity: ocrPulse, transform: [{ scale: ocrPulse }] }]}>
                    <ScanLine size={32} color="#1E5BAC" strokeWidth={1.8} />
                  </Animated.View>

                  <View style={styles.ocrScanTrack}>
                    <Animated.View
                      style={[
                        styles.ocrScanBeam,
                        {
                          transform: [{
                            translateX: ocrScanLine.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-120, 120],
                            }),
                          }],
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.ocrTitle}>{ocrLoadingMessages[ocrLoadingStep]}</Text>
                  <Text style={styles.ocrSubtitle}>{t('ocr_loading_subtitle')}</Text>

                  <ActivityIndicator size="small" color="#1E5BAC" style={{ marginTop: 8 }} />
                </View>
              )}

              {ocrSuccessVisible && !ocrLoading && (
                <View style={styles.ocrSuccessCard}>
                  <View style={styles.ocrSuccessIcon}>
                    <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ocrSuccessTitle}>
                      {t('ocr_success_applied_title', { defaultValue: 'Expense prepared' })}
                    </Text>
                    <Text style={styles.ocrSuccessSubtitle}>
                      {t('ocr_success_applied_subtitle', { defaultValue: 'Review the extracted details before saving.' })}
                    </Text>
                  </View>
                </View>
              )}

              {ocrSuggestion && (
                <View style={[styles.ocrReviewCard, ocrLoading && { opacity: 0.4 }]}>
                  <View style={styles.ocrReviewHeader}>
                    <View style={styles.ocrReviewTitleRow}>
                      {ocrSuggestion.duplicateWarning ? (
                        <AlertTriangle size={18} color="#DC2626" />
                      ) : (
                        <CheckCircle2 size={18} color="#16A34A" />
                      )}
                      <Text style={styles.ocrReviewTitle}>{t('ocr_data_detected')}</Text>
                    </View>
                    <View
                      style={[
                        styles.ocrConfidenceBadge,
                        confidenceTone === 'high' && styles.ocrConfidenceHigh,
                        confidenceTone === 'medium' && styles.ocrConfidenceMedium,
                        confidenceTone === 'low' && styles.ocrConfidenceLow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ocrConfidenceText,
                          confidenceTone === 'high' && styles.ocrConfidenceTextHigh,
                          confidenceTone === 'medium' && styles.ocrConfidenceTextMedium,
                          confidenceTone === 'low' && styles.ocrConfidenceTextLow,
                        ]}
                      >
                        {confidencePercent !== null ? `${confidencePercent}% · ` : ''}{confidenceLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ocrReviewGrid}>
                    {!!ocrSuggestion.supplierName && (
                      <View style={styles.ocrReviewPill}>
                        <Text style={styles.ocrReviewPillLabel}>{t('label_supplier')}</Text>
                        <Text style={styles.ocrReviewPillValue} numberOfLines={1}>{ocrSuggestion.supplierName}</Text>
                      </View>
                    )}
                    {!!ocrSuggestion.amountTTC && (
                      <View style={styles.ocrReviewPill}>
                        <Text style={styles.ocrReviewPillLabel}>{t('label_amount_ttc')}</Text>
                        <Text style={styles.ocrReviewPillValue}>{ocrSuggestion.amountTTC} MAD</Text>
                      </View>
                    )}
                    {!!ocrSuggestion.amountTVA && (
                      <View style={styles.ocrReviewPill}>
                        <Text style={styles.ocrReviewPillLabel}>{t('label_amount_tva')}</Text>
                        <Text style={styles.ocrReviewPillValue}>{ocrSuggestion.amountTVA} MAD</Text>
                      </View>
                    )}
                    {!!ocrSuggestion.categoryName && (
                      <View style={styles.ocrReviewPill}>
                        <Text style={styles.ocrReviewPillLabel}>{t('label_category')}</Text>
                        <Text style={styles.ocrReviewPillValue} numberOfLines={1}>{ocrSuggestion.categoryName}</Text>
                      </View>
                    )}
                    {!!ocrSuggestion.date && (
                      <View style={styles.ocrReviewPill}>
                        <Text style={styles.ocrReviewPillLabel}>{t('label_date')}</Text>
                        <Text style={styles.ocrReviewPillValue}>{ocrSuggestion.date}</Text>
                      </View>
                    )}
                  </View>

                  {!!ocrSuggestion.duplicateWarning && (
                    <Text style={styles.ocrReviewDangerText}>
                      {ocrSuggestion.duplicateWarning}
                    </Text>
                  )}

                  {!!ocrSuggestion.items?.length && (
                    <View style={styles.ocrReviewWarnings}>
                      <Text style={styles.ocrReviewPillLabel}>{t('ocr_detected_items', { defaultValue: 'Detected items' })}</Text>
                      {ocrSuggestion.items.slice(0, 3).map((item, index) => (
                        <Text key={`${item.name ?? 'item'}-${index}`} style={styles.ocrReviewWarningText} numberOfLines={1}>
                          • {item.name ?? t('type_product')} {item.total ? `· ${item.total} MAD` : ''}
                        </Text>
                      ))}
                    </View>
                  )}

                  {!!ocrSuggestion.warnings?.length && (
                    <View style={styles.ocrReviewWarnings}>
                      {ocrSuggestion.warnings.map((warning, index) => (
                        <Text key={`${warning}-${index}`} style={styles.ocrReviewWarningText}>
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  )}

                  {!ocrApplied && (
                    <TouchableOpacity
                      style={styles.ocrApplyButton}
                      onPress={() => applyOcrSuggestionToForm(ocrSuggestion)}
                    >
                      <Text style={styles.ocrApplyButtonText}>{t('ocr_apply')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {document ? (
                <View style={styles.attachmentPreview}>
                  {(document.type ?? '').startsWith('image/') && (document.uri ?? document.fileCopyUri) ? (
                    <TouchableOpacity
                      style={styles.attachmentThumbWrapper}
                      onPress={() => setShowImagePreview(true)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{ uri: document.uri ?? document.fileCopyUri }}
                        style={styles.attachmentThumb}
                        resizeMode="cover"
                      />
                      <View style={styles.attachmentThumbOverlay}>
                        <Eye size={16} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.attachmentFileIconBox}
                      onPress={handlePreviewDocument}
                      activeOpacity={0.85}
                    >
                      <FileText size={24} color="#1E5BAC" />
                    </TouchableOpacity>
                  )}
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentFileName} numberOfLines={2}>{document.name}</Text>
                    <Text style={styles.attachmentFileMeta}>
                      {document.isExisting ? t('label_attached_file') : (document.type ?? 'file')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.attachmentRemoveBtn}
                    onPress={() => {
                      setFileSizeError(false);
                      if (document?.isExisting) setRemovedExistingDocument(true);
                      setDocument(null);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadArea}>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    activeOpacity={0.8}
                    onPress={handleTakePhoto}
                    disabled={ocrLoading}
                  >
                    <Camera size={20} color="#1E5BAC" />
                    <Text style={styles.uploadBtnText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>{t('ocr_scan')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    activeOpacity={0.8}
                    onPress={handlePickDocument}
                    disabled={ocrLoading}
                  >
                    <ScanText size={20} color="#16A34A" />
                    <Text style={styles.uploadBtnText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>{t('choose_file_to_scan')}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {fileSizeError && (
                <Text style={styles.fieldError}>{t('error_file_too_large')}</Text>
              )}

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_reference')}</Text>
                <Controller
                  control={control}
                  name={'expenseReference' as any}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('placeholder_reference')}
                      placeholderTextColor="#9CA3AF"
                    />
                  )}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_notes')}</Text>
                <Controller
                  control={control}
                  name={'description' as any}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, { minHeight: 90, textAlignVertical: 'top' }]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      placeholder={t('placeholder_notes')}
                      placeholderTextColor="#9CA3AF"
                    />
                  )}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_date')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.fieldInput, styles.fieldInputRow, { paddingVertical: 13 }, errors.date && styles.fieldInputError]}
                  onPress={() => { setTempDate(watchedDate ? new Date(watchedDate) : new Date()); setShowDatePicker(true); }}
                  activeOpacity={0.7}
                >
                  <Text style={[{ flex: 1, fontSize: 14 }, watchedDate ? { color: '#1F2937' } : { color: '#9CA3AF' }]}>
                    {watchedDate || 'YYYY-MM-DD'}
                  </Text>
                  <Calendar size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.date && <Text style={styles.fieldError}>{errors.date.message}</Text>}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_amount_ttc')} <Text style={styles.required}>*</Text></Text>
                <View style={styles.fieldInputRow}>
                  <Controller
                    control={control}
                    name="amountTTC"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        style={[styles.fieldInput, { flex: 1 }, errors.amountTTC && styles.fieldInputError]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="1000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                      />
                    )}
                  />
                  <Text style={styles.fieldUnit}>MAD</Text>
                </View>
                {errors.amountTTC && <Text style={styles.fieldError}>{errors.amountTTC.message}</Text>}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_amount_tva')}</Text>
                <View style={styles.fieldInputRow}>
                  <Controller
                    control={control}
                    name="amountTVA"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        style={[styles.fieldInput, { flex: 1 }, errors.amountTVA && styles.fieldInputError]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                      />
                    )}
                  />
                  <Text style={styles.fieldUnit}>MAD</Text>
                </View>
                {errors.amountTVA && <Text style={styles.fieldError}>{errors.amountTVA.message}</Text>}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_payment_method')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerRow, errors.accountId && styles.fieldInputError]}
                  onPress={() => setShowAccountPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={selectedPaymentMethod ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedPaymentMethod ? pmLabel(selectedPaymentMethod) : t('placeholder_payment_method')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.accountId && <Text style={styles.fieldError}>{errors.accountId.message}</Text>}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_category')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerRow, errors.categoryId && styles.fieldInputError]}
                  onPress={() => setShowCategoryPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={selectedCategory ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedCategory ? t(CATEGORY_KEY_MAP[selectedCategory.name] ?? selectedCategory.name, { defaultValue: selectedCategory.name }) : t('placeholder_category')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.categoryId && <Text style={styles.fieldError}>{errors.categoryId.message}</Text>}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_supplier')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerRow, errors.supplierId && styles.fieldInputError]}
                  onPress={() => setShowSupplierPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={selectedSupplier ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedSupplier?.name || t('placeholder_supplier')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.supplierId && <Text style={styles.fieldError}>{errors.supplierId.message}</Text>}
                {applyingOCRSupplier && (
                  <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#1E5BAC" />
                    <Text style={{ color: '#6B7280', fontSize: 12 }}>
                      {t('ocr_applying_supplier', { defaultValue: 'Applying OCR supplier...' })}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.totalsBlock}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t('label_total_tva')}</Text>
                  <Text style={styles.totalValue}>{tvaDisplay.toLocaleString('fr-FR')} MAD</Text>
                </View>
                <View style={[styles.totalRow, styles.totalRowLast]}>
                  <Text style={styles.totalLabelBold}>{t('label_total_ttc')}</Text>
                  <Text style={styles.totalValueBold}>{ttcDisplay.toLocaleString('fr-FR')} MAD</Text>
                </View>
              </View>

              <SuccessMorphButton
                style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
                onPress={handleSubmit(onSubmit as any)}
                disabled={!isValid || saving || ocrLoading || showSuccessCelebration}
                loading={saving || ocrLoading}
                success={showSuccessCelebration}
                label={t('modal_confirm_text')}
                successLabel={t('success_title')}
                textStyle={styles.confirmBtnText}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={showCategoryPicker} transparent animationType="fade" onRequestClose={() => setShowCategoryPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('label_category')}</Text>
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 360 }} showsVerticalScrollIndicator>
                {(categories as Category[]).map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.pickerOption}
                    onPress={() => { setValue('categoryId', c.id, { shouldValidate: true }); setShowCategoryPicker(false); }}
                  >
                    <Text style={[styles.pickerOptionText, watchedCategoryId === c.id && styles.pickerOptionSelected]}>{t(CATEGORY_KEY_MAP[c.name] ?? c.name, { defaultValue: c.name })}</Text>
                    {watchedCategoryId === c.id && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showAccountPicker} transparent animationType="fade" onRequestClose={() => setShowAccountPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowAccountPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('label_payment_method')}</Text>
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 320 }} showsVerticalScrollIndicator>
                {PAYMENT_METHODS.map(p => (
                  <TouchableOpacity
                    key={p.key}
                    style={styles.pickerOption}
                    onPress={() => { setValue('accountId', p.key, { shouldValidate: true }); setShowAccountPicker(false); }}
                  >
                    <Text style={[styles.pickerOptionText, watchedAccountId === p.key && styles.pickerOptionSelected]}>{pmLabel(p)}</Text>
                    {watchedAccountId === p.key && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showSupplierPicker} transparent animationType="fade" onRequestClose={closeSupplierPicker}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={closeSupplierPicker}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width: '100%' }}>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerSheetTitleRow}>
                  <Text style={styles.pickerSheetTitleText}>{t('modal_title_supplier')}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.pickerSheetAddBtn, showSupplierSearch && styles.pickerSheetAddBtnActive]}
                      onPress={() => {
                        setShowSupplierSearch(prev => {
                          if (prev) { setSupplierSearchQuery(''); setSupplierSearchResults(null); }
                          return !prev;
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Search size={18} color={showSupplierSearch ? '#FFFFFF' : '#1E5BAC'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pickerSheetAddBtn}
                      onPress={() => { closeSupplierPicker(); setShowCreateSupplierModal(true); }}
                      activeOpacity={0.7}
                    >
                      <Plus size={18} color="#1E5BAC" />
                    </TouchableOpacity>
                  </View>
                </View>

                {showSupplierSearch && (
                  <View style={styles.supplierSearchRow}>
                    <Search size={15} color="#9CA3AF" />
                    <TextInput
                      style={styles.supplierSearchInput}
                      value={supplierSearchQuery}
                      onChangeText={setSupplierSearchQuery}
                      placeholder={t('placeholder_search_supplier')}
                      placeholderTextColor="#9CA3AF"
                      autoFocus
                      returnKeyType="search"
                    />
                    {supplierSearchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => { setSupplierSearchQuery(''); setSupplierSearchResults(null); }}
                        activeOpacity={0.7}
                      >
                        <X size={15} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300 }}>
                  {supplierSearchLoading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#1E5BAC" />
                    </View>
                  ) : (
                    (supplierSearchResults ?? localSuppliers).map(s => (
                      <TouchableOpacity
                        key={s.id}
                        style={styles.pickerOption}
                        onPress={() => { setValue('supplierId', s.id, { shouldValidate: true }); closeSupplierPicker(); }}
                      >
                        <Text style={[styles.pickerOptionText, watchedSupplierId === s.id && styles.pickerOptionSelected]}>{s.name}</Text>
                        {watchedSupplierId === s.id && <Text style={styles.pickerCheck}>✓</Text>}
                      </TouchableOpacity>
                    ))
                  )}
                  {!supplierSearchLoading && supplierSearchResults?.length === 0 && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: '#9CA3AF' }}>{t('text_no_suppliers_found')}</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={Platform.OS === 'ios' && showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerSheet}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} activeOpacity={0.7}>
                  <Text style={styles.datePickerCancel}>{t('button_cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>{t('label_date')}</Text>
                <TouchableOpacity onPress={confirmDate} activeOpacity={0.7}>
                  <Text style={styles.datePickerOk}>{t('button_confirm')}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'center', paddingBottom: 8 }}>
                <DateTimePicker value={tempDate} mode="date" locale={i18n.language} display="inline" onChange={handleDateChange} themeVariant="light" />
              </View>
            </View>
          </View>
        </Modal>

        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            locale={i18n.language}
            display="default"
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (event.type === 'set' && selected) {
                const y = selected.getFullYear();
                const m = String(selected.getMonth() + 1).padStart(2, '0');
                const d = String(selected.getDate()).padStart(2, '0');
                setValue('date', `${y}-${m}-${d}`, { shouldValidate: true });
              }
            }}
          />
        )}

        <Modal visible={showImagePreview} transparent animationType="fade" onRequestClose={() => setShowImagePreview(false)}>
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setShowImagePreview(false)} activeOpacity={0.7}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={{ uri: document?.uri ?? document?.fileCopyUri }} style={styles.imagePreviewFull} resizeMode="contain" />
          </View>
        </Modal>

        <CreateSupplierModal
  visible={showCreateSupplierModal}
  initialValues={{
    companyName: supplierPrefillValues?.companyName || pendingSupplierName,
    supplierName: supplierPrefillValues?.supplierName || pendingSupplierName,
    email: supplierPrefillValues?.email || '',
    telephone: supplierPrefillValues?.telephone || '',
    postalCode: supplierPrefillValues?.postalCode || '',
    city: supplierPrefillValues?.city || '',
    commercialRegister: supplierPrefillValues?.commercialRegister || '',
    ice: supplierPrefillValues?.ice || '',
    ifNumber: supplierPrefillValues?.ifNumber || '',
    cnss: supplierPrefillValues?.cnss || '',
    address: supplierPrefillValues?.address || '',
  }}
  onClose={() => {
    setShowCreateSupplierModal(false);
    setPendingSupplierName('');
    setSupplierPrefillValues(undefined);
  }}
  onCreated={(createdSupplier?: any) => {
    onSuppliersRefresh?.();

    const createdId = getCreatedSupplierId(createdSupplier);
    const normalizedSupplier = normalizeCreatedSupplier(createdSupplier);

    if (normalizedSupplier) {
      setLocalSuppliers(prev => {
        const exists = prev.some(item => item.id === normalizedSupplier.id);
        return exists ? prev.map(item => item.id === normalizedSupplier.id ? normalizedSupplier : item) : [normalizedSupplier, ...prev];
      });
    }

    if (createdId) {
      setValue('supplierId', Number(createdId), { shouldValidate: true });

      Toast.show({
        type: 'success',
        text1: t('success_title'),
        text2: t('ocr_supplier_detected_selected', { defaultValue: 'Supplier detected and selected' }),
      });
    }

    setShowCreateSupplierModal(false);
    setPendingSupplierName('');
    setSupplierPrefillValues(undefined);
    closeSupplierPicker();
  }}
  skipCelebration
/>
        <PremiumSuccessCelebration
          visible={showSuccessCelebration}
          title={t('success_expense_created', { defaultValue: 'Expense saved successfully' })}
          subtitle={t('success_ready_review', { defaultValue: 'Everything is saved and ready to review.' })}
          continueLabel={t('button_continue', { defaultValue: 'Continue' })}
          onDone={() => {
            setShowSuccessCelebration(false);
            onClose();
          }}
        />
      </View>
          {upgradeWebViewElement}
    </Modal>
  );
};

export default CreateExpenseModal;
