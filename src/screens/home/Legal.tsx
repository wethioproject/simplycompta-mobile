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
  FileText,
  Briefcase,
  FileCheck,
  Shield,
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  Headphones,
  ArrowRight,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { appLogoIcon } from '../../assets/icons';

type StackNavigation = StackNavigationProp<any>;

type Document = {
  id: number;
  name: string;
  date: string;
  iconType: string;
  isValidated: boolean;
};

const documents: Document[] = [
  {
    id: 1,
    name: 'Extrait du Registre du Commerce',
    date: 'Émis le 12 avril 2024',
    iconType: 'briefcase',
    isValidated: true,
  },
  {
    id: 2,
    name: 'Statuts de Société',
    date: 'Émis le 10 janvier 2023',
    iconType: 'fileText',
    isValidated: true,
  },
  {
    id: 3,
    name: 'Procès-Verbaux AG',
    date: 'Émis le 25 juin 2023',
    iconType: 'fileCheck',
    isValidated: false,
  },
  {
    id: 4,
    name: 'Attestation Fiscale',
    date: 'Émise le 3 février 2024',
    iconType: 'fileCheck',
    isValidated: true,
  },
  {
    id: 5,
    name: 'Attestation IS',
    date: 'Émise le 16 janvier 2024',
    iconType: 'receipt',
    isValidated: true,
  },
  {
    id: 6,
    name: 'Attestation Taxe Professionnelle',
    date: 'Émise le 5 décembre 2023',
    iconType: 'receipt',
    isValidated: false,
  },
  {
    id: 7,
    name: 'Attestation de Patente',
    date: 'Émise le 12 janvier 2024',
    iconType: 'shield',
    isValidated: true,
  },
];

const DocIcon: React.FC<{ iconType: string }> = ({ iconType }) => {
  const props = { size: 22, color: '#FFFFFF', strokeWidth: 2 };
  switch (iconType) {
    case 'briefcase':
      return <Briefcase {...props} />;
    case 'fileText':
      return <FileText {...props} />;
    case 'fileCheck':
      return <FileCheck {...props} />;
    case 'receipt':
      return <Receipt {...props} />;
    case 'shield':
      return <Shield {...props} />;
    default:
      return <FileText {...props} />;
  }
};

const Legal: React.FC = () => {
  const navigation = useNavigation<StackNavigation>();
  const [searchQuery, setSearchQuery] = useState('');

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

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleIconBox}>
            <FileText size={24} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.titleText}>Documents Juridiques</Text>
        </View>

        {/* Documents List Card */}
        <View style={styles.listCard}>
          {documents.map((doc, index) => (
            <View
              key={doc.id}
              style={[
                styles.docRow,
                index < documents.length - 1 && styles.docRowBorder,
              ]}
            >
              {/* Icon */}
              <View style={styles.docIconBox}>
                <DocIcon iconType={doc.iconType} />
              </View>

              {/* Name & Date */}
              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={2}>{doc.name}</Text>
                <Text style={styles.docDate}>{doc.date}</Text>
              </View>

              {/* Status & Download */}
              <View style={styles.docActions}>
                {doc.isValidated ? (
                  <View style={styles.badgeValidated}>
                    <CheckCircle2 size={11} color="#15803D" />
                    <Text style={styles.badgeValidatedText}>Validé</Text>
                  </View>
                ) : (
                  <View style={styles.badgePending}>
                    <Clock size={11} color="#C2410C" />
                    <Text style={styles.badgePendingText}>En attente</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.downloadButton} activeOpacity={0.8}>
                  <Text style={styles.downloadButtonText}>PDF</Text>
                  <Download size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Help / Contact Section */}
        <View style={styles.helpCard}>
          <View style={styles.helpRow}>
            <LinearGradient
              colors={['#34D399', '#0D9488']}
              style={styles.helpIconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Headphones size={22} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpText}>Une question ou un document à</Text>
              <Text style={styles.helpText}>transmettre à votre cabinet ?</Text>
            </View>
            <ArrowRight size={20} color="#9CA3AF" />
          </View>

          <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
            <Text style={styles.contactButtonText}>Contacter mon comptable</Text>
            <ArrowRight size={16} color="#1E5BAC" />
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
    rowGap: 16,
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
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E5BAC',
  },
  // Documents List Card
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  docRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    lineHeight: 18,
  },
  docDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  docActions: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  badgeValidated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeValidatedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  badgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgePendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C2410C',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E5BAC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  helpIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#1E5BAC',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E5BAC',
  },
});

export default Legal;
