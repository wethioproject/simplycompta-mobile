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
import { loadSubscription } from '../../store/slices/subscriptionSlice';
import { setIsEnableLogin } from '../../store/slices/appSlice';
import { fetchChecklist } from '../../store/slices/onboardingSlice';
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
  EyeOff,
  FolderOpen,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  Sparkles,
} from 'lucide-react-native';
import notificationService from '../../services/notificationService';
import dashboardService from '../../services/dashboardService';
import premiumInsightsService, { PremiumInsightsData } from '../../services/premiumInsightsService';
import ConnectedAccountantCard from '../../components/home/ConnectedAccountantCard';
import OCRScannerCard from '../../components/home/OCRScannerCard';
import WhatsAppBotCard from '../../components/home/WhatsAppBotCard';
import { FadeInView, PremiumShimmer, PremiumTouchable } from '../../components/common/PremiumMotion';
import { useSecurity } from '../../contexts/SecurityContext';

type DrawerNavigation = DrawerNavigationProp<any>;

/* ─── Sub-components ─── */

/** Home Header with greeting, subtitle & notification bell */
const HomeHeader: React.FC<{
  userName: string;
  currentMonth: string;
  hasUnread: boolean;
  onNotifications: () => void;
  onTogglePrivacy: () => void;
  privateMode: boolean;
  t: any;
}> = ({ userName, currentMonth, hasUnread, onNotifications, onTogglePrivacy, privateMode, t }) => (
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
      <View style={styles.headerActions}>
        <PremiumTouchable style={styles.notifBtn} onPress={onTogglePrivacy} haptic>
          {privateMode ? <EyeOff size={22} color="#1E5BAC" /> : <Eye size={22} color="#374151" />}
        </PremiumTouchable>
        <PremiumTouchable
          style={styles.notifBtn}
          onPress={onNotifications}
          haptic
        >
          <Bell size={24} color="#374151" />
          {hasUnread && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>2</Text>
            </View>
          )}
        </PremiumTouchable>
      </View>
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

