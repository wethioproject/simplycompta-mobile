import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export interface Step2Data {
  companyName: string;
  companyType: string;
  city: string;
}

interface SignupStep2Props {
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

const getCompanyTypes = (t: (k: string) => string) => [
  { value: 'auto-entrepreneur', label: t('company_type_auto_entrepreneur') },
  { value: 'entreprise-individuelle', label: t('company_type_entreprise_individuelle') },
  { value: 'societe', label: t('company_type_societe') },
  { value: 'association', label: t('company_type_association') },
];

const SignupStep2: React.FC<SignupStep2Props> = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [city, setCity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const COMPANY_TYPES = getCompanyTypes(t);
  const selectedLabel = COMPANY_TYPES.find(ct => ct.value === companyType)?.label ?? '';

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) newErrors.companyName = t('signup_error_company_name');
    if (!companyType) newErrors.companyType = t('signup_error_company_type');
    if (!city.trim()) newErrors.city = t('signup_error_city');

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext({ companyName, companyType, city });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressStep}>{'Étape 2 sur 3'}</Text>
            <Text style={styles.progressPercent}>66%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>{t('signup_step2_title')}</Text>
          <Text style={styles.subtitle}>
            {t('signup_step2_subtitle')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Company Name */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('signup_company_name_label')}</Text>
            <TextInput
              style={[styles.input, errors.companyName ? styles.inputError : null]}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder={t('signup_company_name_placeholder')}
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
            />
            {errors.companyName ? <Text style={styles.errorText}>{errors.companyName}</Text> : null}
          </View>

          {/* Company Type */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('signup_company_type_label')}</Text>
            <TouchableOpacity
              style={[styles.dropdownBtn, errors.companyType ? styles.inputError : null]}
              onPress={() => setShowDropdown(true)}
              activeOpacity={0.7}
            >
              <Text style={selectedLabel ? styles.dropdownValue : styles.dropdownPlaceholder}>
                {selectedLabel || t('signup_company_type_placeholder')}
              </Text>
              <ChevronDown size={18} color="#777777" />
            </TouchableOpacity>
            {errors.companyType ? <Text style={styles.errorText}>{errors.companyType}</Text> : null}
          </View>

          {/* City */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('signup_city_label')}</Text>
            <TextInput
              style={[styles.input, errors.city ? styles.inputError : null]}
              value={city}
              onChangeText={setCity}
              placeholder={t('signup_city_placeholder')}
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
            />
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{t('signup_continue_button')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={onBack} activeOpacity={0.85}>
          <Text style={styles.outlineBtnText}>{t('signup_back_button')}</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('signup_company_type_modal_title')}</Text>
            {COMPANY_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                style={styles.modalOption}
                onPress={() => {
                  setCompanyType(type.value);
                  setShowDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    companyType === type.value && styles.modalOptionSelected,
                  ]}
                >
                  {type.label}
                </Text>
                {companyType === type.value && <Check size={16} color="#1E5BAC" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  progressBlock: { marginBottom: 28 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStep: {
    fontSize: 12,
    fontWeight: '500',
    color: '#777777',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E5BAC',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E5BAC',
    borderRadius: 4,
  },
  headerBlock: { marginBottom: 28 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
  },
  form: { gap: 16 },
  fieldBlock: {},
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111111',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111111',
  },
  inputError: { borderColor: '#EF4444' },
  dropdownBtn: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 14,
    color: '#111111',
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#AAAAAA',
    flex: 1,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#1E5BAC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineBtn: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  modalOptionSelected: {
    color: '#1E5BAC',
    fontWeight: '600',
  },
});

export default SignupStep2;
