import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react-native';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

const WhatsAppBot: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const cleaned = phoneNumber.trim();
    if (!cleaned) {
      Alert.alert(t('error_title'), t('whatsapp_error_phone_required'));
      return;
    }
    if (cleaned.replace(/[\s\-\(\)]/g, '').length < 8) {
      Alert.alert(t('error_title'), t('whatsapp_error_phone_invalid'));
      return;
    }

    setSubmitting(true);
    try {
      await api.post(Api_Endpoints.botRequestActivation, { phone: cleaned });
      Alert.alert(
        t('whatsapp_otp_sent_title'),
        `${t('whatsapp_otp_sent_desc')} ${cleaned}`,
        [
          {
            text: t('button_ok'),
            onPress: () => navigation.navigate('WhatsApp Bot OTP', { phoneNumber: cleaned }),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(
        t('error_title'),
        e?.response?.data?.message ?? t('whatsapp_error_phone_invalid')
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>{t('whatsapp_bot_title')}</Text>
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
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <MessageCircle size={48} color="#25D366" strokeWidth={1.5} />
            </View>
            <Text style={styles.heroTitle}>{t('whatsapp_bot_subtitle')}</Text>
            <Text style={styles.heroDesc}>{t('whatsapp_bot_desc')}</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresCard}>
            {[
              t('whatsapp_feature_1'),
              t('whatsapp_feature_2'),
              t('whatsapp_feature_3'),
            ].map((feature, i) => (
              <View key={i} style={[styles.featureRow, i < 2 && styles.featureRowBorder]}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Phone input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>{t('whatsapp_phone_label')}</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Phone size={16} color="#25D366" strokeWidth={2} />
                <Text style={styles.phonePrefixText}>+</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder={t('whatsapp_phone_placeholder')}
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>
            <Text style={styles.inputHint}>{t('whatsapp_phone_hint')}</Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (!phoneNumber.trim() || submitting) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!phoneNumber.trim() || submitting}
            activeOpacity={0.85}
          >
            <MessageCircle size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.submitBtnText}>
              {submitting ? t('whatsapp_sending') : t('whatsapp_submit')}
            </Text>
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

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25D366',
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },

  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#F0FFF4',
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#25D366',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    fontSize: 16,
    color: '#111827',
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default WhatsAppBot;
