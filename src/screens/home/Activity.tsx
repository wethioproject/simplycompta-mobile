import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  Bell,
  Search,
  TrendingUp,
  CloudUpload,
  Calendar,
  FileText,
  TrendingDown,
  ChevronDown,
  FileEdit,
  Users,
  Plus,
  Check,
  RotateCw,
} from 'lucide-react-native';
import { fileIcon } from '../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { appLogoIcon } from '../../assets/icons';
import dashboardService from '../../services/dashboardService';

type StackNavigation = StackNavigationProp<any>;

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
    {
      label: t('period_q1'),
      date_from: fmt(new Date(y, 0, 1)),
      date_to: fmt(new Date(y, 2, 31)),
    },
    {
      label: t('period_q2'),
      date_from: fmt(new Date(y, 3, 1)),
      date_to: fmt(new Date(y, 5, 30)),
    },
    {
      label: t('period_q3'),
      date_from: fmt(new Date(y, 6, 1)),
      date_to: fmt(new Date(y, 8, 30)),
    },
    {
      label: t('period_q4'),
      date_from: fmt(new Date(y, 9, 1)),
      date_to: fmt(new Date(y, 11, 31)),
    },
    {
      label: `${t('period_current_year')} (${y})`,
      date_from: fmt(new Date(y, 0, 1)),
      date_to: fmt(new Date(y, 11, 31)),
    },
    {
      label: `${t('period_previous_year')} (${lastY})`,
      date_from: fmt(new Date(lastY, 0, 1)),
      date_to: fmt(new Date(lastY, 11, 31)),
    },
    {
      label: t('period_last_6_months'),
      date_from: fmt(new Date(now.getFullYear(), now.getMonth() - 5, 1)),
      date_to: fmt(now),
    },
    {
      label: t('period_last_12_months'),
      date_from: fmt(new Date(now.getFullYear(), now.getMonth() - 11, 1)),
      date_to: fmt(now),
    },
  ];
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

const PIE_COLORS = [
  '#3B82F6', '#16A34A', '#10B981', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#16A34A', '#6366F1', '#84CC16',
];

