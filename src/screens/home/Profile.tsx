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
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Briefcase,
  ChevronRight,
  Headphones,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { appLogoIcon } from '../../assets/icons';

type StackNavigation = StackNavigationProp<any>;

const Profile: React.FC = () => {
  const navigation = useNavigation<StackNavigation>();
  const [searchQuery, setSearchQuery] = useState('');

  const profileRows = [
    {
      icon: <User size={20} color="#1E5BAC" />,
      label: 'Nom & Prénom',
      value: 'Alex Durand',
      action: null,
    },
    {
      icon: <Phone size={20} color="#1E5BAC" />,
      label: 'Téléphone',
      value: '+212 6 45 67 89 01',
      action: null,
    },
    {
      icon: <Mail size={20} color="#1E5BAC" />,
      label: 'Email',
      value: 'alex.durand@duran-sarl.ma',
      action: null,
    },
    {
      icon: <MapPin size={20} color="#1E5BAC" />,
      label: 'Adresse',
      value: '15 rue de la Liberté, Casablanca',
      action: 'Télécharger Extrait RC',
    },
    {
      icon: <Globe size={20} color="#1E5BAC" />,
      label: 'N° ICE',
      value: '001234567000058',
      action: 'Télécharger Extrait RC',
    },
    {
      icon: <FileText size={20} color="#1E5BAC" />,
      label: 'N° RC',
      value: '345678',
      action: 'Télécharger Attestation IF',
    },
    {
      icon: <Briefcase size={20} color="#1E5BAC" />,
      label: 'N° de Patente',
      value: '40321678',
      action: 'Télécharger Attestation Patente',
    },
  ];

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
        {/* Profile Header Card */}
        {/* <LinearGradient
          colors={['#E8F0FA', '#F3F4F6']}
          style={styles.profileHeaderCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        > */}
            <View style={[styles.profileHeaderCard, { backgroundColor: '#E8F0FA'}]}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <User size={32} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.profileHeaderText}>
              <Text style={styles.profileHeaderTitle}>Mon Profil</Text>
              <Text style={styles.profileHeaderSubtitle}>CEO</Text>
            </View>
          </View>
            </View>
        {/* </LinearGradient> */}

        {/* Profile Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsCardHeader}>
            <Text style={styles.detailsName}>Alex Durand</Text>
            <Text style={styles.detailsCompany}>DuranElectronics SARL</Text>
          </View>

          {profileRows.map((row, index) => (
            <View
              key={index}
              style={[
                styles.detailRow,
                index < profileRows.length - 1 && styles.detailRowBorder,
              ]}
            >
              <View style={styles.detailRowIcon}>{row.icon}</View>
              <View style={styles.detailRowContent}>
                <View style={styles.detailRowInner}>
                  <View style={styles.detailRowText}>
                    <Text style={styles.detailRowLabel}>{row.label}</Text>
                    <Text style={styles.detailRowValue}>{row.value}</Text>
                  </View>
                  {row.action && (
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                      <Text style={styles.actionButtonText}>{row.action}</Text>
                      <ChevronRight size={14} color="#1E5BAC" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactCard}>
          <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
            <View style={styles.contactRowLeft}>
              <View style={styles.contactIconCircle}>
                <Headphones size={24} color="#0D9488" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactText}>
                  Une question ou un document à{'\n'}transmettre à votre cabinet ?
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
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
  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  // Profile Header Card
  profileHeaderCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderText: {
    flex: 1,
  },
  profileHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  profileHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsCardHeader: {
    marginBottom: 20,
  },
  detailsName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  detailsCompany: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailRowIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  detailRowContent: {
    flex: 1,
  },
  detailRowInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailRowText: {
    flex: 1,
  },
  detailRowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  detailRowValue: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E5BAC',
  },
  // Contact Card
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  contactRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default Profile;
