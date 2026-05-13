import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  Headphones,
  Phone,
  Mail,
  Send,
  User,
  FileText,
  Clock,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AccountantInfo {
  id: number;
  name: string;
  email: string;
  profile: string;
  is_active: number;
  company_logo: string;
}

type StackNavigation = StackNavigationProp<any>;

// ─── Contact Form View ────────────────────────────────────────────────────────
const ContactForm: React.FC<{ onBack: () => void; accountant?: AccountantInfo | null }> = ({ onBack, accountant }) => {
  const { t } = useTranslation();
  console.log(`accinfooo2`, accountant);
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [sending, setSending] = useState(false);

  const handlePickAttachment = async () => {
    try {
      const [file] = await pick({ type: [types.pdf, types.images, types.docx] });
      setAttachment({
        uri: file.uri,
        name: file.name ?? 'fichier',
        type: file.type ?? 'application/octet-stream',
      });
    } catch (e: any) {
      if (!isErrorWithCode(e) || e.code !== errorCodes.OPERATION_CANCELED) {
        Alert.alert(t('error_title'), 'Impossible de sélectionner le fichier.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!sujet.trim() || !message.trim()) {
      Alert.alert(t('alert_required_fields'), t('message_fill_fields'));
      return;
    }
    if (!accountant?.email) {
      Alert.alert(t('error_title'), t('error_accountant_email_missing'));
      return;
    }
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('to', accountant.email);
      formData.append('subject', sujet.trim());
      formData.append('message', message.trim());
      if (attachment) {
        formData.append('attachment', {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.type,
        } as any);
      }
      console.log('testeee100', formData)
      await api.post(Api_Endpoints.sendAccountantEmail, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert(t('success_message_sent'), t('success_message_sent_text'), [
        { text: t('button_ok'), onPress: () => { setSujet(''); setMessage(''); setAttachment(null); onBack(); } },
      ]);
    } catch (e: any) {
        
        console.log('testeee101', e)
      const msg = e?.response?.data?.message ?? 'Erreur lors de l\'envoi du message.';
      Alert.alert(t('error_title'), msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#4B5563" />
          </TouchableOpacity>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>{t('form_title_contact')}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Banner */}
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE']}
          style={styles.titleBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.titleBannerInner}>
            <View style={styles.titleIconBox}>
              <Mail size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.titleText}>{t('header_send_message')}</Text>
          </View>
        </LinearGradient>

        {/* Accountant Info */}
        <View style={styles.card}>
          <View style={styles.accountantRow}>
            {accountant?.company_logo ? (
              <Image source={{ uri: accountant.company_logo }} style={styles.accountantAvatarImg} />
            ) : (
              <View style={styles.accountantAvatar}>
                <User size={24} color="#1E5BAC" />
              </View>
            )}
            <View>
              <Text style={styles.accountantName}>{accountant?.name ?? '—'}</Text>
              <Text style={styles.accountantRole}>{t('role_your_accountant')}</Text>
            </View>
          </View>
        </View>

        {/* Sujet */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t('label_subject')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('placeholder_subject')}
            placeholderTextColor="#9CA3AF"
            value={sujet}
            onChangeText={setSujet}
          />
        </View>

        {/* Message */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t('label_message')}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder={t('placeholder_message')}
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Attachment placeholder */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t('label_attachment')}</Text>
          <TouchableOpacity style={styles.attachmentBox} activeOpacity={0.7} onPress={handlePickAttachment}>
            <FileText size={20} color={attachment ? '#1E5BAC' : '#9CA3AF'} />
            <Text style={[styles.attachmentText, attachment && { color: '#1E5BAC', fontWeight: '600' }]}
              numberOfLines={1}>
              {attachment ? attachment.name : t('button_select_file')}
            </Text>
            {attachment && (
              <TouchableOpacity onPress={() => setAttachment(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ fontSize: 18, color: '#9CA3AF', lineHeight: 20 }}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          <Text style={styles.attachmentHint}>{t('hint_attachment_format')}</Text>
        </View>

        {/* Delay info */}
        <View style={styles.delayBanner}>
          <Clock size={18} color="#D97706" style={{ flexShrink: 0 }} />
          <Text style={styles.delayText}>
            {t('info_response_time')}
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, sending && { opacity: 0.7 }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={sending}
        >
          {sending
            ? <ActivityIndicator color="#FFFFFF" />
            : <>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{t('button_send_message')}</Text>
              </>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Main Contact View ────────────────────────────────────────────────────────
const Contact: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const [showForm, setShowForm] = useState(false);
  const [accountant, setAccountant] = useState<AccountantInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    api.get(Api_Endpoints.accountantInfo)
      .then(res => { if (res.data?.success) setAccountant(res.data.data); })
      .catch(e => console.error('Failed to fetch accountant info:', e))
      .finally(() => setLoadingInfo(false));
  }, []);

  if (showForm) {
    return <ContactForm onBack={() => setShowForm(false)} accountant={accountant} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#4B5563" />
          </TouchableOpacity>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>{t('title_contact_accountant')}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Banner */}
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE']}
          style={styles.titleBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.titleBannerInner}>
            <View style={styles.titleIconBox}>
              <Headphones size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.titleText}>{t('title_contact_accountant')}</Text>
          </View>
        </LinearGradient>

        {/* Accountant Info Card */}
        <View style={styles.card}>
          {loadingInfo ? (
            <ActivityIndicator size="small" color="#1E5BAC" style={{ paddingVertical: 20 }} />
          ) : (
            <>
              <View style={styles.accountantInfoRow}>
                {accountant?.company_logo ? (
                  <Image source={{ uri: accountant.company_logo }} style={styles.accountantLargeAvatarImg} />
                ) : (
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.accountantLargeAvatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <User size={32} color="#FFFFFF" />
                  </LinearGradient>
                )}
                <View style={styles.accountantInfoText}>
                  <Text style={styles.accountantName}>{accountant?.name ?? '—'}</Text>
                  <Text style={styles.accountantRole}>{t('role_certified_accountant')}</Text>
                  <View style={styles.availableRow}>
                    <View style={[styles.greenDot, accountant?.is_active !== 1 && { backgroundColor: '#9CA3AF' }]} />
                    <Text style={styles.availableText}>
                      {accountant?.is_active === 1 ? t('status_available_today') : t('status_not_available')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactDetailsSection}>
                <View style={styles.contactDetailRow}>
                  <Mail size={16} color="#9CA3AF" />
                  <Text style={styles.contactDetailText}>{accountant?.email ?? '—'}</Text>
                </View>
                <View style={styles.contactDetailRow}>
                  <Clock size={16} color="#9CA3AF" />
                  <Text style={styles.contactDetailText}>{t('label_business_hours')}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Call Option */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => Linking.openURL('tel:0123456789')}
        >
          <LinearGradient
            colors={['#16A34A', '#15803D']}
            style={styles.actionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.actionCardInner}>
              <View style={styles.actionIconCircle}>
                <Phone size={28} color="#16A34A" strokeWidth={2.5} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={styles.actionCardTitle}>{t('action_call_directly')}</Text>
                <Text style={styles.actionCardSubtitle}>{t('subtitle_call_directly')}</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Message Option */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => setShowForm(true)}>
          <LinearGradient
            colors={['#1E5BAC', '#2563EB']}
            style={styles.actionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.actionCardInner}>
              <View style={styles.actionIconBoxBlue}>
                <Mail size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.actionCardText}>
                <Text style={styles.actionCardTitle}>{t('action_send_message')}</Text>
                <Text style={styles.actionCardSubtitle}>{t('subtitle_send_message')}</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Urgent Info */}
        <LinearGradient
          colors={['#FAF5FF', '#FDF2F8']}
          style={styles.urgentBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.urgentTitle}>{t('title_urgent_help')}</Text>
          <Text style={styles.urgentBody}>
            {t('text_urgent_help')}
          </Text>
          <View style={styles.urgentFooter}>
            <Clock size={14} color="#7C3AED" />
            <Text style={styles.urgentFooterText}>{t('footer_response_time')}</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 48,
    width: 160,
  },
  headerSpacer: {
    width: 40,
  },
  headerPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerPillText: {
    fontSize: 14,
    color: '#4B5563',
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
    rowGap: 12,
  },
  // Title Banner
  titleBanner: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  titleBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  titleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  // Accountant rows
  accountantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountantAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  accountantLargeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  accountantLargeAvatarImg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    flexShrink: 0,
  },
  accountantInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  accountantInfoText: {
    flex: 1,
  },
  accountantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  accountantRole: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  availableText: {
    fontSize: 12,
    color: '#4B5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  contactDetailsSection: {
    gap: 8,
  },
  contactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactDetailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  // Action Cards
  actionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  actionCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexShrink: 0,
  },
  actionIconBoxBlue: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  // Urgent Banner
  urgentBanner: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  urgentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  urgentBody: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  urgentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  // Form styles
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 10,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
  },
  attachmentText: {
    fontSize: 14,
    color: '#4B5563',
  },
  attachmentHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  delayBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
  },
  delayText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E5BAC',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Contact;
