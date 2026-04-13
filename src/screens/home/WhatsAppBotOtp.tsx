import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageCircle, CheckCircle2, RefreshCw } from 'lucide-react-native';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const WhatsAppBotOtp: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();

  const phoneNumber: string = route.params?.phoneNumber ?? '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert(t('error_title'), t('whatsapp_otp_error_incomplete'));
      return;
    }

    setVerifying(true);
    try {
      await api.post(Api_Endpoints.botVerifyActivation, {
        phone: phoneNumber,
        otp: code,
      });
      setSuccess(true);
    } catch (e: any) {
      Alert.alert(
        t('error_title'),
        e?.response?.data?.message ?? t('whatsapp_otp_error_invalid')
      );
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setResendTimer(RESEND_COOLDOWN);
    inputRefs.current[0]?.focus();
    try {
      await api.post(Api_Endpoints.botRequestActivation, { phone: phoneNumber });
      Alert.alert(
        t('whatsapp_otp_sent_title'),
        `${t('whatsapp_otp_sent_desc')} ${phoneNumber}`
      );
    } catch (e: any) {
      Alert.alert(
        t('error_title'),
        e?.response?.data?.message ?? t('whatsapp_error_phone_invalid')
      );
    }
  };

  const otpFilled = otp.every(d => d !== '');

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <CheckCircle2 size={64} color="#25D366" strokeWidth={1.5} />
          </View>
          <Text style={styles.successTitle}>{t('whatsapp_success_title')}</Text>
          <Text style={styles.successDesc}>{t('whatsapp_success_desc')}</Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.85}
          >
            <Text style={styles.successBtnText}>{t('whatsapp_success_cta')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('whatsapp_otp_header')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <MessageCircle size={40} color="#25D366" strokeWidth={1.5} />
            </View>
            <Text style={styles.infoTitle}>{t('whatsapp_otp_title')}</Text>
            <Text style={styles.infoDesc}>{t('whatsapp_otp_desc')}</Text>
            <View style={styles.phoneChip}>
              <Text style={styles.phoneChipText}>{phoneNumber}</Text>
            </View>
          </View>

          {/* OTP inputs */}
          <View style={styles.otpCard}>
            <Text style={styles.otpLabel}>{t('whatsapp_otp_label')}</Text>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit !== '' && styles.otpInputFilled,
                  ]}
                  value={digit}
                  onChangeText={val => handleOtpChange(val, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textContentType="oneTimeCode"
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendHint}>{t('whatsapp_otp_no_code')}</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendTimer > 0}
                activeOpacity={0.7}
              >
                {resendTimer > 0 ? (
                  <Text style={styles.resendTimer}>
                    {t('whatsapp_otp_resend_in')} {resendTimer}s
                  </Text>
                ) : (
                  <View style={styles.resendBtn}>
                    <RefreshCw size={13} color="#25D366" strokeWidth={2} />
                    <Text style={styles.resendBtnText}>{t('whatsapp_otp_resend')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Verify button */}
          <TouchableOpacity
            style={[styles.verifyBtn, (!otpFilled || verifying) && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={!otpFilled || verifying}
            activeOpacity={0.85}
          >
            {verifying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyBtnText}>{t('whatsapp_otp_verify')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  infoIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  infoDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneChip: {
    backgroundColor: '#F0FFF4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
  },
  phoneChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
  },

  otpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  otpInputFilled: {
    borderColor: '#25D366',
    backgroundColor: '#F0FFF4',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resendHint: {
    fontSize: 13,
    color: '#6B7280',
  },
  resendTimer: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#25D366',
  },

  verifyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  mockHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Success screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  successIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  successBtn: {
    marginTop: 8,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default WhatsAppBotOtp;
