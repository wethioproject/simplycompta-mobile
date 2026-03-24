import React, { useState, useEffect, Activity } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
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
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';
import { useAuth } from '../../hooks/useAuth';

type StackNavigation = StackNavigationProp<any>;

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
     const res = await api.get(Api_Endpoints.customerProfile);
     setData(res.data?.data ?? null);
     console.log('profile data', res.data?.data);
    }
    catch (e: any) {
        Alert.alert(t('error_title'), e?.response?.data?.message ?? t('error_load_data'));
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e: any) {
      Alert.alert(t('error_title'), t('error_logout_failed'));
    } finally {
      setLoggingOut(false);
    }
  };

  const profileRows = [
    {
      icon: <User size={20} color="#1E5BAC" />,
      label: t('label_name_full'),
      value: data?.name,
      action: null,
    },
    {
      icon: <Phone size={20} color="#1E5BAC" />,
      label: t('label_phone_contact'),
      value: data?.contact,
      action: null,
    },
    {
      icon: <Mail size={20} color="#1E5BAC" />,
      label: t('label_email_contact'),
      value: data?.email,
      action: null,
    },
    {
      icon: <MapPin size={20} color="#1E5BAC" />,
      label: t('label_address'),
      value: data?.shipping_address,
      // action: t('action_download_rc_extract'),
      action: null,
    },
    {
      icon: <Globe size={20} color="#1E5BAC" />,
      label: t('label_ice_number'),
      value: data?.ice_number || t('profile_not_provided'),
      // action: t('action_download_rc_extract'),
      action: null,
    },
    {
      icon: <FileText size={20} color="#1E5BAC" />,
      label: t('label_rc_number'),
      value: data?.rc_number  || t('profile_not_provided'),
      // action: t('action_download_if_certificate'),
      action: null,
    },
    {
      icon: <Briefcase size={20} color="#1E5BAC" />,
      label: t('label_patent_number'),
      value: data?.patent_number || t('profile_not_provided'),
      // action: t('action_download_patent_certificate'),
      action: null,
    },
  ];

  if(loading) {
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
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      </SafeAreaView>
    );
  }

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
              placeholder={t('search_placeholder')}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {/* <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <Bell size={24} color="#4B5563" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity> */}
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
              <Text style={styles.profileHeaderTitle}>{t('profile_header_title')}</Text>
              {/* <Text style={styles.profileHeaderSubtitle}>{data?.short_bio || t('profile_na')}</Text> */}
            </View>
          </View>
            </View>
        {/* </LinearGradient> */}

        {/* Profile Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsCardHeader}>
            <Text style={styles.detailsName}>{data?.name}</Text>
            <Text style={styles.detailsCompany}>{data?.bio || t('profile_na')}</Text>
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
                  {t('contact_question_text')}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, loggingOut && { opacity: 0.6 }]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={styles.logoutBtnText}>{t('button_logout')}</Text>
          )}
        </TouchableOpacity>
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default Profile;
