import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useSelector } from 'react-redux';
import i18n from '../../i18n/i18n';
import {
  ArrowLeft,
  Bell,
  Search,
  Scale,
  FileText,
  FileCheck,
  Download,
  CheckCircle2,
  Clock,
  Headphones,
  ArrowRight,
  Plus,
  TrendingDown,
  Users,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

type StackNavigation = StackNavigationProp<any>;

type ApiDocument = {
  id: number;
  customer_id: number;
  sender_id: number;
  title: string;
  message: string;
  is_read: boolean;
  data: string;
  document: string;
  created_at: string;
  updated_at: string;
};

const BASE_DOCUMENT_URL = 'https://simply-compta.com/storage/';

// const formatDate = (iso: string) => {
//   try {
//     return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
//   } catch {
//     return iso;
//   }
// };

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const DocIcon: React.FC<{ iconType: string }> = ({ iconType }) => {
  const props = { size: 22, color: '#FFFFFF', strokeWidth: 2 };
  switch (iconType) {
    case 'scale':
      return <Scale {...props} />;
    case 'fileCheck':
      return <FileCheck {...props} />;
    case 'fileText':
      return <FileText {...props} />;
    default:
      return <FileText {...props} />;
  }
};

const Accounting: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const token = useSelector((state: any) => state.user.token);
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // ── FAB ────────────────────────────────────────────────────────────────────
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabRotation = useState(new Animated.Value(0))[0];
  const fabButton1Scale = useState(new Animated.Value(0))[0];
  const fabButton2Scale = useState(new Animated.Value(0))[0];
  const fabButton3Scale = useState(new Animated.Value(0))[0];
  const fabButton1Opacity = useState(new Animated.Value(0))[0];
  const fabButton2Opacity = useState(new Animated.Value(0))[0];
  const fabButton3Opacity = useState(new Animated.Value(0))[0];
  const rotation = fabRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

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
    setTimeout(() => { navigation.navigate('Contacts') });
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get(Api_Endpoints.documents, {
        params: { documentType: 'comptables' },
      });
      setDocuments(res.data?.data?.documents ?? []);
    } catch (e: any) {
      Alert.alert(t('error_title'), e?.response?.data?.message ?? t('error_load_documents'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const filtered = documents.filter(doc =>
    !searchQuery.trim() ||
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.message.toLowerCase().includes(searchQuery.toLowerCase())
  );


const handleDocOpen = async (doc: any) => {
  try {
    const { fs, config } = ReactNativeBlobUtil;

    const fileName = `document_${doc.id}.pdf`;
    const path =
      Platform.OS === 'ios'
        ? `${fs.dirs.DocumentDir}/${fileName}`
        : `${fs.dirs.DownloadDir}/${fileName}`;

    const res = await config({
      fileCache: true,
      path,
    }).fetch(
      'GET',
      doc.document_url,
      {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      }
    );
    console.log('File downloaded to:101', res.path());
    console.log('File downloaded to:102', await res.text());
    console.log('File downloaded to:103', res.info());

    if (Platform.OS === 'ios') {
      ReactNativeBlobUtil.ios.openDocument(res.path());
    } else {
      ReactNativeBlobUtil.android.actionViewIntent(
        res.path(),
        'application/pdf'
      );
    }
  } catch (error) {
    console.log(error);
    Alert.alert(t('error_title'), t('error_download_document'));
  }
};

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
        {/* Page Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleIconBox}>
            <Scale size={24} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.titleText}>{t('title_accounting_documents')}</Text>
        </View>

        {/* Documents List Card */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1E5BAC" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <FileText size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>{t('empty_no_documents')}</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {filtered.map((doc, index) => (
              <View
                key={doc.id}
                style={[
                  styles.docRow,
                  index < filtered.length - 1 && styles.docRowBorder,
                ]}
              >
                {/* Icon */}
                <View style={styles.docIconBox}>
                  <DocIcon iconType="fileText" />
                </View>

                {/* Title & Date */}
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={2}>{doc.title}</Text>
                  <Text style={styles.docDate}>{t('label_issued_date')} {formatDate(doc.created_at)}</Text>
                  {doc.message ? (
                    <Text style={styles.docMessage} numberOfLines={1}>{doc.message}</Text>
                  ) : null}
                </View>

                {/* Read badge & Download */}
                <View style={styles.docActions}>
                  {doc.is_read ? (
                    <View style={styles.badgeValidated}>
                      <CheckCircle2 size={11} color="#15803D" />
                      <Text style={styles.badgeValidatedText}>{t('badge_read')}</Text>
                    </View>
                  ) : (
                    <View style={styles.badgePending}>
                      <Clock size={11} color="#C2410C" />
                      <Text style={styles.badgePendingText}>{t('badge_unread')}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.downloadButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        handleDocOpen(doc);
                    //   const url = `${BASE_DOCUMENT_URL}${doc.document}`;
                    //   Alert.alert('Télécharger', url);
                    }}
                  >
                    <Text style={styles.downloadButtonText}>{t('button_pdf_download')}</Text>
                    <Download size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

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
              <Text style={styles.helpText}>{t('help_text_contact')}</Text>
            </View>
            <ArrowRight size={20} color="#9CA3AF" />
          </View>

          <TouchableOpacity style={styles.contactButton} activeOpacity={0.8} onPress={() => navigation.navigate('Contact')}>
            <Text style={styles.contactButtonText}>{t('button_contact_accountant')}</Text>
            <ArrowRight size={16} color="#1E5BAC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

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
          <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: rotation }] }]}>
            <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
          </Animated.Text>
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
    backgroundColor: '#6B21A8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
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
  // Loading / Empty
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  docMessage: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
  // ── FAB
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  subFabButton1: { backgroundColor: '#1E5BAC' },
  subFabButton2: { backgroundColor: '#1E5BAC' },
  subFabButton3: { backgroundColor: '#1E5BAC' },
});

export default Accounting;
