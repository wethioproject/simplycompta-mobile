import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  FolderOpen,
  CheckCircle2,
  DollarSign,
  Download,
  Clock,
  ChevronRight,
} from 'lucide-react-native';


interface Document {
  id: string;
  name: string;
  date: string;
  size: string;
  type?: 'pdf' | 'jpg' | 'png';
}

interface DocumentCategory {
  id: string;
  name: string;
  icon: 'legal' | 'accounting' | 'bank';
  count: number;
  totalSize: string;
  lastUpdate: string;
  color: { bg: string; iconBg: string; iconColor: string };
  badge?: { Icon: React.ComponentType<any>; color: string };
}


const documentCategories: DocumentCategory[] = [
  {
    id: 'legal',
    name: 'doc_category_legal',
    icon: 'legal',
    count: 8,
    totalSize: '2.4 MB',
    lastUpdate: 'doc_time_2_days_ago',
    color: { bg: '#E8F5E9', iconBg: '#C8E6C9', iconColor: '#2E7D32' },
    badge: { Icon: CheckCircle2, color: '#16A34A' },
  },
  {
    id: 'accounting',
    name: 'doc_category_accounting',
    icon: 'accounting',
    count: 24,
    totalSize: '8.7 MB',
    lastUpdate: 'doc_time_1_day_ago',
    color: { bg: '#FFF3E0', iconBg: '#FFE0B2', iconColor: '#E65100' },
  },
  {
    id: 'bank',
    name: 'doc_category_bank',
    icon: 'bank',
    count: 12,
    totalSize: '1.5 MB',
    lastUpdate: 'doc_time_today',
    color: { bg: '#E3F2FD', iconBg: '#BBDEFB', iconColor: '#1E5BAC' },
    badge: { Icon: DollarSign, color: '#1E5BAC' },
  },
];

const recentDocuments: Document[] = [
  { id: 'r1', name: 'Facture Client #2024-045.pdf', date: 'doc_recent_1_date', size: '245 KB', type: 'pdf' },
  { id: 'r2', name: 'Relevé - Mars 2026.pdf',       date: 'doc_recent_2_date', size: '124 KB', type: 'pdf' },
  { id: 'r3', name: 'Contrat prestation.pdf',        date: 'doc_recent_3_date', size: '892 KB', type: 'pdf' },
];

const TOTAL_DOCUMENTS = documentCategories.reduce((s, c) => s + c.count, 0);
const TOTAL_SIZE = '12.6 MB';

// CategoryIcon helper
const CategoryIcon: React.FC<{ icon: DocumentCategory['icon']; color: string }> = ({ icon, color }) => {
  if (icon === 'accounting') return <FolderOpen size={28} color={color} strokeWidth={2} />;
  return <FileText size={28} color={color} strokeWidth={2} />;
};

// DocumentsList Screen
const CATEGORY_SCREENS: Record<string, string> = {
  legal:      'Legal Documents',
  accounting: 'Accounting Documents',
  bank:       'Bank Statements',
};

const DocumentsList: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

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
              <Text style={styles.headerTitle}>{t('menu_documents') || 'Mes Documents'}</Text>
              <Text style={styles.headerSubtitle}>{TOTAL_DOCUMENTS} documents · {TOTAL_SIZE}</Text>
            </View>
          </View>
          {/* <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity> */}
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/*  Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <FileText size={24} color="#1E5BAC" strokeWidth={2} />
            <Text style={styles.statValue}>{TOTAL_DOCUMENTS}</Text>
            <Text style={styles.statLabel}>{t('doc_documents_count')}</Text>
          </View>
          <View style={styles.statCard}>
            <Download size={24} color="#16A34A" strokeWidth={2} />
            <Text style={styles.statValue}>{TOTAL_SIZE}</Text>
            <Text style={styles.statLabel}>{t('doc_stored')}</Text>
          </View>
          <View style={styles.statCard}>
            <FolderOpen size={24} color="#F97316" strokeWidth={2} />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>{t('doc_categories_count')}</Text>
          </View>
        </View>

        {/* Recent Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Clock size={18} color="#374151" strokeWidth={2} />
              <Text style={styles.sectionTitleText}>{t('doc_recent')}</Text>
            </View>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.seeAll}>{t('doc_see_all')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {recentDocuments.map((doc, index) => (
              <TouchableOpacity
                key={doc.id}
                style={[styles.docRow, index !== recentDocuments.length - 1 && styles.rowDivider]}
                activeOpacity={0.7}
              >
                <View style={styles.docIconBox}>
                  <FileText size={20} color="#1E5BAC" strokeWidth={2} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                  <Text style={styles.docMeta}>{t(doc.date)} · {doc.size}</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* All Categories */}
        <View style={styles.section}>
          <Text style={styles.categoriesTitle}>{t('doc_all_categories')}</Text>

          {documentCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              activeOpacity={0.75}
              onPress={() => navigation.navigate(CATEGORY_SCREENS[cat.id])}
            >
              {/* Icon + badge */}
              <View style={styles.catIconWrapper}>
                <View style={[styles.catIconBox, { backgroundColor: cat.color.iconBg }]}>
                  <CategoryIcon icon={cat.icon} color={cat.color.iconColor} />
                </View>
                {cat.badge && (
                  <View style={[styles.catBadge, { backgroundColor: cat.badge.color }]}>
                    <cat.badge.Icon size={11} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>

              {/* Content */}
              <View style={styles.catContent}>
                <Text style={styles.catName}>{t(cat.name)}</Text>
                <View style={styles.catMetaRow}>
                  <Text style={styles.catMetaText}>{cat.count} {t('doc_files')}</Text>
                  <Text style={styles.catDot}>•</Text>
                  <Text style={styles.catMetaText}>{cat.totalSize}</Text>
                </View>
                <Text style={styles.catUpdate}>{t(cat.lastUpdate)}</Text>
              </View>

              {/* Count badge + chevron */}
              <View style={styles.catRight}>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{cat.count}</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
