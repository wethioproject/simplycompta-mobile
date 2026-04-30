import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordProps {
  navigation: any;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { forgotPassword, forgotPasswordOtp } = useAuth();

  const handleSendReset = async () => {
    if (!email.trim()) {
      setErrorMessage(t('forgot_error_email_required'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setShowOtpScreen(true);
      Alert.alert(t('forgot_success_title'), result.message || t('forgot_otp_sent'));
    } else {
      setErrorMessage(result.error || t('forgot_generic_error'));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrorMessage(t('forgot_error_otp_required'));
      return;
    }
    if (!password.trim()) {
      setErrorMessage(t('forgot_error_password_required'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('forgot_error_passwords_mismatch'));
      return;
    }
    if (password.length < 6) {
      setErrorMessage(t('forgot_error_password_short'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const result = await forgotPasswordOtp(email, otp, password, confirmPassword);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        t('forgot_success_title'),
        t('forgot_success_message'),
        [
          {
            text: t('forgot_success_ok'),
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } else {
      setErrorMessage(result.error || t('forgot_generic_error'));
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.innerContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ChevronLeft size={24} color="#1F2937" />
          <Text style={styles.backText}>{t('forgot_back')}</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={appLogoIcon} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {!showOtpScreen ? (
            <>
              {/* Email Reset Form */}
              <Text style={styles.formTitle}>{t('forgot_title')}</Text>

              {/* Instruction Text */}
              <Text style={styles.instructionText}>
                {t('forgot_instruction')}
              </Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('forgot_email_label')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('forgot_email_placeholder')}
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendReset}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>{t('forgot_send_button')}</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* OTP Verification Form */}
              <Text style={styles.formTitle}>{t('forgot_otp_title')}</Text>
              <Text style={styles.otpSubtitle}>
                {t('forgot_otp_subtitle', { email })}
              </Text>∆

              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('forgot_otp_label')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('forgot_otp_placeholder')}
                  placeholderTextColor="#9CA3AF"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    setErrorMessage('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('forgot_new_password_label')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('forgot_new_password_placeholder')}
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage('');
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('forgot_confirm_password_label')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('forgot_confirm_password_placeholder')}
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrorMessage('');
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>{t('forgot_verify_button')}</Text>
                )}
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  setShowOtpScreen(false);
                  setOtp('');
                  setPassword('');
                  setConfirmPassword('');
                  setErrorMessage('');
                }}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.resendText}>{t('forgot_resend')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FB',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 0,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  logoImage: {
    width: 192,
    height: 100,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#1E5BAC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1E5BAC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    color: '#1E5BAC',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ForgotPassword;
