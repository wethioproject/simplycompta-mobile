import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Share,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { canUseFeature } from '../../utils/subscriptionHelpers';
import { loadSubscription } from '../../store/slices/subscriptionSlice';
import type { AppDispatch } from '../../store';
import { ChevronDown, Calendar, Camera, FileText, Eye, X } from 'lucide-react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import type { ReceiptItem, ReceiptFormData, PaymentMethod } from '../../types/receipt.types';
import { PAYMENT_METHODS } from '../../types/receipt.types';
import { getPaymentMethodLabel } from './ReceiptCard';
import { receiptStyles as styles } from '../../styles/receipt.styles';

interface CreateReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ReceiptFormData) => void;
  editItem?: ReceiptItem | null;
}

const toIsoDate = (displayDate: string): string => {
  const parts = displayDate.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return new Date().toISOString().split('T')[0];
};

const todayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({
  visible,
  onClose,
  onSave,
  editItem,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const subscription = useSelector((state: any) => state.subscription.data);
  const storageExhausted = (subscription?.usage?.storage?.remaining_mb ?? 1) <= 0;
  const upgradeUrl = subscription?.upgrade_url;
  

  const [formDate, setFormDate]                   = useState(todayIso());
  const [formAmount, setFormAmount]               = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('transfer');
  const [formNote, setFormNote]                   = useState('');
  const [showMethodPicker, setShowMethodPicker]   = useState(false);
  const [showDatePicker, setShowDatePicker]       = useState(false);
  const [tempDate, setTempDate]                   = useState(new Date());
  const [saving, setSaving]                       = useState(false);
  const [document, setDocument]                   = useState<any>(null);
  const [showImagePreview, setShowImagePreview]   = useState(false);
  const [removedExistingDocument, setRemovedExistingDocument] = useState(false);
  const [fileSizeError, setFileSizeError]         = useState(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  const amountParsed = parseFloat(formAmount);
  const isValid = !!formAmount && !isNaN(amountParsed) && amountParsed > 0 && !!formDate && !fileSizeError;

  useEffect(() => {
    if (!visible) return;
    setSaving(false);
    setShowDatePicker(false);
    setShowMethodPicker(false);
    setRemovedExistingDocument(false);
    setFileSizeError(false);
    if (editItem) {
      const iso = toIsoDate(editItem.date);
      setFormDate(iso);
      setTempDate(new Date(iso));
      setFormAmount(editItem.amount.toString());
      setFormPaymentMethod(editItem.paymentMethod);
      setFormNote(editItem.note ?? '');
      if (editItem.documentUrl) {
        const filename = editItem.documentUrl.split('/').pop() ?? 'document';
        const ext = filename.split('.').pop()?.toLowerCase() ?? '';
        const mimeType = ext === 'pdf' ? 'application/pdf'
          : ['jpg', 'jpeg'].includes(ext) ? 'image/jpeg'
          : ext === 'png' ? 'image/png'
          : 'application/octet-stream';
        setDocument({ uri: editItem.documentUrl, fileCopyUri: editItem.documentUrl, name: filename, type: mimeType, isExisting: true });
      } else {
        setDocument(null);
      }
    } else {
      const iso = todayIso();
      setFormDate(iso);
      setTempDate(new Date());
      setFormAmount('');
      setFormPaymentMethod('transfer');
      setFormNote('');
      setDocument(null);
    }
  }, [editItem, visible]);

  const handlePreviewDocument = async () => {
    const uri = document?.fileCopyUri ?? document?.uri;
    if (!uri) return;
    try {
      if (Platform.OS === 'ios') {
        await Share.share({ url: uri });
      } else {
        await ReactNativeBlobUtil.android.actionViewIntent(
          uri.replace('file://', ''),
          document?.type ?? 'application/octet-stream',
        );
      }
    } catch {}
  };

  const handlePickDocument = async () => {
    if (storageExhausted) {
      Alert.alert(t('error_title'), t('error_storage_full'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => Linking.openURL(upgradeUrl) },
      ]);
      return;
    }
    try {
      const [file] = await pick({ type: [types.pdf, types.docx, types.doc, types.images] });
      if (file.size && file.size > MAX_FILE_SIZE) {
        setFileSizeError(true);
        return;
      }
      const remainingBytes = (subscription?.usage?.storage?.remaining_mb ?? Infinity) * 1024 * 1024;
      if (file.size && file.size > remainingBytes) {
        Alert.alert(t('error_title'), t('error_file_exceeds_storage'), [
          { text: t('button_maybe_later'), style: 'cancel' },
          { text: t('button_upgrade_plan'), onPress: () => Linking.openURL(upgradeUrl) },
        ]);
        return;
      }
      setFileSizeError(false);
      setDocument(file);
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert(t('error_title'), t('error_select_file'));
    }
  };

  const handleTakePhoto = async () => {
    if (storageExhausted) {
      Alert.alert(t('error_title'), t('error_storage_full'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => Linking.openURL(upgradeUrl) },
      ]);
      return;
    }
    launchCamera({ mediaType: 'photo', saveToPhotos: false, quality: 0.8 }, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        setFileSizeError(true);
        return;
      }
      const remainingBytes = (subscription?.usage?.storage?.remaining_mb ?? Infinity) * 1024 * 1024;
      if (asset.fileSize && asset.fileSize > remainingBytes) {
        Alert.alert(t('error_title'), t('error_file_exceeds_storage'), [
          { text: t('button_maybe_later'), style: 'cancel' },
          { text: t('button_upgrade_plan'), onPress: () => Linking.openURL(upgradeUrl) },
        ]);
        return;
      }
      setFileSizeError(false);
      setDocument({
        uri: asset.uri,
        fileCopyUri: asset.uri,
        name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      });
    });
  };

  const confirmDate = () => {
    const y = tempDate.getFullYear();
    const m = String(tempDate.getMonth() + 1).padStart(2, '0');
    const d = String(tempDate.getDate()).padStart(2, '0');
    setFormDate(`${y}-${m}-${d}`);
    setShowDatePicker(false);
  };

  const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempDate(selected);
  };

  const handleSubmit = () => {
    if (fileSizeError) return;
        if (!editItem && !canUseFeature(subscription, 'receipts')) {
          Alert.alert(t('subscription_limit_title'), t('subscription_limit_receipts'), [
            { text: t('button_maybe_later'), style: 'cancel' },
            { text: t('button_upgrade_plan'), onPress: () => Linking.openURL(upgradeUrl) },
          ]);
          return;
        }
    if (!isValid) {
      Alert.alert(t('error_title'), t('receipt_error_invalid_amount'));
      return;
    }
    setSaving(true);
    onSave({ date: formDate, amount: formAmount, paymentMethod: formPaymentMethod, note: formNote, document: document ?? null, removedExistingDocument });
    dispatch(loadSubscription() as any);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

          {/* ── Header ── */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>{t('button_cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editItem ? t('receipt_modal_edit_title') : t('receipt_modal_add_title')}
            </Text>
            <TouchableOpacity
              style={[styles.modalConfirmBtn, !isValid && styles.modalConfirmBtnDisabled]}
              onPress={handleSubmit}
              disabled={saving || !isValid}
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

              {/* Date */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {t('receipt_field_date')} <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.fieldInput, styles.fieldInputRow, { paddingVertical: 13 }]}
                  onPress={() => { setTempDate(formDate ? new Date(formDate) : new Date()); setShowDatePicker(true); }}
                  activeOpacity={0.7}
                >
                  <Text style={[{ flex: 1, fontSize: 14 }, formDate ? { color: '#1F2937' } : { color: '#9CA3AF' }]}>
                    {formDate || 'YYYY-MM-DD'}
                  </Text>
                  <Calendar size={18} color="#1E5BAC" />
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {t('receipt_field_amount')} <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }, !isValid && formAmount !== '' && styles.fieldInputError]}
                    value={formAmount}
                    onChangeText={setFormAmount}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.fieldUnit}>MAD</Text>
                </View>
                {!isValid && formAmount !== '' && amountParsed <= 0 && (
                  <Text style={styles.fieldError}>{t('receipt_error_invalid_amount')}</Text>
                )}
              </View>

              {/* Payment method */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {t('receipt_field_method')} <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerRow}
                  onPress={() => setShowMethodPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerValueText}>
                    {getPaymentMethodLabel(formPaymentMethod, t)}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
              </View>

              {/* Note */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('receipt_field_note')}</Text>
                <TextInput
                  style={[styles.fieldInput, styles.notesInput]}
                  value={formNote}
                  onChangeText={setFormNote}
                  placeholder={t('receipt_placeholder_note')}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Document */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('receipt_field_document')}</Text>
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
                      <Text style={styles.attachmentFileMeta}>{document.type ?? 'file'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.attachmentRemoveBtn}
                      onPress={() => {
                        if (document?.isExisting) setRemovedExistingDocument(true);
                        setDocument(null);
                        setFileSizeError(false);
                      }}
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
                {fileSizeError && (
                  <Text style={styles.fieldError}>{t('error_file_too_large')}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.addArticleBtn, !isValid && styles.addArticleBtnDisabled]}
                onPress={handleSubmit}
                disabled={saving || !isValid}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.addArticleBtnText}>
                      {editItem ? t('button_update') : t('receipt_btn_add')}
                    </Text>
                }
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── Image Preview ── */}
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

        {/* ── Payment Method Picker ── */}
        <Modal visible={showMethodPicker} transparent animationType="fade" onRequestClose={() => setShowMethodPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowMethodPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('receipt_field_method')}</Text>
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                {PAYMENT_METHODS.map(method => (
                  <TouchableOpacity
                    key={method}
                    style={styles.pickerOption}
                    onPress={() => { setFormPaymentMethod(method); setShowMethodPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerOptionText, formPaymentMethod === method && styles.pickerOptionSelected]}>
                      {getPaymentMethodLabel(method, t)}
                    </Text>
                    {formPaymentMethod === method && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ── Date Picker (iOS inline) ── */}
        <Modal visible={Platform.OS === 'ios' && showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerSheet}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} activeOpacity={0.7}>
                  <Text style={styles.datePickerCancel}>{t('button_cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>{t('receipt_field_date')}</Text>
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

        {/* ── Date Picker (Android) ── */}
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
                setFormDate(`${y}-${m}-${d}`);
              }
            }}
          />
        )}

      </View>
    </Modal>
  );
};

export default CreateReceiptModal;
