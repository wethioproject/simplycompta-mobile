import React, { useState, useEffect, useCallback } from 'react';
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Search,
  FileText,
  FolderOpen,
  Download,
  Clock,
  ChevronRight,
  Building2,
  BookOpen,
} from 'lucide-react-native';
import i18next from 'i18next';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';


// ── API types ────────────────────────────────────────────────────────────────
interface RecentDocument {
  id: number;
  name: string;
  type: string;
  created_at: string;
  size: string;
  url: string;
}

interface ApiCategory {
  name: string;
  count: number;
  size: string;
  type: string;
  created_at: string;
}

interface DocumentsData {
  total_documents: number;
  total_size: string;
  total_categories: number;
  recent_documents: RecentDocument[];
  categories: ApiCategory[];
}

// ── Category style map keyed by `type` from API ──────────────────────────────
const CATEGORY_STYLE: Record<string, {
  iconBg: string;
  iconColor: string;
  Icon: React.ComponentType<any>;
  screen: string;
}> = {
  juridiques: {
    iconBg: '#C8E6C9', iconColor: '#2E7D32',
    Icon: FileText,
    screen: 'Legal Documents',
  },
  comptables: {
    iconBg: '#FFE0B2', iconColor: '#E65100',
    Icon: BookOpen,
    screen: 'Accounting Documents',
  },
  releves_bancaires: {
    iconBg: '#BBDEFB', iconColor: '#1E5BAC',
    Icon: Building2,
    screen: 'Bank Statements',
  },
};

const DEFAULT_STYLE = {
  iconBg: '#F3F4F6', iconColor: '#6B7280',
  Icon: FolderOpen,
  screen: 'Legal Documents',
};

// ── Date formatter ────────────────────────────────────────────────────────────
const formatDate = (iso: string): string => {
  const date = new Date(iso);
  const locale = i18next.language === 'en' ? 'en-US' : 'fr-FR';
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── DocumentsList Screen ──────────────────────────────────────────────────────
const DocumentsList: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<DocumentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(Api_Endpoints.documentsData);
      setData(res.data?.data ?? null);
    } catch {
      Alert.alert(t('error_title'), t('doc_error_load'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(true); };

  // Filter recent docs by search
  const filteredRecent = (data?.recent_documents ?? []).filter(doc =>
    !searchQuery.trim() ||
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = (data?.categories ?? []).filter(cat =>
    !searchQuery.trim() ||
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeft size={24} color="#111827" strokeWidth={2} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>{t('menu_documents')}</Text>
              {data && (
                <Text style={styles.headerSubtitle}>
                  {data.total_documents} {t('doc_documents_count').toLowerCase()} · {data.total_size}
                </Text>
              )}
            </View>
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
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E5BAC" />}
        >
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <FileText size={24} color="#1E5BAC" strokeWidth={2} />
              <Text style={styles.statValue}>{data?.total_documents ?? 0}</Text>
              <Text style={styles.statLabel}>{t('doc_documents_count')}</Text>
            </View>
            <View style={styles.statCard}>
              <Download size={24} color="#16A34A" strokeWidth={2} />
              <Text style={styles.statValue}>{data?.total_size ?? '—'}</Text>
              <Text style={styles.statLabel}>{t('doc_stored')}</Text>
            </View>
            <View style={styles.statCard}>
              <FolderOpen size={24} color="#F97316" strokeWidth={2} />
              <Text style={styles.statValue}>{data?.total_categories ?? 0}</Text>
              <Text style={styles.statLabel}>{t('doc_categories_count')}</Text>
            </View>
          </View>

          {/* Recent Documents */}
          {filteredRecent.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <Clock size={18} color="#374151" strokeWidth={2} />
                  <Text style={styles.sectionTitleText}>{t('doc_recent')}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AllDocuments', {
                      documentType: 'all',
                      screenTitle: t('doc_recent'),
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAll}>{t('doc_see_all')}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                {filteredRecent.map((doc, index) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={[styles.docRow, index !== filteredRecent.length - 1 && styles.rowDivider]}
                    activeOpacity={0.7}
                    // onPress={() => Linking.openURL(doc.url).catch(() => Alert.alert(t('error_title'), t('error_open_document')))}
                  >
                    <View style={styles.docIconBox}>
                      <FileText size={20} color="#1E5BAC" strokeWidth={2} />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                      <Text style={styles.docMeta}>
                        {formatDate(doc.created_at)} · {doc.size}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* All Categories */}
          {filteredCategories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.categoriesTitle}>{t('doc_all_categories')}</Text>

              {filteredCategories.map((cat) => {
                const style = CATEGORY_STYLE[cat.type] ?? DEFAULT_STYLE;
                const CatIcon = style.Icon;
                const lastUpdate = formatDate(cat.created_at);
                // Normalise type key for i18n (e.g. "Releves bancaires" → "releves_bancaires")
                const i18nKey = `doc_type_${cat.type.toLowerCase().replace(/\s+/g, '_')}`;
                const displayName = t(i18nKey) !== i18nKey ? t(i18nKey) : cat.name;

                return (
                  <TouchableOpacity
                    key={cat.type}
                    style={styles.catCard}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate(style.screen)}
                  >
                    {/* Icon */}
                    <View style={styles.catIconWrapper}>
                      <View style={[styles.catIconBox, { backgroundColor: style.iconBg }]}>
                        <CatIcon size={28} color={style.iconColor} strokeWidth={2} />
                      </View>
                    </View>

                    {/* Content */}
                    <View style={styles.catContent}>
                      <Text style={styles.catName}>{displayName}</Text>
                      {cat.count > 0 && (
                        <View style={styles.catMetaRow}>
                          <Text style={styles.catMetaText}>{cat.count} {t('doc_files')}</Text>
                          <Text style={styles.catDot}>•</Text>
                          <Text style={styles.catMetaText}>{cat.size}</Text>
                        </View>
                      )}
                      <Text style={styles.catUpdate}>{t('doc_last_update')} {lastUpdate}</Text>
                    </View>

                    {/* Count badge + chevron */}
                    {
                    cat.count > 0 && (
                    <View style={styles.catRight}>
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{cat.count}</Text>
                      </View>
                      <ChevronRight size={18} color="#9CA3AF" />
                    </View>
                        )
                    }
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF6' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },


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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#1E5BAC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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


  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },


  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitleText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 12, fontWeight: '600', color: '#1E5BAC' },
  categoriesTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },


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
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  docInfo: { flex: 1, minWidth: 0 },
  docName: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 2 },
  docMeta: { fontSize: 12, color: '#6B7280' },


  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  catIconWrapper: { position: 'relative', flexShrink: 0 },
  catIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  catContent: { flex: 1 },
  catName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  catMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  catMetaText: { fontSize: 12, fontWeight: '500', color: '#4B5563' },
  catDot: { fontSize: 12, color: '#9CA3AF' },
  catUpdate: { fontSize: 11, color: '#9CA3AF' },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#374151' },
});

export default DocumentsList;
