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
  Vibration,
} from 'react-native';
import Toast from 'react-native-toast-message';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import {
  X,
  ChevronDown,
  Calendar,
  FileText,
  Camera,
  Eye,
  Search,
  Plus,
} from 'lucide-react-native';
import { useSupplier } from '../../hooks/useSupplier';
import { getMimeType } from '../../utils/helpers';
import { CreateSupplierModal } from '../../screens/home/Suppliers';
import type { Account, Category, Supplier, ExpenseItem, ExpenseFormValues } from '../../types/expense.types';
import { PAYMENT_METHODS } from '../../types/invoice.types';
import { styles } from '../../styles/expenses.styles';


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
  supplierId: yup.number().nullable().optional(),
});


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
  ocrSupplierData?: any;
}


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
  ocrSupplierData,
}) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { getSuppliers } = useSupplier();


  const [saving, setSaving] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
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

  const selectedPaymentMethod = PAYMENT_METHODS.find(p => p.key === watchedAccountId) ?? null;
  const pmLabel = (p: { key: string; fr: string; en: string }) =>
    i18n.language.startsWith('fr') ? p.fr : p.en;
  const selectedCategory = (categories as Category[]).find(c => c.id === watchedCategoryId) ?? null;
  const selectedSupplier = suppliers.find(s => s.id === watchedSupplierId) ?? null;

  const ttcDisplay = parseFloat(watchedAmountTTC) || 0;
  const tvaDisplay = parseFloat(watchedAmountTVA) || 0;


  useEffect(() => {
    if (!visible) return;
    setShowDatePicker(false);
    setSaving(false);

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
        supplierId: defaultSupplierId ?? null,
      });
    }
  }, [visible]);

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
      const [file] = await pick({ type: [types.pdf, types.docx, types.doc, types.images] });
      setDocument(file);
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert(t('error_title'), t('error_select_file'));
    }
  };

  const handleTakePhoto = async () => {
    launchCamera({ mediaType: 'photo', saveToPhotos: false, quality: 0.8 }, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      setDocument({
        uri: asset.uri,
        fileCopyUri: asset.uri,
        name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      });
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
        payment_method: data.accountId,
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
          {/* Header */}
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
              {/* Document upload */}
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
                    onPress={() => setDocument(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={16} color="#DC2626" />
                  </TouchableOpacity>
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
                  <Text style={selectedPaymentMethod ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedPaymentMethod ? pmLabel(selectedPaymentMethod) : t('placeholder_payment_method')}
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

              {/* Supplier */}
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
                {applyingOCRSupplier && (
                  <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#1E5BAC" />
                    <Text style={{ color: '#6B7280', fontSize: 12 }}>Applying OCR supplier...</Text>
                  </View>
                )}
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

              {/* Bottom submit button */}
              <TouchableOpacity
                style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
                onPress={handleSubmit(onSubmit as any)}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.confirmBtnText}>{t('modal_confirm_text')}</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>


        {/* Category Picker */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryPicker(false)}
          >
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('label_category')}</Text>
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 360 }} showsVerticalScrollIndicator>
                {(categories as Category[]).map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.pickerOption}
                    onPress={() => { setValue('categoryId', c.id, { shouldValidate: true }); setShowCategoryPicker(false); }}
                  >
                    <Text style={[styles.pickerOptionText, watchedCategoryId === c.id && styles.pickerOptionSelected]}>{c.name}</Text>
                    {watchedCategoryId === c.id && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Account / Payment Method Picker */}
        <Modal
          visible={showAccountPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAccountPicker(false)}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowAccountPicker(false)}
          >
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

        {/* Supplier Picker */}
        <Modal
          visible={showSupplierPicker}
          transparent
          animationType="fade"
          onRequestClose={closeSupplierPicker}
        >
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

        {/* Date Picker — iOS */}
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

        {/* Date Picker — Android */}
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

        {/* Full-screen image preview */}
        <Modal
          visible={showImagePreview}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImagePreview(false)}
        >
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity
              style={styles.imagePreviewClose}
              onPress={() => setShowImagePreview(false)}
              activeOpacity={0.7}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: document?.uri ?? document?.fileCopyUri }}
              style={styles.imagePreviewFull}
              resizeMode="contain"
            />
          </View>
        </Modal>

        {/* Create Supplier inline */}
        <CreateSupplierModal
          visible={showCreateSupplierModal}
          onClose={() => setShowCreateSupplierModal(false)}
          initialValues={supplierPrefillValues}
          onCreated={(createdSupplier?: any) => {
            onSuppliersRefresh?.();
            const createdId = createdSupplier?.id;
            if (createdId) {
              setValue('supplierId', createdId, { shouldValidate: true });
              Toast.show({ type: 'success', text1: t('success_title'), text2: 'Supplier detected and selected' });
            }
            setShowCreateSupplierModal(false);
            closeSupplierPicker();
            setSupplierPrefillValues(undefined);
          }}
        />
      </View>
    </Modal>
  );
};

export default CreateExpenseModal;
