import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ReactNativeBlobUtil from 'react-native-blob-util';
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
  Camera,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import { appLogoIcon } from '../../assets/icons';
import { useBankStatement } from '../../hooks/useBankStatement';

type StackNavigation = StackNavigationProp<any>;

interface BankStatementItem {
  id: number;
  customer_id: number;
  file_path: string;
  file_url: string;
  month_year: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const getMonthNames = (t: any) => [
  t('month_january'), t('month_february'), t('month_march'), t('month_april'),
  t('month_may'), t('month_june'), t('month_july'), t('month_august'),
  t('month_september'), t('month_october'), t('month_november'), t('month_december'),
];

const formatMonthYear = (monthYear: string, monthNames: string[]): string => {
  const [month, year] = monthYear.split('-');
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
};

const CURRENT_YEAR = new Date().getFullYear();
const LAST_YEAR = CURRENT_YEAR - 1;

const BankStatements: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const token = useSelector((state: any) => state.user.token);
  const filterScrollRef = useRef<ScrollView>(null);
  const { getBankStatements, createBankStatement } = useBankStatement();
  const user = useSelector((state: any) => state.user.customer);
  const [scrollX, setScrollX] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('3');
  const [apiStatements, setApiStatements] = useState<BankStatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  const monthNames = getMonthNames(t);
  const PERIODS: { label: string; filterValue: string }[] = [
    { label: String(LAST_YEAR), filterValue: String(LAST_YEAR) },
    { label: t('period_3_months'), filterValue: '3' },
    { label: t('period_6_months'), filterValue: '6' },
    { label: t('period_9_months'), filterValue: '9' },
    { label: t('period_12_months'), filterValue: '12' },
  ];

