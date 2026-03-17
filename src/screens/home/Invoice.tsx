import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  Bell,
  Search,
  Plus,
  ChevronDown,
  FileText,
  Download,
  Trash2,
  X,
  CloudUpload,
  Camera,
  Calendar,
  Upload,
  Receipt,
  CirclePlus,
  Share2,
  Eye,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { appLogoIcon } from '../../assets/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInvoice } from '../../hooks/useInvoice';
import { useProducts } from '../../hooks/useProduct';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import { getMimeType } from '../../utils/helpers';
import { CreateClientModal } from './Clients';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

type StackNavigation = StackNavigationProp<any>;

interface Account { id: number; name: string; }
interface Category { id: number; name: string; }
interface Client { id: number; name: string; }

const STATUT_OPTIONS = ['Quotes', 'Issued', 'Paid', 'Cancelled'];

type InvoiceTabType = 'Tous' | 'Quotes' | 'Issued' | 'Paid' | 'Cancelled';
const INVOICE_TABS: InvoiceTabType[] = ['Tous', 'Quotes', 'Issued', 'Paid', 'Cancelled'];

interface InvoiceArticle {
  id: number;
  invoice_id: number;
  designation: string;
  unit_price_ht: string;
  quantity: number;
  total_price_ht: string;
  tva_percentage: string;
}

interface InvoiceItem {
  id: number;
  customer_id: number;
  client_id: number;
  date: string;
  invoice_number: string;
  payment_method: string;
  status: string;
  review_status: string;
  document_path: string | null;
  invoice_url: string | null;
  client: { id: number; client_name: string } | null;
  articles: InvoiceArticle[];
  notes?: string | null;
}

interface Article {
  designation: string;
  unitPriceHT: number;
  quantity: number;
  totalHT: number;
  tva: number;
}

const statusConfig = (status: string): { badge: object; text: object } => {
  switch (status) {
    case 'Payé':    return { badge: styles.badgeGreen,  text: styles.badgeTextGreen };
    case 'Annulé':  return { badge: styles.badgeRed,    text: styles.badgeTextRed };
    case 'Issued':  return { badge: styles.badgeBlue,   text: styles.badgeTextBlue };
    default:        return { badge: styles.badgeOrange, text: styles.badgeTextOrange };
  }
};

