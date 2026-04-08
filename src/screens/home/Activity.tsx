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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import dashboardService from '../../services/dashboardService';
import type { QuickAnalysisData } from '../../services/dashboardService';

type StackNavigation = StackNavigationProp<any>;

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

const buildPeriods = (t: any) => {
  const now = new Date();
  const y = now.getFullYear();
  const lastY = y - 1;
  return [
    { label: t('period_q1'), date_from: fmt(new Date(y, 0, 1)), date_to: fmt(new Date(y, 2, 31)) },
    { label: t('period_q2'), date_from: fmt(new Date(y, 3, 1)), date_to: fmt(new Date(y, 5, 30)) },
    { label: t('period_q3'), date_from: fmt(new Date(y, 6, 1)), date_to: fmt(new Date(y, 8, 30)) },
    { label: t('period_q4'), date_from: fmt(new Date(y, 9, 1)), date_to: fmt(new Date(y, 11, 31)) },
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
  const cards = [
    {
      label: t('label_ca'),
      rawValue: stats.total_issued_paid_sum,
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
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#1E5BAC" style={{ marginTop: 8 }} />
          ) : (
            <>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {card.rawValue.toLocaleString('fr-FR')}{' '}
                <Text style={styles.statCurrency}>{t('currency_mad')}</Text>
              </Text>
              {/* {
              card.perValue && (
              <Text style={[styles.statPercentage, {color: card.perColor}]} numberOfLines={1} adjustsFontSizeToFit>
                {card.perValue}%{' '}
                <Text>{t('currency_mad')}</Text>
              </Text>
              )
              } */}
            </>
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

/** Chart section: line chart + donut side by side */
const ChartSection: React.FC<{
  chartData: { ca: any[]; expenses: any[] };
  chartLoading: boolean;
  t: any;
}> = ({ chartData, chartLoading, t }) => {
  const totalCA = chartData.ca.reduce((sum, p) => sum + p.value, 0);
  const totalExpenses = chartData.expenses.reduce((sum, p) => sum + p.value, 0);
  const grandTotal = totalCA + totalExpenses;
  const caPct = grandTotal > 0 ? ((totalCA / grandTotal) * 100).toFixed(1) : '0.0';
  const expPct = grandTotal > 0 ? ((totalExpenses / grandTotal) * 100).toFixed(1) : '0.0';

  const pieData = [
    { value: totalCA || 0.01, color: '#3B82F6', label: t('legend_ca') },
    { value: totalExpenses || 0.01, color: '#F97316', label: t('legend_expenses') },
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
                data2={chartData.expenses}
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
                    ...chartData.ca.map(p => p.value),
                    ...chartData.expenses.map(p => p.value),
                    1000,
                  ) * 1.2
                }
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

        {/* See all */}
        <View style={styles.seeAllRow}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>{t('label_see_all')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/* ─── Main Component ─── */
const Activity: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const customer = useSelector((state: RootState) => state.user.customer);

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    await Promise.all([
      fetchStats(selectedPeriodIndex, true),
      fetchChartData(selectedChartYear, true),
      fetchQuickAnalysis(true),
    ]);
    setRefreshing(false);
  }, [selectedPeriodIndex, selectedChartYear]);

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