const TodayAssistant: React.FC<{
  stats: {
    unpaidInvoicesCount: number;
    unpaidInvoiceSum: number;
    expiredInvoicesCount: number;
    expiredInvoiceSum: number;
    sentQuotesCount: number;
    sentQuoteSum: number;
    unreadDocumentsCount: number;
    total_expenses_sum: number;
    total_vat_payable: number;
    hasLastMonthStatement: boolean;
  };
  loading: boolean;
  onNavigate: (page: string) => void;
  maskAmount: (value: string | number | null | undefined, suffix?: string) => string;
  t: any;
}> = ({ stats, loading, onNavigate, maskAmount, t }) => {
  const actions = [
    !stats.hasLastMonthStatement && {
      key: 'bank',
      icon: Building2,
      color: '#16A34A',
      bg: '#ECFDF5',
      title: t('today_action_bank'),
      desc: t('today_action_bank_desc'),
      route: 'bank',
    },
    stats.expiredInvoicesCount > 0 && {
      key: 'expired',
      icon: AlertTriangle,
      color: '#D97706',
      bg: '#FFFBEB',
      title: t('today_action_expired_invoices', { count: stats.expiredInvoicesCount }),
      desc: maskAmount(stats.expiredInvoiceSum),
      route: 'invoices-expired',
    },
    stats.unpaidInvoicesCount > 0 && {
      key: 'unpaid',
      icon: FileText,
      color: '#DC2626',
      bg: '#FEF2F2',
      title: t('today_action_unpaid_invoices', { count: stats.unpaidInvoicesCount }),
      desc: maskAmount(stats.unpaidInvoiceSum),
      route: 'invoices',
    },
    stats.sentQuotesCount > 0 && {
      key: 'quotes',
      icon: ClipboardList,
      color: '#1E5BAC',
      bg: '#EFF6FF',
      title: t('today_action_sent_quotes', { count: stats.sentQuotesCount }),
      desc: maskAmount(stats.sentQuoteSum),
      route: 'quotes-sent',
    },
    stats.unreadDocumentsCount > 0 && {
      key: 'documents',
      icon: FolderOpen,
      color: '#7C3AED',
      bg: '#F5F3FF',
      title: t('today_action_documents', { count: stats.unreadDocumentsCount }),
      desc: t('todo_from_accountant'),
      route: 'documentsList',
    },
  ].filter(Boolean).slice(0, 3) as Array<{
    key: string;
    icon: any;
    color: string;
    bg: string;
    title: string;
    desc: string;
    route: string;
  }>;

  const healthSignals = [
    stats.total_vat_payable > 0 ? t('today_signal_vat', { amount: maskAmount(stats.total_vat_payable) }) : null,
    stats.total_expenses_sum > 0 ? t('today_signal_expenses', { amount: maskAmount(stats.total_expenses_sum) }) : null,
    stats.unpaidInvoicesCount === 0 ? t('today_signal_no_unpaid') : null,
  ].filter(Boolean).slice(0, 2);

  return (
    <View style={styles.todayCard}>
      <View style={styles.todayHeader}>
        <View>
          <Text style={styles.todayEyebrow}>{t('today_assistant_eyebrow')}</Text>
          <Text style={styles.todayTitle}>{t('today_assistant_title')}</Text>
        </View>
        <View style={styles.todayPulse}>
          <Sparkles size={18} color="#1E5BAC" />
        </View>
      </View>

      {loading ? (
        <View style={{ gap: 8 }}>
          <PremiumShimmer width="72%" height={14} borderRadius={7} />
          <PremiumShimmer width="92%" height={44} borderRadius={14} />
        </View>
      ) : actions.length ? (
        <View style={styles.todayActions}>
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <PremiumTouchable key={action.key} style={styles.todayActionRow} onPress={() => onNavigate(action.route)} haptic>
                <View style={[styles.todayActionIcon, { backgroundColor: action.bg }]}>
                  <Icon size={18} color={action.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.todayActionTitle}>{action.title}</Text>
                  <Text style={styles.todayActionDesc}>{action.desc}</Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </PremiumTouchable>
            );
          })}
        </View>
      ) : (
        <View style={styles.todayAllGood}>
          <CheckCircle2 size={18} color="#16A34A" />
          <Text style={styles.todayAllGoodText}>{t('today_all_good')}</Text>
        </View>
      )}

      {!!healthSignals.length && (
        <View style={styles.todaySignals}>
          {healthSignals.map(signal => (
            <Text key={signal} style={styles.todaySignalText}>{signal}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const AccountantReviewCard: React.FC<{
  stats: {
    hasLastMonthStatement: boolean;
    unreadDocumentsCount: number;
    unpaidInvoicesCount: number;
    expiredInvoicesCount: number;
  };
  onNavigate: (page: string) => void;
  t: any;
}> = ({ stats, onNavigate, t }) => {
  const blockers = [
    !stats.hasLastMonthStatement && {
      key: 'bank',
      label: t('review_missing_statement'),
      route: 'bank',
    },
    stats.expiredInvoicesCount > 0 && {
      key: 'expired',
      label: t('review_overdue_invoices', { count: stats.expiredInvoicesCount }),
      route: 'invoices-expired',
    },
    stats.unpaidInvoicesCount > 0 && {
      key: 'unpaid',
      label: t('review_unpaid_invoices', { count: stats.unpaidInvoicesCount }),
      route: 'invoices',
    },
    stats.unreadDocumentsCount > 0 && {
      key: 'documents',
      label: t('review_unread_documents', { count: stats.unreadDocumentsCount }),
      route: 'documentsList',
    },
  ].filter(Boolean) as Array<{ key: string; label: string; route: string }>;

  const isReady = blockers.length === 0;
  const primaryAction = blockers[0]?.route ?? 'activity';

  return (
    <PremiumTouchable
      style={[styles.reviewCard, isReady ? styles.reviewCardReady : styles.reviewCardWaiting]}
      onPress={() => onNavigate(primaryAction)}
      haptic
    >
      <View style={styles.reviewTopRow}>
        <View style={[styles.reviewIconBox, isReady ? styles.reviewIconReady : styles.reviewIconWaiting]}>
          {isReady ? <CheckCircle2 size={18} color="#16A34A" /> : <AlertTriangle size={18} color="#D97706" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewTitle}>
            {isReady ? t('review_ready_title') : t('review_waiting_title')}
          </Text>
          <Text style={styles.reviewSubtitle}>
            {isReady ? t('review_ready_subtitle') : t('review_waiting_subtitle')}
          </Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </View>

      <View style={styles.reviewChecklist}>
        {(isReady ? [
          { key: 'ready-bank', label: t('review_statement_ok') },
          { key: 'ready-docs', label: t('review_documents_ok') },
        ] : blockers.slice(0, 3)).map(item => (
          <View key={item.key} style={[styles.reviewChip, isReady && styles.reviewChipReady]}>
            <Text style={[styles.reviewChipText, isReady && styles.reviewChipTextReady]} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </PremiumTouchable>
  );
};

const PremiumInsightsCard: React.FC<{
  insights: PremiumInsightsData | null;
  loading: boolean;
  t: any;
}> = ({ insights, loading, t }) => {
  if (loading) {
    return (
      <View style={styles.insightsCard}>
        <PremiumShimmer width="48%" height={14} borderRadius={7} />
        <PremiumShimmer width="82%" height={42} borderRadius={14} />
      </View>
    );
  }

  if (!insights) return null;

  return (
    <View style={styles.insightsCard}>
      <View style={styles.insightsHeader}>
        <View>
          <Text style={styles.insightsEyebrow}>{t('premium_insights_eyebrow')}</Text>
          <Text style={styles.insightsTitle}>{t('premium_insights_title')}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{insights.financial_health_score}</Text>
        </View>
      </View>
      {(insights.attention_today.length ? insights.attention_today : [{ type: 'ok', title: insights.vat_assistant.message }]).slice(0, 3).map((item, index) => (
        <View key={`${item.type}-${index}`} style={styles.insightRow}>
          <Sparkles size={15} color="#1E5BAC" />
          <Text style={styles.insightText}>{item.title}</Text>
        </View>
      ))}
    </View>
  );
};

const DashboardSkeleton: React.FC = () => (
  <View style={styles.dashboardSkeleton}>
    <View style={styles.skeletonCardTall}>
      <PremiumShimmer width="42%" height={12} borderRadius={6} />
      <PremiumShimmer width="68%" height={20} borderRadius={10} />
      <PremiumShimmer width="54%" height={12} borderRadius={6} />
    </View>
    <View style={styles.skeletonRow}>
      {[0, 1, 2].map(item => (
        <View key={item} style={styles.skeletonMiniCard}>
          <PremiumShimmer width={32} height={32} borderRadius={10} />
          <PremiumShimmer width="70%" height={12} borderRadius={6} />
          <PremiumShimmer width="86%" height={18} borderRadius={9} />
        </View>
      ))}
    </View>
  </View>
);

const AnimatedAmount: React.FC<{ value: number; suffix?: string; privateMode?: boolean }> = ({ value, suffix = 'MAD', privateMode = false }) => {
  const animated = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listener = animated.addListener(({ value: nextValue }) => {
      setDisplayValue(Math.round(nextValue));
    });
    Animated.timing(animated, {
      toValue: value,
      duration: 760,
      useNativeDriver: false,
    }).start();

    return () => animated.removeListener(listener);
  }, [animated, value]);

  return (
    <Text style={styles.statsValue}>
      {privateMode ? '••••' : displayValue.toLocaleString('fr-FR')}{' '}
      <Text style={styles.statsUnit}>{suffix}</Text>
    </Text>
  );
};

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
  privateMode: boolean;
  t: any;
}> = ({ stats, loading, previousMonthName, privateMode, t }) => (
  <View style={styles.statsRow}>
    {/* Revenus */}
    <View style={[styles.statsCard, { backgroundColor: '#F0FDF4' }]}>
      <View style={[styles.statsIconBox, { backgroundColor: '#16A34A' }]}>
        <TrendingUp size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.statsLabel}>{t('label_revenus_home')}</Text>
      {loading ? (
        <View style={styles.statsSkeletonStack}>
          <PremiumShimmer width="72%" height={18} borderRadius={9} />
          <PremiumShimmer width="58%" height={10} borderRadius={5} />
        </View>
      ) : (
        <>
          <AnimatedAmount value={stats.total_paid_sum} privateMode={privateMode} />
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
        <View style={styles.statsSkeletonStack}>
          <PremiumShimmer width="72%" height={18} borderRadius={9} />
          <PremiumShimmer width="58%" height={10} borderRadius={5} />
        </View>
      ) : (
        <>
          <AnimatedAmount value={stats.total_expenses_sum} privateMode={privateMode} />
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
        <View style={styles.statsSkeletonStack}>
          <PremiumShimmer width="72%" height={18} borderRadius={9} />
          <PremiumShimmer width="58%" height={10} borderRadius={5} />
        </View>
      ) : (
        <>
          <AnimatedAmount value={stats.total_vat_payable} privateMode={privateMode} />
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
    hasLastMonthStatement: boolean;
    expiredInvoicesCount: number;
    expiredInvoiceSum: number;
  };
  onNavigate: (page: string) => void;
  bankStatementMonth: string;
  maskAmount: (value: string | number | null | undefined, suffix?: string) => string;
  t: any;
}> = ({ stats, onNavigate, bankStatementMonth, maskAmount, t }) => {
  const showUnpaidTask = stats.unpaidInvoicesCount > 0;
  const showUnreadTask = stats.unreadDocumentsCount > 0;
  const showExpiredTask = stats.expiredInvoicesCount > 0;

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
      {!stats.hasLastMonthStatement && (
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
          <PremiumTouchable
            style={[styles.taskActionBtn, { backgroundColor: '#F0FDF4' }]}
            onPress={() => onNavigate('bank')}
            haptic
          >
            <Send size={16} color="#16A34A" strokeWidth={2.5} />
          </PremiumTouchable>
        </View>
      </View>
      )}

      {!stats.hasLastMonthStatement && <View style={styles.taskDivider} />}

      {/* Task 2: Unpaid invoices */}
      {showUnpaidTask && (
      <View style={styles.taskRow}>
        <View style={[styles.taskIcon, { backgroundColor: '#FEF2F2' }]}>
          <FileText size={20} color="#EF4444" />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{t('todo_unpaid_invoices', { count: stats.unpaidInvoicesCount || 2 })}</Text>
          <Text style={styles.taskDesc}>
            {t('todo_amount_pending', { amount: maskAmount(stats.unpaidInvoiceSum) })}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <View style={styles.taskBadgePriority}>
            <Text style={styles.taskBadgePriorityText}>{t('badge_priority')}</Text>
          </View>
          <PremiumTouchable
            style={[styles.taskActionBtn, { backgroundColor: '#1E5BAC' }]}
            onPress={() => onNavigate('invoices')}
            haptic
          >
            <Eye size={16} color="#FFFFFF" strokeWidth={2.5} />
          </PremiumTouchable>
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
          <PremiumTouchable
            style={[styles.taskActionBtn, { backgroundColor: '#1E3A5F' }]}
            onPress={() => onNavigate('documentsList')}
            haptic
          >
            <FolderOpen size={16} color="#FFFFFF" strokeWidth={2.5} />
          </PremiumTouchable>
        </View>
      </View>
      )}

      {showUnreadTask && showExpiredTask && <View style={styles.taskDivider} />}

      {/* Task 4: Expired invoices */}
      {showExpiredTask && (
      <View style={styles.taskRow}>
        <View style={[styles.taskIcon, { backgroundColor: '#FEF3C7' }]}>
          <AlertTriangle size={20} color="#D97706" />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{t('todo_expired_invoices', { count: stats.expiredInvoicesCount })}</Text>
          <Text style={styles.taskDesc}>
            {t('todo_amount_pending', { amount: maskAmount(stats.expiredInvoiceSum) })}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <View style={[styles.taskBadgePriority, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.taskBadgePriorityText, { color: '#D97706' }]}>{t('badge_expired')}</Text>
          </View>
          <PremiumTouchable
            style={[styles.taskActionBtn, { backgroundColor: '#F59E0B' }]}
            onPress={() => onNavigate('invoices-expired')}
            haptic
          >
            <Eye size={16} color="#FFFFFF" strokeWidth={2.5} />
          </PremiumTouchable>
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
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progressPercentage,
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, progressPercentage]);

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
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
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
    sentQuotesCount: number;
    sentQuoteSum: number;
    expiredInvoicesCount: number;
    expiredInvoiceSum: number;
  };
  loading: boolean;
  onNavigate: (page: string) => void;
  maskAmount: (value: string | number | null | undefined, suffix?: string) => string;
  t: any;
}> = ({ stats, loading, onNavigate, maskAmount, t }) => {
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
    <PremiumTouchable
      style={styles.activityCard}
      onPress={() => onNavigate('invoices')}
      haptic
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
            {maskAmount(stats.unpaidInvoiceSum)}
          </Text>
        )}
        <View style={styles.activityBadgeUrgent}>
          <Text style={styles.activityBadgeUrgentText}>⚠️ {t('badge_urgent')}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </PremiumTouchable>
    )}

    {/* Devis en cours */}
    <PremiumTouchable
      style={styles.activityCard}
      onPress={() => onNavigate('quotes')}
      haptic
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
            {maskAmount(stats.total_quote_sum)}
          </Text>
        )}
        <View style={styles.activityBadgePending}>
          <Text style={styles.activityBadgePendingText}>⏱️ {t('badge_pending')}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </PremiumTouchable>

    {/* Devis envoyés */}
    {stats.sentQuotesCount > 0 && (
    <PremiumTouchable
      style={styles.activityCard}
      onPress={() => onNavigate('quotes-sent')}
      haptic
    >
      <View style={[styles.activityIcon, { backgroundColor: '#FFFBEB' }]}>
        <Send size={20} color="#F59E0B" />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{t('label_devis_envoyes')}</Text>
        <Text style={styles.activitySubtitle}>{t('label_15_devis', { count: stats.sentQuotesCount })}</Text>
      </View>
      <View style={styles.activityRight}>
        {loading ? (
          <ActivityIndicator size="small" color="#F59E0B" />
        ) : (
          <Text style={[styles.activityAmount, { color: '#F59E0B' }]}>
            {maskAmount(stats.sentQuoteSum)}
          </Text>
        )}
        <View style={[styles.activityBadgePending, { backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.activityBadgePendingText, { color: '#D97706' }]}>📤 {t('badge_sent')}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </PremiumTouchable>
    )}
  </View>
  );
};

