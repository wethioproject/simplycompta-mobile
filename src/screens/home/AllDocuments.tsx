import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Search,
  FileText,
  ChevronRight,
  Download,
} from 'lucide-react-native';
import i18next from 'i18next';
import ReactNativeBlobUtil from 'react-native-blob-util';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';


interface ApiDocument {
  id: number;
  customer_id: number;
  sender_id?: number;
  title?: string;
  message?: string;
  is_read?: boolean;
  data?: string;
  document?: string;
  file_path?: string;
  month_year?: string;
  created_at: string;
  updated_at?: string;
  document_url?: string;
  file_url?: string;
}


const formatDate = (iso: string): string => {
  try {
    const date = new Date(iso);
    const locale = i18next.language === 'en' ? 'en-US' : 'fr-FR';
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};


const AllDocuments: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();

  const documentType = route.params?.documentType ?? 'juridiques';
  const screenTitle = route.params?.screenTitle ?? t('menu_documents');
  const token = useSelector((state: any) => state.user.token);

  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(Api_Endpoints.documents, {
        params: { documentType },
      });
      setDocuments(res.data?.data?.documents ?? []);
    } catch (e: any) {
      Alert.alert(
        t('error_title'),
        e?.response?.data?.message ?? t('doc_error_load')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [documentType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments(true);
  };

  const filtered = documents.filter(doc => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    const title = (doc.title || doc.month_year || '').toLowerCase();
    const message = (doc.message || '').toLowerCase();
    return title.includes(searchLower) || message.includes(searchLower);
  });

  const handleDocumentPress = async (doc: ApiDocument) => {
    // If `data` key exists → normal document; otherwise → bank statement
    const isNormalDoc = doc.data !== undefined;
    const downloadUrl = isNormalDoc
      ? doc.document_url
      : doc.file_url;

    if (!downloadUrl) {
      Alert.alert(t('error_title'), t('error_open_document'));
      return;
    }

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
      }).fetch('GET', downloadUrl, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      });

      if (Platform.OS === 'ios') {
        ReactNativeBlobUtil.ios.openDocument(res.path());
      } else {
        ReactNativeBlobUtil.android.actionViewIntent(res.path(), 'application/pdf');
      }
    } catch {
      Alert.alert(t('error_title'), t('error_download_document'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{screenTitle}</Text>
            <Text style={styles.headerSubtitle}>
              {documents.length} {t('doc_documents_count').toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('doc_search_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <FileText size={40} color="#D1D5DB" />
          <Text style={styles.emptyText}>{t('doc_no_documents')}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1E5BAC"
            />
          }
        >
          <View style={styles.card}>
            {filtered.map((doc, index) => (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.docRow,
                  index !== filtered.length - 1 && styles.rowDivider,
                ]}
                activeOpacity={0.7}
                onPress={() => handleDocumentPress(doc)}
              >
                <View style={styles.docIconBox}>
                  <FileText size={20} color="#1E5BAC" strokeWidth={2} />
                </View>
                <View style={styles.docInfo}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docName} numberOfLines={1}>
                      {doc.title || doc.month_year || 'Document'}
                    </Text>
                    {doc.is_read === false && <View style={styles.unreadBadge} />}
                  </View>
                  {doc.message && (
                    <Text style={styles.docMessage} numberOfLines={1}>
                      {doc.message}
                    </Text>
                  )}
                  <Text style={styles.docMeta}>
                    {formatDate(doc.created_at)}
                  </Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    padding: 0,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  docInfo: {
    flex: 1,
    minWidth: 0,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    flexShrink: 0,
  },
  docMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  docMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default AllDocuments;
