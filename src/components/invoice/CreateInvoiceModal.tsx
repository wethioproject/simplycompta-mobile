import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  FileText,
  X,
  Camera,
  Calendar,
  Plus,
  Search,
  Eye,
} from 'lucide-react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';
import { useInvoice } from '../../hooks/useInvoice';
import { CreateClientModal } from '../../components/clients/CreateClientModal';
import ArticleModal from './ArticleModal';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import type { Account, Client, InvoiceArticle, InvoiceItem, Article } from '../../types/invoice.types';
import { STATUT_OPTIONS, PAYMENT_METHODS } from '../../types/invoice.types';

const invoiceSchema = yup.object({
  invoiceNumber: yup.string().trim().required('Invoice number is required'),
  date: yup.string().required('Date is required'),
  clientId: yup
    .number()
    .typeError('Client is required')
    .required('Client is required')
    .positive('Client is required'),
  accountId: yup.string().trim().required('Payment method is required'),
  validUntil: yup.string().required('Due date is required'),
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
  validUntil: string;
  clientId: number;
  accountId: string;
  status: string;
  articles: Article[];
  notes: string;
};

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
  defaultClientId?: number;
}> = ({ visible, onClose, accounts, clients, customerId, onCreated, onSave, editItem, onUpdate, onClientsRefresh, defaultClientId }) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { getInvoiceResources } = useInvoice();

  // Non-form UI states
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [tempDueDate, setTempDueDate] = useState<Date>(new Date());
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Client search states
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<Client[] | null>(null);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const clientSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      validUntil: '',
      clientId: undefined,
      accountId: undefined,
      status: 'Issued',
      articles: [],
      notes: '',
    },
  });

  const watchedClientId = watch('clientId');
  const watchedAccountId = watch('accountId');
  const watchedStatus = watch('status');
  const watchedDate = watch('date');
  const watchedValidUntil = watch('validUntil');
  const watchedArticles = watch('articles') ?? [];

  // Derived display objects from IDs
  const selectedClient = clients.find(c => c.id === watchedClientId) ?? null;
  const selectedPaymentMethod = PAYMENT_METHODS.find(p => p.key === watchedAccountId) ?? null;
  const pmLabel = (pm: { key: string; fr: string; en: string }) =>
    i18n.language.startsWith('fr') ? pm.fr : pm.en;

  // Reset / populate form when modal opens
  React.useEffect(() => {
    if (!visible) return;
    setShowArticleModal(false);
    setShowDatePicker(false);
    setShowDueDatePicker(false);
    setSaving(false);

    if (editItem) {
      const datePart = editItem.date.split('T')[0];
      const [ey, em, ed] = datePart.split('-').map(Number);
      setTempDate(new Date(ey, em - 1, ed));
      const client = clients.find(c => c.id === editItem.client_id) ?? null;
      if (editItem.document_path) {
        const fileName = editItem.document_path.split('/').pop() ?? 'document';
        setDocument({ name: fileName, isExisting: true });
      } else {
        setDocument(null);
      }
      reset({
        invoiceNumber: editItem.invoice_number,
        date: datePart,
        validUntil: (editItem.due_date ?? editItem.valid_until) ? (editItem.due_date ?? editItem.valid_until ?? '').split('T')[0] : '',
        clientId: client?.id ?? undefined,
        accountId: editItem.payment_method ?? undefined,
        status: editItem.status,
        notes: editItem.notes ?? '',
        articles: editItem.articles.map(a => ({
          designation: a.designation,
          unitPriceHT: parseFloat(a.unit_price_ht),
          quantity: a.quantity,
          totalHT: parseFloat(a.total_price_ht),
          tva: parseFloat(a.tva_percentage),
          product_id: a.product_id,
        })),
      });
    } else {
      const today = new Date();
      const y = today.getFullYear();
      const mo = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const ty = tomorrow.getFullYear();
      const tmo = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const td = String(tomorrow.getDate()).padStart(2, '0');
      setDocument(null);
      setTempDate(today);
      setTempDueDate(tomorrow);
      (async () => {
        const resourcesResult = await getInvoiceResources();
        const autoInvoiceNumber = (resourcesResult.resources as any)?.invoice_number ?? '';
        reset({
          invoiceNumber: autoInvoiceNumber,
          date: `${y}-${mo}-${d}`,
          validUntil: `${ty}-${tmo}-${td}`,
          clientId: defaultClientId ?? undefined,
          accountId: undefined,
          status: 'Issued',
          notes: '',
          articles: [],
        });
      })();
    }
  }, [visible]);

  // Debounced client search
  React.useEffect(() => {
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

  const confirmDueDate = () => {
    const y = tempDueDate.getFullYear();
    const m = String(tempDueDate.getMonth() + 1).padStart(2, '0');
    const d = String(tempDueDate.getDate()).padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    setValue('validUntil', formatted, { shouldValidate: true });
    setShowDueDatePicker(false);
  };

  const totalHT = watchedArticles.reduce((s, a) => s + (a.totalHT ?? 0), 0);
  const totalTVA = watchedArticles.reduce((s, a) => s + ((a.totalHT ?? 0) * (a.tva ?? 0)) / 100, 0);
  console.log('fsfss333', totalTVA)
  const totalTTC = totalHT + totalTVA;

  const onSubmit = async (data: InvoiceFormValues) => {
    setSaving(true);
    try {
      const payload = {
        customer_id: customerId,
        client_id: data.clientId,
        date: data.date,
        invoice_number: data.invoiceNumber,
        payment_method: data.accountId,
        status: data.status,
        due_date: data.validUntil || null,
        notes: data.notes || null,
        document: document?.isExisting ? null : document,
        articles: (data.articles ?? []).map(a => ({
          designation: a.designation,
          unit_price_ht: a.unitPriceHT,
          quantity: a.quantity,
          total_price_ht: a.totalHT,
          tva_percentage: a.tva,
          // ...(a.product_id ? { product_id: a.product_id } : {}),
          product_id: a.product_id,
          unit_id: (a as any).unit_id ?? null,
          discount: (a as any).discount ?? null,
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
        console.log('fdfdfdfd333', payload);
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
                  render={({ field: { value } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.invoiceNumber && styles.fieldInputError, { color: '#6B7280', backgroundColor: '#F3F4F6' }]}
                      value={value}
                      editable={false}
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


              {/* Due Date (validUntil) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_due_date')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.fieldInput, styles.fieldInputRow, { paddingVertical: 13 }, errors.validUntil && styles.fieldInputError]}
                  onPress={() => { setTempDueDate(watchedValidUntil ? new Date(watchedValidUntil) : new Date()); setShowDueDatePicker(true); }}
                  activeOpacity={0.7}
                >
                  <Text style={[{ flex: 1, fontSize: 14 }, watchedValidUntil ? { color: '#1F2937' } : { color: '#9CA3AF' }]}>
                    {watchedValidUntil || 'YYYY-MM-DD'}
                  </Text>
                  <Calendar size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.validUntil && (
                  <Text style={styles.fieldError}>{errors.validUntil.message}</Text>
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
                <Text style={selectedPaymentMethod ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {selectedPaymentMethod ? pmLabel(selectedPaymentMethod) : t('placeholder_payment_method')}
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
                  // disabled={!editItem}
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
              {/* {watchedArticles.length > 0 && (
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
              )} */}

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
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                {PAYMENT_METHODS.map(pm => (
                  <TouchableOpacity
                    key={pm.key}
                    style={styles.pickerOption}
                    onPress={() => {
                      setValue('accountId', pm.key, { shouldValidate: true });
                      setShowAccountPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerOptionText, watchedAccountId === pm.key && styles.pickerOptionSelected]}>
                      {pmLabel(pm)}
                    </Text>
                    {watchedAccountId === pm.key && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
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

        {/* Due Date Picker Modal - iOS only */}
        <Modal visible={Platform.OS === 'ios' && showDueDatePicker} transparent animationType="fade" onRequestClose={() => setShowDueDatePicker(false)}>
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerSheet}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDueDatePicker(false)} activeOpacity={0.7}>
                  <Text style={styles.datePickerCancel}>{t('modal_cancel_text')}</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>{t('label_due_date')}</Text>
                <TouchableOpacity onPress={confirmDueDate} activeOpacity={0.7}>
                  <Text style={styles.datePickerOk}>{t('button_confirm')}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'center', paddingBottom: 8 }}>
                <DateTimePicker
                  value={tempDueDate}
                  mode="date"
                  display="inline"
                  onChange={(_, selected) => { if (selected) setTempDueDate(selected); }}
                  themeVariant="light"
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Due Date Picker - Android */}
        {Platform.OS === 'android' && showDueDatePicker && (
          <DateTimePicker
            value={tempDueDate}
            mode="date"
            display="default"
            onChange={(event, selected) => {
              setShowDueDatePicker(false);
              if (event.type === 'set' && selected) {
                const y = selected.getFullYear();
                const m = String(selected.getMonth() + 1).padStart(2, '0');
                const d = String(selected.getDate()).padStart(2, '0');
                setValue('validUntil', `${y}-${m}-${d}`, { shouldValidate: true });
              }
            }}
          />
        )}

        {/* Date Picker Modal - iOS only (inline calendar in centered card) */}
        <Modal visible={Platform.OS === 'ios' && showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
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
              <View style={{ alignItems: 'center', paddingBottom: 8 }}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                  themeVariant="light"
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker - Android: rendered directly (NOT in a nested Modal) to avoid
            native dialog touch events being swallowed by the Modal overlay */}
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

        <ArticleModal
          visible={showArticleModal}
          customerId={customerId}
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

export default CreateInvoiceModal;
