import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { fileIcon, userIcon, downArrowIcon } from '../../assets/icons';
import { LineChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';

type DrawerNavigation = DrawerNavigationProp<any>;

const Home: React.FC = () => {
  const navigation = useNavigation<DrawerNavigation>();
  const insets = useSafeAreaInsets();
  const [dateRange, setDateRange] = useState('01/01/2026 - 31/03/2026');
  const [selectedPeriod, setSelectedPeriod] = useState('Année en cours');
  const [selectedYear, setSelectedYear] = useState('Année en cours');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodSearchQuery, setPeriodSearchQuery] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);






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
    'Trimestre 1',
    'Trimestre 2',
    'Trimestre 3',
    'Trimestre 4',
    'Année en cours',
    'Année précédente',
    'Les 7 derniers jours',
    'Les 30 derniers jours',
    'Ce mois-ci',
    'Le mois dernier',
    'Personnaliser',
  ];

  const filteredPeriodOptions = periodOptions.filter(option =>
    option.toLowerCase().includes(periodSearchQuery.toLowerCase())
  );

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    // Update date range based on selected period
    // This is a placeholder - implement actual date calculation
    if (period === 'Trimestre 1') {
      setDateRange('01/01/2026 - 31/03/2026');
    } else if (period === 'Année en cours') {
      setDateRange('01/01/2026 - 31/12/2026');
    }
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
      navigation.navigate('Add Quote');
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

  // Chart data for all 12 months with proper labels
  const chartData = [
    { value: 0, label: 'Janv.' },
    { value: 0, label: 'Févr.' },
    { value: 0, label: 'Mars' },
    { value: 0, label: 'Avr.' },
    { value: 0, label: 'Mai' },
    { value: 0, label: 'Juin' },
    { value: 0, label: 'Juil.' },
    { value: 0, label: 'Août' },
    { value: 0, label: 'Sept.' },
    { value: 0, label: 'Oct.' },
    { value: 0, label: 'Nov.' },
    { value: 0, label: 'Déc.' },
  ];

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
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Range Selector */}
        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPeriodModal(true)}>
          <Text style={styles.dateText}>{dateRange}</Text>
          <Image source={downArrowIcon} style={styles.dropdownIconImage} resizeMode="contain" />
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.cardsContainer}>
          {/* CA Card */}
          <View style={[styles.card, styles.blueCard]}>
            <Image source={fileIcon} style={styles.cardIconImage} resizeMode="contain" />
            <Text style={styles.cardLabel}>CA (H.T)</Text>
            <Text style={styles.cardAmount}>20,00 MAD</Text>
          </View>

          {/* Encaissements Card */}
          <View style={[styles.card, styles.cyanCard]}>
            <Image source={fileIcon} style={styles.cardIconImage} resizeMode="contain" />
            <Text style={styles.cardLabel}>Encaissements</Text>
            <Text style={styles.cardAmount}>24,00 MAD</Text>
          </View>

          {/* Dépenses Card */}
          <View style={[styles.card, styles.pinkCard]}>
            <Image source={fileIcon} style={styles.cardIconImage} resizeMode="contain" />
            <Text style={styles.cardLabel}>Dépenses</Text>
            <Text style={styles.cardAmount}>500,00 MAD</Text>
          </View>

          {/* Declarations Card */}
          <View style={[styles.card, styles.yellowCard]}>
            <Image source={fileIcon} style={styles.cardIconImage} resizeMode="contain" />
            <Text style={styles.cardLabel}>Montant déclarations à payer</Text>
            <Text style={styles.cardAmount}>0,12 MAD *</Text>
          </View>
        </View>

        {/* Note */}
        <Text style={styles.noteText}>* 0,5 % du chiffre d'affaires encaissé</Text>

        {/* Année en cours Selector */}
        <View style={styles.yearSelectorContainer}>
          <Dropdown
            style={styles.yearDropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            data={yearOptions}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Sélectionner"
            value={selectedYear}
            onChange={(item) => {
              setSelectedYear(item.value);
            }}
            renderRightIcon={() => (
              <Image source={downArrowIcon} style={styles.dropdownIconImage} resizeMode="contain" />
            )}
          />
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Chiffre d'affaires</Text>
          <View style={styles.chartPlaceholder}>
            <LineChart
              data={chartData}
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
              maxValue={1000}
              yAxisLabelWidth={40}
            />
          </View>
        </View>

        {/* Encaissements Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Encaissements</Text>
          <View style={styles.chartPlaceholder}>
            <LineChart
              data={chartData}
              height={250}
              width={chartWidth}
              spacing={chartWidth / 13}
              initialSpacing={10}
              color="hsla(144, 93%, 37%, 0.83)"
              thickness={2}
              dataPointsColor="hsla(144, 93%, 37%, 0.83)"
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
              maxValue={1000}
              yAxisLabelWidth={40}
            />
          </View>
        </View>

        {/* Dépenses Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Dépenses</Text>
          <View style={styles.chartPlaceholder}>
            <LineChart
              data={chartData}
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
              maxValue={1000}
              yAxisLabelWidth={40}
            />
          </View>
        </View>
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
});

export default Home;