/* ─── Main Component ─── */
const Home: React.FC = () => {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const navigation = useNavigation<DrawerNavigation>();
  const { t, i18n } = useTranslation();
  const customer = useSelector((state: any) => state.user.customer);
  const { privateModeEnabled, togglePrivateMode, maskAmount } = useSecurity();
  const dispatch = useDispatch();
  const [hasUnread, setHasUnread] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [premiumInsights, setPremiumInsights] = useState<PremiumInsightsData | null>(null);
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
    sentQuotesCount: 0,
    sentQuoteSum: 0,
    expiredInvoicesCount: 0,
    expiredInvoiceSum: 0,
    total_pending_actions: 0,
    unpaidInvoicesCount: 0,
    unpaidInvoiceSum: 0,
    unreadDocumentsCount: 0,
    total_progress_score: 0,
    hasStatement: false,
    hasLastMonthStatement: false,
    whatsapp_bot_enabled: false,
    companyName: '',
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
          hasLastMonthStatement: res.data.hasLastMonthStatement ?? false,
          sentQuotesCount: res.data.sentQuotesCount ?? 0,
          sentQuoteSum: res.data.sentQuoteSum ?? 0,
          expiredInvoiceSum: res.data.expiredInvoiceSum ?? 0,
          expiredInvoicesCount: res.data.expiredInvoicesCount ?? 0,
          whatsapp_bot_enabled: res.data.whatsapp_bot_enabled ?? false,
          companyName: res.data.companyName ?? 'Default company',
        });
      }
    } catch {}
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchPremiumInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await premiumInsightsService.getInsights();
      setPremiumInsights(res.success ? res.data : null);
    } catch {
      setPremiumInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPremiumInsights(); }, [fetchPremiumInsights]);

  useEffect(() => { dispatch(loadSubscription() as any); }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    await fetchStats();
    await fetchPremiumInsights();
    setRefreshing(false);
  }, [fetchStats, fetchPremiumInsights]);

  const checkUnread = useCallback(() => {
    notificationService.hasUnreadNotifications().then(setHasUnread).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkUnread();
      pollIntervalRef.current = setInterval(checkUnread, 30_000);
      dispatch(fetchChecklist() as any);
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
      expenses: 'Expenses',
      'contact-comptable': 'Contact',
    };
    if (page === 'quotes-sent') {
      navigation.navigate('Quote', { defaultTab: 'sent' });
      return;
    }
    if (page === 'invoices-expired') {
      navigation.navigate('Invoice');
      return;
    }
    if (page === 'whatsapp-bot') {
      navigation.navigate('WhatsApp Bot');
      return;
    }
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
        onTogglePrivacy={togglePrivateMode}
        privateMode={privateModeEnabled}
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
        <FadeInView delay={20}>
          <StatusBadges stats={stats} t={t} />
        </FadeInView>

        {/* KPI Hero */}
        {statsLoading && (
          <FadeInView delay={30}>
            <DashboardSkeleton />
          </FadeInView>
        )}
        <FadeInView delay={40}>
          <StatsCards stats={stats} loading={statsLoading} previousMonthName={previousMonthName} privateMode={privateModeEnabled} t={t} />
        </FadeInView>

        {/* OCR Scanner CTA Card */}
        <FadeInView delay={60}>
          <OCRScannerCard onScan={() => navigation.navigate('Expenses', { openCreateModal: true })} />
        </FadeInView>

        {/* WhatsApp Bot Card */}
        <FadeInView delay={80}>
          <WhatsAppBotCard
            enabled={stats.whatsapp_bot_enabled}
            onActivate={() => handleNavigate('whatsapp-bot')}
          />
        </FadeInView>

        <FadeInView delay={40}>
          <TodayAssistant
            stats={{
              unpaidInvoicesCount: stats.unpaidInvoicesCount,
              unpaidInvoiceSum: stats.unpaidInvoiceSum,
              expiredInvoicesCount: stats.expiredInvoicesCount,
              expiredInvoiceSum: stats.expiredInvoiceSum,
              sentQuotesCount: stats.sentQuotesCount,
              sentQuoteSum: stats.sentQuoteSum,
              unreadDocumentsCount: stats.unreadDocumentsCount,
              total_expenses_sum: stats.total_expenses_sum,
              total_vat_payable: stats.total_vat_payable,
              hasLastMonthStatement: stats.hasLastMonthStatement,
            }}
            loading={statsLoading}
            onNavigate={handleNavigate}
            maskAmount={maskAmount}
            t={t}
          />
        </FadeInView>

        <FadeInView delay={60}>
          <AccountantReviewCard
            stats={{
              hasLastMonthStatement: stats.hasLastMonthStatement,
              unreadDocumentsCount: stats.unreadDocumentsCount,
              unpaidInvoicesCount: stats.unpaidInvoicesCount,
              expiredInvoicesCount: stats.expiredInvoicesCount,
            }}
            onNavigate={handleNavigate}
            t={t}
          />
        </FadeInView>

        <FadeInView delay={70}>
          <PremiumInsightsCard insights={premiumInsights} loading={insightsLoading} t={t} />
        </FadeInView>

        {/* Connected Accountant Card */}
        <FadeInView delay={100}>
          <ConnectedAccountantCard onPress={() => handleNavigate('accounting')} companyName={stats.companyName} />
        </FadeInView>

        {/* Tasks Section */}
        <FadeInView delay={220}>
          <TasksSection stats={stats} onNavigate={handleNavigate} bankStatementMonth={bankStatementMonth} maskAmount={maskAmount} t={t} />
        </FadeInView>

        {/* Progress Section */}
        <FadeInView delay={260}>
          <ProgressSection progressScore={stats.total_progress_score} t={t} />
        </FadeInView>

        {/* Activities Section */}
        <FadeInView delay={300}>
          <ActivitiesSection
            stats={{
              total_issued_count: stats.total_issued_count,
              total_issued_sum: stats.total_issued_sum,
              unpaidInvoicesCount: stats.unpaidInvoicesCount,
              unpaidInvoiceSum: stats.unpaidInvoiceSum,
              total_quote_count: stats.total_quote_count,
              total_quote_sum: stats.total_quote_sum,
              sentQuotesCount: stats.sentQuotesCount,
              sentQuoteSum: stats.sentQuoteSum,
              expiredInvoiceSum: stats.expiredInvoiceSum,
              expiredInvoicesCount: stats.expiredInvoicesCount,
            }}
            loading={statsLoading}
            onNavigate={handleNavigate}
            maskAmount={maskAmount}
            t={t}
          />
        </FadeInView>

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  todayCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  todayEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  todayPulse: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayActions: { gap: 8 },
  todayActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  todayActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayActionTitle: { fontSize: 13, fontWeight: '800', color: '#111827' },
  todayActionDesc: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 },
  todayAllGood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
  },
  todayAllGoodText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#166534', lineHeight: 17 },
  todaySignals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  todaySignalText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E5BAC',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  reviewCard: {
    marginBottom: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  reviewCardReady: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  reviewCardWaiting: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewIconBox: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewIconReady: { backgroundColor: '#DCFCE7' },
  reviewIconWaiting: { backgroundColor: '#FEF3C7' },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  reviewChecklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  reviewChip: {
    maxWidth: '100%',
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reviewChipReady: { backgroundColor: '#DCFCE7' },
  reviewChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  reviewChipTextReady: { color: '#166534' },
  insightsCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    gap: 10,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  insightsEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E5BAC',
    textTransform: 'uppercase',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E5BAC',
  },
  insightRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    lineHeight: 17,
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
    gap: 8,
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  statsIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },
  statsLabel: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '800',
  },
  statsValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  statsUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  statsTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  statsTrendText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsSkeletonStack: {
    marginTop: 4,
    gap: 7,
  },
  dashboardSkeleton: {
    gap: 10,
    marginBottom: 12,
  },
  skeletonCardTall: {
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skeletonMiniCard: {
    flex: 1,
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
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
