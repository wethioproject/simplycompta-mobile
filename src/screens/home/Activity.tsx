import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Vibration,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  RefreshCw,
  FileText,
  ChevronDown,
  Plus,
  Check,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Sparkles, 
  BarChart3,
  Wallet,
  Receipt,
  Info,
  Search,
  Clock3,
  FolderUp,
  MessageSquare,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import dashboardService from '../../services/dashboardService';
import type { QuickAnalysisData } from '../../services/dashboardService';
import activityService from '../../services/activityService';
import type {
  ActivityFilter,
  MobileActivityData,
  MobileActivityEvent,
  MobileActivitySuggestion,
} from '../../types/activity.types';

/* ─── Helpers ─── */
const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const fmtDisplay = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const MONTH_KEYS = ['month_january','month_february','month_march','month_april','month_may','month_june','month_july','month_august','month_september','month_october','month_november','month_december'] as const;

const buildPeriods = (t: any) => {
  const now = new Date();
  const y = now.getFullYear();
  const lastY = y - 1;
  const monthPeriods = Array.from({ length: 12 }, (_, i) => ({
    label: `${t(MONTH_KEYS[i])} ${y}`,
    date_from: fmt(new Date(y, i, 1)),
    date_to: fmt(new Date(y, i + 1, 0)), // last day of month, handles 28/29/30/31 correctly
  }));
  return [
    ...monthPeriods,
    { label: `${t('period_current_year')} (${y})`, date_from: fmt(new Date(y, 0, 1)), date_to: fmt(new Date(y, 11, 31)) },
    { label: `${t('period_previous_year')} (${lastY})`, date_from: fmt(new Date(lastY, 0, 1)), date_to: fmt(new Date(lastY, 11, 31)) },
    { label: t('period_last_6_months'), date_from: fmt(new Date(now.getFullYear(), now.getMonth() - 5, 1)), date_to: fmt(now) },
    { label: t('period_last_12_months'), date_from: fmt(new Date(now.getFullYear(), now.getMonth() - 11, 1)), date_to: fmt(now) },
  ];
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

/* ─── Sub-components ─── */

/** Header with greeting & refresh */
const HeaderSection: React.FC<{
  customerName: string;
  refreshing: boolean;
  loading: boolean;
  onRefresh: () => void;
  t: any;
}> = ({ customerName, refreshing, loading, onRefresh, t }) => {
  const firstName = customerName?.split(' ')[0] ?? '';
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingText}>
            {t('greeting_hello')} {firstName} <Text>👋</Text>
          </Text>
          <Text style={styles.greetingSubtitle}>{t('greeting_subtitle')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, (refreshing || loading) && { opacity: 0.35 }]}
          onPress={onRefresh}
          disabled={refreshing || loading}
          activeOpacity={0.7}
        >
          <RefreshCw size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/** Month / period selector card with gradient background */
const MonthSelectorCard: React.FC<{
  label: string;
  onPress: () => void;
}> = ({ label, onPress }) => (
  <LinearGradient
    colors={['#DBEAFE', '#BFDBFE']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.monthSelectorGradient}
  >
    <TouchableOpacity style={styles.monthSelectorButton} activeOpacity={0.7} onPress={onPress}>
      <FileText size={16} color="#1E5BAC" />
      <Text style={styles.monthSelectorText}>{label}</Text>
      <ChevronDown size={16} color="#6B7280" />
    </TouchableOpacity>
  </LinearGradient>
);

