import React, { useState, useEffect, useCallback } from 'react';
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { canUseFeature } from '../../utils/subscriptionHelpers';
import { ArrowLeft, MessageCircle, Phone, CheckCircle2, PhoneOff, RefreshCw } from 'lucide-react-native';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';
import { useUpgradeWebView } from '../../utils/upgradeWebView';

interface BotStatus {
  bot_active: 0 | 1;
  bot_verified_at: string | null;
  bot_contact: string | null;
}

const WhatsAppBot: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const subscription = useSelector((state: any) => state.subscription.data);
  const { openUpgradeWebView, upgradeWebViewElement } = useUpgradeWebView();
  const upgradeUrl = subscription?.upgrade_url;


  const [statusLoading, setStatusLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);


  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('212');
  const [submitting, setSubmitting] = useState(false);


  const [deactivating, setDeactivating] = useState(false);

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await api.get(Api_Endpoints.botActivationStatus);
      setBotStatus(res.data);
    } catch {
      // If the endpoint fails, default to not-active so the user can still activate
      setBotStatus({ bot_active: 0, bot_verified_at: null, bot_contact: null });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSubmit = async () => {
    if (!canUseFeature(subscription, 'whatsapp_bot_enabled')) {
      Alert.alert(t('subscription_limit_title'), t('subscription_limit_whatsapp'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
      ]);
      return;
    }
    const cleaned = `+${countryCode.trim()}${phoneNumber.trim()}`;
    if (!phoneNumber.trim()) {
      Alert.alert(t('error_title'), t('whatsapp_error_phone_required'));
      return;
    }
    if (cleaned.replace(/[\s\-\(\)\+]/g, '').length < 8) {
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

  // ── Deactivation ──────────────────────────────────────────────────
  const handleDeactivate = () => {
    Alert.alert(
      t('whatsapp_deactivate_title'),
      t('whatsapp_deactivate_confirm'),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('whatsapp_deactivate_btn'),
          style: 'destructive',
          onPress: async () => {
            setDeactivating(true);
            try {
              await api.post(Api_Endpoints.botRequestDeactivation);
              Alert.alert(t('success_title'), t('whatsapp_deactivated_success'));
              fetchStatus();
            } catch (e: any) {
              Alert.alert(t('error_title'), e?.response?.data?.message ?? t('error_generic'));
            } finally {
              setDeactivating(false);
            }
          },
        },
      ]
    );
  };

  if (statusLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('whatsapp_bot_title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#25D366" />
        </View>
      </SafeAreaView>
    );
  }

  if (botStatus?.bot_active === 1) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('whatsapp_bot_title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Active hero */}
          <View style={styles.heroCard}>
            <View style={[styles.heroIconWrap, { backgroundColor: '#F0FFF4', borderColor: '#BBF7D0' }]}>
              <CheckCircle2 size={48} color="#25D366" strokeWidth={1.5} />
            </View>
            <Text style={styles.heroTitle}>{t('whatsapp_connected_title')}</Text>
            <Text style={styles.heroDesc}>{t('whatsapp_connected_desc')}</Text>
          </View>

          {/* Connected number card */}
          <View style={styles.connectedCard}>
            <Text style={styles.connectedLabel}>{t('whatsapp_connected_number')}</Text>
            <View style={styles.connectedNumberRow}>
              <Phone size={20} color="#25D366" strokeWidth={2} />
              <Text style={styles.connectedNumber}>{botStatus.bot_contact ?? '—'}</Text>
            </View>
            {botStatus.bot_verified_at && (
              <Text style={styles.connectedSince}>
                {t('whatsapp_connected_since')} {new Date(botStatus.bot_verified_at).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Management actions */}
          <View style={styles.actionsCard}>
            {/* Deactivate */}
            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={handleDeactivate}
              disabled={deactivating}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
                {deactivating
                  ? <ActivityIndicator size="small" color="#EF4444" />
                  : <PhoneOff size={20} color="#EF4444" strokeWidth={2} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: '#EF4444' }]}>{t('whatsapp_deactivate_btn')}</Text>
                <Text style={styles.actionSub}>{t('whatsapp_deactivate_sub')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Reconnect hint */}
          <TouchableOpacity style={styles.reconnectBtn} onPress={fetchStatus} activeOpacity={0.8}>
            <RefreshCw size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.reconnectText}>{t('whatsapp_refresh_status')}</Text>
          </TouchableOpacity>
        </ScrollView>
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
                <Text style={styles.phonePrefixPlus}>+</Text>
                <TextInput
                  style={styles.countryCodeInput}
                  value={countryCode}
                  onChangeText={v => setCountryCode(v.replace(/[^0-9]/g, '').slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="212"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder={t('whatsapp_phone_placeholder')}
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={9}
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
          {upgradeWebViewElement}
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
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#F0FFF4',
  },
  phonePrefixPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#25D366',
  },
  countryCodeInput: {
    minWidth: 36,
    maxWidth: 52,
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
    padding: 0,
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

  connectedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  connectedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectedNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  connectedNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  connectedSince: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  actionSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  reconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  reconnectText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default WhatsAppBot;
