import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
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
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { appLogoIcon } from '../../assets/icons';

type StackNavigation = StackNavigationProp<any>;

const caData = [
  { value: 2000, label: 'Jan' },
  { value: 3000, label: 'Fév' },
  { value: 4500, label: 'Mar' },
  { value: 5200, label: 'Avr' },
  { value: 6800, label: 'Mai' },
  { value: 7500, label: 'Juin' },
  { value: 8200, label: 'Juil' },
  { value: 9000, label: 'Août' },
  { value: 9500, label: 'Sep' },
  { value: 10200, label: 'Oct' },
];

const encaissementsData = [
  { value: 1800 },
  { value: 2500 },
  { value: 3800 },
  { value: 4500 },
  { value: 5800 },
  { value: 6500 },
  { value: 7200 },
  { value: 8000 },
  { value: 8500 },
  { value: 9200 },
];

const statsCards = [
  {
    label: 'CA (H.T)',
    value: '3 258 €',
    iconColor: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    label: 'Encaissements',
    value: '2 000 €',
    iconColor: '#059669',
    bg: '#ECFDF5',
  },
  {
    label: 'Dépenses',
    value: '1 150 €',
    iconColor: '#DB2777',
    bg: '#FDF2F8',
  },
  {
    label: 'Montant déclarations à payer',
    value: '3 750 €',
    iconColor: '#D97706',
    bg: '#FFFBEB',
  },
];

const actionButtons = [
  { label: 'Créer une facture', icon: 'fileEdit', bg: '#F0FDF4', iconColor: '#16A34A' },
  { label: 'Faire un devis', icon: 'fileText', bg: '#FEFCE8', iconColor: '#CA8A04' },
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
  const selectedPeriod = '01/01/2026 - 31/03/2026';
  const selectedYear = 'Année en cours';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
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
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <Bell size={24} color="#4B5563" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title Card */}
        <View style={styles.titleCard}>
          <LinearGradient
            colors={['#FB923C', '#EAB308']}
            style={styles.titleIconBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TrendingUp size={24} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={styles.titleText}>Mon Activité</Text>
        </View>

        {/* Upload Card */}
        <TouchableOpacity style={styles.uploadCard} activeOpacity={0.8}>
          <View style={styles.uploadIconCircle}>
            <CloudUpload size={28} color="#1E5BAC" />
          </View>
          <Text style={styles.uploadTitle}>Téléverser un document</Text>
          <Text style={styles.uploadSubtitle}>
            Ajoutez vos factures et vos reçus pour centraliser votre comptabilité
          </Text>
        </TouchableOpacity>

        {/* Period Selector */}
        <TouchableOpacity style={styles.selectorRow} activeOpacity={0.7}>
          <View style={styles.selectorLeft}>
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.selectorText}>{selectedPeriod}</Text>
          </View>
          <ChevronDown size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsCards.map((card, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: card.bg }]}>
              <View style={styles.statCardHeader}>
                <FileText size={18} color={card.iconColor} />
                <Text style={styles.statLabel} numberOfLines={2}>{card.label}</Text>
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
            </View>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.note}>* 0,5 % du chiffre d'affaires encaissé</Text>

        {/* Year Selector */}
        <TouchableOpacity style={styles.selectorRow} activeOpacity={0.7}>
          <Text style={styles.selectorText}>{selectedYear}</Text>
          <ChevronDown size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Chart */}
        <View style={styles.chartCard}>
          <LineChart
            data={caData}
            data2={encaissementsData}
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
            maxValue={12000}
          />

          {/* Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>CA</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Encaissements</Text>
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
            >
              <ActionIcon icon={btn.icon} color={btn.iconColor} />
              <Text style={styles.actionButtonText}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacer for FAB */}
        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default Activity;
