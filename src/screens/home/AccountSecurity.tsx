import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Lock, ShieldCheck, Monitor, ArrowLeft } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

const AccountSecurity: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [twoFactor, setTwoFactor] = useState(false);
  const [lastPasswordUpdate, setLastPasswordUpdate] = useState<string>('');
  const [loadingPassword, setLoadingPassword] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const calculateTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffMonths / 12);

      if (diffYears > 0) return `${t('time_ago_prefix')} ${diffYears} ${diffYears === 1 ? t('time_ago_year') : t('time_ago_year_plural')}`;
      if (diffMonths > 0) return `${t('time_ago_prefix')} ${diffMonths} ${diffMonths === 1 ? t('time_ago_month') : t('time_ago_month_plural')}`;
      if (diffDays > 0) return `${t('time_ago_prefix')} ${diffDays} ${diffDays === 1 ? t('time_ago_day') : t('time_ago_day_plural')}`;
      if (diffHours > 0) return `${t('time_ago_prefix')} ${diffHours} ${diffHours === 1 ? t('time_ago_hour') : t('time_ago_hour_plural')}`;
      if (diffMins > 0) return `${t('time_ago_prefix')} ${diffMins} ${diffMins === 1 ? t('time_ago_minute') : t('time_ago_minute_plural')}`;
      return t('time_ago_just_now');
    } catch {
      return t('time_ago_last_update_unknown');
    }
  };

  useEffect(() => {
    fetchLastPasswordUpdate();
  }, []);

  const fetchLastPasswordUpdate = async () => {
    try {
      setLoadingPassword(true);
      const response = await api.get(Api_Endpoints.lastPasswordUpdate);
      const timestamp = response.data?.data?.last_password_update || response.data?.last_password_update;
      if (timestamp) {
        const formattedTime = calculateTimeAgo(timestamp);
        setLastPasswordUpdate(`${t('label_last_updated')} ${formattedTime}`);
      }
    } catch (error) {
      console.error('Error fetching last password update:', error);
      setLastPasswordUpdate(t('time_ago_last_update_unknown'));
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('alert_delete_account_title'),
      t('alert_delete_account_message'),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(Api_Endpoints.customerProfile);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (e: any) {
              const msg = e?.response?.data?.message ?? t('error_delete_account');
              Alert.alert(t('error_title'), msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('header_security')}</Text>
          <View style={{ flex: 1 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main security card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('card_account_security')}</Text>

          {/* Password row */}
          <View style={styles.row}>
            <View style={styles.rowIconBox}>
              <Lock size={20} color="#9CA3AF" />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{t('label_password')}</Text>
              {loadingPassword ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Text style={styles.rowSub}>{lastPasswordUpdate}</Text>
              )}
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Change Password')}>
              <Text style={styles.actionLink}>{t('button_change')}</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={styles.divider} /> */}

          {/* 2FA row */}
          {/* <View style={styles.row}>
            <View style={styles.rowIconBox}>
              <ShieldCheck size={20} color="#9CA3AF" />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Authentification à deux facteurs</Text>
              <Text style={styles.rowSub}>Ajoutez une couche de sécurité supplémentaire</Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: '#E5E7EB', true: '#3B6FD4' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View> */}

          {/* <View style={styles.divider} /> */}

          {/* Active sessions row */}
          {/* <View style={styles.row}>
            <View style={styles.rowIconBox}>
              <Monitor size={20} color="#9CA3AF" />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Sessions actives</Text>
              <Text style={styles.rowSub}>2 appareils connectés</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.actionLink}>Gérer</Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Danger zone card */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>{t('header_danger_zone')}</Text>
          <Text style={styles.dangerSub}>{t('danger_zone_description')}</Text>
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && { opacity: 0.7 }]}
            onPress={handleDeleteAccount}
            disabled={deleting}
            activeOpacity={0.85}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.deleteBtnText}>{t('button_delete_account')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F8' },

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
  headerTop: { alignItems: 'center', marginBottom: 12 },
  logo: { height: 44, width: 150 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },

  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },

  // Main card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  rowSub: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B6FD4',
    flexShrink: 0,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },

  // Danger zone
  dangerCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 24,
    gap: 6,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  dangerSub: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 16,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AccountSecurity;
