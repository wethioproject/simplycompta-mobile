import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  Upload,
  Receipt,
} from 'lucide-react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { appLogoIcon } from '../../assets/icons';
import { useInvoice } from '../../hooks/useInvoice';
import { useInvoiceList } from '../../hooks/useInvoiceList';
import CreateInvoiceModal from '../../components/invoice/CreateInvoiceModal';
import DetailModal from '../../components/invoice/DetailModal';
import InvoiceCard from '../../components/invoice/InvoiceCard';
import type { Account, Category, Client, InvoiceItem, InvoiceTabType, StackNavigation } from '../../types/invoice.types';
import { invoiceStyles as styles } from '../../styles/invoice.styles';

import { INVOICE_TABS } from '../../types/invoice.types';

const Invoice: React.FC = ({ navigation: navProp }: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const route = useRoute<any>();
  const { createInvoice, updateInvoice, exportInvoices, deleteInvoice, getInvoiceResources } = useInvoice();
  const token = useSelector((state: any) => state.user.token);
  const user = useSelector((state: any) => state.user.customer);

  const {
    invoices,
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<InvoiceTabType>('Tous');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const MONTHS = [t('month_january'), t('month_february'), t('month_march'), t('month_april'), t('month_may'), t('month_june'), t('month_july'), t('month_august'), t('month_september'), t('month_october'), t('month_november'), t('month_december')];
  const YEARS = ['2026', '2025', '2024'];

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

  const refreshClients = async () => {
    try {
      const resourcesResult = await getInvoiceResources();
      if (resourcesResult.success) {
        setClients(
          (resourcesResult.resources?.clients ?? []).map((c: any) => ({
            id: c.id,
            name: c.client_name,
          }))
        );
      }
    } catch {}
  };

  useEffect(() => {
    fetchResources();
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
      Alert.alert(t('success_title'), t('success_invoice_deleted'));
    } else {
      Alert.alert(t('error_title'), result.error ?? t('error_delete_invoice'));
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = await exportInvoices();
      if (result.success && result.csvData) {
        const { fs } = ReactNativeBlobUtil;
        const fileName = result.fileName || 'invoices_export.csv';
        const filePath = `${fs.dirs.CacheDir}/${fileName}`;

        // Remove stale cached file if present
        if (await fs.exists(filePath)) await fs.unlink(filePath);

        // Write CSV string directly to file — no second network request needed
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

  useEffect(() => {
    if (!loading && route.params?.openCreateModal) {
      setShowCreateModal(true);
    }
  }, [loading, route.params?.openCreateModal]);

  const filtered = invoices.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || t.invoice_number.toLowerCase().includes(q) || (t.client?.client_name ?? '').toLowerCase().includes(q);
    const matchesTab = activeTab === 'Tous' || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const renderItem = ({ item }: { item: InvoiceItem }) => (
    <InvoiceCard item={item} onPress={setSelectedItem} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}

            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
              </View>
              <View style={styles.titleRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => nav.goBack()} activeOpacity={0.7}>
                  <ArrowLeft size={20} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.titleText}>{t('title_invoices')}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting} activeOpacity={0.8}>
                  {exporting
                    ? <ActivityIndicator size="small" color="#4B5563" />
                    : <Upload size={15} color="#4B5563" />
                  }
                  <Text style={styles.exportBtnText}>{t('button_export')}</Text>
                </TouchableOpacity>
              </View>
            </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {/* Month */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={[styles.filterBtn, selectedMonth !== null && styles.filterBtnActive]}
            onPress={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, selectedMonth !== null && styles.filterBtnTextActive]}>{selectedMonth ?? t('filter_month')}</Text>
            <ChevronDown size={14} color={selectedMonth !== null ? '#1E5BAC' : '#6B7280'} />
          </TouchableOpacity>
          {showMonthPicker && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedMonth(null); setShowMonthPicker(false); }}>
                <Text style={styles.dropdownItemText}>{t('filter_all_months')}</Text>
              </TouchableOpacity>
              {MONTHS.map(m => (
                <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setSelectedMonth(m); setShowMonthPicker(false); }}>
                  <Text style={[styles.dropdownItemText, selectedMonth === m && styles.dropdownItemSelected]}>{m}</Text>
                  {selectedMonth === m && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Year */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={[styles.filterBtn, selectedYear !== null && styles.filterBtnActive]}
            onPress={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, selectedYear !== null && styles.filterBtnTextActive]}>{selectedYear ?? t('filter_year')}</Text>
            <ChevronDown size={14} color={selectedYear !== null ? '#1E5BAC' : '#6B7280'} />
          </TouchableOpacity>
          {showYearPicker && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedYear(null); setShowYearPicker(false); }}>
                <Text style={styles.dropdownItemText}>{t('filter_all_years')}</Text>
              </TouchableOpacity>
              {YEARS.map(y => (
                <TouchableOpacity key={y} style={styles.dropdownItem} onPress={() => { setSelectedYear(y); setShowYearPicker(false); }}>
                  <Text style={[styles.dropdownItemText, selectedYear === y && styles.dropdownItemSelected]}>{y}</Text>
                  {selectedYear === y && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsWrapper}
        contentContainerStyle={styles.tabsContainer}
      >
        {INVOICE_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List + Pie Chart */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { fetchInvoices(getFilterParams()); }} tintColor="#1E5BAC" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Receipt size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('empty_no_invoices')}</Text>
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
        onClose={() => setShowCreateModal(false)}
        accounts={accounts}
        clients={clients}
        customerId={user?.id ?? 0}
        onCreated={() => fetchInvoices(getFilterParams())}
        onSave={createInvoice}
        onClientsRefresh={refreshClients}
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
    </SafeAreaView>
  );
};


export default Invoice;
