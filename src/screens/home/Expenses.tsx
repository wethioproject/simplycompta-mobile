import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Linking,
  Share,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useExpense } from '../../hooks/useExpense';
import { useSupplier } from '../../hooks/useSupplier';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  FileText,
  Download,
  Trash2,
  X,
  CloudUpload,
  Calendar,
  Upload,
  Camera,
  Eye,
  Search,
} from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import { PieChart } from 'react-native-gifted-charts';
import dashboardService from '../../services/dashboardService';
import type { ExpenseCategoryItem } from '../../services/dashboardService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import { getMimeType } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { CreateSupplierModal } from './Suppliers';

type StackNavigation = StackNavigationProp<any>;

interface Account { id: number; name: string; }
interface Category { id: number; name: string; }
interface Supplier { id: number; name: string; supplier_name?: string; }

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExpenseItem {
  id: number;
  customer_id: number;
  category_id: number;
  supplier_id: number;
  date: string;
  payment_method: string;
  file: string | null;
  file_url: string | null;
  ttc: string;
  tva: string;
  total_ttc: string;
  total_tva: string;
  category: { id: number; name: string };
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
// const DetailModal: React.FC<{ item: ExpenseItem; onClose: () => void }> = ({ item, onClose }) => (
const DetailModal: React.FC<{ item: any; onClose: () => void, onDelete: (id: number) => Promise<void>, onEdit: () => void }> = ({ item, onClose, onEdit, onDelete }) =>
  
{
  const token = useSelector((state: any) => state.user.token);
  const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
    const [deleting, setDeleting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const { t } = useTranslation();
    console.log('expense itemmm:', item);
  
    const handleDelete = () => {
      Alert.alert(
        t('alert_delete_expense'),
        t('message_confirm_delete_expense'),
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
    if (!item.file_url) return;

    setDownloading(true);

    try {
      const { fs, config } = ReactNativeBlobUtil;
      const filePath = `${fs.dirs.CacheDir}/expense_${item.id}`;

      const res = await config({
        fileCache: true,
        path: filePath
      }).fetch('GET', item.file_url, {
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
      Alert.alert(t('error_title'), t('error_document_unavailable'));
    } finally {
      setDownloading(false);
    }
  };


  return (
  <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={styles.modalContainer} edges={['top']}>
      <View style={styles.detailModalHeader}>
        <Text style={styles.detailModalTitle}>{t('title_expense_details')}</Text>
        <TouchableOpacity onPress={onClose} style={styles.detailCloseBtn} activeOpacity={0.7}>
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={styles.detailHero}>
          <View style={styles.badgeRedLg}>
            <Text style={styles.badgeRedLgText}>{t('label_expense')}</Text>
          </View>
          <Text style={styles.detailAmount}>{parseFloat(item?.total_ttc || '0').toLocaleString('fr-FR')} MAD</Text>
          <Text style={styles.detailDate}>{formattedDate}</Text>
        </View>

        <View style={styles.detailCard}>
          {[
            // { label: 'Description', value: item.description },
            { label: t('label_category'), value: item.category.name },
            { label: t('label_payment_method'), value: item.payment_method },
            // { label: 'Statut', value: item.status === 'completed' ? 'Payé' : 'En attente', isStatus: true, completed: item.status === 'completed' },
          ].map(row => (
            <View key={row.label} style={styles.detailRow}>
              <Text style={styles.detailRowLabel}>{row.label}</Text>
              <Text style={styles.detailRowValue}>{row.value ?? '—'}</Text>
            </View>
          ))}
        </View>

        {item.file ? (
          <TouchableOpacity
            style={styles.attachmentCard}
            onPress={handleDownload}
            activeOpacity={0.8}
            disabled={downloading}
          >
            <View style={styles.attachmentLeft}>
              <View style={styles.attachmentIconBox}>
                <FileText size={20} color="#1E5BAC" />
              </View>
              <View>
                {(() => {
                  const rawName = item.file.split('/').pop() || 'Document';
                  const displayName = rawName.length > 24 ? `${rawName.slice(0, 24)}...` : rawName;
                  return (
                    <>
                      <Text style={styles.attachmentName}>{displayName}</Text>
                      <Text style={styles.attachmentSub}>{t('text_tap_to_download')}</Text>
                    </>
                  );
                })()}
              </View>
            </View>
            <View style={styles.attachmentDownload}>
              <Download size={18} color="#1E5BAC" />
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
      </ScrollView>

      <View style={styles.detailFooter}>
                  <TouchableOpacity style={styles.detailDeleteBtn} onPress={handleDelete} disabled={deleting} activeOpacity={0.8}>
                    {deleting
                      ? <ActivityIndicator size="small" color="#DC2626" />
                      : <>
                          <Trash2 size={16} color="#DC2626" />
                          <Text style={styles.detailDeleteText}>{t('button_delete')}</Text>
                        </>
                    }
                  </TouchableOpacity>
        <TouchableOpacity style={styles.detailEditBtn} onPress={onEdit} activeOpacity={0.8}>
          <Upload size={16} color="#FFFFFF" />
          <Text style={styles.detailEditText}>{t('button_edit')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </Modal>
  )
}


// ─── Yup schema (Expense) ────────────────────────────────────────────────────
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
    .number()
    .typeError('Payment method is required')
    .required('Payment method is required')
    .positive('Payment method is required'),
  categoryId: yup
    .number()
    .typeError('Category is required')
    .required('Category is required')
    .positive('Category is required'),
  supplierId: yup.number().nullable().optional(),
});

type ExpenseFormValues = {
  date: string;
  amountTTC: string;
  amountTVA: string;
  accountId: number;
  categoryId: number;
  supplierId?: number | null;
};

// ─── Create Expense Modal ─────────────────────────────────────────────────────
const CreateExpenseModal: React.FC<{
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
}> = ({ visible, onClose, accounts, categories, suppliers, customerId, onCreated, onSave, editItem, onUpdate, onSuppliersRefresh }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { getSuppliers } = useSupplier();

  // ── Non-form UI state ──────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // ── Supplier search state ──────────────────────────────────────────────
  const [showSupplierSearch, setShowSupplierSearch] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [supplierSearchResults, setSupplierSearchResults] = useState<Supplier[] | null>(null);
  const [supplierSearchLoading, setSupplierSearchLoading] = useState(false);
  const supplierSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── react-hook-form ────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ExpenseFormValues>({
    resolver: yupResolver(expenseSchema) as any,
    mode: 'onChange',
    defaultValues: {
      date: '',
      amountTTC: '',
      amountTVA: '',
      accountId: undefined,
      categoryId: undefined,
      supplierId: null,
    },
  });

  const watchedDate = watch('date');
  const watchedAmountTTC = watch('amountTTC') ?? '';
  const watchedAmountTVA = watch('amountTVA') ?? '';
  const watchedAccountId = watch('accountId');
  const watchedCategoryId = watch('categoryId');
  const watchedSupplierId = watch('supplierId');

  const selectedAccount = accounts.find(a => a.id === watchedAccountId) ?? null;
  const selectedCategory = (categories as Category[]).find(c => c.id === watchedCategoryId) ?? null;
  const selectedSupplier = suppliers.find(s => s.id === watchedSupplierId) ?? null;

  const ttcDisplay = parseFloat(watchedAmountTTC) || 0;
  const tvaDisplay = parseFloat(watchedAmountTVA) || 0;

  // ── Reset / populate form when modal opens ─────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    setShowDatePicker(false);
    setSaving(false);

    if (editItem) {
      const datePart = editItem.date.split('T')[0];
      const [ey, em, ed] = datePart.split('-').map(Number);
      setTempDate(new Date(ey, em - 1, ed));
      const account = accounts.find(a => a.name === editItem.payment_method) ?? null;
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
        accountId: account?.id ?? undefined,
        categoryId: cat?.id ?? undefined,
        supplierId: sup?.id ?? null,
      });
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
        supplierId: null,
      });
    }
  }, [visible]);

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

  // ── Debounced supplier search ──────────────────────────────────────────
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
    return () => { if (supplierSearchTimer.current) clearTimeout(supplierSearchTimer.current); };
  }, [supplierSearchQuery]);

  const closeSupplierPicker = () => {
    setShowSupplierPicker(false);
    setShowSupplierSearch(false);
    setSupplierSearchQuery('');
    setSupplierSearchResults(null);
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: ExpenseFormValues) => {
    setSaving(true);
    try {
      const ttc = parseFloat(data.amountTTC) || 0;
      const tva = parseFloat(data.amountTVA) || 0;
      const payload = {
        customer_id: customerId,
        date: data.date,
        ttc,
        tva,
        payment_method: selectedAccount!.name,
        category_id: data.categoryId,
        supplier_id: data.supplierId ?? null,
        total_ttc: ttc,
        total_tva: tva,
        document: document?.isExisting ? null : document,
      };
      if (editItem && onUpdate) {
        const result = await onUpdate(editItem.id, payload);
        if (result.success) {
          Alert.alert(t('success_title'), t('success_expense_updated'));
          onCreated();
          onClose();
        } else {
          Alert.alert(t('error_title'), result.error ?? t('error_generic'));
        }
      } else {
        const result = await onSave(payload);
        if (result.success) {
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>{t('button_cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editItem ? t('title_edit_expense') : t('title_create_expense')}</Text>
            <TouchableOpacity
              style={[styles.modalConfirmBtn, !isValid && styles.modalConfirmBtnDisabled]}
              onPress={handleSubmit(onSubmit as any)}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalConfirmText}>{t('modal_confirm_text')}</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              {/* Upload area */}
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
                {errors.date && <Text style={styles.fieldError}>{errors.date.message}</Text>}
              </View>

              {/* Amount TTC */}
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

              {/* Amount TVA */}
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

              {/* Payment Method */}
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
                {errors.accountId && <Text style={styles.fieldError}>{errors.accountId.message}</Text>}
              </View>

              {/* Category */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_category')} <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerRow, errors.categoryId && styles.fieldInputError]}
                  onPress={() => setShowCategoryPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={selectedCategory ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedCategory?.name || t('placeholder_category')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
                {errors.categoryId && <Text style={styles.fieldError}>{errors.categoryId.message}</Text>}
              </View>

              {/* Supplier (optional) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_supplier')}</Text>
                <TouchableOpacity
                  style={styles.pickerRow}
                  onPress={() => setShowSupplierPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={selectedSupplier ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedSupplier?.name || t('placeholder_supplier')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
              </View>

              {/* Totals */}
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
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.confirmBtnText}>{t('modal_confirm_text')}</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Category Picker */}
        <Modal visible={showCategoryPicker} transparent animationType="fade" onRequestClose={() => setShowCategoryPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('label_category')}</Text>
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 360 }} showsVerticalScrollIndicator={true}>
                {(categories as Category[]).map(c => (
                  <TouchableOpacity key={c.id} style={styles.pickerOption} onPress={() => { setValue('categoryId', c.id, { shouldValidate: true }); setShowCategoryPicker(false); }}>
                    <Text style={[styles.pickerOptionText, watchedCategoryId === c.id && styles.pickerOptionSelected]}>{c.name}</Text>
                    {watchedCategoryId === c.id && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Account Picker */}
        <Modal visible={showAccountPicker} transparent animationType="fade" onRequestClose={() => setShowAccountPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowAccountPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('label_payment_method')}</Text>
              {accounts.map(a => (
                <TouchableOpacity key={a.id} style={styles.pickerOption} onPress={() => { setValue('accountId', a.id, { shouldValidate: true }); setShowAccountPicker(false); }}>
                  <Text style={[styles.pickerOptionText, watchedAccountId === a.id && styles.pickerOptionSelected]}>{a.name}</Text>
                  {watchedAccountId === a.id && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Supplier Picker */}
        <Modal visible={showSupplierPicker} transparent animationType="fade" onRequestClose={closeSupplierPicker}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={closeSupplierPicker}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width: '100%' }}>
              <View style={styles.pickerSheet}>
                {/* Title row: title + Search icon + Plus icon */}
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

                {/* Inline search input */}
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
                      <TouchableOpacity onPress={() => { setSupplierSearchQuery(''); setSupplierSearchResults(null); }} activeOpacity={0.7}>
                        <X size={15} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Options list */}
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

        {/* Date Picker - iOS */}
        <Modal visible={Platform.OS === 'ios' && showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
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
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker - Android: */}
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

        {/* Image Preview */}
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

        <CreateSupplierModal
          visible={showCreateSupplierModal}
          onClose={() => setShowCreateSupplierModal(false)}
          onCreated={() => {
            onSuppliersRefresh?.();
            setShowCreateSupplierModal(false);
            closeSupplierPicker();
            setShowSupplierPicker(true);
          }}
        />
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const PIE_COLORS = [
  '#3B82F6', '#16A34A', '#10B981', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316',
];

const Expenses: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const route = useRoute<any>();
  const user = useSelector((state: any) => state.user.customer);
  const { getExpenses, getExpense, getExpenseResources, createExpense, updateExpense, exportExpenses, deleteExpense } = useExpense();
  const { getSuppliers } = useSupplier();
  const { getExpenseCategoryChart } = dashboardService;
  const { t } = useTranslation();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);
  const [pieLoading, setPieLoading] = useState(true);
  const [pieCategories, setPieCategories] = useState<ExpenseCategoryItem[]>([]);

  const MONTHS = [
    t('month_january'), t('month_february'), t('month_march'), t('month_april'),
    t('month_may'), t('month_june'), t('month_july'), t('month_august'),
    t('month_september'), t('month_october'), t('month_november'), t('month_december'),
  ];
  const YEARS = ['2026', '2025', '2024'];
  const isFilterMount = useRef(false);

  const getFilterParams = () => {
    const monthNum = selectedMonth !== null ? MONTHS.indexOf(selectedMonth) + 1 : undefined;
    const yearNum = selectedYear !== null ? parseInt(selectedYear) : undefined;
    return (monthNum || yearNum) ? { month: monthNum, year: yearNum } : undefined;
  };

    const fetchData = async (params?: { month?: number; year?: number }) => {
      try {
        const [expensesResult, resourcesResult, suppliersResult, pieChartResult] = await Promise.all([
          getExpenses(params),
          getExpenseResources(),
          getSuppliers(),
          getExpenseCategoryChart(params)
        ]);
        console.log('Expenses Result:', expensesResult);
        console.log('Expenses Resource Result:', resourcesResult);
        if (expensesResult.success) setExpenses(expensesResult.expenses ?? []);
        if (resourcesResult.success) {
          console.log('Resources Result:', resourcesResult.resources);
          setAccounts(resourcesResult.resources?.accounts ?? []);
          setCategories(resourcesResult.resources?.categories ?? []);
        }
        if (suppliersResult.success) {
          setSuppliers((suppliersResult.suppliers ?? []).map((s: any) => ({ id: s.id, name: s.supplier_name || s.name })));
        }
        if(pieChartResult?.success) {
          setPieCategories(pieChartResult.data ?? []);
        }
      } catch {
        Alert.alert(t('error_title'), t('error_load_expenses'));
      } finally {
        setLoading(false);
        setRefreshing(false);
        setPieLoading(false)
      }
    };
  
    useEffect(() => { fetchData(); }, []);

    // useEffect(() => {
    //   setPieLoading(true);
    //   dashboardService.getExpenseCategoryChart().then(res => {
    //     if (res?.success && Array.isArray(res.data)) {
    //       setPieCategories(res.data);
    //     }
    //   })
    //   .catch(e => console.error('Pie chart error:', e))
    //   .finally(() => setPieLoading(false)) 
    // }, [])

    const refreshSuppliers = async () => {
    try {
      const result = await getSuppliers();
      if (result.success) {
        setSuppliers((result.suppliers ?? []).map((s: any) => ({ id: s.id, name: s.supplier_name || s.name })));
      }
    } catch {}
  };

    useEffect(() => {
    if (!isFilterMount.current) { isFilterMount.current = true; return; }
    setLoading(true);
    fetchData(getFilterParams());
    }, [selectedMonth, selectedYear]);

      const handleEditExpense = (item: any) => {
        setSelectedItem(null);
        setEditingItem(item);
      };

    
      const handleDeleteExpense = async (id: number) => {
        const result = await deleteExpense(id);
        if (result.success) {
          setSelectedItem(null);
          fetchData();
          Alert.alert(t('success_title'), t('success_expense_deleted'));
        } else {
          Alert.alert(t('error_title'), result.error ?? t('error_delete_expense'));
        }
      };

        const handleExport = async () => {
            if (exporting) return;
            setExporting(true);
            try {
              const result = await exportExpenses();
              if (result.success && result.csvData) {
                const { fs } = ReactNativeBlobUtil;
                const fileName = result.fileName || 'expenses_export.csv';
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
                Alert.alert(t('error_title'), result.error ?? t('error_export_expenses'));
              }
            } catch (e) {
              console.error('Export error:', e);
              Alert.alert(t('error_title'), t('error_document_unavailable'));
            } finally {
              setExporting(false);
            }
          };

      
        useEffect(() => {
          if (!loading && route.params?.openCreateModal) {
            setShowCreateModal(true);
          }
        }, [loading, route.params?.openCreateModal]);

  const filtered = expenses.filter(expense => {
    const q = searchQuery.toLowerCase();
    return !q || expense.payment_method.toLowerCase().includes(q) || (expense.category?.name ?? '').toLowerCase().includes(q);
    // const matchSearch = !q || expense.payment_method.toLowerCase().includes(q) || (expense.category?.name ?? '').toLowerCase().includes(q);
    // const matchMonth = selectedMonth === null || new Date(expense.date).toLocaleDateString('fr-FR', { month: 'long' }).toLowerCase() === selectedMonth.toLowerCase();
    // const matchYear = selectedYear === null || new Date(expense.date).getFullYear().toString() === selectedYear;
    // return matchSearch && matchMonth && matchYear;
  });

  // const renderItem = ({ item }: { item: ExpenseItem }) => (
  const renderPieChart = () => {
    const total = pieCategories.reduce((sum, c) => sum + parseFloat(c.value), 0);
    const pieData = pieCategories.map((c, i) => ({
      value: parseFloat(c.value),
      color: PIE_COLORS[i % PIE_COLORS.length],
      label: c.label,
      percentage: total > 0 ? ((parseFloat(c.value) / total) * 100).toFixed(1) : '0.0',
    }));
    return (
      <View style={styles.pieCard}>
        <Text style={styles.pieTitle}>{t('pie_title_distribution')}</Text>
        {loading ? (
          <View style={styles.pieLoader}>
            <ActivityIndicator size="large" color="#1E5BAC" />
          </View>
        ) : pieData.length === 0 ? (
          <View style={styles.pieEmpty}>
            <Text style={styles.pieEmptyText}>{t('pie_empty_message')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.pieChartRow}>
              <PieChart
                data={pieData}
                donut
                radius={80}
                innerRadius={52}
                innerCircleColor="#FFFFFF"
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.pieCenterValue}>
                      {total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                    </Text>
                    <Text style={styles.pieCenterLabel}>{t('currency_mad')}</Text>
                  </View>
                )}
                showText={false}
                strokeWidth={2}
                strokeColor="#FFFFFF"
              />
            </View>
            <View style={styles.pieLegend}>
              {pieData.map((item, i) => (
                <View key={i} style={styles.pieLegendRow}>
                  <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.pieLegendLabel} numberOfLines={1}>{item.label}</Text>
                  <Text style={styles.pieLegendPct}>{item.percentage}%</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  // const renderItem = ({ item }: { item: ExpenseItem }) => (
  const renderItem = ({ item }: { item: any }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
      return (
    <TouchableOpacity style={styles.expenseCard} onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
      <View style={styles.expenseCardLeft}>
        <View style={styles.expenseIconBox}>
          <Text style={styles.expenseIconText}>−</Text>
        </View>
        <View style={{ flex: 1 }}>
          {/* <Text style={styles.expenseDesc} numberOfLines={1}>{item.category.name}</Text> */}
          <Text style={styles.expenseDesc} numberOfLines={1}>{item.category.name.charAt(0).toUpperCase() + item.category.name.slice(1)}</Text>
          <Text style={styles.expenseMeta}>{formattedDate} • {item.payment_method}</Text>
        </View>
      </View>
      <Text style={styles.expenseAmount}>-{parseFloat(item.total_ttc).toLocaleString('fr-FR')} MAD</Text>
    </TouchableOpacity>
      )
  }



  

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
          <Text style={styles.titleText}>{t('title_expenses')}</Text>
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
            <RefreshControl refreshing={refreshing} onRefresh={() => {
               setRefreshing(true);
               if( selectedMonth || selectedYear) {
                fetchData(getFilterParams())
               } else {
                fetchData();
               }
              //  fetchData(); 
              }} tintColor="#1E5BAC" />
          }
          ListFooterComponent={renderPieChart}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t('text_no_expenses_found')}</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <CreateExpenseModal
        visible={showCreateModal}
        accounts={accounts}
        customerId={user?.id ?? 0}
        categories={categories}
        suppliers={suppliers}
        onSave={createExpense}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchData}
        onSuppliersRefresh={refreshSuppliers}
      />

      {editingItem && (
        <CreateExpenseModal
          visible={!!editingItem}
          accounts={accounts}
          customerId={user?.id ?? 0}
          categories={categories}
          suppliers={suppliers}
          onSave={createExpense}
          onClose={() => setEditingItem(null)}
          onCreated={fetchData}
          editItem={editingItem}
          onUpdate={updateExpense}
          onSuppliersRefresh={refreshSuppliers}
        />
      )}

      {selectedItem && <DetailModal 
      item={selectedItem}
      onClose={() => setSelectedItem(null)}           
      onDelete={handleDeleteExpense}
      onEdit={() => handleEditExpense(selectedItem)} 
      />}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  headerTop: { alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logo: { height: 48, width: 160 },
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

  // Filters
  filtersRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: 'transparent',
  },
  filterBtnActive: { backgroundColor: '#FFFFFF', borderColor: '#BFDBFE' },
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
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  // Expense Card
  expenseCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  expenseCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  expenseIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  expenseIconText: { fontSize: 24, color: '#DC2626', fontWeight: '300', lineHeight: 28 },
  expenseDesc: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  expenseMeta: { fontSize: 12, color: '#6B7280' },
  expenseAmount: { fontSize: 14, fontWeight: '700', color: '#DC2626' },

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
  modalTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', flex: 1, textAlign: 'center', marginHorizontal: 8 },
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

  fieldBlock: { gap: 6 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  required: { color: '#1E5BAC' },
  optional: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
  fieldInput: {
    backgroundColor: '#F3F4F6', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1F2937',
  },
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
  totalsBlock: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRowLast: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  totalValue: { fontSize: 14, color: '#374151', fontWeight: '500' },
  totalLabelBold: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  totalValueBold: { fontSize: 15, fontWeight: '700', color: '#1E5BAC' },
  confirmBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // Pickers
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingVertical: 12, paddingHorizontal: 8, maxHeight: 400,
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
  badgeRedLg: { backgroundColor: '#FEE2E2', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  badgeRedLgText: { fontSize: 12, fontWeight: '600', color: '#DC2626' },
  detailAmount: { fontSize: 28, fontWeight: '700', color: '#DC2626' },
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
  statusCompleted: { color: '#16A34A' },
  statusPending: { color: '#EA580C' },
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
  attachmentDownload: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  noAttachment: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#E5E7EB',
    borderRadius: 12, padding: 24, alignItems: 'center', gap: 6,
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
    gap: 8, paddingVertical: 13, borderRadius: 12, backgroundColor: '#FEF2F2',
  },
  detailDeleteText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  detailEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12, backgroundColor: '#1E5BAC',
  },
  detailEditText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

    // Date Picker bottom sheet
    datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  datePickerSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  datePickerTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  datePickerCancel: { fontSize: 15, fontWeight: '500', color: '#6B7280' },
  datePickerOk: { fontSize: 15, fontWeight: '700', color: '#1E5BAC' },

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

  // Disabled confirm buttons
  modalConfirmBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  confirmBtnDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Supplier search inside picker
  pickerSheetAddBtnActive: {
    backgroundColor: '#1E5BAC',
  },
  supplierSearchRow: {
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
  supplierSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },

  // Pie chart
  pieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pieTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  pieLoader: { height: 180, justifyContent: 'center', alignItems: 'center' },
  pieEmpty: { height: 100, justifyContent: 'center', alignItems: 'center' },
  pieEmptyText: { fontSize: 13, color: '#9CA3AF' },
  pieChartRow: { alignItems: 'center', marginBottom: 20 },
  pieCenterValue: { fontSize: 16, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  pieCenterLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  pieLegend: { gap: 10 },
  pieLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pieLegendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  pieLegendLabel: { flex: 1, fontSize: 13, color: '#374151' },
  pieLegendPct: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
});

export default Expenses;
