import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  Building2,
  Shield,
  Package,
  Languages,
  ChevronRight,
  LogOut,
  Headphones,
  Share2,
  CheckCircle2,
  Edit2,
  FolderOpen,
  MessageCircle,
  CreditCard,
} from 'lucide-react-native';

const MenuRow: React.FC<{
  Icon: React.ComponentType<any>;
  iconColor: string;
  label: string;
  onPress: () => void;
  isLast?: boolean;
  labelColor?: string;
  chevronColor?: string;
}> = ({ Icon, iconColor, label, onPress, isLast, labelColor = '#111827', chevronColor = '#9CA3AF' }) => (
  <TouchableOpacity
    style={[styles.row, !isLast && styles.rowDivider]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon size={22} color={iconColor} strokeWidth={2} />
    <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
    <ChevronRight size={18} color={chevronColor} />
  </TouchableOpacity>
);

const Plus: React.FC = ({ navigation }: any) => {
  const user = useSelector((state: any) => state.user.customer);
  const nav = useNavigation<any>();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      nav.reset({ index: 0, routes: [{ name: 'Splash' }] });
    } catch (e: any) {
      Alert.alert(t('error_title'), t('error_logout_message'));
    } finally {
      setLoggingOut(false);
    }
  };
  console.log('user in plus screen', user);
  const handleMenuPress = (action: string) => {
    console.log('Navigate to:', action);
    if (action === 'profile')          navigation.navigate('Personal Profile');
    else if (action === 'company')     navigation.navigate('Company Profile');
    else if (action === 'security')    navigation.navigate('Account Security');
    else if (action === 'products')    navigation.navigate('Products');
    else if (action === 'language')    navigation.navigate('Language Settings');
    else if (action === 'whatsapp')    navigation.navigate('WhatsApp Bot');
    else if (action === 'documents')   navigation.navigate('Documents List');
    else if (action === 'support')     navigation.navigate('Contact');
    else if (action === 'plan')        navigation.navigate('My Plan');
    else if (action === 'logout')      handleLogout();
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: t('share_message') });
    } catch { }
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0].substring(0, 2).toUpperCase();
  };
  const displayName    = user?.name  || 'Mon Compte';
  const companyName    = user?.billing_name   || 'Mon Entreprise';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarCircle}>
            {/* <Text style={styles.avatarText}>{getInitials(displayName)}</Text> */}
            <Image source={{ uri: user?.avatar_url }} style={{width: 72, height: 72, borderRadius: 36}} />
          </View>

          {/* Name + company */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.companyRow}>
              <Building2 size={14} color="#6B7280" />
              <Text style={styles.companyText}>{companyName}</Text>
              <TouchableOpacity
                onPress={() => handleMenuPress('company')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Edit2 size={14} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Admin badge */}
          <View style={styles.adminBadge}>
            <CheckCircle2 size={14} color="#1E5BAC" fill="#1E5BAC" />
            <Text style={styles.adminBadgeText}>{t('plus_admin')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('section_compte')}</Text>
          <View style={styles.card}>
            <MenuRow Icon={User}      iconColor="#1E5BAC" label={t('menu_profile')}   onPress={() => handleMenuPress('profile')}  />
            <MenuRow Icon={Building2} iconColor="#1E5BAC" label={t('menu_company')}   onPress={() => handleMenuPress('company')}  isLast />
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('section_securite')}</Text>
          <View style={styles.card}>
            <MenuRow Icon={Shield} iconColor="#1E5BAC" label={t('menu_security')} onPress={() => handleMenuPress('security')} isLast />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('section_preferences')}</Text>
          <View style={styles.card}>
            <MenuRow Icon={FolderOpen}     iconColor="#1E5BAC" label={t('menu_documents')} onPress={() => handleMenuPress('documents')} />
            <MenuRow Icon={Package}         iconColor="#1E5BAC" label={t('menu_products')}  onPress={() => handleMenuPress('products')}  />
            <MenuRow Icon={Languages}       iconColor="#1E5BAC" label={t('menu_language')}  onPress={() => handleMenuPress('language')}  />
            <MenuRow Icon={MessageCircle}   iconColor="#25D366" label={t('menu_whatsapp')}  onPress={() => handleMenuPress('whatsapp')}  />
            <MenuRow Icon={CreditCard}       iconColor="#1E5BAC" label={t('menu_my_plan')}   onPress={() => handleMenuPress('plan')}      isLast />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('section_support')}</Text>
          <View style={styles.card}>
            <MenuRow Icon={Headphones} iconColor="#1E5BAC" label={t('menu_help')} onPress={() => handleMenuPress('support')} isLast />
          </View>
        </View>

        {/* Share */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.card, styles.shareRow]} onPress={handleShare} activeOpacity={0.75}>
            <Share2 size={22} color="#16A34A" strokeWidth={2} />
            <View style={styles.shareInfo}>
              <Text style={styles.shareTitle}>{t('menu_rate')}</Text>
              <Text style={styles.shareSubtitle}>{t('menu_rate_sub')}</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.row, { paddingHorizontal: 20 }]}
              onPress={() => handleMenuPress('logout')}
              disabled={loggingOut}
              activeOpacity={0.7}
            >
              {loggingOut
                ? <ActivityIndicator size="small" color="#EF4444" />
                : <LogOut size={22} color="#EF4444" strokeWidth={2} />}
              <Text style={styles.logoutLabel}>{t('menu_logout')}</Text>
              <ChevronRight size={18} color="#FCA5A5" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF6' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Profile header
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: '#1E5BAC' },
  profileInfo: { flex: 1, paddingTop: 4 },
  profileName: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 6 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  companyText: { fontSize: 13, color: '#6B7280', flex: 1 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    flexShrink: 0,
  },
  adminBadgeText: { fontSize: 12, fontWeight: '600', color: '#1E5BAC' },

  // Section
  section: { marginTop: 16, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },

  // Share
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  shareInfo: { flex: 1 },
  shareTitle: { fontSize: 15, fontWeight: '500', color: '#111827' },
  shareSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  // Logout
  logoutLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#EF4444' },
});

export default Plus;
