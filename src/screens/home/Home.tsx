import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  AppState,
  AppStateStatus,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Bell,
  FileText,
  Building2,
  Scale,
  Briefcase,
  CreditCard,
  TrendingDown,
  ArrowUpRight,
  Percent,
  RotateCw,
  Users,
  Plus,
} from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import notificationService from '../../services/notificationService';
import dashboardService from '../../services/dashboardService';

type DrawerNavigation = DrawerNavigationProp<any>;

const Home: React.FC = () => {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const navigation = useNavigation<DrawerNavigation>();
  const { t, i18n } = useTranslation();
  const customer = useSelector((state: any) => state.user.customer);
  const [hasUnread, setHasUnread] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_paid_sum: 0,
    total_expenses_sum: 0,
    total_vat_payable: 0,
    total_issued_sum: 0,
    total_quote_sum: 0,
    total_issued_count: 0,
    total_quote_count: 0,
  });


    // Animation values
    const fabRotation = useState(new Animated.Value(0))[0];
    const fabButton1Scale = useState(new Animated.Value(0))[0];
    const fabButton2Scale = useState(new Animated.Value(0))[0];
    const fabButton3Scale = useState(new Animated.Value(0))[0];
    const fabButton1Opacity = useState(new Animated.Value(0))[0];
    const fabButton2Opacity = useState(new Animated.Value(0))[0];
    const fabButton3Opacity = useState(new Animated.Value(0))[0];

    const rotation = fabRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  
    const toggleFab = () => {
      const toValue = isFabOpen ? 0 : 1;
      setIsFabOpen(!isFabOpen);
      Animated.parallel([
        Animated.timing(fabRotation, { toValue, duration: 300, useNativeDriver: true }),
        Animated.stagger(50, [
          Animated.parallel([
            Animated.spring(fabButton1Scale, { toValue, friction: 5, useNativeDriver: true }),
            Animated.timing(fabButton1Opacity, { toValue, duration: 200, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.spring(fabButton2Scale, { toValue, friction: 5, useNativeDriver: true }),
            Animated.timing(fabButton2Opacity, { toValue, duration: 200, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.spring(fabButton3Scale, { toValue, friction: 5, useNativeDriver: true }),
            Animated.timing(fabButton3Opacity, { toValue, duration: 200, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    };
  
    const handleNavigateToInvoice = () => {
      toggleFab();
      setTimeout(() => { navigation.navigate('Invoice', { openCreateModal: true }); }, 300);
    };
  
    const handleNavigateToQuote = () => {
      toggleFab();
      setTimeout(() => { navigation.navigate('Expenses', { openCreateModal: true }); }, 300);
    };
  
    const handleOpenAddClient = () => {
      toggleFab();
      setTimeout(() => { navigation.navigate('Clients', { openCreateModal: true }); }, 300);
    };

  

  const fetchStats = useCallback(async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const date_from = `${year}-${month}-01`;
    const date_to = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    try {
      const res = await dashboardService.getActivityData(date_from, date_to);
      if (res.success && res.data) {
        setStats({
          total_paid_sum: res.data.total_paid_sum ?? 0,
          total_expenses_sum: res.data.total_expenses_sum ?? 0,
          total_vat_payable: res.data.total_vat_payable ?? 0,
          total_issued_sum: res.data.total_issued_sum ?? 0,
          total_quote_sum: res.data.total_quote_sum ?? 0,
          total_issued_count: res.data.total_issued_count ?? 0,
          total_quote_count: res.data.total_quote_count ?? 0,
        });
      }
    } catch {}
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const checkUnread = useCallback(() => {
    notificationService.hasUnreadNotifications().then(setHasUnread).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkUnread();
      pollIntervalRef.current = setInterval(checkUnread, 30_000);
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }, [checkUnread])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') checkUnread();
    });
    return () => subscription.remove();
  }, [checkUnread]);

  const handleNavigate = (page: string) => {
    const routes: { [key: string]: string } = {
      profile: 'Profile',
      legal: 'Legal Documents',
      accounting: 'Accounting Documents',
      activity: 'Activity',
      bank: 'Bank Statements',
      notifications: 'Notifications',
      invoices: 'Accounting Documents',
      'contact-comptable': 'Contact',
    };
    const route = routes[page];
    if (route) navigation.navigate(route);
  };

  const userName =
    customer?.first_name || customer?.client_name || customer?.name || 'Youssef';

  const currentMonth = new Date().toLocaleString(i18n.language, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Logo Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity
          style={[styles.refreshButton, (refreshing || statsLoading) && { opacity: 0.35 }]}
          onPress={handleRefresh}
          disabled={refreshing || statsLoading}
          activeOpacity={0.7}
        >
          <RotateCw size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1E5BAC']}
            tintColor="#1E5BAC"
          />
        }
      >
        {/* Greeting */}
        <Text style={styles.greeting}>
          {t('greeting_hello')} {userName}
        </Text>

        {/* ── Activity Summary ──────────────────────────────────── */}
        <Text style={styles.sectionSubtitle}>
          {t('activity_summary_title')} {currentMonth}
        </Text>

        <View style={styles.summaryRow}>
          {/* Revenus */}
          <View style={[styles.summaryCard, { backgroundColor: '#C9F29A' }]}>
            <View style={[styles.summaryIconBox, { backgroundColor: 'rgba(255,255,255,0.35)' }]}>
              <TrendingDown size={16} color="#0D9488" />
            </View>
            <Text style={styles.summaryLabel}>{t('label_revenus')}</Text>
            {statsLoading ? (
              <ActivityIndicator size="small" color="#0D9488" style={{ marginTop: 4 }} />
            ) : (
              <Text style={[styles.summaryAmount, { color: '#0D9488' }]}>
                {stats.total_paid_sum.toLocaleString('fr-FR')}{' '}
                <Text style={styles.summaryUnit}>MAD</Text>
              </Text>
            )}
          </View>

          {/* Dépenses */}
          <View style={[styles.summaryCard, { backgroundColor: '#FFF1EE' }]}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FFE0D9' }]}>
              <ArrowUpRight size={16} color="#E8795A" />
            </View>
            <Text style={styles.summaryLabel}>{t('label_depenses')}</Text>
            {statsLoading ? (
              <ActivityIndicator size="small" color="#E8795A" style={{ marginTop: 4 }} />
            ) : (
              <Text style={[styles.summaryAmount, { color: '#E8795A' }]}>
                {stats.total_expenses_sum.toLocaleString('fr-FR')}{' '}
                <Text style={styles.summaryUnit}>MAD</Text>
              </Text>
            )}
          </View>

          {/* TVA */}
          <View style={[styles.summaryCard, { backgroundColor: '#E8F4F8' }]}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#D1EAF0' }]}>
              <Percent size={16} color="#0E7490" />
            </View>
            <Text style={styles.summaryLabel}>{t('label_tva')}</Text>
            {statsLoading ? (
              <ActivityIndicator size="small" color="#0E7490" style={{ marginTop: 4 }} />
            ) : (
              <Text style={[styles.summaryAmount, { color: '#111827' }]}>
                {stats.total_vat_payable.toLocaleString('fr-FR')}{' '}
                <Text style={styles.summaryUnit}>MAD</Text>
              </Text>
            )}
          </View>
        </View>

        {/* ── Activités en cours ───────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('section_activites_en_cours')}</Text>

        <View style={styles.activitiesContainer}>
          <TouchableOpacity
            style={styles.activityRow}
            onPress={() => handleNavigate('invoices')}
            activeOpacity={0.75}
          >
            <View style={[styles.activityIcon, { backgroundColor: '#E6F7F1' }]}>
              <FileText size={18} color="#6FB13F" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{t('label_factures_impayees')}</Text>
              <Text style={styles.activitySubtitle}>{t('label_3_factures', { count: stats.total_issued_count })}</Text>
            </View>
            {statsLoading ? (
              <ActivityIndicator size="small" color="#6FB13F" />
            ) : (
              <Text style={styles.activityAmount}>
                {stats.total_issued_sum.toLocaleString('fr-FR')}{' '}
                <Text style={styles.summaryUnit}>MAD</Text>
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityRow}
            onPress={() => handleNavigate('invoices')}
            activeOpacity={0.75}
          >
            <View style={[styles.activityIcon, { backgroundColor: '#E0EDFB' }]}>
              <FileText size={18} color="#4FA3D1" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{t('label_devis_en_cours')}</Text>
              <Text style={styles.activitySubtitle}>{t('label_15_devis', { count: stats.total_quote_count })}</Text>
            </View>
            {statsLoading ? (
              <ActivityIndicator size="small" color="#4FA3D1" />
            ) : (
              <Text style={styles.activityAmount}>
                {stats.total_quote_sum.toLocaleString('fr-FR')}{' '}
                <Text style={styles.summaryUnit}>MAD</Text>
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Administratif ───────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('section_administratif')}</Text>

        <View style={styles.adminGrid}>
          <TouchableOpacity
            style={[styles.adminCard, { backgroundColor: '#329ED2' }]}
            onPress={() => handleNavigate('profile')}
            activeOpacity={0.85}
          >
            <View style={styles.adminIconBox}>
              <Building2 size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.adminCardText}>{t('my_profile')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminCard, { backgroundColor: '#579529' }]}
            onPress={() => handleNavigate('legal')}
            activeOpacity={0.85}
          >
            <View style={styles.adminIconBox}>
              <Scale size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.adminCardText}>{t('legal_documents')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminCard, { backgroundColor: '#4FA3D1' }]}
            
            onPress={() => handleNavigate('activity')}
            activeOpacity={0.85}
          >
            <View style={styles.adminIconBox}>
              
              <Briefcase size={20} color="#FFFFFF" />
            </View>
            
            <Text style={styles.adminCardText}>{t('my_activity')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminCard, { backgroundColor: '#6FB13F' }]}
            onPress={() => handleNavigate('accounting')}
            activeOpacity={0.85}
          >
            <View style={styles.adminIconBox}>
              <FileText size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.adminCardText}>{t('accounting_documents')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminCard, { backgroundColor: '#6DA6C4' }]}
            onPress={() => handleNavigate('bank')}
            activeOpacity={0.85}
          >
            <View style={styles.adminIconBox}>
              <CreditCard size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.adminCardText}>{t('my_bank_statements')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminCard, { backgroundColor: '#9BD25B' }]}
            onPress={() => handleNavigate('notifications')}
            activeOpacity={0.85}
          >
            {hasUnread && (
              <View style={styles.cardBadge}>
                <View style={styles.cardBadgeDot} />
              </View>
            )}
            <View style={styles.adminIconBox}>
              <Bell size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.adminCardText}>{t('my_notifications')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton3Scale }], opacity: fabButton3Opacity, bottom: 176 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton3]} onPress={handleNavigateToInvoice} activeOpacity={0.8}>
            {/* <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" /> */}
          <FileText
          size={24}
          color="#FFFFFF"
          strokeWidth={2}
          />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton2Scale }], opacity: fabButton2Opacity, bottom: 120 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton2]} onPress={handleNavigateToQuote} activeOpacity={0.8}>
            {/* <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" /> */}
          <TrendingDown
          size={24}
          color="#FFFFFF"
          strokeWidth={2}
          />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton1Scale }], opacity: fabButton1Opacity, bottom: 64 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton1]} onPress={handleOpenAddClient} activeOpacity={0.8}>
            {/* <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" /> */}
          <Users
          size={24}
          color="#FFFFFF"
          strokeWidth={2}
          />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.fab} onPress={toggleFab} activeOpacity={0.8}>
          <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: rotation }] }]}><Plus size={28} color="#FFFFFF" strokeWidth={2.5}/></Animated.Text>
          {/* <Plus size={28} color="#FFFFFF" strokeWidth={2.5} style={{ transform: [{ rotate: rotation }] }} /> */}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 64,
    width: 200,
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // ── Greeting
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 16,
  },

  // ── Section labels
  sectionSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },

  // ── Summary row (3 cards)
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryUnit: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },

  // ── Activités en cours
  activitiesContainer: {
    gap: 8,
    marginBottom: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: { flex: 1 },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  activitySubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },

  // ── Admin grid (2-column)
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  adminCard: {
    width: '48.5%',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    position: 'relative',
  },
  adminIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminCardText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Notification badge on card
  cardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cardBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

    // FAB
  fabSpacer: {
    height: 16,
  },
//   fab: {
//     position: 'absolute',
//     bottom: 24,
//     right: 20,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#1E5BAC',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#1E5BAC',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//     elevation: 8,
//   },


  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 20,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E5BAC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  //   fab: {
  //   position: 'absolute',
  //   bottom: 28,
  //   right: 20,
  //   width: 56,
  //   height: 56,
  //   borderRadius: 28,
  //   backgroundColor: '#1E5BAC',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   shadowColor: '#1E5BAC',
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.35,
  //   shadowRadius: 8,
  //   elevation: 8,
  // },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  subFab: {
    position: 'absolute',
    right: 0,
  },
  subFabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  subFabButton1: {
    backgroundColor: '#1E5BAC',
  },
  subFabButton2: {
    backgroundColor: '#1E5BAC',
  },
  subFabButton3: {
    backgroundColor: '#1E5BAC',
  },
  fabIconImage: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default Home;