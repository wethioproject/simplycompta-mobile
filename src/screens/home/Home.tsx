import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, TextInput, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { fileIcon, userIcon, downArrowIcon } from '../../assets/icons';
import { LineChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import dashboardService, { DashboardData, DashboardFilter } from '../../services/dashboardService';

type DrawerNavigation = DrawerNavigationProp<any>;

const Home: React.FC = () => {
  const navigation = useNavigation<DrawerNavigation>();
  const insets = useSafeAreaInsets();
  const [dateRange, setDateRange] = useState('Toutes les périodes');
  const [selectedPeriod, setSelectedPeriod] = useState('Cette année');
  const [selectedYear, setSelectedYear] = useState('Cette année');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodSearchQuery, setPeriodSearchQuery] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<DashboardFilter>('all');

  const getFilterFromPeriod = (period: string): DashboardFilter => {
    switch (period) {
      case 'Cette semaine':
        return 'this_week';
      case 'Ce mois-ci':
        return 'this_month';
      case 'Cette année':
      case 'Année en cours':
        return 'this_year';
      case 'Année précédente':
        return 'last_year';
      case 'Toutes les périodes':
        return 'all';
      default:
        return null;
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async (filter?: DashboardFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardService.getDashboardData(filter);
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData(currentFilter);
  }, [currentFilter]);


  // Animation values
  const fabRotation = useState(new Animated.Value(0))[0];
  const fabButton1Scale = useState(new Animated.Value(0))[0];
  const fabButton2Scale = useState(new Animated.Value(0))[0];
  const fabButton3Scale = useState(new Animated.Value(0))[0];
  const fabButton1Opacity = useState(new Animated.Value(0))[0];
  const fabButton2Opacity = useState(new Animated.Value(0))[0];
  const fabButton3Opacity = useState(new Animated.Value(0))[0];

  const yearOptions = [
    { label: 'Année en cours', value: 'Année en cours' },
    { label: 'Année précédente', value: 'Année précédente' },
  ];

  const periodOptions = [
    'Cette semaine',
    'Ce mois-ci',
    'Cette année',
    'Année précédente',
    'Toutes les périodes',
  ];

  const filteredPeriodOptions = periodOptions.filter(option =>
    option.toLowerCase().includes(periodSearchQuery.toLowerCase())
  );

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    
    // Update date range based on selected period
    const today = new Date();
    
    if (period === 'Cette semaine') {
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      setDateRange(`${lastWeek.toLocaleDateString('fr-FR')} - ${today.toLocaleDateString('fr-FR')}`);
    } else if (period === 'Ce mois-ci') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateRange(`${firstDay.toLocaleDateString('fr-FR')} - ${today.toLocaleDateString('fr-FR')}`);
    } else if (period === 'Cette année' || period === 'Année en cours') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      setDateRange(`${startOfYear.toLocaleDateString('fr-FR')} - ${endOfYear.toLocaleDateString('fr-FR')}`);
    } else if (period === 'Année précédente') {
      const lastYear = today.getFullYear() - 1;
      const startOfLastYear = new Date(lastYear, 0, 1);
      const endOfLastYear = new Date(lastYear, 11, 31);
      setDateRange(`${startOfLastYear.toLocaleDateString('fr-FR')} - ${endOfLastYear.toLocaleDateString('fr-FR')}`);
    } else if (period === 'Toutes les périodes') {
      setDateRange('Toutes les périodes');
    }
    
    // Get filter and fetch data
    const filter = getFilterFromPeriod(period);
    setCurrentFilter(filter);
    setSelectedYear(period);
    
    setShowPeriodModal(false);
    setPeriodSearchQuery('');
  };

  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;
    setIsFabOpen(!isFabOpen);

    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(50, [
        Animated.parallel([
          Animated.spring(fabButton1Scale, {
            toValue,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(fabButton1Opacity, {
            toValue,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(fabButton2Scale, {
            toValue,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(fabButton2Opacity, {
            toValue,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(fabButton3Scale, {
            toValue,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(fabButton3Opacity, {
            toValue,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  };

  const handleNavigateToInvoice = () => {
    toggleFab();
    setTimeout(() => {
      navigation.navigate('Add Invoice');
    }, 300);
  };

  const handleNavigateToQuote = () => {
    toggleFab();
    setTimeout(() => {
      navigation.navigate('Add Bank Statement');
    }, 300);
  };

  const handleOpenAddClient = () => {
    // toggleFab();
    // setTimeout(() => {
    //   setShowAddClientModal(true);
    // }, 300);
    toggleFab();
    setTimeout(() => {
      navigation.navigate('Add Client');
    }, 300);
  };

  const rotation = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Calculate responsive chart width
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 110; // Account for margins and y-axis labels

  const generateChartData = (total: number) => {
    const monthLabels = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    
    if (total === 0) {
      return monthLabels.map(label => ({ value: 0, label }));
    }

    const monthlyValues: number[] = [];
    let remaining = total;
    
    for (let i = 0; i < 12; i++) {
      if (i === 11) {
        monthlyValues.push(Math.max(0, remaining));
      } else {
        const percentage = 0.05 + Math.random() * 0.10;
        const value = Math.floor(total * percentage);
        monthlyValues.push(value);
        remaining -= value;
      }
    }

    return monthLabels.map((label, index) => ({
      value: monthlyValues[index],
      label
    }));
  };

  const revenueChartData = generateChartData(dashboardData?.total_revenue || 0);
  const expensesChartData = generateChartData(dashboardData?.total_expenses || 0);

  const getMaxChartValue = (data: { value: number }[]) => {
    const maxValue = Math.max(...data.map(d => d.value));
    return maxValue > 0 ? Math.ceil(maxValue * 1.2) : 1000; 
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.openDrawer()}>
          <View style={styles.profileCircle}>
            <Image source={userIcon} style={styles.profileImage} resizeMode="contain" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        {/* <View style={styles.placeholder} /> */}
        <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.notificationCircle}>
            <Image source={fileIcon} style={styles.notificationIconImage} resizeMode="contain" />
          </View>
          {dashboardData?.has_unread_notifications && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Range Selector */}
        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPeriodModal(true)}>
          <Text style={styles.dateText}>{dateRange}</Text>
          <Image source={downArrowIcon} style={styles.dropdownIconImage} resizeMode="contain" />
        </TouchableOpacity>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0B5FA5" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => fetchDashboardData(currentFilter)}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Cards */}
        {!isLoading && !error && dashboardData && (
        <>
          <View style={styles.cardsContainer}>

            <View style={[styles.card, styles.blueCard]}>
              <Image source={fileIcon} style={styles.cardIconImage} resizeMode="contain" />
              <Text style={styles.cardLabel}>CA (H.T)</Text>
              <Text style={styles.cardAmount}>{dashboardData.total_revenue.toFixed(2)} MAD</Text>
            </View>

            <View style={[styles.card, styles.pinkCard]}>
              <Image source={fileIcon} style={styles.cardIconImage} resizeMode="contain" />
              <Text style={styles.cardLabel}>Dépenses</Text>
              <Text style={styles.cardAmount}>{dashboardData.total_expenses.toFixed(2)} MAD</Text>
            </View>
          </View>


        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Chiffre d'affaires</Text>
          <View style={styles.chartPlaceholder}>
            <LineChart
              data={revenueChartData}
              height={250}
              width={chartWidth}
              spacing={chartWidth / 13}
              initialSpacing={10}
              color="#4A90E2"
              thickness={2}
              dataPointsColor="#4A90E2"
              dataPointsRadius={3}
              hideDataPoints={false}
              showVerticalLines
              verticalLinesColor="rgba(200, 200, 200, 0.3)"
              rulesColor="rgba(200, 200, 200, 0.3)"
              rulesThickness={1}
              yAxisTextStyle={{ color: '#999999', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#666666', fontSize: 8, textAlign: 'center' }}
              xAxisColor="rgba(200, 200, 200, 0.5)"
              yAxisColor="rgba(200, 200, 200, 0.5)"
              yAxisThickness={1}
              xAxisThickness={1}
              noOfSections={10}
              maxValue={getMaxChartValue(revenueChartData)}
              yAxisLabelWidth={40}
            />
          </View>
        </View>

        {/* Dépenses Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Dépenses</Text>
          <View style={styles.chartPlaceholder}>
            <LineChart
              data={expensesChartData}
              height={250}
              width={chartWidth}
              spacing={chartWidth / 13}
              initialSpacing={10}
              color="rgb(232, 20, 20)"
              thickness={2}
              dataPointsColor="rgb(232, 20, 20)"
              dataPointsRadius={3}
              hideDataPoints={false}
              showVerticalLines
              verticalLinesColor="rgba(200, 200, 200, 0.3)"
              rulesColor="rgba(200, 200, 200, 0.3)"
              rulesThickness={1}
              yAxisTextStyle={{ color: '#999999', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#666666', fontSize: 8, textAlign: 'center' }}
              xAxisColor="rgba(200, 200, 200, 0.5)"
              yAxisColor="rgba(200, 200, 200, 0.5)"
              yAxisThickness={1}
              xAxisThickness={1}
              noOfSections={10}
              maxValue={getMaxChartValue(expensesChartData)}
              yAxisLabelWidth={40}
            />
          </View>
        </View>
        </>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        {/* Sub Action Buttons */}
        <Animated.View
          style={[
            styles.subFab,
            {
              transform: [{ scale: fabButton3Scale }],
              opacity: fabButton3Opacity,
              bottom: 176,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.subFabButton, styles.subFabButton3]}
            onPress={handleNavigateToInvoice}
            activeOpacity={0.8}
          >
            <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.subFab,
            {
              transform: [{ scale: fabButton2Scale }],
              opacity: fabButton2Opacity,
              bottom: 120,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.subFabButton, styles.subFabButton2]}
            onPress={handleNavigateToQuote}
            activeOpacity={0.8}
          >
            <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.subFab,
            {
              transform: [{ scale: fabButton1Scale }],
              opacity: fabButton1Opacity,
              bottom: 64,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.subFabButton, styles.subFabButton1]}
            onPress={handleOpenAddClient}
            activeOpacity={0.8}
          >
            <Image source={fileIcon} style={styles.fabIconImage} resizeMode="contain" />
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity style={styles.fab} onPress={toggleFab} activeOpacity={0.8}>
          <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: rotation }] }]}>
            +
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {/* Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
          <View style={styles.modalContentFullscreen}>
            <View style={styles.modalHeaderFullscreen}>
              <TouchableOpacity
                onPress={() => {
                  setShowPeriodModal(false);
                  setPeriodSearchQuery('');
                }}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Période</Text>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Chercher"
                placeholderTextColor="#AAAAAA"
                value={periodSearchQuery}
                onChangeText={setPeriodSearchQuery}
              />
              {periodSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setPeriodSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {filteredPeriodOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionItem}
                  onPress={() => handlePeriodSelect(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Client Modal */}
      <Modal
        visible={showAddClientModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAddClientModal(false)}
      >
        <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
          <View style={styles.modalContentFullscreen}>
            <View style={styles.modalHeaderFullscreen}>
              <TouchableOpacity
                onPress={() => setShowAddClientModal(false)}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Ajouter client</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.label}>Nom du client <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Entrer le nom"
                  placeholderTextColor="#AAAAAA"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  placeholder="client@example.com"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+212 6XX XXX XXX"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.fixedButtonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  // Handle save client
                  setShowAddClientModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  profileIcon: {
    width: 40,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 20,
  },
  profileImage: {
    width: 24,
    height: 24,
  },
  notificationIcon: {
    width: 40,
    position: 'relative',
  },
  notificationCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconImage: {
    width: 20,
    height: 20,
  },
  badge: {
  position: 'absolute',
  top: 2,
  right: 2,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#FF3B30', 
},
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  // dropdownIcon: {
  //   fontSize: 16,
  //   color: '#999999',
  // },
  dropdownIconImage: {
    width: 16,
    height: 16,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    width: '48%',
  },
  blueCard: {
    backgroundColor: '#D4E4F7',
  },
  cyanCard: {
    backgroundColor: '#B8EAE5',
  },
  pinkCard: {
    backgroundColor: '#FBDBE5',
  },
  yellowCard: {
    backgroundColor: '#FFF0D4',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardIconImage: {
    width: 32,
    height: 32,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  noteText: {
    fontSize: 12,
    color: '#999999',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  yearSelectorContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  yearDropdown: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: '#333333',
  },
  yearText: {
    fontSize: 16,
    color: '#333333',
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 50,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  chartPlaceholder: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 0,
    paddingVertical: 20,
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
    backgroundColor: '#0B5FA5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B5FA5',
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
  modalOverlayFullscreen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalContentFullscreen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeaderFullscreen: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalBackButton: {
    marginRight: 16,
  },
  modalBackArrow: {
    fontSize: 28,
    color: '#0B5FA5',
    fontWeight: '400',
  },
  modalTitleFullscreen: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    marginRight: 44,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    position: 'absolute',
    right: 30,
    top: 24,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#0B5FA5',
    fontWeight: '600',
  },
  optionsList: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  optionItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '400',
  },
  required: {
    color: '#E74C3C',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  fixedButtonContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  saveButton: {
    backgroundColor: '#0B5FA5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0B5FA5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Home;