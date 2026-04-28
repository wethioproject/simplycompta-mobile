import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  Share,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronDown,
  Upload,
  Receipt,
  AlertTriangle,
  Plus,
  Search,
  X,
} from 'lucide-react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useQuote } from '../../hooks/useQuote';
import { useQuoteList } from '../../hooks/useQuoteList';
import CreateQuoteModal from '../../components/quote/CreateQuoteModal';
import DetailModal from '../../components/quote/DetailModal';
import QuoteCard from '../../components/quote/QuoteCard';
import QuotePieChart from '../../components/quote/QuotePieChart';
import dashboardService from '../../services/dashboardService';
import type { QuoteChartItem } from '../../services/dashboardService';
import type { Account, Category, Client, StackNavigation } from '../../types/invoice.types';
import type { InvoiceItem } from '../../types/quote.types';
import { invoiceStyles as styles } from '../../styles/quote.styles';
import i18n from '../../i18n/i18n';

type QuoteTabType = 'all' | 'expired' | 'draft' | 'sent' | 'accepted' | 'rejected';
const QUOTE_TABS: QuoteTabType[] = ['all', 'expired', 'draft', 'sent', 'accepted', 'rejected'];

/** i18n key for each tab */
const TAB_LABEL_KEYS: Record<QuoteTabType, string> = {
  all:      'tab_all',
  expired:  'status_expired',
  draft:    'status_draft',
  sent:     'status_sent',
  accepted: 'status_accepted',
  rejected: 'status_rejected',
};

/** Active background color for each tab */
const TAB_COLORS: Record<QuoteTabType, string> = {
  all:      '#1E5BAC',
  expired:  '#EF4444',
  draft:    '#6B7280',
  sent:     '#F59E0B',
  accepted: '#16A34A',
  rejected: '#DC2626',
};

