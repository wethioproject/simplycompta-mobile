import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from 'react-native';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { clientSchema, ClientFormValues } from '../../types/client.types';
import { createClient } from '../../services/client.service';
import { useSelector, useDispatch } from 'react-redux';
import { Linking } from 'react-native';
import { canUseFeature } from '../../utils/subscriptionHelpers';
import { loadSubscription } from '../../store/slices/subscriptionSlice';
import type { AppDispatch } from '../../store';

interface CreateClientModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  visible,
  onClose,
  onCreated,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const subscription = useSelector((state: any) => state.subscription.data);
  const upgradeUrl = subscription?.upgrade_url;
  const [saving, setSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const today = new Date().toLocaleDateString('fr-FR');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ClientFormValues>({
    resolver: yupResolver(clientSchema) as any,
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      clientName: '',
      email: '',
      telephone: '',
      postalCode: '',
      city: '',
      commercialRegister: '',
      ice: '',
      customerType: 'Company',
      notes: '',
    },
  });

  const watchedType = watch('customerType') ?? 'Company';

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

  const onSubmit = async (data: ClientFormValues) => {
    if (!canUseFeature(subscription, 'clients')) {
      Alert.alert(t('subscription_limit_title'), t('subscription_limit_clients'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => Linking.openURL(upgradeUrl) },
      ]);
      return;
    }
    setSaving(true);
    try {
      await createClient(data);
      dispatch(loadSubscription() as any);
      Alert.alert(t('success_title'), t('success_client_created'));
      await onCreated();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erreur lors de la création du client.';
      Alert.alert(t('error_title'), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>

        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1E5BAC" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('title_create_client')}</Text>
          <TouchableOpacity
            style={[styles.modalConfirmBtn, !isValid && styles.modalConfirmBtnDisabled]}
            onPress={handleSubmit(onSubmit as any)}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.modalConfirmText}>{t('modal_confirm_text')}</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Date subtitle */}
            <Text style={styles.createDateText}>{t('text_creation_date')}{today}</Text>

            {/* Form fields */}
            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {t('label_company_name')} <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="companyName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.companyName && styles.fieldInputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.companyName && (
                  <Text style={styles.fieldError}>{errors.companyName.message}</Text>
                )}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {t('label_contact_name')} <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="clientName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {t('label_email')}
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.email && styles.fieldInputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                />
                {errors.email && (
                  <Text style={styles.fieldError}>{errors.email.message}</Text>
                )}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_phone')}</Text>
                <Controller
                  control={control}
                  name="telephone"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                    />
                  )}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {t('label_postal_code')}
                </Text>
                <Controller
                  control={control}
                  name="postalCode"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>
                  {t('label_city')}
                </Text>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_commercial_register')}</Text>
                <Controller
                  control={control}
                  name="commercialRegister"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_ice')}</Text>
                <Controller
                  control={control}
                  name="ice"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_client_type')}</Text>
                <TouchableOpacity
                  style={styles.pickerRow}
                  onPress={() => setShowTypePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerValueText}>
                    {watchedType === 'Individual' ? t('label_individual') : t('label_company')}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
              </View>

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
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  )}
                />
              </View>
            </View>

            {/* Bottom confirm button */}
            <TouchableOpacity
              style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
              onPress={handleSubmit(onSubmit as any)}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.confirmBtnText}>{t('modal_confirm_text')}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Client Type Picker */}
        <Modal visible={showTypePicker} transparent animationType="fade" onRequestClose={() => setShowTypePicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('label_client_type')}</Text>
              {(['Company', 'Individual'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.pickerOption}
                  onPress={() => { setValue('customerType', type, { shouldValidate: true }); setShowTypePicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerOptionText, watchedType === type && styles.pickerOptionSelected]}>
                    {type === 'Individual' ? t('label_individual') : t('label_company')}
                  </Text>
                  {watchedType === type && <Check size={16} color="#1E5BAC" />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#F5F7FF' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  modalConfirmBtn: {
    backgroundColor: '#1E5BAC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalConfirmText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  modalContent: { padding: 16, paddingBottom: 40 },
  createDateText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  formCard: { borderRadius: 16, paddingVertical: 18, gap: 16, marginBottom: 16 },
  fieldBlock: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  fieldInput: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmBtn: {
    backgroundColor: '#1E5BAC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  required: { color: '#DC2626' },
  fieldError: { fontSize: 12, color: '#DC2626', marginTop: 3, fontWeight: '500' },
  fieldInputError: { borderColor: '#DC2626', backgroundColor: '#FFF5F5' },
  modalConfirmBtnDisabled: { backgroundColor: '#93C5FD' },
  confirmBtnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0, elevation: 0 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerValueText: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  notesInput: { minHeight: 80, paddingTop: 12 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  pickerSheetTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionText: { fontSize: 15, color: '#374151' },
  pickerOptionSelected: { color: '#1E5BAC', fontWeight: '600' },
});