/** 2×2 KPI stats cards */
const StatsCards: React.FC<{
  stats: {
    total_issued_paid_sum: number;
    total_paid_sum: number;
    total_expenses_sum: number;
    total_vat_payable: number;
    total_paid_percentage_change: number;
    total_expenses_percentage_change: number;
    total_vat_payable_percentage_change: number;
  };
  loading: boolean;
  t: any;
}> = ({ stats, loading, t }) => {
  const [activeInfo, setActiveInfo] = useState<number | null>(null);

  const cards = [
    {
      label: t('label_ca'),
      rawValue: stats.total_issued_paid_sum,
      infoKey: 'info_ca',
      icon: <FileText size={16} color="#1E5BAC" />,
      bg: '#FFFFFF',
      borderColor: '#F3F4F6',
      subtitleColor: '#16A34A',
    },
    {
      label: t('label_cash_collected'),
      rawValue: stats.total_paid_sum,
      perValue: stats.total_paid_percentage_change,
      perColor: "#16A34A",
      infoKey: 'info_cash_collected',
      icon: <Wallet size={16} color="#16A34A" />,
      bg: '#F0FDF4',
      borderColor: '#DCFCE7',
      subtitleColor: '#16A34A',
    },
    {
      label: t('label_expenses'),
      rawValue: stats.total_expenses_sum,
      perValue: stats.total_expenses_percentage_change,
      perColor: "#EF4444",
      infoKey: 'info_expenses',
      icon: <Receipt size={16} color="#EF4444" />,
      bg: '#FEF2F2',
      borderColor: '#FEE2E2',
      subtitleColor: '#EF4444',
    },
    {
      label: t('label_estimated_vat'),
      rawValue: stats.total_vat_payable,
      perValue: stats.total_vat_payable_percentage_change,
      perColor: "#CA8A04",
      infoKey: 'info_estimated_vat',
      icon: <Sparkles size={16} color="#CA8A04" />,
      bg: '#FEFCE8',
      borderColor: '#FEF9C3',
      subtitleColor: '#A16207',
    },
  ];

  return (
    <View style={styles.statsGrid}>
      {cards.map((card, index) => (
        <View
          key={index}
          style={[
            styles.statCard,
            { backgroundColor: card.bg, borderColor: card.borderColor },
          ]}
        >
          <View style={styles.statCardHeader}>
            <View style={styles.statIconWrap}>{card.icon}</View>
            <Text style={[styles.statLabel, { flex: 1 }]}>{card.label}</Text>
            <TouchableOpacity
              onPress={() => setActiveInfo(activeInfo === index ? null : index)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.7}
            >
              <Info size={13} color={activeInfo === index ? '#1E5BAC' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#1E5BAC" style={{ marginTop: 8 }} />
          ) : (
            <>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {card.rawValue.toLocaleString('fr-FR')}{' '}
                <Text style={styles.statCurrency}>{t('currency_mad')}</Text>
              </Text>
            </>
          )}
          {activeInfo === index && (
            <View style={styles.statTooltip}>
              <Text style={styles.statTooltipText}>{t(card.infoKey)}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

/** Action buttons row (Facture + Dépense) */
const ActionButtons: React.FC<{
  onInvoice: () => void;
  onExpense: () => void;
  t: any;
}> = ({ onInvoice, onExpense, t }) => (
  <View style={styles.actionRow}>
    <TouchableOpacity style={styles.actionBtnPrimary} activeOpacity={0.8} onPress={onInvoice}>
      <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
      <Text style={styles.actionBtnPrimaryText}>{t('action_invoice')}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8} onPress={onExpense}>
      <Plus size={16} color="#1E5BAC" strokeWidth={2.5} />
      <Text style={styles.actionBtnSecondaryText}>{t('action_expense')}</Text>
    </TouchableOpacity>
  </View>
);

/** Quick Analysis section */
const QuickAnalysis: React.FC<{
  t: any;
  loading: boolean;
  analysis: QuickAnalysisData | null;
}> = ({ t, loading, analysis }) => {
  const expensePct = Math.abs(Number(analysis?.expenses_alert?.variation_percentage ?? 0));
  const pendingCount = Number(analysis?.pending_invoices?.count ?? 0);
  const pendingAmount = Number(analysis?.pending_invoices?.total_amount ?? 0);
  const goodMonthPct = Math.abs(Number(analysis?.performance_alert?.variation_percentage ?? 0));

  const showExpenseAlert = Boolean(analysis?.expenses_alert?.is_higher);
  const showPendingInvoices = pendingCount > 0;
  const showGoodMonth = Boolean(analysis?.performance_alert?.is_good);
  const hasAlerts = showExpenseAlert || showPendingInvoices || showGoodMonth;

  if (!loading && !hasAlerts) {
    return null;
  }

  return (
    <View style={styles.analysisSection}>
      <View style={styles.analysisTitleRow}>
        <BarChart3 size={20} color="#1E5BAC" />
        <Text style={styles.analysisTitleText}>{t('section_quick_analysis')}</Text>
      </View>

      {loading ? (
        <View style={styles.analysisLoadingBox}>
          <ActivityIndicator size="small" color="#1E5BAC" />
        </View>
      ) : (
        <>
          {showExpenseAlert && (
            <View style={[styles.analysisAlert, { backgroundColor: '#FEF2F2' }]}>
              <AlertTriangle size={16} color="#EF4444" style={{ marginTop: 2 }} />
              <View style={styles.analysisAlertContent}>
                <Text style={styles.analysisAlertBold}>{t('analysis_high_expenses')} </Text>
                <Text style={styles.analysisAlertNormal}>{t('analysis_high_expenses_detail', { pct: expensePct })}</Text>
              </View>
            </View>
          )}

          {showPendingInvoices && (
            <View style={[styles.analysisAlert, { backgroundColor: '#FEFCE8' }]}>
              <FileText size={16} color="#CA8A04" style={{ marginTop: 2 }} />
              <View style={styles.analysisAlertContent}>
                <Text style={styles.analysisAlertBold}>{t('analysis_pending_invoices', { count: pendingCount })} </Text>
                <Text style={styles.analysisAlertNormal}>{t('analysis_pending_invoices_amount', { amount: pendingAmount.toLocaleString('fr-FR') })}</Text>
              </View>
            </View>
          )}

          {showGoodMonth && (
            <View style={[styles.analysisAlert, { backgroundColor: '#F0FDF4' }]}>
              <TrendingUp size={16} color="#16A34A" style={{ marginTop: 2 }} />
              <View style={styles.analysisAlertContent}>
                <Text style={styles.analysisAlertBold}>{t('analysis_good_month')} </Text>
                <Text style={styles.analysisAlertNormal}>{t('analysis_good_month_detail', { pct: goodMonthPct })}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: '#EFF6FF', text: '#1E5BAC', border: '#BFDBFE' },
  urgent: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  waiting: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  completed: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  ai_detected: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  insight: { bg: '#ECFEFF', text: '#0E7490', border: '#A5F3FC' },
};

const eventIcon = (icon: string, color: string) => {
  const props = { size: 18, color, strokeWidth: 2.2 };
  switch (icon) {
    case 'file-text':
      return <FileText {...props} />;
    case 'check-circle':
      return <CheckCircle2 {...props} />;
    case 'alert-circle':
      return <AlertCircle {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    case 'receipt':
      return <Receipt {...props} />;
    case 'folder-up':
      return <FolderUp {...props} />;
    case 'message-square':
      return <MessageSquare {...props} />;
    case 'landmark':
      return <Landmark {...props} />;
    case 'credit-card':
      return <Wallet {...props} />;
    case 'building-2':
      return <Building2 {...props} />;
    default:
      return <Clock3 {...props} />;
  }
};

const formatEventDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const ActivitySkeleton = () => (
  <View style={styles.timelineSkeletonWrap}>
    {[0, 1, 2].map(index => (
      <View key={index} style={styles.timelineSkeletonRow}>
        <View style={styles.timelineSkeletonIcon} />
        <View style={styles.timelineSkeletonBody}>
          <View style={[styles.timelineSkeletonLine, { width: index === 1 ? '58%' : '76%' }]} />
          <View style={[styles.timelineSkeletonLineSmall, { width: index === 2 ? '46%' : '62%' }]} />
        </View>
      </View>
    ))}
  </View>
);

const SuggestionsStrip: React.FC<{
  suggestions: MobileActivitySuggestion[];
  onPress: (suggestion: MobileActivitySuggestion) => void;
}> = ({ suggestions, onPress }) => {
  if (!suggestions.length) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestionsContent}
    >
      {suggestions.map(suggestion => {
        const colors = BADGE_COLORS[suggestion.type] ?? BADGE_COLORS.insight;
        return (
          <TouchableOpacity
            key={suggestion.id}
            style={[styles.suggestionCard, { borderColor: colors.border, backgroundColor: colors.bg }]}
            onPress={() => onPress(suggestion)}
            activeOpacity={0.78}
          >
            <Sparkles size={16} color={colors.text} />
            <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={2}>
              {suggestion.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const SmartTimeline: React.FC<{
  data: MobileActivityData | null;
  loading: boolean;
  filter: ActivityFilter;
  search: string;
  onFilterChange: (filter: ActivityFilter) => void;
  onSearchChange: (search: string) => void;
  onEventPress: (event: MobileActivityEvent) => void;
  onSuggestionPress: (suggestion: MobileActivitySuggestion) => void;
  t: any;
  locale: string;
}> = ({
  data,
  loading,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onEventPress,
  onSuggestionPress,
  t,
  locale,
}) => {
  const groups = data?.groups ?? [];
  const filters = data?.filters?.length
    ? data.filters
    : [
        { key: 'all' as ActivityFilter, label: t('activity_filter_all') },
        { key: 'invoices' as ActivityFilter, label: t('activity_filter_invoices') },
        { key: 'expenses' as ActivityFilter, label: t('activity_filter_expenses') },
        { key: 'ocr' as ActivityFilter, label: t('activity_filter_ocr') },
        { key: 'documents' as ActivityFilter, label: t('activity_filter_documents') },
        { key: 'payments' as ActivityFilter, label: t('activity_filter_payments') },
        { key: 'accountant' as ActivityFilter, label: t('activity_filter_accountant') },
      ];

  return (
    <View style={styles.timelineSection}>
      <View style={[styles.timelineHeader, I18nManager.isRTL && styles.rowReverse]}>
        <View>
          <Text style={styles.timelineEyebrow}>{t('activity_premium_eyebrow')}</Text>
          <Text style={styles.timelineTitle}>{t('activity_timeline_title')}</Text>
        </View>
        <View style={styles.timelineLiveBadge}>
          <Sparkles size={13} color="#1E5BAC" />
          <Text style={styles.timelineLiveBadgeText}>{t('activity_smart_badge')}</Text>
        </View>
      </View>

      <View style={[styles.timelineSearch, I18nManager.isRTL && styles.rowReverse]}>
        <Search size={18} color="#9CA3AF" />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder={t('activity_search_placeholder')}
          placeholderTextColor="#9CA3AF"
          style={[styles.timelineSearchInput, I18nManager.isRTL && styles.textRight]}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineFilterContent}
      >
        {filters.map(item => {
          const isActive = item.key === filter;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.timelineFilterChip, isActive && styles.timelineFilterChipActive]}
              onPress={() => onFilterChange(item.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.timelineFilterText, isActive && styles.timelineFilterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SuggestionsStrip suggestions={data?.suggestions ?? []} onPress={onSuggestionPress} />

      {loading ? (
        <ActivitySkeleton />
      ) : groups.length === 0 ? (
        <View style={styles.timelineEmpty}>
          <View style={styles.timelineEmptyIcon}>
            <Clock3 size={24} color="#1E5BAC" />
          </View>
          <Text style={styles.timelineEmptyTitle}>{t('activity_empty_title')}</Text>
          <Text style={styles.timelineEmptySubtitle}>{t('activity_empty_subtitle')}</Text>
        </View>
      ) : (
        <View style={styles.timelineCard}>
          {groups.map(group => (
            <View key={group.key} style={styles.timelineGroup}>
              <Text style={styles.timelineGroupTitle}>{group.label}</Text>
              {group.events.map((event, index) => {
                const colors = BADGE_COLORS[event.badge] ?? BADGE_COLORS.new;
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.timelineEventRow,
                      index === group.events.length - 1 && styles.timelineEventRowLast,
                    ]}
                    onPress={() => onEventPress(event)}
                    activeOpacity={0.78}
                  >
                    <View style={[styles.timelineEventIcon, { backgroundColor: colors.bg }]}>
                      {eventIcon(event.icon, colors.text)}
                    </View>
                    <View style={styles.timelineEventContent}>
                      <View style={[styles.timelineEventTop, I18nManager.isRTL && styles.rowReverse]}>
                        <Text style={[styles.timelineEventTitle, I18nManager.isRTL && styles.textRight]} numberOfLines={1}>
                          {event.title}
                        </Text>
                        <View style={[styles.timelineBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                          <Text style={[styles.timelineBadgeText, { color: colors.text }]} numberOfLines={1}>
                            {event.badge_label}
                          </Text>
                        </View>
                      </View>
                      {!!event.description && (
                        <Text style={[styles.timelineEventDescription, I18nManager.isRTL && styles.textRight]} numberOfLines={2}>
                          {event.description}
                        </Text>
                      )}
                      <View style={[styles.timelineEventMeta, I18nManager.isRTL && styles.rowReverse]}>
                        <Text style={styles.timelineEventDate}>{formatEventDate(event.occurred_at, locale)}</Text>
                        {event.amount !== null && event.amount !== undefined && (
                          <Text style={styles.timelineEventAmount}>
                            {Number(event.amount).toLocaleString(locale)} {event.currency ?? t('currency_mad')}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

/** Chart section: line chart + donut side by side */
const ChartSection: React.FC<{
  chartData: { ca: any[]; expenses: any[] };
  chartLoading: boolean;
  t: any;
}> = ({ chartData, chartLoading, t }) => {
  const [lineTooltip, setLineTooltip] = useState<{
    index: number;
    caVal: number;
    expVal: number;
    label: string;
  } | null>(null);
  const [pieTooltip, setPieTooltip] = useState<{
    label: string;
    value: number;
    pct: string;
    color: string;
  } | null>(null);

  const totalCA = chartData.ca.reduce((sum, p) => sum + p.value, 0);
  const totalExpenses = chartData.expenses.reduce((sum, p) => sum + p.value, 0);
  const grandTotal = totalCA + totalExpenses;
  const caPct = grandTotal > 0 ? ((totalCA / grandTotal) * 100).toFixed(1) : '0.0';
  const expPct = grandTotal > 0 ? ((totalExpenses / grandTotal) * 100).toFixed(1) : '0.0';

  const showLineTooltip = (index: number, caVal: number) => {
    setPieTooltip(null);
    const expVal = chartData.expenses[index]?.value ?? 0;
    const label =
      chartData.ca[index]?.label ??
      chartData.expenses[index]?.label ??
      `M${index + 1}`;
    setLineTooltip({ index, caVal, expVal, label });
  };

  const expensesWithPress = chartData.expenses.map((item: any, idx: number) => ({
    ...item,
    onPress: () => showLineTooltip(idx, chartData.ca[idx]?.value ?? 0),
  }));

  const pieData = [
    {
      value: totalCA || 0.01,
      color: '#3B82F6',
      label: t('legend_ca'),
      onPress: () => {
        setLineTooltip(null);
        setPieTooltip({ label: t('legend_ca'), value: totalCA, pct: caPct, color: '#3B82F6' });
      },
    },
    {
      value: totalExpenses || 0.01,
      color: '#F97316',
      label: t('legend_expenses'),
      onPress: () => {
        setLineTooltip(null);
        setPieTooltip({ label: t('legend_expenses'), value: totalExpenses, pct: expPct, color: '#F97316' });
      },
    },
  ];

  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartSectionTitle}>{t('chart_title_expenses_vs_ca')}</Text>
      <View style={styles.chartSectionCard}>
        {/* Legend */}
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>{t('legend_ca')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
            <Text style={styles.legendText}>{t('legend_expenses')}</Text>
          </View>
        </View>

        {chartLoading ? (
          <View style={styles.chartLoader}>
            <ActivityIndicator size="large" color="#1E5BAC" />
          </View>
        ) : (
          <View style={styles.chartComboRow}>
            {/* Line chart */}
            <View style={styles.lineChartWrap}>
              <LineChart
                data={chartData.ca}
                data2={expensesWithPress}
                height={160}
                spacing={28}
                initialSpacing={8}
                endSpacing={8}
                color1="#3B82F6"
                color2="#F97316"
                thickness={2.5}
                dataPointsColor1="#3B82F6"
                dataPointsColor2="#F97316"
                dataPointsRadius={4}
                startFillColor1="#3B82F6"
                startFillColor2="#F97316"
                endFillColor1="#F3F4F6"
                endFillColor2="#F3F4F6"
                startOpacity={0.15}
                endOpacity={0.01}
                areaChart
                curved
                yAxisColor="#E5E7EB"
                xAxisColor="#E5E7EB"
                yAxisTextStyle={styles.chartAxisText}
                xAxisLabelTextStyle={styles.chartAxisText}
                rulesColor="#E5E7EB"
                rulesType="dashed"
                hideDataPoints={false}
                noOfSections={4}
                maxValue={
                  Math.max(
                    ...chartData.ca.map((p: any) => p.value),
                    ...chartData.expenses.map((p: any) => p.value),
                    1000,
                  ) * 1.2
                }
                onPress={(item: any, index: number) => showLineTooltip(index, item.value)}
              />
            </View>

            {/* Donut chart */}
            <View style={styles.donutWrap}>
              <PieChart
                data={pieData}
                donut
                radius={50}
                innerRadius={35}
                innerCircleColor="#FFFFFF"
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.donutCenterValue}>
                      {grandTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                    </Text>
                    <Text style={styles.donutCenterLabel}>{t('currency_mad')}</Text>
                  </View>
                )}
                showText={false}
                strokeWidth={2}
                strokeColor="#FFFFFF"
              />
              {/* Percentages */}
              <View style={styles.donutPercentages}>
                <Text style={styles.donutPctText}>{caPct}%</Text>
                <Text style={styles.donutPctText}>{expPct}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Line chart data popup */}
        {lineTooltip && (
          <View style={styles.chartPopup}>
            <View style={styles.chartPopupHeader}>
              <Text style={styles.chartPopupTitle}>{lineTooltip.label}</Text>
              <TouchableOpacity
                onPress={() => setLineTooltip(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.chartPopupClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartPopupRow}>
              <View style={[styles.chartPopupDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.chartPopupLabel}>{t('legend_ca')}</Text>
              <Text style={styles.chartPopupValue}>
                {lineTooltip.caVal.toLocaleString('fr-FR')}{' '}
                <Text style={styles.chartPopupCurrency}>{t('currency_mad')}</Text>
              </Text>
            </View>
            <View style={styles.chartPopupRow}>
              <View style={[styles.chartPopupDot, { backgroundColor: '#F97316' }]} />
              <Text style={styles.chartPopupLabel}>{t('legend_expenses')}</Text>
              <Text style={styles.chartPopupValue}>
                {lineTooltip.expVal.toLocaleString('fr-FR')}{' '}
                <Text style={styles.chartPopupCurrency}>{t('currency_mad')}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Pie slice data popup */}
        {pieTooltip && (
          <View style={styles.chartPopup}>
            <View style={styles.chartPopupHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.chartPopupDot, { backgroundColor: pieTooltip.color }]} />
                <Text style={styles.chartPopupTitle}>{pieTooltip.label}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPieTooltip(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.chartPopupClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartPopupRow}>
              <Text style={styles.chartPopupLabel}>{t('chart_popup_amount')}</Text>
              <Text style={[styles.chartPopupValue, { color: pieTooltip.color }]}>
                {pieTooltip.value.toLocaleString('fr-FR')}{' '}
                <Text style={styles.chartPopupCurrency}>{t('currency_mad')}</Text>
              </Text>
            </View>
            <View style={styles.chartPopupRow}>
              <Text style={styles.chartPopupLabel}>{t('chart_popup_share')}</Text>
              <Text style={[styles.chartPopupValue, { color: pieTooltip.color }]}>
                {pieTooltip.pct}%
              </Text>
            </View>
          </View>
        )}

        {/* See all */}
        {/* <View style={styles.seeAllRow}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>{t('label_see_all')}</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );
};

/* ─── Main Component ─── */
const Activity: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const customer = useSelector((state: RootState) => state.user.customer);

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityData, setActivityData] = useState<MobileActivityData | null>(null);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(new Date().getMonth());
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_issued_paid_sum: 0,
    total_paid_sum: 0,
    total_expenses_sum: 0,
    total_vat_payable: 0,
    total_paid_percentage_change: 0,
    total_expenses_percentage_change: 0,
    total_vat_payable_percentage_change: 0,
    unpaidInvoiceSum: 0,
    unpaidInvoicesCount: 0,
  });

  const PERIODS = buildPeriods(t);

  const EMPTY_MONTHS = Array.from({ length: 12 }, (_, i) => ({
    label: [
      t('month_jan'), t('month_feb'), t('month_mar'), t('month_apr'),
      t('month_may'), t('month_jun'), t('month_jul'), t('month_aug'),
      t('month_sep'), t('month_oct'), t('month_nov'), t('month_dec'),
    ][i],
    value: 0,
  }));

  const selectedPeriod = PERIODS[selectedPeriodIndex];

  const [selectedChartYear, setSelectedChartYear] = useState(CURRENT_YEAR);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [chartLoading, setChartLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState<{ ca: any[]; expenses: any[] }>({
    ca: EMPTY_MONTHS,
    expenses: EMPTY_MONTHS,
  });
  const [quickAnalysisLoading, setQuickAnalysisLoading] = useState(true);
  const [quickAnalysis, setQuickAnalysis] = useState<QuickAnalysisData | null>(null);

  /* ─── Data fetching ─── */
  const fetchChartData = async (year: number, silent = false) => {
    if (!silent) setChartLoading(true);
    try {
      const res = await dashboardService.getGraphData(year);
      if (res?.chart) {
        setChartData({ ca: res.chart.ca, expenses: res.chart.expenses });
      }
    } catch (e) {
      console.error('Chart data error:', e);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => { fetchChartData(selectedChartYear); }, [selectedChartYear]);

  const fetchStats = async (periodIndex: number, silent = false) => {
    const p = PERIODS[periodIndex];
    if (!silent) setStatsLoading(true);
    try {
      const res = await dashboardService.getActivityData(p.date_from, p.date_to);
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.error('Activity stats error:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { fetchStats(selectedPeriodIndex); }, [selectedPeriodIndex]);

  const fetchQuickAnalysis = async (silent = false) => {
    if (!silent) setQuickAnalysisLoading(true);
    try {
      const res = await dashboardService.getQuickAnalysis();
      if (res.success && res.data) {
        setQuickAnalysis(res.data);
      } else {
        setQuickAnalysis(null);
      }
    } catch (e) {
      console.error('Quick analysis error:', e);
      setQuickAnalysis(null);
    } finally {
      setQuickAnalysisLoading(false);
    }
  };

  useEffect(() => { fetchQuickAnalysis(); }, []);

  const fetchMobileActivity = async (silent = false) => {
    if (!silent) setActivityLoading(true);
    try {
      const res = await activityService.getMobileActivity({
        filter: activityFilter,
        search: activitySearch || undefined,
        per_page: 24,
      });
      if (res.success && res.data) {
        setActivityData(res.data);
      }
    } catch (e) {
      console.error('Mobile activity timeline error:', e);
      setActivityData(null);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMobileActivity();
    }, activitySearch ? 280 : 0);

    return () => clearTimeout(timer);
  }, [activityFilter, activitySearch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    await Promise.all([
      fetchMobileActivity(true),
      fetchStats(selectedPeriodIndex, true),
      fetchChartData(selectedChartYear, true),
      fetchQuickAnalysis(true),
    ]);
    setRefreshing(false);
  }, [selectedPeriodIndex, selectedChartYear, activityFilter, activitySearch]);

  const navigateFromActivityAction = (action?: MobileActivityEvent['action']) => {
    if (!action) {
      return;
    }

    if (action.filter) {
      Vibration.vibrate(12);
      setActivityFilter(action.filter);
      return;
    }

    const routeMap: Record<string, string> = {
      invoice_detail: 'Invoice Detail',
      expense_detail: 'Expenses',
      notification_detail: 'Notification Detail',
      bank_statement_detail: 'Bank Statements',
      transaction_detail: 'Payments',
      client_detail: 'Client Detail',
      supplier_detail: 'Supplier Detail',
      bank_statements: 'Bank Statements',
      tax_summary: 'Activity',
    };

    const routeName = action.screen ? routeMap[action.screen] : undefined;
    if (routeName) {
      Vibration.vibrate(12);
      if (action.id) {
        navigation.navigate(routeName as never, { id: action.id } as never);
      } else {
        navigation.navigate(routeName as never);
      }
    }
  };

  const handleActivityEventPress = (event: MobileActivityEvent) => {
    navigateFromActivityAction(event.action);
  };

  const handleSuggestionPress = (suggestion: MobileActivitySuggestion) => {
    navigateFromActivityAction(suggestion.action);
  };

  /* ─── FAB animations ─── */
  const fabRotation = useState(new Animated.Value(0))[0];
  const fabButton1Scale = useState(new Animated.Value(0))[0];
  const fabButton2Scale = useState(new Animated.Value(0))[0];
  const fabButton3Scale = useState(new Animated.Value(0))[0];
  const fabButton1Opacity = useState(new Animated.Value(0))[0];
  const fabButton2Opacity = useState(new Animated.Value(0))[0];
  const fabButton3Opacity = useState(new Animated.Value(0))[0];

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
    setTimeout(() => { navigation.navigate('Contacts')});
  };

  const rotation = fabRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <HeaderSection
        customerName={customer?.name ?? ''}
        refreshing={refreshing}
        loading={statsLoading || chartLoading}
        onRefresh={handleRefresh}
        t={t}
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
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
        {/* Month Selector */}
        <MonthSelectorCard
          label={selectedPeriod.label}
          onPress={() => setShowPeriodPicker(true)}
        />

        {/* KPI Stats */}
        <StatsCards stats={stats} loading={statsLoading} t={t} />

        {/* Note */}
        <Text style={styles.note}>{t('note_vat_calculation')}</Text>

        {/* Action Buttons */}
        <ActionButtons
          onInvoice={() => navigation.navigate('Invoice', { openCreateModal: true })}
          onExpense={() => navigation.navigate('Expenses', { openCreateModal: true })}
          t={t}
        />

        <SmartTimeline
          data={activityData}
          loading={activityLoading}
          filter={activityFilter}
          search={activitySearch}
          onFilterChange={(nextFilter) => {
            Vibration.vibrate(8);
            setActivityFilter(nextFilter);
          }}
          onSearchChange={setActivitySearch}
          onEventPress={handleActivityEventPress}
          onSuggestionPress={handleSuggestionPress}
          t={t}
          locale={i18n.language}
        />

        {/* Quick Analysis */}
        <QuickAnalysis t={t} loading={quickAnalysisLoading} analysis={quickAnalysis} />

        {/* Year Selector */}
        <TouchableOpacity style={styles.yearSelectorRow} activeOpacity={0.7} onPress={() => setShowYearPicker(true)}>
          <View style={styles.yearSelectorLeft}>
            <TrendingUp size={20} color="#6B7280" />
            <Text style={styles.yearSelectorText}>{t('label_annual_chart')}</Text>
          </View>
          <View style={styles.yearSelectorRight}>
            <Text style={styles.yearSelectorLabel}>{selectedChartYear}</Text>
            <ChevronDown size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Chart Section */}
        <ChartSection chartData={chartData} chartLoading={chartLoading} t={t} />

        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* Period Picker Modal */}
      <Modal visible={showPeriodPicker} transparent animationType="slide" onRequestClose={() => setShowPeriodPicker(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPeriodPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>{t('modal_select_period')}</Text>
            <ScrollView bounces={false}>
              {PERIODS.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.pickerOption}
                  onPress={() => { setSelectedPeriodIndex(i); setShowPeriodPicker(false); }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerOptionText, selectedPeriodIndex === i && styles.pickerOptionSelected]}>{p.label}</Text>
                    <Text style={styles.pickerOptionDate}>{fmtDisplay(p.date_from)} – {fmtDisplay(p.date_to)}</Text>
                  </View>
                  {selectedPeriodIndex === i && <Check size={18} color="#1E5BAC" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Picker Modal */}
      <Modal visible={showYearPicker} transparent animationType="slide" onRequestClose={() => setShowYearPicker(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowYearPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>{t('modal_select_year')}</Text>
            {YEAR_OPTIONS.map(yr => (
              <TouchableOpacity
                key={yr}
                style={styles.pickerOption}
                onPress={() => { setSelectedChartYear(yr); setShowYearPicker(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerOptionText, selectedChartYear === yr && styles.pickerOptionSelected]}>
                  {yr}
                </Text>
                {selectedChartYear === yr && <Check size={18} color="#1E5BAC" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FAB */}
      <View style={styles.fabContainer}>
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
      </View>
    </SafeAreaView>
  );
};

/* ─── Styles ─── */
const styles = StyleSheet.create({
  /* Container */
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* Header */
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 2,
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 20,
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },

  /* Month Selector */
  monthSelectorGradient: {
    borderRadius: 16,
    padding: 16,
    height: 110,
    marginBottom: 16,
  },
  monthSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  monthSelectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    width: '47.5%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statIconWrap: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statCurrency: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
  },
  statPercentage: {
    fontSize: 10,
    fontWeight: '500',
  },
  statTooltip: {
    marginTop: 8,
    // backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 8,
    // padding: 8,
  },
  statTooltipText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
  },

  /* Note */
  note: {
    fontSize: 11,
    color: '#9CA3AF',
    paddingHorizontal: 4,
    marginBottom: 16,
  },

  /* Action Buttons */
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E5BAC',
  },

  /* Quick Analysis */
  analysisSection: {
    marginBottom: 24,
  },
  analysisTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  analysisTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  analysisLoadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  analysisAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 8,
  },
  analysisAlertContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  analysisAlertBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  analysisAlertNormal: {
    fontSize: 14,
    color: '#6B7280',
  },

  /* Smart timeline */
  timelineSection: {
    marginBottom: 24,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  timelineEyebrow: {
    fontSize: 11,
    color: '#1E5BAC',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  timelineLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  timelineLiveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E5BAC',
  },
  timelineSearch: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  timelineSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  timelineFilterContent: {
    gap: 8,
    paddingRight: 16,
    paddingBottom: 12,
  },
  timelineFilterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timelineFilterChipActive: {
    backgroundColor: '#1E5BAC',
    borderColor: '#1E5BAC',
  },
  timelineFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  timelineFilterTextActive: {
    color: '#FFFFFF',
  },
  suggestionsContent: {
    gap: 10,
    paddingRight: 16,
    paddingBottom: 12,
  },
  suggestionCard: {
    width: 220,
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  timelineGroup: {
    marginBottom: 14,
  },
  timelineGroupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  timelineEventRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timelineEventRowLast: {
    borderBottomWidth: 0,
  },
  timelineEventIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineEventContent: {
    flex: 1,
    minWidth: 0,
  },
  timelineEventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineEventTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  timelineBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 104,
  },
  timelineBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timelineEventDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    marginTop: 4,
  },
  timelineEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 7,
  },
  timelineEventDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  timelineEventAmount: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '800',
  },
  timelineEmpty: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    paddingVertical: 28,
    paddingHorizontal: 18,
  },
  timelineEmptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  timelineEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  timelineEmptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
  timelineSkeletonWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    padding: 14,
  },
  timelineSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  timelineSkeletonIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E5EAF2',
  },
  timelineSkeletonBody: {
    flex: 1,
    gap: 8,
  },
  timelineSkeletonLine: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E5EAF2',
  },
  timelineSkeletonLineSmall: {
    height: 9,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },

  /* Year Selector */
  yearSelectorRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  yearSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yearSelectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yearSelectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5BAC',
  },
  yearSelectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  /* Chart Section */
  chartSection: {
    marginBottom: 24,
  },
  chartSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  chartSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  chartLoader: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartComboRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lineChartWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  chartAxisText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  donutWrap: {
    alignItems: 'center',
    width: 120,
  },
  donutCenterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  donutCenterLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  donutPercentages: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  donutPctText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5BAC',
  },

  /* Chart popup */
  chartPopup: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartPopupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chartPopupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  chartPopupClose: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  chartPopupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  chartPopupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartPopupLabel: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartPopupValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  chartPopupCurrency: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
  },

  /* Period / Year Picker Modal */
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    paddingHorizontal: 12,
    paddingBottom: 10,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  pickerOptionSelected: {
    color: '#1E5BAC',
    fontWeight: '700',
  },
  pickerOptionDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  /* FAB */
  fabSpacer: {
    height: 16,
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

export default Activity;