  const fetchStatements = async (filter?: string) => {
    try {
      setLoading(true);
      const result = await getBankStatements(filter);
      console.log('fetchstatttttt333', result);
      if (result.success && result.bankStatements) {
        setApiStatements(result.bankStatements);
      }
    } catch (err) {
      Alert.alert(t('error_title'), t('error_load_statements'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStatements(selectedPeriod); }, [selectedPeriod]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatements(selectedPeriod);
  };

  const handleUpload = async (slot: string) => {
    try {
      const [file] = await pick({ type: [types.pdf] });
      setUploadingSlot(slot);
      const result = await createBankStatement({
        customer_id: String(user?.id ?? ''),
        month_year: slot,
        statement: file,
      });
      if (result.success) {
        Alert.alert(t('success_title'), t('success_statement_uploaded'));
        fetchStatements();
      } else {
        Alert.alert(t('error_title'), result.error || t('error_upload_statement'));
      }
    } catch (err) {
      if (!isErrorWithCode(err) || err.code !== errorCodes.OPERATION_CANCELED) {
        Alert.alert(t('error_title'), t('error_upload_file'));
      }
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleTakePhotoForSlot = (slot: string) => {
    launchCamera(
      { mediaType: 'photo', saveToPhotos: false, quality: 0.8 },
      async (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (!asset?.uri) return;
        const file = {
          uri: asset.uri,
          fileCopyUri: asset.uri,
          name: asset.fileName ?? `photo_${Date.now()}.jpg`,
          type: asset.type ?? 'image/jpeg',
        };
        setUploadingSlot(slot);
        try {
          const result = await createBankStatement({
            customer_id: String(user?.id ?? ''),
            month_year: slot,
            statement: file,
          });
          if (result.success) {
            Alert.alert(t('success_title'), t('success_statement_uploaded'));
            fetchStatements();
          } else {
            Alert.alert(t('error_title'), result.error || t('error_upload_statement'));
          }
        } catch {
          Alert.alert(t('error_title'), t('error_upload_file'));
        } finally {
          setUploadingSlot(null);
        }
      }
    );
  };

  const generateMonthSlots = (): string[] => {
    const currentYear = new Date().getFullYear();
    if (/^\d{4}$/.test(selectedPeriod)) {
      // Year filter: generate all 12 months for that year
      const year = parseInt(selectedPeriod, 10);
      return Array.from({ length: 12 }, (_, i) =>
        `${String(i + 1).padStart(2, '0')}-${year}`
      );
    }
    const numMonths = parseInt(selectedPeriod, 10);
    if (!isNaN(numMonths)) {
      // First N months of current year
      return Array.from({ length: numMonths }, (_, i) =>
        `${String(i + 1).padStart(2, '0')}-${currentYear}`
      );
    }
    return [];
  };

  const transmittedMap = new Map(apiStatements.map(s => [s.month_year, s]));
  const allSlots = generateMonthSlots();
  const filteredSlots = allSlots.filter(slot => {
    if (!searchQuery.trim()) return true;
    return formatMonthYear(slot, monthNames).toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

const handleDocOpen = async (doc: any) => {
  try {
    const { fs, config } = ReactNativeBlobUtil;

    const fileName = `document_${doc.id}.pdf`;
    const path =
      Platform.OS === 'ios'
        ? `${fs.dirs.DocumentDir}/${fileName}`
        : `${fs.dirs.DownloadDir}/${fileName}`;

        console.log('File downloaded to:100', doc);
              console.log('gggggg2222ggggbkst', {
                file_url: doc.file_url,
                token,
                accept: 'application/pdf',
              })   
    const res = await config({
      fileCache: true,
      path,
    }).fetch(
      'GET',
      doc.file_url,
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleIconBox}>
            <CreditCard size={24} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.titleText}>{t('title_bank_statements')}</Text>
        </View>

        {/* Period Filter Bar */}
        <View style={styles.filterBar}>
            <TouchableOpacity
            style={styles.filterArrow}
            activeOpacity={0.7}
            onPress={() => {
                filterScrollRef.current?.scrollTo({
              x: Math.max(scrollX - 120, 0),
              animated: true,
            }); 
            }}>
                <ArrowLeft size={20} color="#4B5563" />
            </TouchableOpacity>

          <ScrollView
            ref={filterScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPills}
            onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            {PERIODS.map((period) => (
              <TouchableOpacity
                key={period.filterValue}
                onPress={() => setSelectedPeriod(period.filterValue)}
                activeOpacity={0.8}
                style={[
                  styles.filterPill,
                  selectedPeriod === period.filterValue && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedPeriod === period.filterValue && styles.filterPillTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.filterArrow}
           activeOpacity={0.7}
            onPress={() => {
            filterScrollRef.current?.scrollTo({
              x: scrollX + 120,
              animated: true,
            });
          }}
           >
            <ArrowRight size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Statements List */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : filteredSlots.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 16 }}>{t('empty_no_statements')}</Text>
          </View>
        ) : (
          filteredSlots.map(slot => {
            const item = transmittedMap.get(slot);
            const label = formatMonthYear(slot, monthNames);
            const [monthName, yearStr] = label.split(' ');
            const isTransmitted = !!item;

            return (
              <View key={slot} style={styles.statementCard}>
                {/* Left: icon + text */}
                <View style={styles.statementLeft}>
                  <View style={styles.statementIconBox}>
                    <FileText size={26} color="#2563EB" />
                  </View>
                  <View style={styles.statementInfo}>
                    <Text style={styles.statementTitle}>
                      {t('label_statement_prefix')} {monthName} {yearStr}
                    </Text>
                    {isTransmitted ? (
                      <View style={styles.transmittedRow}>
                        <CheckCircle2 size={14} color="#16A34A" />
                        <Text style={styles.transmittedText}>{t('badge_transmitted')}</Text>
                      </View>
                    ) : (
                      <Text style={styles.missingText}>{t('label_no_document')}</Text>
                    )}
                  </View>
                </View>

                {/* Right: action button */}
                {isTransmitted ? (
                  <TouchableOpacity
                    style={styles.pdfButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        handleDocOpen(item)
                    //   if (!item?.file_url) return;
                    //   Linking.openURL(item.file_url).catch(() =>
                    //     Alert.alert('Erreur', "Impossible d'ouvrir le fichier PDF.")
                    //   );
                    }}
                  >
                    <Text style={styles.pdfButtonText}>PDF</Text>
                    <Download size={15} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.uploadActions}>
                    <TouchableOpacity
                      style={[styles.uploadButton, uploadingSlot === slot && { opacity: 0.6 }]}
                      activeOpacity={0.8}
                      disabled={!!uploadingSlot}
                      onPress={() => handleTakePhotoForSlot(slot)}
                    >
                      {uploadingSlot === slot
                        ? <ActivityIndicator size="small" color="#4B5563" />
                        : <Camera size={18} color="#4B5563" />}
                      <Text style={styles.uploadButtonText}>{t('button_take_photo')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.uploadButton, uploadingSlot === slot && { opacity: 0.6 }]}
                      activeOpacity={0.8}
                      disabled={!!uploadingSlot}
                      onPress={() => handleUpload(slot)}
                    >
                      {uploadingSlot === slot
                        ? <ActivityIndicator size="small" color="#4B5563" />
                        : <Upload size={18} color="#4B5563" />}
                      <Text style={styles.uploadButtonText}>{t('button_upload')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Help / Contact Card */}
        <View style={styles.helpCard}>
          <View style={styles.helpRow}>
            <View style={styles.helpIconCircle}>
              <Headphones size={24} color="#0F766E" />
            </View>
            <Text style={styles.helpText}>
              {t('help_text_contact')}
            </Text>
          </View>

          <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
            <Text style={styles.contactButtonText}>{t('button_contact_accountant')}</Text>
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
  uploadActions: {
    flexDirection: 'row',
    gap: 8,
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