const Activity: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_issued_paid_sum: 0,
    total_paid_sum: 0,
    total_expenses_sum: 0,
    total_vat_payable: 0,
  });

  const PERIODS = buildPeriods(t);

  const EMPTY_MONTHS = Array.from({ length: 12 }, (_, i) => ({
    label: [t('month_jan'),t('month_feb'),t('month_mar'),t('month_apr'),t('month_may'),t('month_jun'),t('month_jul'),t('month_aug'),t('month_sep'),t('month_oct'),t('month_nov'),t('month_dec')][i],
    value: 0,
  }));

  const actionButtons = [
    { label: t('action_create_invoice'), icon: 'fileEdit', bg: '#F0FDF4', iconColor: '#16A34A' },
    { label: t('action_create_expense'), icon: 'fileText', bg: '#FEFCE8', iconColor: '#CA8A04' },
    { label: t('action_manage_clients'), icon: 'users', bg: '#EFF6FF', iconColor: '#2563EB' },
  ];

  const selectedPeriod = PERIODS[selectedPeriodIndex];

  const [selectedChartYear, setSelectedChartYear] = useState(CURRENT_YEAR);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [chartLoading, setChartLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState<{ ca: any[]; expenses: any[] }>({
    ca: EMPTY_MONTHS,
    expenses: EMPTY_MONTHS,
  });

  const fetchChartData = async (year: number, silent = false) => {
    if (!silent) setChartLoading(true);
    try {
      const res = await dashboardService.getGraphData(year);
      console.log('gdatattttaaa', res)
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    await Promise.all([
      fetchStats(selectedPeriodIndex, true),
      fetchChartData(selectedChartYear, true),
    ]);
    setRefreshing(false);
  }, [selectedPeriodIndex, selectedChartYear]);

  // Animation values
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
    setTimeout(() => { navigation.navigate('Clients', { openCreateModal: true }); }, 300);
  };

  const handleActionButtonClick = (btn: any) => {
    if (btn.label === t('action_create_invoice')) {
      navigation.navigate('Invoice');
    } else if (btn.label === t('action_create_expense')) {
      navigation.navigate('Expenses');
    } else if (btn.label === t('action_manage_clients')) {
      navigation.navigate('Clients');
    }
  };

  const rotation = fabRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  const statsCards = [
    {
      label: t('label_ca'),
      value: statsLoading ? null : `${stats.total_issued_paid_sum.toLocaleString('fr-FR')} MAD`,
      iconColor: '#1E5BAC',
      bg: '#DBEAFE',
    },
    {
      label: t('label_collections'),
      value: statsLoading ? null : `${stats.total_paid_sum.toLocaleString('fr-FR')} MAD`,
      iconColor: '#16A34A',
      bg: '#D1FAE5',
    },
    {
      label: t('label_expenses'),
      value: statsLoading ? null : `${stats.total_expenses_sum.toLocaleString('fr-FR')} MAD`,
      iconColor: '#16A34A',
      bg: '#DCFCE7',
    },
    {
      label: t('label_vat_payable'),
      value: statsLoading ? null : `${stats.total_vat_payable.toLocaleString('fr-FR')} MAD`,
      iconColor: '#1E5BAC',
      bg: '#EFF6FF',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity
            style={[styles.refreshButton, (refreshing || statsLoading || chartLoading) && { opacity: 0.35 }]}
            onPress={handleRefresh}
            disabled={refreshing || statsLoading || chartLoading}
            activeOpacity={0.7}
          >
            <RotateCw size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        {/* <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search_placeholder')}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View> */}
      </View>

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
        {/* Page Title Card */}
        <View style={styles.titleCard}>
          <LinearGradient 
          // colors={['#FB923C', '#EAB308']} 
          colors={['#3B82F6', '#1E5BAC']}
          style={styles.titleIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TrendingUp size={24} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={styles.titleText}>{t('title_activity')}</Text>
        </View>

        {/* Period Selector */}
        <TouchableOpacity style={styles.selectorRow} activeOpacity={0.7} onPress={() => setShowPeriodPicker(true)}>
          <View style={styles.selectorLeft}>
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.selectorText}>
              {fmtDisplay(selectedPeriod.date_from)} – {fmtDisplay(selectedPeriod.date_to)}
            </Text>
          </View>
          <View style={styles.selectorRight}>
            <Text style={styles.selectorPeriodLabel}>{selectedPeriod.label}</Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsCards.map((card, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: card.bg }]}>
              <View style={styles.statCardHeader}>
                <FileText size={18} color={card.iconColor} />
                <Text style={styles.statLabel} numberOfLines={2}>{card.label}</Text>
              </View>
              {card.value === null ? (
                <ActivityIndicator size="small" color={card.iconColor} style={{ marginTop: 4 }} />
              ) : (
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{card.value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.note}>{t('note_vat_calculation')}</Text>

        {/* Year Selector */}
        <TouchableOpacity style={styles.selectorRow} activeOpacity={0.7} onPress={() => setShowYearPicker(true)}>
          <View style={styles.selectorLeft}>
            <TrendingUp size={20} color="#6B7280" />
            <Text style={styles.selectorText}>{t('label_annual_chart')}</Text>
          </View>
          <View style={styles.selectorRight}>
            <Text style={styles.selectorPeriodLabel}>{selectedChartYear}</Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Chart */}
        <View style={styles.chartCard}>
          {chartLoading ? (
            <View style={styles.chartLoader}>
              <ActivityIndicator size="large" color="#1E5BAC" />
            </View>
          ) : (
            <LineChart
              data={chartData.ca}
              data2={chartData.expenses}
              height={200}
              spacing={28}
              initialSpacing={12}
              endSpacing={12}
              color1="#3B82F6"
              color2="#16A34A"
              thickness={2}
              dataPointsColor1="#3B82F6"
              dataPointsColor2="#16A34A"
              dataPointsRadius={3}
              startFillColor1="#3B82F6"
              startFillColor2="#16A34A"
              endFillColor1="#F3F4F6"
              endFillColor2="#F3F4F6"
              startOpacity={0.3}
              endOpacity={0.05}
              areaChart
              curved
              yAxisColor="#E5E7EB"
              xAxisColor="#E5E7EB"
              yAxisTextStyle={styles.chartAxisText}
              xAxisLabelTextStyle={styles.chartAxisText}
              rulesColor="#E5E7EB"
              rulesType="solid"
              hideDataPoints={false}
              noOfSections={4}
              maxValue={Math.max(
                ...chartData.ca.map(p => p.value),
                ...chartData.expenses.map(p => p.value),
                1000
              ) * 1.2}
            />
          )}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>{t('legend_ca')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.legendText}>{t('legend_expenses')}</Text>
            </View>
          </View>
        </View>

        {/* Revenue vs Expenses Distribution */}
        {(() => {
          const totalCA = chartData.ca.reduce((sum, p) => sum + p.value, 0);
          const totalExpenses = chartData.expenses.reduce((sum, p) => sum + p.value, 0);
          const grandTotal = totalCA + totalExpenses;
          const pieData = [
            {
              value: totalCA,
              color: '#3B82F6',
              label: t('legend_ca'),
              percentage: grandTotal > 0 ? ((totalCA / grandTotal) * 100).toFixed(1) : '0.0',
            },
            {
              value: totalExpenses,
              color: '#16A34A',
              label: t('legend_expenses'),
              percentage: grandTotal > 0 ? ((totalExpenses / grandTotal) * 100).toFixed(1) : '0.0',
            },
          ].filter(d => d.value > 0);
          return (
            <View style={styles.pieCard}>
              <Text style={styles.pieTitle}>{t('pie_title_distribution')}</Text>
              {chartLoading ? (
                <View style={styles.pieLoader}>
                  <ActivityIndicator size="large" color="#1E5BAC" />
                </View>
              ) : pieData.length === 0 ? (
                <View style={styles.pieEmpty}>
                  <Text style={styles.pieEmptyText}>{t('pie_empty_message')}</Text>
                </View>
              ) : (
                <>
                  <View style={styles.pieChartRow}>
                    <PieChart
                      data={pieData}
                      donut
                      radius={80}
                      innerRadius={52}
                      innerCircleColor="#FFFFFF"
                      centerLabelComponent={() => (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={styles.pieCenterValue}>
                            {grandTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                          </Text>
                          <Text style={styles.pieCenterLabel}>{t('currency_mad')}</Text>
                        </View>
                      )}
                      showText={false}
                      strokeWidth={2}
                      strokeColor="#FFFFFF"
                    />
                  </View>
                  <View style={styles.pieLegend}>
                    {pieData.map((item, i) => (
                      <View key={i} style={styles.pieLegendRow}>
                        <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
                        <Text style={styles.pieLegendLabel} numberOfLines={1}>{item.label}</Text>
                        <Text style={styles.pieLegendPct}>{item.percentage}%</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        })()}

        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* Period Picker Modal */}
      <Modal visible={showPeriodPicker} transparent animationType="slide" onRequestClose={() => setShowPeriodPicker(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPeriodPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>{t('modal_select_period')}</Text>
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
    backgroundColor: '#F3F4F6',
  },
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
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  logo: {
    height: 48,
    width: 160,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    rowGap: 12,
  },
  // Title Card
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Upload Card
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Selector Row 
  selectorRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectorPeriodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E5BAC',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47.5%',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    lineHeight: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Note
  note: {
    fontSize: 11,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  // Period Picker Modal
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
  // Chart Card
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingLeft: 8,
    paddingRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartLoader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartAxisText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 15,
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

  // Pie Chart
  pieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pieTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  pieLoader: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieEmpty: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieEmptyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  pieChartRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pieCenterValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  pieCenterLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  pieLegend: {
    gap: 10,
  },
  pieLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pieLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  pieLegendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  pieLegendPct: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 48,
    textAlign: 'right',
  },
});

export default Activity;
