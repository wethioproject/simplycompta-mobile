import React, { useState, useEffect, useRef } from 'react';
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
  Linking,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
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
import { useInvoice } from '../../hooks/useInvoice';
import { canUseFeature } from '../../utils/subscriptionHelpers';
import { loadSubscription } from '../../store/slices/subscriptionSlice';
import { fetchChecklist } from '../../store/slices/onboardingSlice';
import type { AppDispatch } from '../../store';
import { useInvoiceList } from '../../hooks/useInvoiceList';
import CreateInvoiceModal from '../../components/invoice/CreateInvoiceModal';
import DetailModal from '../../components/invoice/DetailModal';
import InvoiceCard from '../../components/invoice/InvoiceCard';
import InvoiceSkeleton from '../../components/invoice/InvoiceSkeleton';
import { FontFamily, FontWeight } from '../../theme/typography';
import type { Account, Category, Client, InvoiceItem, InvoiceTabType, StackNavigation } from '../../types/invoice.types';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import { INVOICE_TABS } from '../../types/invoice.types';
import i18n from '../../i18n/i18n';
import { useUpgradeWebView } from '../../utils/upgradeWebView';

/** i18n key for each tab */
const TAB_LABEL_KEYS: Record<InvoiceTabType, string> = {
  Tous:      'tab_all',
  issued:    'status_issued',
  paid:      'status_paid',
  cancelled: 'status_cancelled',
};

/** Active background color for each tab */
const TAB_COLORS: Record<InvoiceTabType, string> = {
  Tous:      '#1E5BAC',
  issued:    '#3B82F6',
  paid:      '#16A34A',
  cancelled: '#EF4444',
};