const reviewConfig = (rs: string): { badge: object; text: object } => {
  switch (rs) {
    case 'APPROVED': return { badge: styles.badgeGreen,  text: styles.badgeTextGreen };
    case 'REJECTED': return { badge: styles.badgeRed,    text: styles.badgeTextRed };
    default:         return { badge: styles.badgeOrange, text: styles.badgeTextOrange }; // PENDING
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { badge, text } = statusConfig(status);
  return (
    <View style={[styles.badge, badge]}>
      <Text style={[styles.badgeText, text]}>{status}</Text>
    </View>
  );
};

const ReviewBadge: React.FC<{ reviewStatus: string }> = ({ reviewStatus }) => {
  const { t } = useTranslation();
  const { badge, text } = reviewConfig(reviewStatus);
  const label = reviewStatus === 'PENDING' ? t('review_status_pending') : reviewStatus === 'APPROVED' ? t('review_status_approved') : t('review_status_rejected');
  return (
    <View style={[styles.badge, badge]}>
      <Text style={[styles.badgeText, text]}>{label}</Text>
    </View>
  );
};

// Article Form Modal
const ArticleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (article: Article) => void;
}> = ({ visible, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const { getProducts } = useProducts();

  const [form, setForm] = useState<Article>({
    designation: '',
    unitPriceHT: 0,
    quantity: 1,
    totalHT: 0,
    tva: 20,
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recalculate total whenever unit price or quantity changes
  useEffect(() => {
    setForm(prev => ({ ...prev, totalHT: prev.unitPriceHT * prev.quantity }));
  }, [form.unitPriceHT, form.quantity]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    }
  }, [visible]);

  const handleDesignationChange = (value: string) => {
    setForm(prev => ({ ...prev, designation: value }));
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      setShowSuggestions(true);
      const result = await getProducts({ like: value });
      setSuggestionsLoading(false);
      if (result.success) {
        const raw = result.products;
        const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
        setSuggestions(list);
        setShowSuggestions(list.length > 0 || false);
      } else {
        setShowSuggestions(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (product: any) => {
    const unitPrice = parseFloat(product.unit_price_ht) || 0;
    const qty = parseFloat(product.quantity) || form.quantity;
    const tva = parseFloat(product.tva_percent) || form.tva;
    setForm({
      designation: product.designation,
      unitPriceHT: unitPrice,
      quantity: qty,
      totalHT: unitPrice * qty,
      tva,
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleConfirm = () => {
    if (!form.designation.trim()) {
      Alert.alert(t('alert_field_required'), t('message_designation_required'));
      return;
    }
    onConfirm(form);
    setForm({ designation: '', unitPriceHT: 0, quantity: 1, totalHT: 0, tva: 20 });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>{t('modal_cancel_text')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('modal_title_article_designation')}</Text>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.modalConfirmText}>{t('modal_confirm_text')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Désignation */}
            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_designation')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={t('placeholder_designation')}
                  placeholderTextColor="#9CA3AF"
                  value={form.designation}
                  onChangeText={handleDesignationChange}
                  autoCorrect={false}
                />
                {/* Autocomplete suggestions */}
                {showSuggestions && (
                  <View style={styles.suggestionsContainer}>
                    {suggestionsLoading ? (
                      <View style={styles.suggestionLoadingRow}>
                        <ActivityIndicator size="small" color="#1E5BAC" />
                        <Text style={styles.suggestionLoadingText}>{t('text_searching')}</Text>
                      </View>
                    ) : (
                      suggestions.map((product, index) => (
                        <TouchableOpacity
                          key={product.id ?? index}
                          style={[
                            styles.suggestionItem,
                            index < suggestions.length - 1 && styles.suggestionItemBorder,
                          ]}
                          onPress={() => handleSelectSuggestion(product)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.suggestionDesignation}>{product.designation}</Text>
                          <Text style={styles.suggestionMeta}>
                            {parseFloat(product.unit_price_ht).toLocaleString('fr-FR')} MAD HT  ·  TVA {product.tva_percent}%
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>

              {/* Prix H.T. unitaire */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_unit_price_ht')} <Text style={styles.required}>*</Text></Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={form.unitPriceHT > 0 ? String(form.unitPriceHT) : ''}
                    onChangeText={v => setForm(prev => ({
                      ...prev,
                      unitPriceHT: parseFloat(v) || 0,
                      totalHT: (parseFloat(v) || 0) * prev.quantity,
                    }))}
                  />
                  <Text style={styles.fieldUnit}>{t('field_unit')}</Text>
                </View>
              </View>

              {/* Quantité */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_quantity')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={form.quantity > 0 ? String(form.quantity) : ''}
                  onChangeText={v => setForm(prev => ({
                    ...prev,
                    quantity: parseFloat(v) || 0,
                    totalHT: prev.unitPriceHT * (parseFloat(v) || 0),
                  }))}
                />
              </View>

              {/* Prix H.T. total (read-only) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_price_ht_total')}</Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputReadOnly, { flex: 1 }]}
                    value={form.totalHT.toLocaleString('fr-FR')}
                    editable={false}
                  />
                  <Text style={styles.fieldUnit}>{t('field_unit')}</Text>
                </View>
              </View>

              {/* TVA */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_tva_percent')}</Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    placeholder="20"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={String(form.tva)}
                    onChangeText={v => setForm({ ...form, tva: parseFloat(v) || 0 })}
                  />
                  <Text style={styles.fieldUnit}>%</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.addArticleBtn} onPress={handleConfirm} activeOpacity={0.85}>
                <Text style={styles.addArticleBtnText}>{t('button_add')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Yup validation schema ───────────────────────────────────────────────────
const invoiceSchema = yup.object({
  invoiceNumber: yup.string().trim().required('Invoice number is required'),
  date: yup.string().required('Date is required'),
  clientId: yup
    .number()
    .typeError('Client is required')
    .required('Client is required')
    .positive('Client is required'),
  accountId: yup
    .number()
    .typeError('Payment method is required')
    .required('Payment method is required')
    .positive('Payment method is required'),
  status: yup.string().required('Status is required'),
  articles: yup
    .array()
    .of(
      yup.object({
        designation: yup.string().trim().required('Designation is required'),
        unitPriceHT: yup
          .number()
          .typeError('Unit price must be a number')
          .moreThan(0, 'Unit price must be greater than 0')
          .required(),
        quantity: yup
          .number()
          .typeError('Quantity must be a number')
          .positive('Quantity must be a positive number')
          .required(),
        tva: yup
          .number()
          .typeError('TVA must be a number')
          .min(0, 'TVA must be ≥ 0')
          .required(),
        totalHT: yup.number().required(),
      })
    )
    .min(1, 'At least one article is required')
    .default([]),
  notes: yup.string().default(''),
});

type InvoiceFormValues = {
  invoiceNumber: string;
  date: string;
  clientId: number;
  accountId: number;
  status: string;
  articles: Article[];
  notes: string;
};

// Create Invoice Modal
const CreateInvoiceModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  clients: Client[];
  customerId: number;
  onCreated: () => void;
  onSave: (payload: any) => Promise<{ success: boolean; error?: string }>;
  editItem?: InvoiceItem;
  onUpdate?: (id: number, payload: any) => Promise<{ success: boolean; error?: string }>;
  onClientsRefresh?: () => void;
}> = ({ visible, onClose, accounts, clients, customerId, onCreated, onSave, editItem, onUpdate, onClientsRefresh }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // ── Non-form UI state ──────────────────────────────────────────────────────
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // ── Client search state ────────────────────────────────────────────────────
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<Client[] | null>(null);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const clientSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── react-hook-form ────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<InvoiceFormValues>({
    resolver: yupResolver(invoiceSchema) as any,
    mode: 'onChange',
    defaultValues: {
      invoiceNumber: '',
      date: '',
      clientId: undefined,
      accountId: undefined,
      status: 'Quotes',
      articles: [],
      notes: '',
    },
  });

  const watchedClientId = watch('clientId');
  const watchedAccountId = watch('accountId');
  const watchedStatus = watch('status');
  const watchedDate = watch('date');
  const watchedArticles = watch('articles') ?? [];

  // Derived display objects from IDs
  const selectedClient = clients.find(c => c.id === watchedClientId) ?? null;
  const selectedAccount = accounts.find(a => a.id === watchedAccountId) ?? null;

  // ── Reset / populate form when modal opens ────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    setShowArticleModal(false);
    setShowDatePicker(false);
    setSaving(false);

    if (editItem) {
      const datePart = editItem.date.split('T')[0];
      const [ey, em, ed] = datePart.split('-').map(Number);
      setTempDate(new Date(ey, em - 1, ed));
      const client = clients.find(c => c.id === editItem.client_id) ?? null;
      const account = accounts.find(a => a.name === editItem.payment_method) ?? null;
      if (editItem.document_path) {
        const fileName = editItem.document_path.split('/').pop() ?? 'document';
        setDocument({ name: fileName, isExisting: true });
      } else {
        setDocument(null);
      }
      reset({
        invoiceNumber: editItem.invoice_number,
        date: datePart,
        clientId: client?.id ?? undefined,
        accountId: account?.id ?? undefined,
        status: editItem.status,
        notes: editItem.notes ?? '',
        articles: editItem.articles.map(a => ({
          designation: a.designation,
          unitPriceHT: parseFloat(a.unit_price_ht),
          quantity: a.quantity,
          totalHT: parseFloat(a.total_price_ht),
          tva: parseFloat(a.tva_percentage),
        })),
      });
    } else {
      const today = new Date();
      const y = today.getFullYear();
      const mo = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setDocument(null);
      setTempDate(today);
      reset({
        invoiceNumber: '',
        date: `${y}-${mo}-${d}`,
        clientId: undefined,
        accountId: undefined,
        status: 'Quotes',
        notes: '',
        articles: [],
      });
    }
  }, [visible]);

  // ── Debounced client search ─────────────────────────────────────────────
  useEffect(() => {
    if (clientSearchTimer.current) clearTimeout(clientSearchTimer.current);
    if (!clientSearchQuery.trim()) {
      setClientSearchResults(null);
      setClientSearchLoading(false);
      return;
    }
    setClientSearchLoading(true);
    clientSearchTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(Api_Endpoints.customerClientsSearch, {
          params: { like: clientSearchQuery.trim() },
        });
        const mapped: Client[] = (res.data?.data ?? []).map((c: any) => ({
          id: c.id,
          name: c.company_name ?? c.client_name ?? c.name ?? '',
        }));
        setClientSearchResults(mapped);
      } catch {
        setClientSearchResults([]);
      } finally {
        setClientSearchLoading(false);
      }
    }, 350);
    return () => { if (clientSearchTimer.current) clearTimeout(clientSearchTimer.current); };
  }, [clientSearchQuery]);

  const closeClientPicker = () => {
    setShowClientPicker(false);
    setShowClientSearch(false);
    setClientSearchQuery('');
    setClientSearchResults(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
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
      const [file] = await pick({ type: [types.pdf, types.docx, types.doc, types.images] });
      setDocument(file);
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert(t('error_title'), t('error_select_file'));
    }
  };

  const handleTakePhoto = async () => {
    launchCamera(
      { mediaType: 'photo', saveToPhotos: false, quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (!asset?.uri) return;
        setDocument({
          uri: asset.uri,
          fileCopyUri: asset.uri,
          name: asset.fileName ?? `photo_${Date.now()}.jpg`,
          type: asset.type ?? 'image/jpeg',
        });
      }
    );
  };

  const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  const confirmDate = () => {
    const y = tempDate.getFullYear();
    const m = String(tempDate.getMonth() + 1).padStart(2, '0');
    const d = String(tempDate.getDate()).padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    setValue('date', formatted, { shouldValidate: true });
    setShowDatePicker(false);
  };

  // Totals derived from form articles
  const totalHT = watchedArticles.reduce((s, a) => s + (a.totalHT ?? 0), 0);
  const totalTVA = watchedArticles.reduce((s, a) => s + ((a.totalHT ?? 0) * (a.tva ?? 0)) / 100, 0);
  const totalTTC = totalHT + totalTVA;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: InvoiceFormValues) => {
    setSaving(true);
    try {
      const payload = {
        customer_id: customerId,
        client_id: data.clientId,
        date: data.date,
        invoice_number: data.invoiceNumber,
        payment_method: selectedAccount!.name,
        status: data.status,
        notes: data.notes || null,
        document: document?.isExisting ? null : document,
        articles: (data.articles ?? []).map(a => ({
          designation: a.designation,
          unit_price_ht: a.unitPriceHT,
          quantity: a.quantity,
          total_price_ht: a.totalHT,
          tva_percentage: a.tva,
        })),
      };
      if (editItem && onUpdate) {
        const result = await onUpdate(editItem.id, payload);
        if (result.success) {
          Alert.alert(t('success_title'), t('success_invoice_updated'));
          onCreated();
          onClose();
        } else {
          Alert.alert(t('error_title'), result.error ?? t('error_generic'));
        }
      } else {
        const result = await onSave(payload);
        if (result.success) {
          Alert.alert(t('success_title'), t('success_invoice_created'));
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>{t('modal_cancel_text')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editItem ? t('title_edit_invoice') : t('title_create_invoice')}</Text>
            <TouchableOpacity
              style={[styles.modalConfirmBtn, !isValid && styles.modalConfirmBtnDisabled]}
              onPress={handleSubmit(onSubmit as any)}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={styles.modalConfirmText}>{t('modal_confirm_text')}</Text>
              }
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              {/* Upload Doc */}
              {document ? (
                <View style={styles.attachmentPreview}>
                  {(document.type ?? '').startsWith('image/') && (document.uri ?? document.fileCopyUri) ? (
                    <TouchableOpacity style={styles.attachmentThumbWrapper} onPress={() => setShowImagePreview(true)} activeOpacity={0.85}>
                      <Image source={{ uri: document.uri ?? document.fileCopyUri }} style={styles.attachmentThumb} resizeMode="cover" />
                      <View style={styles.attachmentThumbOverlay}>
                        <Eye size={16} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.attachmentFileIconBox} onPress={handlePreviewDocument} activeOpacity={0.85}>
                      <FileText size={24} color="#1E5BAC" />
                    </TouchableOpacity>
                  )}
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentFileName} numberOfLines={2}>{document.name}</Text>
                    <Text style={styles.attachmentFileMeta}>
                      {document.isExisting ? t('label_attached_file') : (document.type ?? 'file')}
                    </Text>
                  </View>
                  {!document.isExisting && (
                    <TouchableOpacity style={styles.attachmentRemoveBtn} onPress={() => setDocument(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <X size={16} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.uploadArea}>
                  <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8} onPress={handleTakePhoto}>
                    <Camera size={20} color="#1E5BAC" />
                    <Text style={styles.uploadBtnText}>{t('button_take_photo')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8} onPress={handlePickDocument}>
                    <FileText size={20} color="#16A34A" />
                    <Text style={styles.uploadBtnText}>{t('button_select_file')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Invoice Number */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_invoice_number')} <Text style={styles.required}>*</Text></Text>
                <Controller
                  control={control}
                  name="invoiceNumber"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.invoiceNumber && styles.fieldInputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('placeholder_invoice_number')}
                      placeholderTextColor="#9CA3AF"
                    />
                  )}
                />
                {errors.invoiceNumber && (
                  <Text style={styles.fieldError}>{errors.invoiceNumber.message}</Text>
                )}
              </View>

              {/* Date */}
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
                {errors.date && (
                  <Text style={styles.fieldError}>{errors.date.message}</Text>
                )}
              </View>

              {/* Client */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_client')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerRow, errors.clientId && styles.fieldInputError]}
                  onPress={() => setShowClientPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={selectedClient ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedClient ? selectedClient.name : t('placeholder_client')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.clientId && (
                  <Text style={styles.fieldError}>{errors.clientId.message}</Text>
                )}
              </View>

              {/* Mode de paiement */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_payment_method')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerRow, errors.accountId && styles.fieldInputError]}
                  onPress={() => setShowAccountPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={selectedAccount ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedAccount ? selectedAccount.name : t('placeholder_payment_method')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.accountId && (
                  <Text style={styles.fieldError}>{errors.accountId.message}</Text>
                )}
              </View>

              {/* Statut */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_status')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerRow, errors.status && styles.fieldInputError]}
                  disabled={!editItem}
                  onPress={() => setShowStatusPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[watchedStatus ? styles.pickerValueText : styles.pickerPlaceholderText, editItem ? { color: '#1F2937' } : { color: '#9CA3AF' }]}>
                    {watchedStatus || t('placeholder_status')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.status && (
                  <Text style={styles.fieldError}>{errors.status.message}</Text>
                )}
              </View>

              {/* Notes */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_notes')}</Text>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, styles.notesInput]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('placeholder_notes')}
                      placeholderTextColor="#9CA3AF"
                      multiline={true}
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  )}
                />
              </View>

              {/* Articles */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_articles')}</Text>
                {watchedArticles.map((a, i) => (
                  <View key={i} style={styles.articleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.articleDesignation}>{a.designation}</Text>
                      <Text style={styles.articleMeta}>
                        {a.quantity} × {(a.unitPriceHT ?? 0).toLocaleString('fr-FR')} MAD HT
                      </Text>
                    </View>
                    <Text style={styles.articleTotal}>{(a.totalHT ?? 0).toLocaleString('fr-FR')} MAD</Text>
                    <TouchableOpacity
                      onPress={() => setValue('articles', watchedArticles.filter((_, j) => j !== i), { shouldValidate: true })}
                      style={{ marginLeft: 8 }}
                    >
                      <X size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addArticleRowBtn} onPress={() => setShowArticleModal(true)} activeOpacity={0.8}>
                  <Plus size={18} color="#1E5BAC" />
                  <Text style={styles.addArticleRowText}>{t('button_add_article')}</Text>
                </TouchableOpacity>
                {watchedArticles.length === 0 && (
                  <Text style={styles.articleHint}>{t('text_no_articles')}</Text>
                )}
                {errors.articles && !Array.isArray(errors.articles) && (
                  <Text style={styles.fieldError}>{(errors.articles as any).message}</Text>
                )}
              </View>

              {/* Totals */}
              {watchedArticles.length > 0 && (
                <View style={styles.totalsBlock}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('label_total_ht')}</Text>
                    <Text style={styles.totalValue}>{totalHT.toLocaleString('fr-FR')} MAD</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('label_total_tva')}</Text>
                    <Text style={styles.totalValue}>{totalTVA.toLocaleString('fr-FR')} MAD</Text>
                  </View>
                  <View style={[styles.totalRow, styles.totalRowLast]}>
                    <Text style={styles.totalLabelBold}>{t('label_total_ttc')}</Text>
                    <Text style={styles.totalValueBold}>{totalTTC.toLocaleString('fr-FR')} MAD</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.addArticleBtn, !isValid && styles.addArticleBtnDisabled]}
                onPress={handleSubmit(onSubmit as any)}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.addArticleBtnText}>{t('button_confirm')}</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Client Picker Modal */}
        <Modal visible={showClientPicker} transparent animationType="fade" onRequestClose={closeClientPicker}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={closeClientPicker}>
            {/* Inner wrapper stops touch from bubbling to the overlay close handler */}
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width: '100%' }}>
              <View style={styles.pickerSheet}>
                {/* Title row: title + Search icon + Plus icon */}
                <View style={styles.pickerSheetTitleRow}>
                  <Text style={styles.pickerSheetTitleText}>{t('modal_title_client')}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.pickerSheetAddBtn, showClientSearch && styles.pickerSheetAddBtnActive]}
                      onPress={() => {
                        setShowClientSearch(prev => {
                          if (prev) { setClientSearchQuery(''); setClientSearchResults(null); }
                          return !prev;
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Search size={18} color={showClientSearch ? '#FFFFFF' : '#1E5BAC'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pickerSheetAddBtn}
                      onPress={() => { closeClientPicker(); setShowCreateClientModal(true); }}
                      activeOpacity={0.7}
                    >
                      <Plus size={18} color="#1E5BAC" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Inline search input */}
                {showClientSearch && (
                  <View style={styles.clientSearchRow}>
                    <Search size={15} color="#9CA3AF" />
                    <TextInput
                      style={styles.clientSearchInput}
                      value={clientSearchQuery}
                      onChangeText={setClientSearchQuery}
                      placeholder={t('placeholder_search_client')}
                      placeholderTextColor="#9CA3AF"
                      autoFocus
                      returnKeyType="search"
                    />
                    {clientSearchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => { setClientSearchQuery(''); setClientSearchResults(null); }} activeOpacity={0.7}>
                        <X size={15} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Options list */}
                <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300 }}>
                  {clientSearchLoading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#1E5BAC" />
                    </View>
                  ) : (
                    (clientSearchResults ?? clients).map(c => (
                      <TouchableOpacity
                        key={c.id}
                        style={styles.pickerOption}
                        onPress={() => {
                          setValue('clientId', c.id, { shouldValidate: true });
                          closeClientPicker();
                        }}
                      >
                        <Text style={[styles.pickerOptionText, watchedClientId === c.id && styles.pickerOptionSelected]}>{c.name}</Text>
                        {watchedClientId === c.id && <Text style={styles.pickerCheck}>✓</Text>}
                      </TouchableOpacity>
                    ))
                  )}
                  {!clientSearchLoading && clientSearchResults?.length === 0 && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: '#9CA3AF' }}>{t('text_no_clients_found')}</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Account Picker Modal */}
        <Modal visible={showAccountPicker} transparent animationType="fade" onRequestClose={() => setShowAccountPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowAccountPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('modal_title_payment_method')}</Text>
              {accounts.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.pickerOption}
                  onPress={() => {
                    setValue('accountId', a.id, { shouldValidate: true });
                    setShowAccountPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, watchedAccountId === a.id && styles.pickerOptionSelected]}>{a.name}</Text>
                  {watchedAccountId === a.id && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Statut Picker Modal */}
        <Modal visible={showStatusPicker} transparent animationType="fade" onRequestClose={() => setShowStatusPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowStatusPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('modal_title_status')}</Text>
              {STATUT_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={styles.pickerOption}
                  onPress={() => {
                    setValue('status', s, { shouldValidate: true });
                    setShowStatusPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, watchedStatus === s && styles.pickerOptionSelected]}>{s}</Text>
                  {watchedStatus === s && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerSheet}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} activeOpacity={0.7}>
                  <Text style={styles.datePickerCancel}>{t('modal_cancel_text')}</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>{t('modal_title_date')}</Text>
                <TouchableOpacity onPress={confirmDate} activeOpacity={0.7}>
                  <Text style={styles.datePickerOk}>{t('button_confirm')}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={{ width: '100%', height: 216 }}
              />
            </View>
          </View>
        </Modal>

        <ArticleModal
          visible={showArticleModal}
          onClose={() => setShowArticleModal(false)}
          onConfirm={a => {
            setValue('articles', [...watchedArticles, a], { shouldValidate: true });
            setShowArticleModal(false);
          }}
        />

        <Modal visible={showImagePreview} transparent animationType="fade" onRequestClose={() => setShowImagePreview(false)}>
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setShowImagePreview(false)} activeOpacity={0.7}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: document?.uri ?? document?.fileCopyUri }}
              style={styles.imagePreviewFull}
              resizeMode="contain"
            />
          </View>
        </Modal>

        <CreateClientModal
          visible={showCreateClientModal}
          onClose={() => setShowCreateClientModal(false)}
          onCreated={() => {
            onClientsRefresh?.();
            setShowCreateClientModal(false);
            setShowClientPicker(true);
          }}
        />
      </View>
    </Modal>
  );
};

// Detail Modal
const DetailModal: React.FC<{
  item: InvoiceItem;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  onEdit: () => void;
  onUpdate: (id: number, payload: any) => Promise<{ success: boolean; error?: string }>;
}> = ({ item, onClose, onDelete, onEdit, onUpdate }) => {
  const { t } = useTranslation();
  const totalHT = item.articles.reduce((s, a) => s + parseFloat(a.total_price_ht), 0);
  const totalTVA = item.articles.reduce((s, a) => s + (parseFloat(a.total_price_ht) * parseFloat(a.tva_percentage)) / 100, 0);
  const totalTTC = totalHT + totalTVA;
  const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
    const rawFileName = item.document_path?.split('/').pop() || 'Document';
  const attachmentName = rawFileName.length > 24 ? `${rawFileName.slice(0, 24)}...` : rawFileName;
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(item.status);
  const token = useSelector((state: any) => state.user.token);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const { getPdfDownloadUrl } = useInvoice();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) { setShowStatusPicker(false); return; }
    setShowStatusPicker(false);
    setUpdatingStatus(true);
    try {
      const datePart = item.date.split('T')[0];
      const payload = {
        customer_id: item.customer_id,
        client_id: item.client_id,
        date: datePart,
        invoice_number: item.invoice_number,
        payment_method: item.payment_method,
        status: newStatus,
        notes: item.notes || null,
        document: null,
        articles: item.articles.map(a => ({
          designation: a.designation,
          unit_price_ht: parseFloat(a.unit_price_ht),
          quantity: a.quantity,
          total_price_ht: parseFloat(a.total_price_ht),
          tva_percentage: parseFloat(a.tva_percentage),
        })),
      };
      const result = await onUpdate(item.id, payload);
      if (result.success) {
        setCurrentStatus(newStatus);
      } else {
        Alert.alert(t('error_title'), result.error ?? t('error_update_status'));
      }
    } catch {
      Alert.alert(t('error_title'), t('error_update_status'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('alert_delete_invoice'),
      t('message_confirm_delete').replace('{invoice_number}', item.invoice_number),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await onDelete(item.id);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

    const handleDownload = async () => {
        if (!item.invoice_url) return;

        setDownloading(true);

        try {
            const { fs, config } = ReactNativeBlobUtil;
            const filePath = `${fs.dirs.CacheDir}/invoice_${item.id}`;

            const res = await config({
                fileCache: true,
                path: filePath
            }).fetch('GET', item.invoice_url, {
                Authorization: `Bearer ${token}`,
                Accept: 'application/octet-stream', // Requesting raw binary data
            });

            const headers = res.respInfo.headers;
            const mime = (headers['Content-Type'] || headers['content-type'] || 'application/pdf').split(';')[0];

            const extensionMap: any = {
                'application/pdf': 'pdf',
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/jpg': 'jpg',
            };
            const ext = extensionMap[mime] || 'pdf'; // default to pdf if unknown

            const finalPath = `${res.path()}.${ext}`;

            if (await fs.exists(finalPath)) await fs.unlink(finalPath);
            await fs.mv(res.path(), finalPath);

            console.log('Document saved to:', finalPath);

            if (Platform.OS === 'ios') {
                await Share.share({
                    url: `file://${finalPath}`,
                    // type: mime
                });
            } else {
                await ReactNativeBlobUtil.android.actionViewIntent(finalPath, mime);
            }

        } catch (e) {
            console.error('Download error:', e);
            Alert.alert(t('error_title'), t('error_document_not_found'));
        } finally {
            setDownloading(false);
        }
    };

  const handleShare = async () => {
    const url = getPdfDownloadUrl(item.id);
    setSharing(true);
    try {
      const { fs, config } = ReactNativeBlobUtil;
      const safeNumber = item.invoice_number.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `${fs.dirs.CacheDir}/invoice_pdf_${safeNumber}.pdf`;

      if (await fs.exists(filePath)) await fs.unlink(filePath);

      const res = await config({ fileCache: true, path: filePath }).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      });

      const headers = res.respInfo.headers;
      const contentType = (headers['Content-Type'] || headers['content-type'] || 'application/pdf').split(';')[0].trim();

      if (contentType.includes('text/html')) {
        await fs.unlink(filePath).catch(() => {});
        Alert.alert(t('error_title'), t('error_pdf_expired'));
        return;
      }

      const message = t('message_share_invoice').replace('{invoice_number}', item.invoice_number);

      if (Platform.OS === 'ios') {
        await Share.share({
          url: `file://${filePath}`,
          message,
        });
      } else {
        await ReactNativeBlobUtil.android.actionViewIntent(filePath, contentType || 'application/pdf');
      }
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        console.error('Share error:', e);
        Alert.alert(t('error_title'), t('error_unable_to_share'));
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    let pdfPath: string | null = null;
    try {
      const url = getPdfDownloadUrl(item.id);
      const { fs, config } = ReactNativeBlobUtil;
      const safeNumber = item.invoice_number.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = Platform.OS === 'ios'
        ? `${fs.dirs.DocumentDir}/invoice_pdf_${safeNumber}.pdf`
        : `${fs.dirs.DownloadDir}/invoice_pdf_${safeNumber}.pdf`;

      if (await fs.exists(filePath)) await fs.unlink(filePath);

      const res = await config({ fileCache: true, path: filePath }).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      });

      const headers = res.respInfo.headers;
      const contentType = (headers['Content-Type'] || headers['content-type'] || 'application/pdf').split(';')[0].trim();

      if (contentType.includes('text/html')) {
        await fs.unlink(filePath).catch(() => {});
        Alert.alert(t('error_title'), t('error_pdf_expired'));
        return;
      }

      pdfPath = res.path();
    } catch (e: any) {
      console.error('PDF download error:', e);
      Alert.alert(t('error_title'), t('error_unable_to_download_pdf'));
    } finally {
      setDownloadingPdf(false);
    }

    if (pdfPath) {
      onClose(); // Dismiss modal first
      const path = pdfPath;
      setTimeout(() => {
        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios.openDocument(path);
        } else {
          ReactNativeBlobUtil.android.actionViewIntent(path, 'application/pdf');
        }
      }, 400); // Wait for pageSheet dismiss animation to finish
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        {/* Header */}
        <View style={styles.detailModalHeader}>
          <Text style={styles.detailModalTitle}>{t('title_invoice_details')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.detailCloseBtn} activeOpacity={0.7}>
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Amount hero */}
          <View style={styles.detailHero}>
            {/* Status dropdown */}
            <TouchableOpacity
              style={styles.statusDropdownBtn}
              onPress={() => setShowStatusPicker(true)}
              disabled={updatingStatus}
              activeOpacity={0.8}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color="#1E5BAC" />
              ) : (
                <>
                  {/* <StatusBadge status={currentStatus} /> */}
                  <Text>{currentStatus}</Text>
                  
                  <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 4 }} />
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.detailAmount}>{totalTTC.toLocaleString('fr-FR')} MAD</Text>
            <Text style={styles.detailDate}>{formattedDate}</Text>
          </View>

          {/* Detail rows */}
          <View style={styles.detailCard}>
            {[
              { label: t('label_invoice_number'), value: item.invoice_number },
              { label: t('label_client'), value: item.client?.client_name ?? '—' },
              { label: t('label_payment_method'), value: item.payment_method },
              { label: t('label_status'), value: currentStatus },
              { label: t('label_total_ht'), value: `${totalHT.toLocaleString('fr-FR')} MAD` },
              { label: t('label_total_tva'), value: `${totalTVA.toLocaleString('fr-FR')} MAD` },
              { label: t('label_total_ttc'), value: `${totalTTC.toLocaleString('fr-FR')} MAD` },
              { label: t('label_notes'), value: item.notes || '-' },
            ].map(row => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>{row.label}</Text>
                <Text style={styles.detailRowValue}>{row.value ?? '—'}</Text>
              </View>
            ))}
          </View>

          {/* Articles */}
          {item.articles.length > 0 && (
            <View style={styles.detailCard}>
              <View style={[styles.detailRow, { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }]}>
                <Text style={[styles.detailRowLabel, { fontWeight: '700', color: '#1F2937' }]}>{t('label_articles')}</Text>
              </View>
              {item.articles.map(a => (
                <View key={a.id} style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailRowLabel, { fontWeight: '600', color: '#1F2937' }]}>{a.designation}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {a.quantity} × {parseFloat(a.unit_price_ht).toLocaleString('fr-FR')} MAD HT  •  TVA {a.tva_percentage}%
                    </Text>
                  </View>
                  <Text style={styles.detailRowValue}>{parseFloat(a.total_price_ht).toLocaleString('fr-FR')} MAD</Text>
                </View>
              ))}
            </View>
          )}

          {/* Attachment */}
          {item.document_path ? (
            <TouchableOpacity style={styles.attachmentCard} onPress={handleDownload} activeOpacity={0.8} disabled={downloading}>
              <View style={styles.attachmentLeft}>
                <View style={styles.attachmentIconBox}>
                  <FileText size={20} color="#1E5BAC" />
                </View>
                <View>
                  {/* <Text style={styles.attachmentName}>{item.document_path.split('/').pop()}</Text> */}
                  <Text style={styles.attachmentName}>{attachmentName}</Text>
                  <Text style={styles.attachmentSub}>{t('label_document_attached')}</Text>
                </View>
              </View>
              <View style={styles.attachmentDownload}>
                {downloading
                  ? <ActivityIndicator size="small" color="#1E5BAC" />
                  : <Download size={18} color="#1E5BAC" />}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noAttachment}>
              <CloudUpload size={28} color="#D1D5DB" />
              <Text style={styles.noAttachmentText}>{t('text_no_documents')}</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.noAttachmentLink}>{t('label_add_document')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Supprimer — inline below attachment */}
          <TouchableOpacity
            style={styles.inlineDeleteBtn}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting
              ? <ActivityIndicator size="small" color="#DC2626" />
              : <>
                  <Trash2 size={16} color="#DC2626" />
                  <Text style={styles.inlineDeleteText}>{t('alert_delete_invoice')}</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={styles.detailFooter}>
          <TouchableOpacity
            style={[styles.detailDownloadPdfBtn, downloadingPdf && { opacity: 0.5 }]}
            onPress={handleDownloadPdf}
            disabled={downloadingPdf}
            activeOpacity={0.8}
          >
            {downloadingPdf
              ? <ActivityIndicator size="small" color="#16A34A" />
              : <>
                  <Download size={16} color="#16A34A" />
                  <Text style={styles.detailDownloadPdfText}>PDF</Text>
                </>
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.detailShareBtn, (!item.invoice_url || sharing) && { opacity: 0.5 }]}
            onPress={handleShare}
            disabled={!item.invoice_url || sharing}
            activeOpacity={0.8}
          >
            {sharing
              ? <ActivityIndicator size="small" color="#1E5BAC" />
              : <>
                  <Share2 size={16} color="#1E5BAC" />
                  <Text style={styles.detailShareText}>{t('button_share')}</Text>
                </>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailEditBtn} onPress={onEdit} activeOpacity={0.8}>
            <Upload size={16} color="#FFFFFF" />
            <Text style={styles.detailEditText}>{t('button_edit')}</Text>
          </TouchableOpacity>
        </View>

        {/* Status Picker Modal */}
        <Modal visible={showStatusPicker} transparent animationType="slide" onRequestClose={() => setShowStatusPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowStatusPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('modal_title_change_status')}</Text>
              {STATUT_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={styles.pickerOption}
                  onPress={() => handleStatusChange(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerOptionText, currentStatus === s && styles.pickerOptionSelected]}>{s}</Text>
                  {currentStatus === s && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

// Main Invoice Screen
const Invoice: React.FC = ({ navigation: navProp }: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const route = useRoute<any>();
  const { getInvoices, getInvoiceResources, createInvoice, updateInvoice, exportInvoices, deleteInvoice } = useInvoice();
  const token = useSelector((state: any) => state.user.token);
  const user = useSelector((state: any) => state.user.customer);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<InvoiceTabType>('Tous');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const MONTHS = [t('month_january'), t('month_february'), t('month_march'), t('month_april'), t('month_may'), t('month_june'), t('month_july'), t('month_august'), t('month_september'), t('month_october'), t('month_november'), t('month_december')];
  const YEARS = ['2026', '2025', '2024'];
  const isFilterMount = useRef(false);

  const getFilterParams = () => {
    const monthNum = selectedMonth !== null ? MONTHS.indexOf(selectedMonth) + 1 : undefined;
    const yearNum = selectedYear !== null ? parseInt(selectedYear) : undefined;
    return (monthNum || yearNum) ? { month: monthNum, year: yearNum } : undefined;
  };

  const fetchData = async (params?: { month?: number; year?: number }) => {
    try {
      const [invoicesResult, resourcesResult] = await Promise.all([
        getInvoices(params),
        getInvoiceResources(),
      ]);
      if (invoicesResult.success) setInvoices(invoicesResult.invoices ?? []);
      if (resourcesResult.success) {
        setAccounts(resourcesResult.resources?.accounts ?? []);
        setCategories(resourcesResult.resources?.categories ?? []);
        setClients(
          (resourcesResult.resources?.clients ?? []).map((c: any) => ({
            id: c.id,
            name: c.client_name,
          }))
        );
      }
    } catch {
      Alert.alert(t('error_title'), t('error_generic'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const refreshClients = async () => {
    try {
      const resourcesResult = await getInvoiceResources();
      if (resourcesResult.success) {
        setClients(
          (resourcesResult.resources?.clients ?? []).map((c: any) => ({
            id: c.id,
            name: c.client_name,
          }))
        );
      }
    } catch {}
  };

  useEffect(() => {
    if (!isFilterMount.current) { isFilterMount.current = true; return; }
    setLoading(true);
    fetchData(getFilterParams());
  }, [selectedMonth, selectedYear]);

  const handleEditInvoice = (item: InvoiceItem) => {
    setSelectedItem(null);
    setEditingItem(item);
  };

  const handleDeleteInvoice = async (id: number) => {
    const result = await deleteInvoice(id);
    if (result.success) {
      setSelectedItem(null);
      fetchData();
      Alert.alert(t('success_title'), t('success_invoice_deleted'));
    } else {
      Alert.alert(t('error_title'), result.error ?? t('error_delete_invoice'));
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = await exportInvoices();
      if (result.success && result.csvData) {
        const { fs } = ReactNativeBlobUtil;
        const fileName = result.fileName || 'invoices_export.csv';
        const filePath = `${fs.dirs.CacheDir}/${fileName}`;

        // Remove stale cached file if present
        if (await fs.exists(filePath)) await fs.unlink(filePath);

        // Write CSV string directly to file — no second network request needed
        await fs.writeFile(filePath, result.csvData, 'utf8');

        if (Platform.OS === 'ios') {
          await Share.share({ url: `file://${filePath}` });
        } else {
          await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'text/csv');
        }
      } else {
        Alert.alert(t('error_title'), result.error ?? t('error_generic'));
      }
    } catch (e) {
      console.error('Export error:', e);
      Alert.alert(t('error_title'), t('error_document_not_found'));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!loading && route.params?.openCreateModal) {
      setShowCreateModal(true);
    }
  }, [loading, route.params?.openCreateModal]);

  const filtered = invoices.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || t.invoice_number.toLowerCase().includes(q) || (t.client?.client_name ?? '').toLowerCase().includes(q);
    const matchesTab = activeTab === 'Tous' || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const renderItem = ({ item }: { item: InvoiceItem }) => {
    console.log('rennnndddiii444', item)
    const totalHT = item.articles.reduce((s, a) => s + parseFloat(a.total_price_ht), 0);
    const totalTVA = item.articles.reduce((s, a) => s + (parseFloat(a.total_price_ht) * parseFloat(a.tva_percentage)) / 100, 0);
    const totalTTC = totalHT + totalTVA;
    console.log('totaltttc:11', totalTTC);
    console.log('totaltttc:22', totalTTC.toLocaleString('fr-FR'));
    const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
    return (
      <TouchableOpacity style={styles.invoiceCard} onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
        <View style={styles.invoiceCardLeft}>
          <View style={styles.invoiceIconBox}>
            <Plus size={20} color="#16A34A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.invoiceDesc} numberOfLines={1}>{item.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>
              {formattedDate} • {item.status}
            </Text>
            {item.client && <Text style={styles.invoiceRef}>{item.client.client_name}</Text>}
          </View>
        </View>
        <View style={styles.invoiceCardRight}>
          <Text style={styles.invoiceAmount}>+{totalTTC.toLocaleString('fr-FR')} MAD</Text>
          {/* <StatusBadge status={item.status} /> */}
          <ReviewBadge reviewStatus={item.review_status} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}

            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
              </View>
              <View style={styles.titleRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => nav.goBack()} activeOpacity={0.7}>
                  <ArrowLeft size={20} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.titleText}>{t('title_invoices')}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting} activeOpacity={0.8}>
                  {exporting
                    ? <ActivityIndicator size="small" color="#4B5563" />
                    : <Upload size={15} color="#4B5563" />
                  }
                  <Text style={styles.exportBtnText}>{t('button_export')}</Text>
                </TouchableOpacity>
              </View>
            </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {/* Month */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={[styles.filterBtn, selectedMonth !== null && styles.filterBtnActive]}
            onPress={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, selectedMonth !== null && styles.filterBtnTextActive]}>{selectedMonth ?? t('filter_month')}</Text>
            <ChevronDown size={14} color={selectedMonth !== null ? '#1E5BAC' : '#6B7280'} />
          </TouchableOpacity>
          {showMonthPicker && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedMonth(null); setShowMonthPicker(false); }}>
                <Text style={styles.dropdownItemText}>{t('filter_all_months')}</Text>
              </TouchableOpacity>
              {MONTHS.map(m => (
                <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setSelectedMonth(m); setShowMonthPicker(false); }}>
                  <Text style={[styles.dropdownItemText, selectedMonth === m && styles.dropdownItemSelected]}>{m}</Text>
                  {selectedMonth === m && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Year */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={[styles.filterBtn, selectedYear !== null && styles.filterBtnActive]}
            onPress={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, selectedYear !== null && styles.filterBtnTextActive]}>{selectedYear ?? t('filter_year')}</Text>
            <ChevronDown size={14} color={selectedYear !== null ? '#1E5BAC' : '#6B7280'} />
          </TouchableOpacity>
          {showYearPicker && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedYear(null); setShowYearPicker(false); }}>
                <Text style={styles.dropdownItemText}>{t('filter_all_years')}</Text>
              </TouchableOpacity>
              {YEARS.map(y => (
                <TouchableOpacity key={y} style={styles.dropdownItem} onPress={() => { setSelectedYear(y); setShowYearPicker(false); }}>
                  <Text style={[styles.dropdownItemText, selectedYear === y && styles.dropdownItemSelected]}>{y}</Text>
                  {selectedYear === y && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsWrapper}
        contentContainerStyle={styles.tabsContainer}
      >
        {INVOICE_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(getFilterParams()); }} tintColor="#1E5BAC" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Receipt size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('empty_no_invoices')}</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Create Modal */}
      <CreateInvoiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        accounts={accounts}
        clients={clients}
        customerId={user?.id ?? 0}
        onCreated={fetchData}
        onSave={createInvoice}
        onClientsRefresh={refreshClients}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleDeleteInvoice}
          onEdit={() => handleEditInvoice(selectedItem)}
          onUpdate={updateInvoice}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <CreateInvoiceModal
          visible={!!editingItem}
          onClose={() => setEditingItem(null)}
          accounts={accounts}
          clients={clients}
          customerId={user?.id ?? 0}
          onCreated={fetchData}
          onSave={createInvoice}
          editItem={editingItem}
          onUpdate={updateInvoice}
          onClientsRefresh={refreshClients}
        />
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  logo: { height: 48, width: 160 },
  headerSpacer: { width: 40 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#1F2937', padding: 0 },
  bellButton: { position: 'relative', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 12 },
  bellBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#EF4444', borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  bellBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },

  // Banner
  bannerWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 12, gap: 8,
  },
  titleBanner: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  titleBannerInner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  titleIconBox: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center', alignItems: 'center',
  },
  titleText: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  exportBtnText: { fontSize: 13, fontWeight: '500', color: '#4B5563' },

  // Tabs
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexGrow: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CCCCCC',
  },
  activeTabText: {
    color: '#0B5FA5',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0B5FA5',
  },

  // Filters
  filtersRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BFDBFE',
  },
  filterBtnText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  filterBtnTextActive: { color: '#1E5BAC' },
  dropdown: {
    position: 'absolute', top: 44, left: 0, zIndex: 50,
    backgroundColor: '#FFFFFF', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 8,
    minWidth: 160, borderWidth: 1, borderColor: '#F3F4F6',
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  dropdownItemText: { fontSize: 13, color: '#374151' },
  dropdownItemSelected: { color: '#1E5BAC', fontWeight: '600' },
  dropdownCheck: { color: '#1E5BAC', fontWeight: '700', fontSize: 14 },

  // List
  listContent: { padding: 12, paddingBottom: 100, gap: 10 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  // Invoice Card
  invoiceCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  invoiceCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  invoiceIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#c5efd5',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  invoiceDesc: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  invoiceMeta: { fontSize: 12, color: '#6B7280' },
  invoiceRef: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  invoiceCardRight: { alignItems: 'flex-end', gap: 4 },
  invoiceAmount: { fontSize: 14, fontWeight: '700', color: '#16A34A' },
  attachmentDot: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // Status Badge
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeOrange: { backgroundColor: '#FFEDD5' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextGreen: { color: '#16A34A' },
  badgeTextOrange: { color: '#EA580C' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeTextRed: { color: '#DC2626' },
  badgeBlue: { backgroundColor: '#DBEAFE' },
  badgeTextBlue: { color: '#1D4ED8' },

  // FAB
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 8,
  },

  // Modal shared
  modalContainer: { flex: 1, backgroundColor: '#F5F7FF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F5F7FF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  modalCancelText: { fontSize: 15, fontWeight: '500', color: '#1E5BAC' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  modalConfirmBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    minWidth: 80, alignItems: 'center',
  },
  modalConfirmText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  modalContent: { padding: 16, paddingBottom: 40 },

  // Form card
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 18, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  fieldBlock: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  required: { color: '#1E5BAC' },
  fieldInput: {
    backgroundColor: '#F3F4F6', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1F2937',
  },
  fieldInputReadOnly: { color: '#6B7280' },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center' },
  fieldUnit: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginLeft: 8 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F3F4F6', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  pickerPlaceholderText: { fontSize: 14, color: '#9CA3AF', flex: 1 },
  pickerValueText: { fontSize: 14, color: '#1F2937', flex: 1, fontWeight: '500' },

  // Upload
  uploadRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingVertical: 14,
  },
  uploadRowDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },
  uploadText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  uploadTextDone: { color: '#16A34A', flex: 1 },
  uploadArea: { flexDirection: 'row', gap: 12 },
  uploadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E0E7FF', borderRadius: 12,
    paddingVertical: 14,
  },
  uploadBtnText: { fontSize: 12, fontWeight: '500', color: '#374151' },

  // Attachment preview card
  attachmentPreview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F4FF', borderRadius: 12,
    borderWidth: 1, borderColor: '#C7D2FE',
    padding: 10, gap: 10,
  },
  attachmentThumbWrapper: {
    width: 56, height: 56, borderRadius: 8,
    overflow: 'hidden', flexShrink: 0,
  },
  attachmentThumb: { width: 56, height: 56 },
  attachmentThumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center', alignItems: 'center',
  },
  attachmentFileIconBox: {
    width: 56, height: 56, borderRadius: 8,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  attachmentInfo: { flex: 1 },
  attachmentFileName: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  attachmentFileMeta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  attachmentRemoveBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },

  // Full-screen image preview
  imagePreviewOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute', top: 56, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  imagePreviewFull: { width: '100%', height: '80%' },

  // Articles inside form
  addArticleRowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#EEF2FF',
    borderWidth: 1, borderColor: '#C7D2FE',
    borderRadius: 10, paddingVertical: 12,
  },
  addArticleRowText: { fontSize: 14, fontWeight: '600', color: '#1E5BAC' },
  articleHint: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  articleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 8,
    padding: 10, gap: 4,
  },
  articleDesignation: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  articleMeta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  articleTotal: { fontSize: 13, fontWeight: '600', color: '#16A34A' },

  // Totals
  totalsBlock: {
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingTop: 12, gap: 8,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRowLast: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  totalValue: { fontSize: 14, color: '#374151', fontWeight: '500' },
  totalLabelBold: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  totalValueBold: { fontSize: 15, fontWeight: '700', color: '#1E5BAC' },

  // Add article button
  addArticleBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  addArticleBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // Picker overlay
  pickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  // Date Picker bottom sheet
  datePickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  datePickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  datePickerTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  datePickerCancel: { fontSize: 15, fontWeight: '500', color: '#6B7280' },
  datePickerOk: { fontSize: 15, fontWeight: '700', color: '#1E5BAC' },
  pickerSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingVertical: 12, paddingHorizontal: 8,
    maxHeight: 400,
  },
  pickerSheetTitle: {
    fontSize: 14, fontWeight: '700', color: '#374151',
    paddingHorizontal: 12, paddingBottom: 8, marginBottom: 4,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  pickerSheetTitleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 8, marginBottom: 4,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  pickerSheetTitleText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  pickerSheetAddBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  pickerOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  pickerOptionText: { fontSize: 14, color: '#374151' },
  pickerOptionSelected: { color: '#1E5BAC', fontWeight: '600' },
  pickerCheck: { fontSize: 15, color: '#1E5BAC', fontWeight: '700' },

  // Detail Modal
  detailModalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  detailModalTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  detailCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  detailHero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  statusDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: 80,
    justifyContent: 'center',
    minHeight: 32,
  },
  badgeGreenLg: { backgroundColor: '#DCFCE7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  badgeGreenLgText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  detailAmount: { fontSize: 28, fontWeight: '700', color: '#16A34A' },
  detailDate: { fontSize: 13, color: '#9CA3AF' },
  detailCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  detailRowLabel: { fontSize: 14, color: '#6B7280' },
  detailRowValue: { fontSize: 14, fontWeight: '600', color: '#1F2937', maxWidth: '55%', textAlign: 'right' },
  attachmentCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  attachmentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  attachmentIconBox: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
  },
  attachmentName: { fontSize: 13, fontWeight: '600', color: '#1E3A5F' },
  attachmentSub: { fontSize: 11, color: '#3B82F6', marginTop: 2 },
  attachmentDownload: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  noAttachment: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#E5E7EB',
    borderRadius: 12, padding: 24,
    alignItems: 'center', gap: 6,
  },
  noAttachmentText: { fontSize: 13, color: '#9CA3AF' },
  noAttachmentLink: { fontSize: 13, fontWeight: '600', color: '#1E5BAC' },
  detailFooter: {
    flexDirection: 'row', gap: 12,
    padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  detailDeleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  detailDeleteText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  detailShareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  detailShareText: { fontSize: 14, fontWeight: '600', color: '#1E5BAC' },
  detailEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#1E5BAC',
  },
  detailEditText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  detailDownloadPdfBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  detailDownloadPdfText: { fontSize: 14, fontWeight: '600', color: '#16A34A' },
  inlineDeleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  inlineDeleteText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },

  // Autocomplete suggestions
  suggestionsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    zIndex: 99,
  },
  suggestionLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  suggestionLoadingText: { fontSize: 13, color: '#6B7280' },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  suggestionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionDesignation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  suggestionMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  notesInput: {
  height: 100,
  paddingTop: 12,
  paddingBottom: 12,
  lineHeight: 20,
},

  // Validation error
  fieldError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 3,
    fontWeight: '500',
  },
  fieldInputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FFF5F5',
  },

  // Disabled confirm button
  modalConfirmBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  addArticleBtnDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Client search inside picker
  pickerSheetAddBtnActive: {
    backgroundColor: '#1E5BAC',
  },
  clientSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  clientSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },
});

export default Invoice;
