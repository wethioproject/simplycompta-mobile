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
  Image,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export interface Step1Data {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface SignupStep1Props {
  onNext: (data: Step1Data) => void;
  onSignIn: () => void;
}

const SignupStep1: React.FC<SignupStep1Props> = ({ onNext, onSignIn }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const validatePhone = (val: string) =>
    /^(\+212|0)[5-7][0-9]{8}$/.test(val.replace(/\s/g, ''));

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = t('signup_error_firstname');
    if (!lastName.trim()) newErrors.lastName = t('signup_error_lastname');
    if (!email.trim()) {
      newErrors.email = t('signup_error_email_required');
    } else if (!validateEmail(email)) {
      newErrors.email = t('signup_error_email_invalid');
    }
    if (!phone.trim()) {
      newErrors.phone = t('signup_error_phone_required');
    } else if (!validatePhone(phone)) {
      newErrors.phone = t('signup_error_phone_invalid');
    }
    if (!password) {
      newErrors.password = t('signup_error_password_required');
    } else if (password.length < 6) {
      newErrors.password = t('signup_error_password_short');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext({ firstName, lastName, email, phone, password });
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
            <Text style={styles.progressStep}>{t('signup_step1_title') && 'Étape 1 sur 3'}</Text>
            <Text style={styles.progressPercent}>33%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>{t('signup_step1_title')}</Text>
          <Text style={styles.subtitle}>{t('signup_step1_subtitle')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('signup_firstname_label')}</Text>
            <TextInput
              style={[styles.input, errors.firstName ? styles.inputError : null]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('signup_firstname_placeholder')}
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
            />
            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
          </View>

          {/* Last Name */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('signup_lastname_label')}</Text>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('signup_lastname_placeholder')}
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
            />
            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('signup_email_label')}</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder={t('signup_email_placeholder')}
              placeholderTextColor="#AAAAAA"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Phone */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('signup_phone_label')}</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('signup_phone_placeholder')}
              placeholderTextColor="#AAAAAA"
              keyboardType="phone-pad"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('signup_password_label')}</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                value={password}
                onChangeText={setPassword}
                placeholder={t('signup_password_placeholder')}
                placeholderTextColor="#AAAAAA"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword
                  ? <EyeOff size={20} color="#777777" />
                  : <Eye size={20} color="#777777" />
                }
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{t('signup_continue_button')}</Text>
        </TouchableOpacity>
        <View style={styles.signinRow}>
          <Text style={styles.signinText}>{t('signup_already_account')}</Text>
          <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
            <Text style={styles.signinLink}>{t('signup_signin_link')}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 14,
    color: '#111111',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
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
    gap: 12,
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
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinText: {
    fontSize: 13,
    color: '#777777',
  },
  signinLink: {
    fontSize: 13,
    color: '#1E5BAC',
    fontWeight: '600',
  },
});

export default SignupStep1;
