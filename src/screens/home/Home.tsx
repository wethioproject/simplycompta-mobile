import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { useSelector, useDispatch } from 'react-redux';
import { setIsEnableLogin } from '../../store/slices/appSlice';
import {
  Bell,
  FileText,
  Building2,
  TrendingUp,
  TrendingDown,
  Percent,
  Users,
  Plus,
  CheckCircle2,
  Send,
  Eye,
  FolderOpen,
  ChevronRight,
  ClipboardList,
} from 'lucide-react-native';
import notificationService from '../../services/notificationService';
import dashboardService from '../../services/dashboardService';

type DrawerNavigation = DrawerNavigationProp<any>;

/* ─── Sub-components ─── */

/** Home Header with greeting, subtitle & notification bell */
const HomeHeader: React.FC<{
  userName: string;
  currentMonth: string;
  hasUnread: boolean;
  onNotifications: () => void;
  t: any;
}> = ({ userName, currentMonth, hasUnread, onNotifications, t }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <View style={styles.headerTextWrap}>
        <Text style={styles.greetingText}>
          {t('greeting_hello')} {userName} <Text>👋</Text>
        </Text>
        <Text style={styles.greetingSubtitle}>
          {t('home_subtitle', { month: currentMonth })}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.notifBtn}
        onPress={onNotifications}
        activeOpacity={0.7}
      >
        <Bell size={24} color="#374151" />
        {hasUnread && (
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>2</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

/** Status badges row */
const StatusBadges: React.FC<{ stats: { total_pending_actions: number }; t: any }> = ({ stats, t }) => (
  <View style={styles.badgesRow}>
    {stats.total_pending_actions === 0 ? (
      <View style={styles.badgeGreen}>
        <CheckCircle2 size={14} color="#16A34A" />
        <Text style={styles.badgeGreenText}>{t('badge_accounting_up_to_date')}</Text>
      </View>
    ) : (
      <View style={styles.badgeOrange}>
        <Text style={styles.badgeOrangeText}>{t('badge_actions_pending', { count: stats.total_pending_actions })}</Text>
      </View>
    )}
  </View>
);

/** Stats cards (3 columns) */
const StatsCards: React.FC<{
  stats: {
    total_paid_sum: number;
    total_paid_percentage_change: number;
    total_expenses_sum: number;
    total_expenses_percentage_change: number;
    total_vat_payable: number;
    total_vat_payable_percentage_change: number;
  };
  loading: boolean;
  previousMonthName: string;
  t: any;
}> = ({ stats, loading, previousMonthName, t }) => (
  <View style={styles.statsRow}>
    {/* Revenus */}
    <View style={[styles.statsCard, { backgroundColor: '#F0FDF4' }]}>
      <View style={[styles.statsIconBox, { backgroundColor: '#16A34A' }]}>
        <TrendingUp size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.statsLabel}>{t('label_revenus_home')}</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#16A34A" style={{ marginTop: 4 }} />
      ) : (
        <>
          <Text style={styles.statsValue}>
            {stats.total_paid_sum.toLocaleString('fr-FR')}{' '}
            <Text style={styles.statsUnit}>MAD</Text>
          </Text>
          <View style={styles.statsTrendRow}>
            <TrendingUp size={10} color="#16A34A" />
            <Text style={[styles.statsTrendText, { color: '#16A34A' }]}>{stats.total_paid_percentage_change > 0 ? '+' : ''}{stats.total_paid_percentage_change}% vs {previousMonthName}</Text>
          </View>
        </>
      )}
    </View>

    {/* Dépenses */}
    <View style={[styles.statsCard, { backgroundColor: '#FEF2F2' }]}>
      <View style={[styles.statsIconBox, { backgroundColor: '#F87171' }]}>
        <TrendingDown size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.statsLabel}>{t('label_depenses_home')}</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#F87171" style={{ marginTop: 4 }} />
      ) : (
        <>
          <Text style={styles.statsValue}>
            {stats.total_expenses_sum.toLocaleString('fr-FR')}{' '}
            <Text style={styles.statsUnit}>MAD</Text>
          </Text>
          <View style={styles.statsTrendRow}>
            <TrendingDown size={10} color="#EF4444" />
            <Text style={[styles.statsTrendText, { color: '#EF4444' }]}>{stats.total_expenses_percentage_change > 0 ? '+' : ''}{stats.total_expenses_percentage_change}% vs {previousMonthName}</Text>
          </View>
        </>
      )}
    </View>

    {/* TVA */}
    <View style={[styles.statsCard, { backgroundColor: '#EFF6FF' }]}>
      <View style={[styles.statsIconBox, { backgroundColor: '#1E5BAC' }]}>
        <Percent size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.statsLabel}>{t('label_tva_home')}</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#1E5BAC" style={{ marginTop: 4 }} />
      ) : (
        <>
          <Text style={styles.statsValue}>
            {stats.total_vat_payable.toLocaleString('fr-FR')}{' '}
            <Text style={styles.statsUnit}>MAD</Text>
          </Text>
          <Text style={[styles.statsTrendText, { color: '#9CA3AF', marginTop: 2 }]}>{stats.total_vat_payable_percentage_change > 0 ? '+' : ''}{stats.total_vat_payable_percentage_change}% vs {previousMonthName}</Text>
        </>
      )}
    </View>
  </View>
);

