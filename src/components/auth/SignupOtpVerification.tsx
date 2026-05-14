import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MailCheck } from 'lucide-react-native';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN_SEC = 60;

export interface SignupOtpVerificationProps {
  email: string;
  onVerified: () => void;
  onResend: () => Promise<{ success: boolean; error?: string }>;
  onVerify: (otp: string) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  isLoading?: boolean;
}

const SignupOtpVerification: React.FC<SignupOtpVerificationProps> = ({
  email,
  onVerified,
  onResend,
  onVerify,
  onBack,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SEC);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  const otp = digits.join('');
  const isFilled = otp.length === OTP_LENGTH;
  const isSubmitting = submitting || isLoading;

  const handleChange = useCallback((text: string, index: number) => {
    if (text.length > 1) {
      const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newDigits = Array(OTP_LENGTH).fill('');
      cleaned.split('').forEach((c, i) => { newDigits[i] = c; });
      setDigits(newDigits);
      const focusIdx = Math.min(cleaned.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      setError('');
      return;
    }

    const char = text.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError('');

    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits]);

  const handleKeyPress = useCallback((
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handleSubmit = useCallback(async () => {
    if (!isFilled || isSubmitting) return;
    setError('');
    setSubmitting(true);
    try {
      const result = await onVerify(otp);
      if (result.success) {
        onVerified();
      } else {
        setError(result.error ?? t('otp_error_invalid'));
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  }, [isFilled, isSubmitting, otp, onVerify, onVerified, t]);

  const handleResend = useCallback(async () => {
    if (resending || countdown > 0) return;
    setResending(true);
    setError('');
    try {
      const result = await onResend();
      if (result.success) {
        setCountdown(RESEND_COUNTDOWN_SEC);
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error ?? t('otp_error_resend_failed'));
      }
    } finally {
      setResending(false);
    }
  }, [resending, countdown, onResend, t]);

  const maskedEmail = (() => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 2);
    const masked = '*'.repeat(Math.max(0, local.length - 2));
    return `${visible}${masked}@${domain}`;
  })();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Progress */}
        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressStep}>{t('otp_step_label')}</Text>
            <Text style={styles.progressPercent}>50%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        {/* Icon + Header */}
        <View style={styles.headerBlock}>
          <View style={styles.iconContainer}>
            <MailCheck size={32} color="#1E5BAC" />
          </View>
          <Text style={styles.title}>{t('otp_title')}</Text>
          <Text style={styles.subtitle}>
            {t('otp_subtitle')}{' '}
            <Text style={styles.emailHighlight}>{maskedEmail}</Text>
          </Text>
        </View>

        {/* OTP digit inputs */}
        <View style={styles.digitRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { inputRefs.current[index] = ref; }}
              style={[
                styles.digitInput,
                digit ? styles.digitInputFilled : null,
                error ? styles.digitInputError : null,
              ]}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH} // allow paste on some Android devices
              textAlign="center"
              selectionColor="#1E5BAC"
              caretHidden={false}
            />
          ))}
        </View>

        {/* Inline error */}
        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.primaryBtn, (!isFilled || isSubmitting) && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isFilled || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>{t('otp_verify_button')}</Text>
          )}
        </TouchableOpacity>

        {/* Resend row */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>{t('otp_no_code')}</Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              {t('otp_resend_in', { seconds: countdown })}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResend}
              disabled={resending}
              activeOpacity={0.7}
            >
              {resending ? (
                <ActivityIndicator size="small" color="#1E5BAC" />
              ) : (
                <Text style={styles.resendLink}>{t('otp_resend')}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Back */}
        <TouchableOpacity style={styles.ghostBtn} onPress={onBack} activeOpacity={0.85}>
          <Text style={styles.ghostBtnText}>{t('signup_back_button')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignupOtpVerification;

const styles = StyleSheet.create({
  flex: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },

  progressBlock: { marginBottom: 28 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStep: { fontSize: 12, fontWeight: '500', color: '#777777' },
  progressPercent: { fontSize: 12, fontWeight: '600', color: '#1E5BAC' },
  progressTrack: { height: 4, backgroundColor: '#E5E5E5', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1E5BAC', borderRadius: 4 },

  headerBlock: { alignItems: 'center', marginBottom: 36 },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111111', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#777777', textAlign: 'center', lineHeight: 22 },
  emailHighlight: { fontWeight: '600', color: '#1E5BAC' },

  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  digitInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },
  digitInputFilled: {
    borderColor: '#1E5BAC',
    backgroundColor: '#EFF6FF',
  },
  digitInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },

  primaryBtn: {
    height: 52,
    backgroundColor: '#1E5BAC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnDisabled: {
    backgroundColor: '#93B5E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  resendText: { fontSize: 13, color: '#777777' },
  countdownText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  resendLink: { fontSize: 13, fontWeight: '600', color: '#1E5BAC' },

  ghostBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { color: '#777777', fontSize: 15, fontWeight: '500' },
});