const Invoice: React.FC = ({ navigation: navProp }: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const route = useRoute<any>();
  const { createInvoice, updateInvoice, exportInvoices, deleteInvoice, getInvoiceResources, duplicateInvoice, updateInvoiceStatus } = useInvoice();
  const token = useSelector((state: any) => state.user.token);
  const user = useSelector((state: any) => state.user.customer);
  const subscription = useSelector((state: any) => state.subscription.data);
  const upgradeUrl = subscription?.upgrade_url;
  const dispatch = useDispatch<AppDispatch>();
  const { openUpgradeWebView, upgradeWebViewElement } = useUpgradeWebView();

  const {
    invoices,
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
    fetchInvoices,
    getFilterParams,
  } = useInvoiceList();

  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [defaultClientId, setDefaultClientId] = useState<number | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<InvoiceTabType>('Tous');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const MONTHS = [t('month_january'), t('month_february'), t('month_march'), t('month_april'), t('month_may'), t('month_june'), t('month_july'), t('month_august'), t('month_september'), t('month_october'), t('month_november'), t('month_december')];
  const YEARS = ['2026', '2025', '2024'];

  /* ─── Derived stats (from API) ─── */
  const totalRevenue = stats?.total_sum_all ?? 0;
  const collectedAmt = stats?.total_sum_paid ?? 0;
  const pendingAmt   = stats?.total_sum_issued ?? 0;
  const overdueAmt   = stats?.total_sum_cancelled ?? 0;
  const overdueCount = invoices.filter(i => i.status === 'cancelled').length;

  /* ─── Month button label ─── */
  const now = new Date();
  const currentMonthLabel = now.toLocaleString(i18n.language, { month: 'long' });
  const currentYearLabel  = String(now.getFullYear());
  const monthBtnLabel = selectedMonth && selectedYear 
    ? `${selectedMonth} ${selectedYear}` 
    : t('filter_all_months');

  const fetchResources = async () => {
    try {
      const resourcesResult = await getInvoiceResources();
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

  const refreshClients = async (): Promise<Client[]> => {
    try {
      const resourcesResult = await getInvoiceResources();
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
    Promise.all([fetchResources(), fetchInvoices(getFilterParams())]);
  }, []);

  const handleEditInvoice = (item: InvoiceItem) => {
    setSelectedItem(null);
    setEditingItem(item);
  };

  const handleDeleteInvoice = async (id: number) => {
    const result = await deleteInvoice(id);
    if (result.success) {
      setSelectedItem(null);
      fetchInvoices(getFilterParams());
      dispatch(loadSubscription() as any);
      Alert.alert(t('success_title'), t('success_invoice_deleted'));
    } else {
      Alert.alert(t('error_title'), result.error ?? t('error_delete_invoice'));
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    if (!canUseFeature(subscription, 'export_enabled')) {
      Alert.alert(t('subscription_limit_title'), t('subscription_limit_export'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
      ]);
      return;
    }
    setExporting(true);
    try {
      const result = await exportInvoices();
      if (result.success && result.csvData) {
        const { fs } = ReactNativeBlobUtil;
        const fileName = result.fileName || 'invoices_export.csv';
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
    } catch (e) {
      console.error('Export error:', e);
      Alert.alert(t('error_title'), t('error_document_not_found'));
    } finally {
      setExporting(false);
    }
  };

  const handleDuplicate = async (item: InvoiceItem) => {
    if (!canUseFeature(subscription, 'invoices')) {
      Alert.alert(t('subscription_limit_title'), t('subscription_limit_invoices'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
      ]);
      return;
    }
    const result = await duplicateInvoice(item.id);
    if (result.success) {
      fetchInvoices(getFilterParams());
      dispatch(loadSubscription() as any);
      Alert.alert(t('success'), t('success_invoice_duplicated'));
    } else {
      Alert.alert(t('error'), result.error ?? t('error_generic'));
    }
  };

  const handleMarkPaid = async (item: InvoiceItem) => {
    const newStatus = item.status === 'paid' ? 'issued' : 'paid';
    const result = await updateInvoiceStatus(item.id, newStatus);
    if (result.success) {
      fetchInvoices(getFilterParams());
    } else {
      Alert.alert(t('error'), result.error ?? t('error_generic'));
    }
  };

  const handleRelancerAll = () => {
    Alert.alert(t('invoice_relancer_tout'), t('error_generic'));
  };

  const fromChecklistRef = useRef(false);

  useEffect(() => {
    if (!loading && route.params?.openCreateModal) {
      fromChecklistRef.current = true;
      setDefaultClientId(route.params?.defaultClientId ?? undefined);
      setShowCreateModal(true);
    }
  }, [loading, route.params?.openCreateModal]);

  const filtered = invoices.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || item.invoice_number.toLowerCase().includes(q) || (item.client?.client_name ?? '').toLowerCase().includes(q);
    const matchesTab = activeTab === 'Tous' || item.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const renderItem = ({ item }: { item: InvoiceItem }) => (
    <InvoiceCard
      item={item}
      onPress={setSelectedItem}
      openMenuId={openMenuId}
      onMenuToggle={setOpenMenuId}
      onMarkPaid={handleMarkPaid}
      onDuplicate={handleDuplicate}
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
        <Text style={styles.headerTitle}>{t('title_invoices')}</Text>

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
          {INVOICE_TABS.map(tab => {
            const isActive = activeTab === tab;
            const isCancelled = tab === 'cancelled';
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
                {isCancelled && overdueCount > 0 && (
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
        <InvoiceSkeleton />
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
              onRefresh={() => fetchInvoices(getFilterParams())}
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
                      {' '}{t('status_paid')}
                    </Text>
                  </View>
                  <View style={styles.summaryIndicator}>
                    <View style={[styles.summaryDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.summaryIndicatorText}>
                      <Text style={styles.summaryIndicatorAmount}>
                        {pendingAmt.toLocaleString('fr-FR')}
                      </Text>
                      {' '}{t('status_issued')}
                    </Text>
                  </View>
                  <View style={styles.summaryIndicator}>
                    <View style={[styles.summaryDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.summaryIndicatorText}>
                      <Text style={styles.summaryIndicatorAmount}>
                        {overdueAmt.toLocaleString('fr-FR')}
                      </Text>
                      {' '}{t('status_cancelled')}
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
              {/* Icon container */}
                  <View style={styles.emptyIconContainer}>
                    <Receipt size={36} color="#1E5BAC" />
                  </View>

              {/* Title */}
              <Text style={[styles.emptyTitle, { fontFamily: FontFamily.display, fontWeight: FontWeight.bold }]}>
                {t('empty_no_invoices_title') || t('empty_no_invoices')}
              </Text>

              {/* Subtitle */}
              <Text style={[styles.emptySubtitle, { fontFamily: FontFamily.regular, fontWeight: FontWeight.regular }]}>
                {t('empty_no_invoices_hint') || t('empty_no_invoices')}
              </Text>

              {/* CTA */}
              <TouchableOpacity
                style={[styles.emptyCTABtn, { gap: 8 }]}
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.85}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={[styles.emptyCTAText, { fontFamily: FontFamily.display, fontWeight: FontWeight.bold }]}>
                  {t('button_create_invoice') || t('button_new')}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Create Modal */}
      <CreateInvoiceModal
        visible={showCreateModal}
        onClose={() => { setShowCreateModal(false); setDefaultClientId(undefined); }}
        accounts={accounts}
        clients={clients}
        customerId={user?.id ?? 0}
        onCreated={() => {
          fetchInvoices(getFilterParams());
          if (fromChecklistRef.current) {
            fromChecklistRef.current = false;
            dispatch(fetchChecklist() as any);
            navigation.navigate('Home' as any);
          }
        }}
        onSave={createInvoice}
        onClientsRefresh={refreshClients}
        defaultClientId={defaultClientId}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleDeleteInvoice}
          onEdit={() => handleEditInvoice(selectedItem)}
          onUpdate={updateInvoice}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <CreateInvoiceModal
          visible={!!editingItem}
          onClose={() => setEditingItem(null)}
          accounts={accounts}
          clients={clients}
          customerId={user?.id ?? 0}
          onCreated={() => fetchInvoices(getFilterParams())}
          onSave={createInvoice}
          editItem={editingItem}
          onUpdate={updateInvoice}
          onClientsRefresh={refreshClients}
        />
      )}
          {upgradeWebViewElement}
    </SafeAreaView>
  );
};

export default Invoice;