/** Tasks section ("À faire ce mois") */
const TasksSection: React.FC<{
  stats: {
    total_issued_count: number;
    total_issued_sum: number;
    unpaidInvoicesCount: number;
    unreadDocumentsCount: number;
    unpaidInvoiceSum: number;
    hasStatement: boolean;
  };
  onNavigate: (page: string) => void;
  bankStatementMonth: string;
  t: any;
}> = ({ stats, onNavigate, bankStatementMonth, t }) => {
  const showUnpaidTask = stats.unpaidInvoicesCount > 0;
  const showUnreadTask = stats.unreadDocumentsCount > 0;

  return (
  <View style={styles.tasksSection}>
    <View style={styles.tasksSectionHeader}>
      <View style={styles.tasksTitleRow}>
        <View style={styles.tasksTitleIcon}>
          <Text style={styles.tasksTitleEmoji}>🎯</Text>
        </View>
        <Text style={styles.tasksSectionTitle}>{t('section_todo_this_month')}</Text>
      </View>
      {/* <TouchableOpacity activeOpacity={0.7}>
        <Text style={styles.tasksSeeAll}>{t('todo_see_all')}</Text>
      </TouchableOpacity> */}
    </View>

    <View style={styles.tasksCard}>
      {/* Task 1: Send bank statement */}
      {stats.hasStatement && (
      <View style={styles.taskRow}>
        <View style={[styles.taskIcon, { backgroundColor: '#F0FDF4' }]}>
          <Building2 size={20} color="#16A34A" />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{t('todo_send_bank_statement')}</Text>
          <Text style={styles.taskDesc}>{t('todo_bank_statement_missing', { month: bankStatementMonth })}</Text>
        </View>
        <View style={styles.taskActions}>
          <View style={styles.taskBadgePriority}>
            <Text style={styles.taskBadgePriorityText}>{t('badge_priority')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.taskActionBtn, { backgroundColor: '#F0FDF4' }]}
            onPress={() => onNavigate('bank')}
            activeOpacity={0.8}
          >
            <Send size={16} color="#16A34A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
      )}

      {stats.hasStatement && <View style={styles.taskDivider} />}

      {/* Task 2: Unpaid invoices */}
      {showUnpaidTask && (
      <View style={styles.taskRow}>
        <View style={[styles.taskIcon, { backgroundColor: '#FEF2F2' }]}>
          <FileText size={20} color="#EF4444" />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{t('todo_unpaid_invoices', { count: stats.unpaidInvoicesCount || 2 })}</Text>
          <Text style={styles.taskDesc}>
            {t('todo_amount_pending', { amount: stats.unpaidInvoiceSum.toLocaleString('fr-FR') })}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <View style={styles.taskBadgePriority}>
            <Text style={styles.taskBadgePriorityText}>{t('badge_priority')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.taskActionBtn, { backgroundColor: '#1E5BAC' }]}
            onPress={() => onNavigate('invoices')}
            activeOpacity={0.8}
          >
            <Eye size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
      )}

      {showUnpaidTask && <View style={styles.taskDivider} />}

      {/* Task 3: Unread document */}
      {showUnreadTask && (
      <View style={styles.taskRow}>
        <View style={[styles.taskIcon, { backgroundColor: '#F3E8FF' }]}>
          <Eye size={20} color="#8B5CF6" />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{t('todo_unread_document', { count: stats.unreadDocumentsCount || 1 })}</Text>
          <Text style={styles.taskDesc}>{t('todo_from_accountant')}</Text>
        </View>
        <View style={styles.taskActions}>
          <View style={styles.taskBadgeNew}>
            <Text style={styles.taskBadgeNewText}>{t('badge_new')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.taskActionBtn, { backgroundColor: '#1E3A5F' }]}
            onPress={() => onNavigate('documentsList')}
            activeOpacity={0.8}
          >
            <FolderOpen size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
      )}
    </View>
  </View>
  );
};

