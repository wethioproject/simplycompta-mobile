import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  Share,
  Linking,
  TouchableOpacity,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchChecklist } from '../../store/slices/onboardingSlice';
import { StackNavigationProp } from '@react-navigation/stack';
import { Plus, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useExpense } from '../../hooks/useExpense';
import { canUseFeature } from '../../utils/subscriptionHelpers';
import { loadSubscription } from '../../store/slices/subscriptionSlice';
import type { AppDispatch } from '../../store';
import { useSupplier } from '../../hooks/useSupplier';
import dashboardService from '../../services/dashboardService';
import type { ExpenseCategoryItem } from '../../services/dashboardService';

import ExpenseHeader from '../../components/expense/ExpenseHeader';
import ExpenseFilters from '../../components/expense/ExpenseFilters';
import ExpenseItemCard from '../../components/expense/ExpenseItemCard';
import ExpensePieChart from '../../components/expense/ExpensePieChart';
import ExpenseDetailModal from '../../components/expense/ExpenseDetailModal';
import CreateExpenseModal from '../../components/expense/CreateExpenseModal';
import ExpenseSkeleton from '../../components/expense/ExpenseSkeleton';
import { FontFamily, FontWeight } from '../../theme/typography';

import type { ExpenseItem, Account, Supplier } from '../../types/expense.types';
import { styles } from '../../styles/expenses.styles';
import { useUpgradeWebView } from '../../utils/upgradeWebView';

type StackNavigation = StackNavigationProp<any>;