const Quote: React.FC = ({ navigation: navProp }: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const route = useRoute<any>();
  const { createQuote, updateQuote, deleteQuote, getQuoteResources, duplicateQuote, updateQuoteStatus, exportQuotes } = useQuote();
  const token = useSelector((state: any) => state.user.token);
  const user = useSelector((state: any) => state.user.customer);

  const {
    quotes,
    stats,
    loading,
    refreshing,
    selectedMonth,
    selectedYear,
    showMonthPicker,
    showYearPicker,
    setSelectedMonth,
    setSelectedYear,
    setShowMonthPicker,
    setShowYearPicker,
    fetchQuotes,
    getFilterParams,
  } = useQuoteList();
  console.log('quotes', quotes)

  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [defaultClientId, setDefaultClientId] = useState<number | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<QuoteTabType>('all');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pieLoading, setPieLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState<QuoteChartItem[]>([]);
  const [convertedQuotes, setConvertedQuotes] = useState<number>(0);

  const MONTHS = [t('month_january'), t('month_february'), t('month_march'), t('month_april'), t('month_may'), t('month_june'), t('month_july'), t('month_august'), t('month_september'), t('month_october'), t('month_november'), t('month_december')];
  const YEARS = ['2026', '2025', '2024'];

  /* ─── Derived stats (from API) ─── */
  const totalRevenue = stats?.total_sum_all ?? 0;
  const collectedAmt = stats?.total_sum_accepted ?? 0;
  const pendingAmt   = stats?.total_sum_sent ?? 0;
  const overdueAmt   = stats?.total_sum_overdue ?? 0;
  const overdueCount = quotes.filter((i: InvoiceItem) => i.status === 'expired').length;

  /* ─── Month button label ─── */
  const now = new Date();
  const currentMonthLabel = now.toLocaleString(i18n.language, { month: 'long' });
  const currentYearLabel  = String(now.getFullYear());
  const monthBtnLabel = selectedMonth && selectedYear 
    ? `${selectedMonth} ${selectedYear}` 
    : t('filter_all_months');

  const fetchResources = async () => {
    try {
      const resourcesResult = await getQuoteResources();
      if (resourcesResult.success) {
        setAccounts(resourcesResult.resources?.accounts ?? []);
        setCategories(resourcesResult.resources?.categories ?? []);
        setClients(
          (resourcesResult.resources?.clients ?? []).map((c: any) => ({
            id: c.id,
            name: c.client_name,
          }))
        );
      }
    } catch {
      Alert.alert(t('error_title'), t('error_generic'));
    }
  };

  const fetchChartData = async () => {
    try {
      setPieLoading(true);
      const pieChartResult = await dashboardService.getQuoteChart();
      if (pieChartResult?.success) {
        setPieChartData(pieChartResult.data ?? []);
        setConvertedQuotes(pieChartResult.convertedQuotes ?? 0);
      }
    } catch {
      // chart failure is non-blocking
    } finally {
      setPieLoading(false);
    }
  };

    const refreshClients = async (): Promise<Client[]> => {
      try {
        const resourcesResult = await getQuoteResources();
        if (resourcesResult.success) {
          const newClients = (resourcesResult.resources?.clients ?? []).map((c: any) => ({
            id: c.id,
            name: c.client_name,
          }));
          setClients(newClients);
          return newClients;
        }
      } catch {}
      return clients;
    };
  
    useEffect(() => {
      Promise.all([fetchResources(), fetchChartData(), fetchQuotes(getFilterParams())]);
    }, []);

  const handleEditInvoice = (item: InvoiceItem) => {
    setSelectedItem(null);
    setEditingItem(item);
  };

  const handleDeleteQuote = async (id: number) => {
    const result = await deleteQuote(id);
    if (result.success) {
      setSelectedItem(null);
      fetchQuotes(getFilterParams());
      Alert.alert(t('success_title'), t('success_quote_deleted'));
    } else {
      Alert.alert(t('error_title'), result.error ?? t('error_delete_quote'));
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = await exportQuotes();
      if (result.success && result.csvData) {
        const { fs } = ReactNativeBlobUtil;
        const fileName = result.fileName || 'quotes_export.csv';
        const filePath = `${fs.dirs.CacheDir}/${fileName}`;
        if (await fs.exists(filePath)) await fs.unlink(filePath);
        await fs.writeFile(filePath, result.csvData, 'utf8');
        if (Platform.OS === 'ios') {
          await Share.share({ url: `file://${filePath}` });
        } else {
          await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'text/csv');
        }
      } else {
        Alert.alert(t('error_title'), result.error ?? t('error_generic'));
      }
    } catch {
      Alert.alert(t('error_title'), t('error_generic'));
    } finally {
      setExporting(false);
    }
  };

  const handleDuplicate = async (item: InvoiceItem) => {
    const result = await duplicateQuote(item.id);
    if (result.success) {
      fetchQuotes(getFilterParams());
      Alert.alert(t('success'), t('success_quote_duplicated') || t('success_invoice_duplicated'));
    } else {
      Alert.alert(t('error'), result.error ?? t('error_generic'));
    }
  };

  const handleMarkAccepted = async (item: InvoiceItem) => {
    const result = await updateQuoteStatus(item.id, 'accepted');
    if (result.success) {
      fetchQuotes(getFilterParams());
    } else {
      Alert.alert(t('error'), result.error ?? t('error_generic'));
    }
  };

  const handleRelancerAll = () => {
    Alert.alert(t('invoice_relancer_tout'), t('error_generic'));
  };

  useEffect(() => {
    if (!loading && route.params?.openCreateModal) {
      setDefaultClientId(route.params?.defaultClientId ?? undefined);
      setShowCreateModal(true);
    }
  }, [loading, route.params?.openCreateModal]);

  const filtered = quotes.filter((item: InvoiceItem) => {
    const q = searchQuery.toLowerCase();
    const quoteNum = (item.quote_number || item.invoice_number || '').toLowerCase();
    const matchesSearch = !q || quoteNum.includes(q) || (item.client?.client_name ?? '').toLowerCase().includes(q);
    const effectiveStatus = getEffectiveStatus(item);
    const matchesTab = activeTab === 'all' || effectiveStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  function getEffectiveStatus(item: InvoiceItem): string {
    if (item.status === 'sent' && (item.due_date ?? item.valid_until)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(item.due_date ?? item.valid_until ?? '');
      due.setHours(0, 0, 0, 0);
      if (due < today) return 'expired';
    }
    return item.status;
  }

  const renderItem = ({ item }: { item: InvoiceItem }) => (
    <QuoteCard
      item={item}
      onPress={setSelectedItem}
      openMenuId={openMenuId}
      onMenuToggle={setOpenMenuId}
      onDuplicate={handleDuplicate}
      onMarkAccepted={handleMarkAccepted}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.newHeader}>
        {/* Back pill */}
        <TouchableOpacity
          style={styles.headerPillBtn}
          onPress={() => nav.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={16} color="#FFFFFF" />
          <Text style={styles.headerPillBtnText}>{t('button_retour')}</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitle}>{t('status_quotes')}</Text>

        {/* Right: month selector + export icon */}
        <View style={styles.headerRightRow}>
          {/* Month picker trigger */}
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.headerPillBtn}
              onPress={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
              activeOpacity={0.8}
            >
              <Text style={styles.headerPillBtnText}>{monthBtnLabel}</Text>
              <ChevronDown size={14} color="#FFFFFF" />
            </TouchableOpacity>

            {showMonthPicker && (
              <View style={[styles.dropdown, { top: 46, right: 0, left: undefined, minWidth: 180, maxHeight: 320 }]}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedMonth(null); setSelectedYear(null); setShowMonthPicker(false); }}
                  >
                    <Text style={styles.dropdownItemText}>{t('filter_all_months')}</Text>
                  </TouchableOpacity>
                  {YEARS.map(y => (
                    <View key={y}>
                      <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF' }}>{y}</Text>
                      </View>
                      {MONTHS.map(m => (
                        <TouchableOpacity
                          key={`${y}-${m}`}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedMonth(m);
                            setSelectedYear(y);
                            setShowMonthPicker(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedMonth === m && selectedYear === y && styles.dropdownItemSelected,
                          ]}>{m}</Text>
                          {selectedMonth === m && selectedYear === y && (
                            <Text style={styles.dropdownCheck}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Export icon */}
          <TouchableOpacity
            style={styles.exportIconBtn}
            onPress={handleExport}
            disabled={exporting}
            activeOpacity={0.8}
          >
            {exporting
              ? <ActivityIndicator size="small" color="#4B5563" />
              : <Upload size={16} color="#4B5563" />
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#F3F4F6', borderRadius: 12,
          paddingHorizontal: 12, height: 44,
        }}>
          <Search size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: '#111827' }}
            placeholder={t('placeholder_search_invoice')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={15} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Pill Filter Tabs ────────────────────────────────────────── */}
      <View style={styles.pillTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillTabsContainer}
        >
          {QUOTE_TABS.map(tab => {
            const isActive = activeTab === tab;
            const isExpired = tab === 'expired';
            const tabColor = TAB_COLORS[tab];
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.pillTab,
                  isActive && { backgroundColor: tabColor, borderColor: tabColor },
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.pillTabText,
                  isActive && styles.pillTabTextActive,
                ]}>
                  {t(TAB_LABEL_KEYS[tab])}
                </Text>
                {isExpired && overdueCount > 0 && (
                  <View style={styles.pillTabBadge}>
                    <Text style={styles.pillTabBadgeText}>{overdueCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.listContent, { gap: 12 }]}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setOpenMenuId(null)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                fetchQuotes(getFilterParams());
                fetchChartData();
              }}
              tintColor="#1E5BAC"
            />
          }
          ListHeaderComponent={
            <View style={{ gap: 12, marginBottom: 4 }}>
              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  {t('invoice_summary_ca', { amount: totalRevenue.toLocaleString('fr-FR') })}
                </Text>
                <View style={styles.summaryIndicatorsRow}>
                  <View style={styles.summaryIndicator}>
                    <View style={[styles.summaryDot, { backgroundColor: '#16A34A' }]} />
                    <Text style={styles.summaryIndicatorText}>
                      <Text style={styles.summaryIndicatorAmount}>
                        {collectedAmt.toLocaleString('fr-FR')}
                      </Text>
                      {' '}{t('status_accepted')}
                    </Text>
                  </View>
                  <View style={styles.summaryIndicator}>
                    <View style={[styles.summaryDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.summaryIndicatorText}>
                      <Text style={styles.summaryIndicatorAmount}>
                        {pendingAmt.toLocaleString('fr-FR')}
                      </Text>
                      {' '}{t('status_sent')}
                    </Text>
                  </View>
                  <View style={styles.summaryIndicator}>
                    <View style={[styles.summaryDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.summaryIndicatorText}>
                      <Text style={styles.summaryIndicatorAmount}>
                        {overdueAmt.toLocaleString('fr-FR')}
                      </Text>
                      {' '}{t('invoice_summary_retard')}
                      {/* {' '}{t('status_expired')} */}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Overdue Alert */}
              {overdueCount > 0 && (
                <View style={styles.overdueAlert}>
                  <View style={styles.overdueAlertLeft}>
                    <View style={styles.overdueAlertIcon}>
                      <AlertTriangle size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.overdueAlertText}>
                      {overdueCount > 1
                        ? t('invoice_overdue_alert_other', { count: overdueCount })
                        : t('invoice_overdue_alert_one', { count: overdueCount })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.overdueAlertBtn}
                    onPress={handleRelancerAll}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.overdueAlertBtnText}>{t('invoice_relancer_tout')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Receipt size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('empty_no_quotes')}</Text>
            </View>
          }
          ListFooterComponent={
            <QuotePieChart
              loading={pieLoading}
              chartData={pieChartData}
              convertedQuotes={convertedQuotes}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Create Modal */}
      <CreateQuoteModal
        visible={showCreateModal}
        onClose={() => { setShowCreateModal(false); setDefaultClientId(undefined); }}
        accounts={accounts}
        clients={clients}
        customerId={user?.id ?? 0}
        onCreated={() => fetchQuotes(getFilterParams())}
        onSave={createQuote}
        onClientsRefresh={refreshClients}
        defaultClientId={defaultClientId}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleDeleteQuote}
          onEdit={() => handleEditInvoice(selectedItem)}
          onUpdate={updateQuote}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <CreateQuoteModal
          visible={!!editingItem}
          onClose={() => setEditingItem(null)}
          accounts={accounts}
          clients={clients}
          customerId={user?.id ?? 0}
          onCreated={() => fetchQuotes(getFilterParams())}
          onSave={createQuote}
          editItem={editingItem}
          onUpdate={updateQuote}
          onClientsRefresh={refreshClients}
        />
      )}
    </SafeAreaView>
  );
};

export default Quote;