/** Progress section */
const ProgressSection: React.FC<{ progressScore: number; t: any }> = ({ progressScore, t }) => {
  const progressPercentage = Math.min(100, Math.max(0, progressScore));
  return (
  <View style={styles.progressSection}>
    <View style={styles.progressHeader}>
      <View style={styles.tasksTitleRow}>
        <Text style={styles.tasksTitleEmoji}>📊</Text>
        <Text style={styles.tasksSectionTitle}>{t('section_month_progress')}</Text>
      </View>
      <Text style={styles.progressPct}>{progressPercentage}%</Text>
    </View>
    <View style={styles.progressCard}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
      </View>
      <Text style={styles.progressText}>{t('progress_encouragement')}</Text>
    </View>
  </View>
  );
};

/** Activities section (Factures impayées + Devis en cours) */
const ActivitiesSection: React.FC<{
  stats: {
    total_issued_count: number;
    total_issued_sum: number;
    unpaidInvoicesCount: number;
    unpaidInvoiceSum: number;
    total_quote_count: number;
    total_quote_sum: number;
  };
  loading: boolean;
  onNavigate: (page: string) => void;
  t: any;
}> = ({ stats, loading, onNavigate, t }) => {
  return (
  <View style={styles.activitiesSection}>
    <View style={styles.activitiesHeader}>
      <View style={styles.tasksTitleRow}>
        <Text style={styles.tasksTitleEmoji}>📋</Text>
        <Text style={styles.tasksSectionTitle}>{t('section_activites_en_cours')}</Text>
      </View>
      <Text style={styles.activitiesCount}>{t('label_elements', { count: stats.unpaidInvoicesCount > 0 ? 2 : 1 })}</Text>
    </View>

    {/* Unpaid invoices - Conditional render */}
    {stats.unpaidInvoicesCount > 0 && (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => onNavigate('invoices')}
      activeOpacity={0.8}
    >
      <View style={[styles.activityIcon, { backgroundColor: '#F0FDF4' }]}>
        <FileText size={20} color="#16A34A" />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{t('label_factures_impayees')}</Text>
        <Text style={styles.activitySubtitle}>{t('label_3_factures', { count: stats.unpaidInvoicesCount })}</Text>
      </View>
      <View style={styles.activityRight}>
        {loading ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <Text style={[styles.activityAmount, { color: '#EF4444' }]}>
            {stats.unpaidInvoiceSum.toLocaleString('fr-FR')} MAD
          </Text>
        )}
        <View style={styles.activityBadgeUrgent}>
          <Text style={styles.activityBadgeUrgentText}>⚠️ {t('badge_urgent')}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
    )}

    {/* Devis en cours */}
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => onNavigate('quotes')}
      activeOpacity={0.8}
    >
      <View style={[styles.activityIcon, { backgroundColor: '#EFF6FF' }]}>
        <ClipboardList size={20} color="#1E5BAC" />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{t('label_devis_en_cours')}</Text>
        <Text style={styles.activitySubtitle}>{t('label_15_devis', { count: stats.total_quote_count })}</Text>
      </View>
      <View style={styles.activityRight}>
        {loading ? (
          <ActivityIndicator size="small" color="#111827" />
        ) : (
          <Text style={[styles.activityAmount, { color: '#111827' }]}>
            {stats.total_quote_sum.toLocaleString('fr-FR')} MAD
          </Text>
        )}
        <View style={styles.activityBadgePending}>
          <Text style={styles.activityBadgePendingText}>⏱️ {t('badge_pending')}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  </View>
  );
};

