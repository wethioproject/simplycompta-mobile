import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  ChevronDown,
  FileEdit,
  Users,
  Plus,
  Check,
} from 'lucide-react-native';
import { fileIcon } from '../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
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

const buildPeriods = () => {
  const now = new Date();
  const y = now.getFullYear();
  const lastY = y - 1;
  return [
    {
      label: 'T1 (Jan – Mar)',
      date_from: fmt(new Date(y, 0, 1)),
      date_to: fmt(new Date(y, 2, 31)),
    },
    {
      label: 'T2 (Avr – Juin)',
      date_from: fmt(new Date(y, 3, 1)),
      date_to: fmt(new Date(y, 5, 30)),
    },
    {
      label: 'T3 (Juil – Sep)',
      date_from: fmt(new Date(y, 6, 1)),
      date_to: fmt(new Date(y, 8, 30)),
    },
    {
      label: 'T4 (Oct – Déc)',
      date_from: fmt(new Date(y, 9, 1)),
      date_to: fmt(new Date(y, 11, 31)),
    },
    {
      label: `Année en cours (${y})`,
      date_from: fmt(new Date(y, 0, 1)),
      date_to: fmt(new Date(y, 11, 31)),
    },
    {
      label: `Année précédente (${lastY})`,
      date_from: fmt(new Date(lastY, 0, 1)),
      date_to: fmt(new Date(lastY, 11, 31)),
    },
    {
      label: '6 derniers mois',
      date_from: fmt(new Date(now.getFullYear(), now.getMonth() - 5, 1)),
      date_to: fmt(now),
    },
    {
      label: '12 derniers mois',
      date_from: fmt(new Date(now.getFullYear(), now.getMonth() - 11, 1)),
      date_to: fmt(now),
    },
  ];
};

const PERIODS = buildPeriods();

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

const EMPTY_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  value: 0,
}));

const actionButtons = [
  { label: 'Créer une facture', icon: 'fileEdit', bg: '#F0FDF4', iconColor: '#16A34A' },
  { label: 'Faire un depense', icon: 'fileText', bg: '#FEFCE8', iconColor: '#CA8A04' },
  { label: 'Gérer mes clients', icon: 'users', bg: '#EFF6FF', iconColor: '#2563EB' },
];

const ActionIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => {
  const props = { size: 24, color, strokeWidth: 2 };
  switch (icon) {
    case 'fileEdit': return <FileEdit {...props} />;
    case 'fileText': return <FileText {...props} />;
    case 'users': return <Users {...props} />;
    default: return <FileText {...props} />;
  }
};

const Activity: React.FC = () => {
  const navigation = useNavigation<StackNavigation>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_invoices_sum: 0,
    total_invoices_issued_sum: 0,
    total_expenses_sum: 0,
    total_vat_payable: 0,
  });

  const selectedPeriod = PERIODS[selectedPeriodIndex];

  const [selectedChartYear, setSelectedChartYear] = useState(CURRENT_YEAR);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartData, setChartData] = useState<{ ca: any[]; expenses: any[] }>({
    ca: EMPTY_MONTHS,
    expenses: EMPTY_MONTHS,
  });

  const fetchChartData = async (year: number) => {
    setChartLoading(true);
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

  const fetchStats = async (periodIndex: number) => {
    const p = PERIODS[periodIndex];
    setStatsLoading(true);
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
    setTimeout(() => { navigation.navigate('Add Quote'); }, 300);
  };

  const handleOpenAddClient = () => {
    toggleFab();
    setTimeout(() => { navigation.navigate('Add Client'); }, 300);
  };

  const handleActionButtonClick = (btn: any) => {
    if (btn.label === 'Créer une facture') {
      navigation.navigate('Invoice');
    } else if (btn.label === 'Faire un depense') {
      navigation.navigate('Expenses');
    } else if (btn.label === 'Gérer mes clients') {
      navigation.navigate('Clients');
    }
  };

  const rotation = fabRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  const statsCards = [
    {
      label: 'CA (H.T)',
      value: statsLoading ? null : `${stats.total_invoices_sum.toLocaleString('fr-FR')} MAD`,
      iconColor: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      label: 'Encaissements',
      value: statsLoading ? null : `${stats.total_invoices_issued_sum.toLocaleString('fr-FR')} MAD`,
      iconColor: '#059669',
      bg: '#ECFDF5',
    },
    {
      label: 'Dépenses',
      value: statsLoading ? null : `${stats.total_expenses_sum.toLocaleString('fr-FR')} MAD`,
      iconColor: '#DB2777',
      bg: '#FDF2F8',
    },
    {
      label: 'TVA à payer',
      value: statsLoading ? null : `${stats.total_vat_payable.toLocaleString('fr-FR')} MAD`,
      iconColor: '#D97706',
      bg: '#FFFBEB',
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
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Title Card */}
        <View style={styles.titleCard}>
          <LinearGradient colors={['#FB923C', '#EAB308']} style={styles.titleIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TrendingUp size={24} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={styles.titleText}>Mon Activité</Text>
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
        <Text style={styles.note}>* TVA calculée sur la période sélectionnée</Text>

        {/* Year Selector */}
        <TouchableOpacity style={styles.selectorRow} activeOpacity={0.7} onPress={() => setShowYearPicker(true)}>
          <View style={styles.selectorLeft}>
            <TrendingUp size={20} color="#6B7280" />
            <Text style={styles.selectorText}>Graphique annuel</Text>
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
              color2="#F59E0B"
              thickness={2}
              dataPointsColor1="#3B82F6"
              dataPointsColor2="#F59E0B"
              dataPointsRadius={3}
              startFillColor1="#3B82F6"
              startFillColor2="#F59E0B"
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
              <Text style={styles.legendText}>CA</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Dépenses</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          {actionButtons.map((btn, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: btn.bg }]}
              activeOpacity={0.8}
              onPress={() => handleActionButtonClick(btn)}
            >
              <ActionIcon icon={btn.icon} color={btn.iconColor} />
              <Text style={styles.actionButtonText}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* Period Picker Modal */}
      <Modal visible={showPeriodPicker} transparent animationType="slide" onRequestClose={() => setShowPeriodPicker(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPeriodPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Sélectionner une période</Text>
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
            <Text style={styles.pickerTitle}>Sélectionner une année</Text>
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
            <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton2Scale }], opacity: fabButton2Opacity, bottom: 120 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton2]} onPress={handleNavigateToQuote} activeOpacity={0.8}>
            <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton1Scale }], opacity: fabButton1Opacity, bottom: 64 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton1]} onPress={handleOpenAddClient} activeOpacity={0.8}>
            <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.fab} onPress={toggleFab} activeOpacity={0.8}>
          <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: rotation }] }]}>+</Animated.Text>
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
    backgroundColor: 'rgb(55, 75, 163)',
  },
  subFabButton2: {
    backgroundColor: 'rgb(55, 75, 163)',
  },
  subFabButton3: {
    backgroundColor: 'rgb(55, 75, 163)',
  },
  fabIconImage: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default Activity;
