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
import { launchCamera } from 'react-native-image-picker';
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

const OCR_API_URL = 'https://ocr.simply-compta.com/api/expenses/ocr';

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
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [removedExistingDocument, setRemovedExistingDocument] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [pendingSupplierName, setPendingSupplierName] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [ocrSuggestion, setOcrSuggestion] = useState<OcrSuggestion | null>(null);
  const [ocrRaw, setOcrRaw] = useState<any>(null);
  const [ocrApplied, setOcrApplied] = useState(false);
  const ocrPulse = useRef(new Animated.Value(1)).current;
  const ocrScanLine = useRef(new Animated.Value(0)).current;
  const [supplierPrefillValues, setSupplierPrefillValues] = useState<any>(undefined);
  const [applyingOCRSupplier, setApplyingOCRSupplier] = useState(false);

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
  const selectedSupplier = suppliers.find(s => s.id === watchedSupplierId) ?? null;

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
    if (!supplierName || !suppliers?.length) return null;
    const supplier = normalizeText(supplierName);

    return suppliers.find((s: any) => {
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
    const data =
      response?.extracted ||
      response?.data ||
      response?.result ||
      response?.expense ||
      response;

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
      data?.supplier_name ||
      data?.supplier ||
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
    };
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

    if (suggestion.supplierName) {
      const matchedSupplier = findSupplier(suggestion.supplierName);
      if (matchedSupplier) {
        setValue('supplierId', matchedSupplier.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      } else {
        setPendingSupplierName(String(suggestion.supplierName));
        setShowCreateSupplierModal(true);
      }
    }

    setOcrApplied(true);
  };

  const applyOcrDataToForm = (response: any, file?: any) => {
    console.log('🔥 OCR FULL RESPONSE:', JSON.stringify(response, null, 2));

    const suggestion = buildOcrSuggestion(response, file);
    setOcrSuggestion(suggestion);
    setOcrRaw(response);
    setOcrApplied(false);

    const confidence = suggestion.confidenceScore ?? 0;
    if (confidence >= 0.85 && !suggestion.duplicateWarning) {
      applyOcrSuggestionToForm(suggestion);
    }
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

      Alert.alert(t('ocr_success_title'), t('ocr_success_message'));
    } catch (e: any) {
      console.log('❌ OCR FETCH ERROR:', e?.message || e);
      Alert.alert(t('ocr_error_title'), e?.message || t('ocr_error_failed'));
    } finally {
      setOcrLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setShowDatePicker(false);
    setSaving(false);
    setOcrLoading(false);
    setOcrSuggestion(null);
    setOcrRaw(null);
    setOcrApplied(false);
    setPendingSupplierName('');
    setRemovedExistingDocument(false);
    setFileSizeError(false);

    if (editItem) {
      const datePart = editItem.date.split('T')[0];
      const [ey, em, ed] = datePart.split('-').map(Number);
      setTempDate(new Date(ey, em - 1, ed));
      const cat = (categories as Category[]).find(c => c.id === editItem.category_id) ?? null;
      const sup = suppliers.find(s => s.id === editItem.supplier_id) ?? null;

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
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ocrPulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(ocrPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
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
    return () => { pulse.stop(); scan.stop(); };
  }, [ocrLoading]);

useEffect(() => {
  if (!visible || !ocrSupplierData?.supplier_name) return;
    const applyOCRSupplier = async () => {
      setApplyingOCRSupplier(true);
      const normalize = (v?: string) => (v ?? '').trim().toLowerCase();
      const detectedName = normalize(ocrSupplierData?.supplier_name);
      const localMatch = suppliers.find(s => normalize(s.name) === detectedName);
      if (localMatch?.id) {
        setValue('supplierId', localMatch.id, { shouldValidate: true });
        Vibration.vibrate(18);
        Toast.show({ type: 'success', text1: t('success_title'), text2: 'Supplier detected and selected' });
        setApplyingOCRSupplier(false);
        return;
      }
      setSupplierPrefillValues({
        supplierName: ocrSupplierData?.supplier_name ?? '',
        companyName: ocrSupplierData?.company_name ?? ocrSupplierData?.legal_name ?? '',
        ice: ocrSupplierData?.ice ?? '',
        commercialRegister: ocrSupplierData?.rc ?? '',
        telephone: ocrSupplierData?.phone ?? '',
        city: ocrSupplierData?.city ?? '',
        email: ocrSupplierData?.email ?? '',
        postalCode: '',
      });
      Vibration.vibrate(18);
      setShowCreateSupplierModal(true);
      setApplyingOCRSupplier(false);
    };
    applyOCRSupplier();
  }, [visible, ocrSupplierData, suppliers, setValue, t]);


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
      const [file] = await pick({ type: [types.images] });
      if (file.size && file.size > MAX_FILE_SIZE) {
        setFileSizeError(true);
        return;
      }
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
      if (file.size && file.size > MAX_FILE_SIZE) {
        setFileSizeError(true);
        return;
      }
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
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        setFileSizeError(true);
        return;
      }
      setFileSizeError(false);

      const photoFile = {
        uri: asset.uri,
        fileCopyUri: asset.uri,
        name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      };

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
          Alert.alert(t('success_title'), t('success_expense_updated'));
          onCreated();
          onClose();
        } else {
          Alert.alert(t('error_title'), result.error ?? t('error_generic'));
        }
      } else {
        const result = await onSave(payload);
        if (result.success) {
          dispatch(loadSubscription() as any);
          Alert.alert(t('success_title'), t('success_expense_created'));
          onCreated();
          onClose();
        } else {
          Alert.alert(t('error_title'), result.error ?? t('error_generic'));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const confidencePercent = ocrSuggestion?.confidenceScore !== undefined
    ? Math.round((ocrSuggestion.confidenceScore ?? 0) * 100)
    : null;

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
            <TouchableOpacity
              style={[styles.modalConfirmBtn, !isValid && styles.modalConfirmBtnDisabled]}
              onPress={handleSubmit(onSubmit as any)}
              disabled={saving || ocrLoading}
              activeOpacity={0.8}
            >
              {saving || ocrLoading
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={styles.modalConfirmText}>{t('modal_confirm_text')}</Text>
              }
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              {ocrLoading && (
                <View style={styles.ocrLoadingCard}>
                  <Animated.View style={[styles.ocrIconWrap, { opacity: ocrPulse }]}>
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

                  <Text style={styles.ocrTitle}>{t('ocr_loading_title')}</Text>
                  <Text style={styles.ocrSubtitle}>{t('ocr_loading_subtitle')}</Text>

                  <ActivityIndicator size="small" color="#1E5BAC" style={{ marginTop: 8 }} />
                </View>
              )}

              {ocrSuggestion && (
                <View style={[{ padding: 12, marginBottom: 12, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' }, ocrLoading && { opacity: 0.4 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {ocrSuggestion.duplicateWarning ? (
                      <AlertTriangle size={18} color="#DC2626" />
                    ) : (
                      <CheckCircle2 size={18} color="#16A34A" />
                    )}
                    <Text style={{ fontWeight: '700', color: '#111827', flex: 1 }}>
                      {t('ocr_data_detected')}{confidencePercent !== null ? ` (${confidencePercent}%)` : ''}
                    </Text>
                  </View>

                  {!!ocrSuggestion.duplicateWarning && (
                    <Text style={{ color: '#DC2626', fontSize: 12, marginBottom: 8 }}>
                      {ocrSuggestion.duplicateWarning}
                    </Text>
                  )}

                  {!!ocrSuggestion.warnings?.length && (
                    <View style={{ marginBottom: 8 }}>
                      {ocrSuggestion.warnings.map((warning, index) => (
                        <Text key={`${warning}-${index}`} style={{ color: '#92400E', fontSize: 12 }}>
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  )}

                  {!ocrApplied && (
                    <TouchableOpacity
                      style={{ backgroundColor: '#1E5BAC', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                      onPress={() => applyOcrSuggestionToForm(ocrSuggestion)}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{t('ocr_apply')}</Text>
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
                    <Text style={{ color: '#6B7280', fontSize: 12 }}>Applying OCR supplier...</Text>
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

              <TouchableOpacity
                style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
                onPress={handleSubmit(onSubmit as any)}
                disabled={saving || ocrLoading}
                activeOpacity={0.85}
              >
                {saving || ocrLoading
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.confirmBtnText}>{t('modal_confirm_text')}</Text>
                }
              </TouchableOpacity>
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
                    (supplierSearchResults ?? suppliers).map(s => (
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
                <DateTimePicker value={tempDate} mode="date" display="inline" onChange={handleDateChange} themeVariant="light" />
              </View>
            </View>
          </View>
        </Modal>

        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
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
  }}
  onClose={() => {
    setShowCreateSupplierModal(false);
    setPendingSupplierName('');
    setSupplierPrefillValues(undefined);
  }}
  onCreated={(createdSupplier?: any) => {
    onSuppliersRefresh?.();

    const createdId = createdSupplier?.id;

    if (createdId) {
      setValue('supplierId', createdId, { shouldValidate: true });

      Toast.show({
        type: 'success',
        text1: t('success_title'),
        text2: 'Supplier detected and selected',
      });
    }

    setShowCreateSupplierModal(false);
    setPendingSupplierName('');
    setSupplierPrefillValues(undefined);
    closeSupplierPicker();
  }}
/>
      </View>
          {upgradeWebViewElement}
    </Modal>
  );
};

export default CreateExpenseModal;