/* ─── Main Component ─── */
const Home: React.FC = () => {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const navigation = useNavigation<DrawerNavigation>();
  const { t, i18n } = useTranslation();
  const customer = useSelector((state: any) => state.user.customer);
  const dispatch = useDispatch();
  const [hasUnread, setHasUnread] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_paid_sum: 0,
    total_paid_percentage_change: 0,
    total_expenses_sum: 0,
    total_expenses_percentage_change: 0,
    total_vat_payable: 0,
    total_vat_payable_percentage_change: 0,
    total_issued_sum: 0,
    total_quote_sum: 0,
    total_issued_count: 0,
    total_quote_count: 0,
    total_pending_actions: 0,
    unpaidInvoicesCount: 0,
    unpaidInvoiceSum: 0,
    unreadDocumentsCount: 0,
    total_progress_score: 0,
    hasStatement: false,
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
      console.log('dashboard statsss', res);
      if (res.success && res.data) {
        dispatch(setIsEnableLogin((res.data.is_enable_login ?? 1) as 0 | 1));
        setStats({
          total_paid_sum: res.data.total_paid_sum ?? 0,
          total_paid_percentage_change: res.data.total_paid_percentage_change ?? 0,
          total_expenses_sum: res.data.total_expenses_sum ?? 0,
          total_expenses_percentage_change: res.data.total_expenses_percentage_change ?? 0,
          total_vat_payable: res.data.total_vat_payable ?? 0,
          total_vat_payable_percentage_change: res.data.total_vat_payable_percentage_change ?? 0,
          total_issued_sum: res.data.total_issued_sum ?? 0,
          total_quote_sum: res.data.total_quote_sum ?? 0,
          total_issued_count: res.data.total_issued_count ?? 0,
          total_quote_count: res.data.total_quote_count ?? 0,
          total_pending_actions: res.data.total_pending_actions ?? 0,
          unpaidInvoicesCount: res.data.unpaidInvoicesCount ?? 0,
          unpaidInvoiceSum: res.data.unpaidInvoiceSum ?? 0,
          unreadDocumentsCount: res.data.unreadDocumentsCount ?? 0,
          total_progress_score: res.data.total_progress_score ?? 0,
          hasStatement: res.data.hasStatement ?? false,
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
      documentsList: 'Documents List',
      invoices: 'Invoice',
      quotes: 'Quote',
      'contact-comptable': 'Contact',
    };
    const route = routes[page];
    if (route) navigation.navigate(route);
  };

  const userName =
    customer?.first_name || customer?.client_name || customer?.name.split(" ")[0] || 'Youssef';

  const currentMonth = new Date().toLocaleString(i18n.language, {
    month: 'long',
    year: 'numeric',
  });

  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const previousMonthName = previousMonth.toLocaleString(i18n.language, {
    month: 'short',
  });

  const bankStatementMonth = previousMonth.toLocaleString(i18n.language, {
    month: 'long',
    year: 'numeric',
  });
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <HomeHeader
        userName={userName}
        currentMonth={currentMonth}
        hasUnread={hasUnread}
        onNotifications={() => handleNavigate('notifications')}
        t={t}
      />

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
        {/* Status Badges */}
        <StatusBadges stats={stats} t={t} />

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={statsLoading} previousMonthName={previousMonthName} t={t} />

        {/* Tasks Section */}
        <TasksSection stats={stats} onNavigate={handleNavigate} bankStatementMonth={bankStatementMonth} t={t} />

        {/* Progress Section */}
        <ProgressSection progressScore={stats.total_progress_score} t={t} />

        {/* Activities Section */}
        <ActivitiesSection
          stats={{
            total_issued_count: stats.total_issued_count,
            total_issued_sum: stats.total_issued_sum,
            unpaidInvoicesCount: stats.unpaidInvoicesCount,
            unpaidInvoiceSum: stats.unpaidInvoiceSum,
            total_quote_count: stats.total_quote_count,
            total_quote_sum: stats.total_quote_sum,
          }}
          loading={statsLoading}
          onNavigate={handleNavigate}
          t={t}
        />

        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* FAB */}
      {/* <View style={styles.fabContainer}>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton3Scale }], opacity: fabButton3Opacity, bottom: 176 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton3]} onPress={handleNavigateToInvoice} activeOpacity={0.8}>
            <FileText size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton2Scale }], opacity: fabButton2Opacity, bottom: 120 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton2]} onPress={handleNavigateToQuote} activeOpacity={0.8}>
            <TrendingDown size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton1Scale }], opacity: fabButton1Opacity, bottom: 64 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton1]} onPress={handleOpenAddClient} activeOpacity={0.8}>
            <Users size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.fab} onPress={toggleFab} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
          </Animated.View>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

/* ─── Styles ─── */
const styles = StyleSheet.create({
  /* Container */
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTextWrap: {
    flex: 1,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  notifBtn: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  /* Status Badges */
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  badgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  badgeGreenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  badgeOrange: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  badgeOrangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA580C',
  },

  /* Stats Cards (3 cols) */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statsIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statsLabel: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statsUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  statsTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statsTrendText: {
    fontSize: 9,
    fontWeight: '600',
  },

  /* Tasks Section */
  tasksSection: {
    marginBottom: 24,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tasksTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tasksTitleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksTitleEmoji: {
    fontSize: 16,
  },
  tasksSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tasksSeeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5BAC',
  },
  tasksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  taskDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  taskDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskBadgePriority: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgePriorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
  },
  taskBadgeNew: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgeNewText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  taskActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Progress Section */
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },

  /* Activities Section */
  activitiesSection: {
    marginBottom: 16,
  },
  activitiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activitiesCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  activityBadgeUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activityBadgeUrgentText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  activityBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activityBadgePendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EA580C',
  },

  /* FAB */
  fabSpacer: {
    height: 24,
  },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    shadowOffset: { width: 0, height: 2 },
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
});

export default Home;