const Expenses: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const route = useRoute<any>();
  const { t } = useTranslation();
  const user = useSelector((state: any) => state.user.customer);
  const subscription = useSelector((state: any) => state.subscription.data);
  const upgradeUrl = subscription?.upgrade_url;
  const dispatch = useDispatch<AppDispatch>();
  const { openUpgradeWebView, upgradeWebViewElement } = useUpgradeWebView();

  const {
    getExpenses,
    getExpenseResources,
    createExpense,
    updateExpense,
    exportExpenses,
    duplicateExpense,
    deleteExpense,
  } = useExpense();
  const { getSuppliers } = useSupplier();
  const { getExpenseCategoryChart } = dashboardService;

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [pieLoading, setPieLoading] = useState(true);
  const [pieCategories, setPieCategories] = useState<ExpenseCategoryItem[]>([]);
  const [defaultSupplierId, setDefaultSupplierId] = useState<number | undefined>(undefined);
  const [ocrSupplierData, setOcrSupplierData] = useState<any>(undefined);

  const MONTHS = [
    t('month_january'), t('month_february'), t('month_march'), t('month_april'),
    t('month_may'), t('month_june'), t('month_july'), t('month_august'),
    t('month_september'), t('month_october'), t('month_november'), t('month_december'),
  ];
  const YEARS = ['2026', '2025', '2024'];
  const isFilterMount = useRef(false);

  const getFilterParams = () => {
    const monthNum = selectedMonth !== null ? MONTHS.indexOf(selectedMonth) + 1 : undefined;
    const yearNum = selectedYear !== null ? parseInt(selectedYear) : undefined;
    return (monthNum || yearNum) ? { month: monthNum, year: yearNum } : undefined;
  };

  const fetchData = async (params?: { month?: number; year?: number }) => {
    try {
      const [expensesResult, resourcesResult, suppliersResult, pieChartResult] = await Promise.all([
        getExpenses(params),
        getExpenseResources(),
        getSuppliers(),
        getExpenseCategoryChart(params),
      ]);
      if (expensesResult.success) setExpenses(expensesResult.expenses ?? []);
      if (resourcesResult.success) {
        setAccounts(resourcesResult.resources?.accounts ?? []);
        setCategories(resourcesResult.resources?.categories ?? []);
      }
      if (suppliersResult.success) {
        setSuppliers(
          (suppliersResult.suppliers ?? []).map((s: any) => ({
            id: s.id,
            name: s.company_name || s.supplier_name || s.name,
          }))
        );
      }
      if (pieChartResult?.success) {
        setPieCategories(pieChartResult.data ?? []);
      }
    } catch {
      Alert.alert(t('error_title'), t('error_load_expenses'));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPieLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!isFilterMount.current) { isFilterMount.current = true; return; }
    setLoading(true);
    fetchData(getFilterParams());
  }, [selectedMonth, selectedYear]);

  const fromChecklistRef = useRef(false);

  useEffect(() => {
    if (!loading && route.params?.openCreateModal) {
      fromChecklistRef.current = true;
      setDefaultSupplierId(route.params?.defaultSupplierId ?? undefined);
      setOcrSupplierData(route.params?.ocrSupplierData ?? undefined);
      setShowCreateModal(true);
      navigation.setParams({ openCreateModal: undefined, defaultSupplierId: undefined } as any);
    }
  }, [loading, route.params?.openCreateModal]);

  const refreshSuppliers = async () => {
    try {
      const result = await getSuppliers();
      if (result.success) {
        setSuppliers(
          (result.suppliers ?? []).map((s: any) => ({
            id: s.id,
            name: s.company_name || s.supplier_name || s.name,
          }))
        );
      }
    } catch {}
  };

  const handleDuplicateExpense = async (id: number) => {
    const result = await duplicateExpense(id);
    if (result.success) {
      fetchData();
    } else {
      Alert.alert(t('error_title'), result.error ?? t('error_generic'));
    }
  };

  const handleDeleteExpense = async (id: number) => {
    const result = await deleteExpense(id);
    if (result.success) {
      setSelectedItem(null);
      fetchData();
      dispatch(loadSubscription() as any);
      Alert.alert(t('success_title'), t('success_expense_deleted'));
    } else {
      Alert.alert(t('error_title'), result.error ?? t('error_delete_expense'));
    }
  };

  const handleEditExpense = (item: ExpenseItem) => {
    setSelectedItem(null);
    setEditingItem(item);
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
      const result = await exportExpenses();
      if (result.success && result.csvData) {
        const { fs } = ReactNativeBlobUtil;
        const fileName = result.fileName || 'expenses_export.csv';
        const filePath = `${fs.dirs.CacheDir}/${fileName}`;
        if (await fs.exists(filePath)) await fs.unlink(filePath);
        await fs.writeFile(filePath, result.csvData, 'utf8');
        if (Platform.OS === 'ios') {
          await Share.share({ url: `file://${filePath}` });
        } else {
          await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'text/csv');
        }
      } else {
        Alert.alert(t('error_title'), result.error ?? t('error_export_expenses'));
      }
    } catch {
      Alert.alert(t('error_title'), t('error_document_unavailable'));
    } finally {
      setExporting(false);
    }
  };

  const filtered = expenses.filter(expense => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      expense.payment_method.toLowerCase().includes(q) ||
      (expense.category?.name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ExpenseHeader
        onBack={() => nav.goBack()}
        onExport={handleExport}
        exporting={exporting}
      />

      <ExpenseFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        showMonthPicker={showMonthPicker}
        showYearPicker={showYearPicker}
        months={MONTHS}
        years={YEARS}
        onMonthToggle={() => { setShowMonthPicker(p => !p); setShowYearPicker(false); }}
        onYearToggle={() => { setShowYearPicker(p => !p); setShowMonthPicker(false); }}
        onMonthSelect={m => { setSelectedMonth(m); setShowMonthPicker(false); }}
        onYearSelect={y => { setSelectedYear(y); setShowYearPicker(false); }}
      />

      {/* Alert card */}
      {!loading && expenses.length > 0 && (
        <View style={[styles.expenseAlertCard, { marginHorizontal: 16, marginBottom: 8 }]}>
          <View style={styles.expenseAlertLeft}>
            <View style={styles.expenseAlertIcon}>
              <AlertTriangle size={18} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.expenseAlertText}>
              {t('expense_alert_count', {
                count: filtered.length,
                month: selectedMonth ?? MONTHS[new Date().getMonth()],
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.expenseAlertBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Activity')}>
            <Text style={styles.expenseAlertBtnText}>{t('expense_voir_statistiques')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ExpenseSkeleton />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <ExpenseItemCard item={item} onPress={setSelectedItem} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData(selectedMonth || selectedYear ? getFilterParams() : undefined);
              }}
              tintColor="#1E5BAC"
            />
          }
          ListFooterComponent={
            pieCategories.length > 0 ? (
              <ExpensePieChart loading={pieLoading} pieCategories={pieCategories} />
            ) : null
          }
          ListEmptyComponent={
              <View style={styles.emptyBoxLarge}>
                {/* Icon */}
                <View style={styles.emptyIconContainer}>
                  <AlertTriangle size={36} color="#1E5BAC" />
                </View>

                {/* Title */}
                <Text style={[styles.emptyTitle, { fontFamily: FontFamily.display, fontWeight: FontWeight.bold }]}>
                  {t('empty_no_expenses_title') || t('empty_no_expenses')}
                </Text>

                {/* Subtitle */}
                <Text style={[styles.emptySubtitle, { fontFamily: FontFamily.regular, fontWeight: FontWeight.regular }]}>
                  {t('empty_no_expenses_hint') || t('empty_no_expenses')}
                </Text>

                {/* CTA */}
                <TouchableOpacity
                  style={[styles.emptyCTABtn, { gap: 8 }]}
                  onPress={() => setShowCreateModal(true)}
                  activeOpacity={0.85}
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={[styles.emptyCTAText, { fontFamily: FontFamily.display, fontWeight: FontWeight.bold }]}>
                    {t('button_create_expense') || t('button_new')}
                  </Text>
                </TouchableOpacity>
              </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Create modal */}
      <CreateExpenseModal
        visible={showCreateModal}
        accounts={accounts}
        customerId={user?.id ?? 0}
        categories={categories}
        suppliers={suppliers}
        onSave={createExpense}
        onClose={() => { setShowCreateModal(false); setDefaultSupplierId(undefined); }}
        onCreated={async () => {
          await fetchData();
          if (fromChecklistRef.current) {
            fromChecklistRef.current = false;
            dispatch(fetchChecklist() as any);
            navigation.navigate('Home' as any);
          }
        }}
        onClose={() => {
          setShowCreateModal(false);
          setDefaultSupplierId(undefined);
          setOcrSupplierData(undefined);
        }}
        onCreated={fetchData}
        onSuppliersRefresh={refreshSuppliers}
        defaultSupplierId={defaultSupplierId}
        ocrSupplierData={ocrSupplierData}
      />

      {/* Edit modal */}
      {editingItem && (
        <CreateExpenseModal
          visible={!!editingItem}
          accounts={accounts}
          customerId={user?.id ?? 0}
          categories={categories}
          suppliers={suppliers}
          onSave={createExpense}
          onClose={() => setEditingItem(null)}
          onCreated={fetchData}
          editItem={editingItem}
          onUpdate={updateExpense}
          onSuppliersRefresh={refreshSuppliers}
        />
      )}

      {/* Detail modal */}
      {selectedItem && (
        <ExpenseDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleDeleteExpense}
          onDuplicate={handleDuplicateExpense}
          onEdit={() => handleEditExpense(selectedItem)}
        />
      )}
          {upgradeWebViewElement}
    </SafeAreaView>
  );
};


export default Expenses;
