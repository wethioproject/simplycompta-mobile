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
  ArrowRight,
  Bell,
  Search,
  CreditCard,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Headphones,
} from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';

type StackNavigation = StackNavigationProp<any>;

type StatementStatus = 'transmitted' | 'missing';

type Statement = {
  id: string;
  month: string;
  year: string;
  status: StatementStatus;
};

const STATEMENTS: Statement[] = [
  { id: '1', month: 'Janvier',  year: '2026', status: 'transmitted' },
  { id: '2', month: 'Février',  year: '2026', status: 'transmitted' },
  { id: '3', month: 'Mars',     year: '2026', status: 'transmitted' },
  { id: '4', month: 'Avril',    year: '2026', status: 'missing' },
  { id: '5', month: 'Juin',     year: '2026', status: 'missing' },
  { id: '6', month: 'Juillet',  year: '2026', status: 'missing' },
];

const PERIODS = ['2026', '3 mois', '6 mois', '9 mois', '12 mois'];

const BankStatements: React.FC = () => {
  const navigation = useNavigation<StackNavigation>();
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('3 mois');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleIconBox}>
            <CreditCard size={24} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.titleText}>Mes Relevés Bancaires</Text>
        </View>

        {/* Period Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.filterArrow} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#4B5563" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPills}
          >
            {PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.8}
                style={[
                  styles.filterPill,
                  selectedPeriod === period && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedPeriod === period && styles.filterPillTextActive,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.filterArrow} activeOpacity={0.7}>
            <ArrowRight size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Statements List */}
        {STATEMENTS.map((statement) => (
          <View key={statement.id} style={styles.statementCard}>
            {/* Left: icon + text */}
            <View style={styles.statementLeft}>
              <View style={styles.statementIconBox}>
                <FileText size={26} color="#2563EB" />
              </View>
              <View style={styles.statementInfo}>
                <Text style={styles.statementTitle}>
                  Relevé {statement.month} {statement.year}
                </Text>
                {statement.status === 'transmitted' ? (
                  <View style={styles.transmittedRow}>
                    <CheckCircle2 size={14} color="#16A34A" />
                    <Text style={styles.transmittedText}>Transmis</Text>
                  </View>
                ) : (
                  <Text style={styles.missingText}>Aucun document en ligne</Text>
                )}
              </View>
            </View>

            {/* Right: action button */}
            {statement.status === 'transmitted' ? (
              <TouchableOpacity style={styles.pdfButton} activeOpacity={0.8}>
                <Text style={styles.pdfButtonText}>PDF</Text>
                <Download size={15} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8}>
                <Upload size={18} color="#4B5563" />
                <Text style={styles.uploadButtonText}>Mettre en ligne</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Help / Contact Card */}
        <View style={styles.helpCard}>
          <View style={styles.helpRow}>
            <View style={styles.helpIconCircle}>
              <Headphones size={24} color="#0F766E" />
            </View>
            <Text style={styles.helpText}>
              Une question ou un document à transmettre à votre cabinet ?
            </Text>
          </View>

          <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
            <Text style={styles.contactButtonText}>Contacter mon comptable</Text>
            <ArrowRight size={18} color="#1E5BAC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 32,
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Period Filter Bar
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterArrow: {
    padding: 8,
    borderRadius: 8,
  },
  filterPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: '#1E5BAC',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  // Statement Card
  statementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statementIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  statementInfo: {
    flex: 1,
  },
  statementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transmittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transmittedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#16A34A',
  },
  missingText: {
    fontSize: 13,
    color: '#6B7280',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E5BAC',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    flexShrink: 0,
  },
  pdfButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadButton: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexShrink: 0,
  },
  uploadButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  // Help Card 
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  helpIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    paddingTop: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 14,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E5BAC',
  },
});

export default BankStatements;
