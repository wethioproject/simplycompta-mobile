import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  Platform,
  RefreshControl,
  Share,
  ScrollView,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchChecklist } from '../../store/slices/onboardingSlice';
import { StackNavigationProp } from '@react-navigation/stack';
import { Plus, AlertTriangle, FileText, HandCoins, Lightbulb, ScanLine, Sparkles, Store, Tags, TrendingDown, TrendingUp, X } from 'lucide-react-native';
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
import { FadeInView } from '../../components/common/PremiumMotion';

import type { ExpenseItem, Account, Supplier, Category } from '../../types/expense.types';
import { styles } from '../../styles/expenses.styles';
import { useUpgradeWebView } from '../../utils/upgradeWebView';
import { formatCurrency, resolveCategoryKey } from '../../utils/expense.helpers';

type StackNavigation = StackNavigationProp<any>;
type DatePreset = 'all' | 'this_month' | 'last_month' | 'last_7_days';
type SmartAlertSeverity = 'info' | 'warning' | 'critical';
type SmartAlert = {
  id: string;
  severity: SmartAlertSeverity;
  title: string;
  description: string;
  icon: 'duplicate' | 'document' | 'amount' | 'ocr' | 'supplier' | 'category' | 'month' | 'quota';
  cta?: string;
  expense?: ExpenseItem;
  categoryId?: number;
  supplierId?: number;
  action?: 'missing_document' | 'ocr' | 'category' | 'supplier' | 'this_month';
};

const toAmount = (value: unknown) => {
  const number = typeof value === 'string' ? parseFloat(value) : Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const toExpenseDate = (expense: ExpenseItem) => {
  const date = new Date(expense.date);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameMonth = (date: Date | null, month: number, year: number) =>
  Boolean(date && date.getMonth() === month && date.getFullYear() === year);

const getSupplierName = (expense: ExpenseItem) =>
  expense.supplier?.company_name || expense.supplier?.supplier_name || expense.supplier?.name || '';

const isOcrExpense = (expense: ExpenseItem) =>
  Boolean(expense.is_ocr || expense.ocr_raw || expense.ocr_items?.length);

const hasDocument = (expense: ExpenseItem) => Boolean(expense.file || expense.file_url);

const getCategoryName = (expense: ExpenseItem, categories: Category[]) => {
  const id = expense.category?.id ?? expense.category_id;
  return expense.category?.name || categories.find(c => c.id === id)?.name || '';
};

const getSupplierIce = (expense: ExpenseItem, suppliers: Supplier[]) => {
  const id = expense.supplier?.id ?? expense.supplier_id;
  const supplier = suppliers.find(s => s.id === id);
  return expense.supplier?.ice || expense.supplier?.ice_number || supplier?.ice || supplier?.ice_number || '';
};

const getOcrConfidence = (expense: ExpenseItem) => {
  const raw = expense.ocr_confidence_score ?? expense.ocr_raw?.confidence ?? expense.ocr_raw?.confidence_score;
  const value = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  if (!Number.isFinite(value)) return null;
  return value > 1 ? value / 100 : value;
};

const hasOcrWarning = (expense: ExpenseItem) =>
  Boolean(expense.ocr_warnings?.length || expense.warnings?.length || expense.ocr_raw?.warnings?.length);

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [pieLoading, setPieLoading] = useState(true);
  const [pieCategories, setPieCategories] = useState<ExpenseCategoryItem[]>([]);
  const [defaultSupplierId, setDefaultSupplierId] = useState<number | undefined>(undefined);
  const [ocrSupplierData, setOcrSupplierData] = useState<any>(undefined);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [withDocumentOnly, setWithDocumentOnly] = useState(false);
  const [missingDocumentOnly, setMissingDocumentOnly] = useState(false);
  const [ocrOnly, setOcrOnly] = useState(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  const MONTHS = [
    t('month_january'), t('month_february'), t('month_march'), t('month_april'),
    t('month_may'), t('month_june'), t('month_july'), t('month_august'),
    t('month_september'), t('month_october'), t('month_november'), t('month_december'),
  ];
  const YEARS = ['2026', '2025', '2024'];
  const isFilterMount = useRef(false);

  const haptic = useCallback(() => Vibration.vibrate(8), []);

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
            company_name: s.company_name,
            supplier_name: s.supplier_name,
            ice: s.ice,
            ice_number: s.ice_number,
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
      navigation.setParams({ openCreateModal: undefined, defaultSupplierId: undefined, ocrSupplierData: undefined } as any);
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
            company_name: s.company_name,
            supplier_name: s.supplier_name,
            ice: s.ice,
            ice_number: s.ice_number,
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

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

  const dateScopedExpenses = React.useMemo(() => {
    const last7 = new Date();
    last7.setDate(last7.getDate() - 6);
    last7.setHours(0, 0, 0, 0);

    return expenses.filter(expense => {
      const date = toExpenseDate(expense);
      if (datePreset === 'this_month') return isSameMonth(date, currentMonth, currentYear);
      if (datePreset === 'last_month') return isSameMonth(date, previousMonthDate.getMonth(), previousMonthDate.getFullYear());
      if (datePreset === 'last_7_days') return Boolean(date && date >= last7);
      return true;
    });
  }, [expenses, datePreset, currentMonth, currentYear, previousMonthDate]);

  const analytics = React.useMemo(() => {
    const previousMonthExpenses = expenses.filter(expense => isSameMonth(toExpenseDate(expense), previousMonthDate.getMonth(), previousMonthDate.getFullYear()));
    const total = dateScopedExpenses.reduce((sum, expense) => sum + toAmount(expense.total_ttc || expense.ttc), 0);
    const tva = dateScopedExpenses.reduce((sum, expense) => sum + toAmount(expense.total_tva || expense.tva), 0);
    const previousTotal = previousMonthExpenses.reduce((sum, expense) => sum + toAmount(expense.total_ttc || expense.ttc), 0);
    const trendPct = datePreset === 'this_month' && previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null;

    const categoryTotals = new Map<number, { id: number; name: string; total: number; count: number }>();
    dateScopedExpenses.forEach(expense => {
      const id = expense.category?.id ?? expense.category_id;
      const name = expense.category?.name || categories.find(c => c.id === id)?.name || t('expense_cat_autres_depenses');
      const current = categoryTotals.get(id) ?? { id, name, total: 0, count: 0 };
      current.total += toAmount(expense.total_ttc || expense.ttc);
      current.count += 1;
      categoryTotals.set(id, current);
    });
    const breakdown = Array.from(categoryTotals.values()).sort((a, b) => b.total - a.total);

    const supplierTotals = new Map<number, { id: number; name: string; total: number; count: number }>();
    dateScopedExpenses.forEach(expense => {
      const id = expense.supplier?.id ?? expense.supplier_id;
      if (!id) return;
      const name = getSupplierName(expense) || suppliers.find(s => s.id === id)?.name || suppliers.find(s => s.id === id)?.company_name || t('label_supplier');
      const current = supplierTotals.get(id) ?? { id, name, total: 0, count: 0 };
      current.total += toAmount(expense.total_ttc || expense.ttc);
      current.count += 1;
      supplierTotals.set(id, current);
    });
    const topSupplier = Array.from(supplierTotals.values()).sort((a, b) => b.total - a.total)[0];

    return {
      total,
      tva,
      count: dateScopedExpenses.length,
      scannedCount: dateScopedExpenses.filter(isOcrExpense).length,
      topCategory: breakdown[0],
      topSupplier,
      trendPct,
      breakdown,
    };
  }, [expenses, dateScopedExpenses, categories, suppliers, previousMonthDate, datePreset, t]);

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const last7 = new Date();
    last7.setDate(last7.getDate() - 6);
    last7.setHours(0, 0, 0, 0);

    return expenses.filter(expense => {
      const date = toExpenseDate(expense);
      const supplierName = getSupplierName(expense).toLowerCase();
      const categoryName = getCategoryName(expense, categories).toLowerCase();
      const expenseHasDocument = hasDocument(expense);

      if (datePreset === 'this_month' && !isSameMonth(date, currentMonth, currentYear)) return false;
      if (datePreset === 'last_month' && !isSameMonth(date, previousMonthDate.getMonth(), previousMonthDate.getFullYear())) return false;
      if (datePreset === 'last_7_days' && (!date || date < last7)) return false;
      if (selectedCategoryId && (expense.category?.id ?? expense.category_id) !== selectedCategoryId) return false;
      if (selectedSupplierId && (expense.supplier?.id ?? expense.supplier_id) !== selectedSupplierId) return false;
      if (withDocumentOnly && !expenseHasDocument) return false;
      if (missingDocumentOnly && expenseHasDocument) return false;
      if (ocrOnly && !isOcrExpense(expense)) return false;

      return (
        !q ||
        String(expense.payment_method ?? '').toLowerCase().includes(q) ||
        categoryName.includes(q) ||
        supplierName.includes(q) ||
        String(expense.notes ?? '').toLowerCase().includes(q)
      );
    });
  }, [expenses, searchQuery, datePreset, selectedCategoryId, selectedSupplierId, withDocumentOnly, missingDocumentOnly, ocrOnly, currentMonth, currentYear, previousMonthDate, categories]);

  const activeSupplierOptions = React.useMemo(() => {
    const map = new Map<number, string>();
    expenses.forEach(expense => {
      const id = expense.supplier?.id ?? expense.supplier_id;
      if (!id) return;
      map.set(id, getSupplierName(expense) || suppliers.find(s => s.id === id)?.name || suppliers.find(s => s.id === id)?.company_name || t('label_supplier'));
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).slice(0, 8);
  }, [expenses, suppliers, t]);

  const recentCategories = React.useMemo(() => {
    const seen = new Map<number, { id: number; name: string; lastTime: number }>();
    expenses.forEach(expense => {
      const id = expense.category?.id ?? expense.category_id;
      const date = toExpenseDate(expense)?.getTime() ?? 0;
      const name = expense.category?.name || categories.find(c => c.id === id)?.name;
      if (!id || !name) return;
      const existing = seen.get(id);
      if (!existing || date > existing.lastTime) seen.set(id, { id, name, lastTime: date });
    });
    return Array.from(seen.values()).sort((a, b) => b.lastTime - a.lastTime).slice(0, 5);
  }, [expenses, categories]);

  const insights = React.useMemo(() => {
    const result: string[] = [];
    const restaurant = analytics.breakdown.find(item => {
      const normalized = item.name.toLowerCase();
      return normalized.includes('restaurant') || normalized.includes('meal') || normalized.includes('repas');
    });
    if (restaurant && analytics.total > 0 && restaurant.total / analytics.total >= 0.25) {
      result.push(t('expense_insight_restaurant_high', { category: restaurant.name, defaultValue: `${restaurant.name} spending is high this month` }));
    }
    if (analytics.scannedCount > 0) {
      result.push(t('expense_insight_scanned_count', { count: analytics.scannedCount, defaultValue: `You scanned ${analytics.scannedCount} receipts this month` }));
    }
    if (analytics.topSupplier?.name) {
      result.push(t('expense_insight_top_supplier', { supplier: analytics.topSupplier.name, defaultValue: `Your top supplier is ${analytics.topSupplier.name}` }));
    }
    if (analytics.tva > 0) {
      result.push(t('expense_insight_tva_detected', { amount: formatCurrency(analytics.tva), defaultValue: `TVA detected: ${formatCurrency(analytics.tva)}` }));
    }
    return result.slice(0, 3);
  }, [analytics, t]);

  const smartAlerts = React.useMemo<SmartAlert[]>(() => {
    const currentMonthExpenses = expenses.filter(expense => isSameMonth(toExpenseDate(expense), currentMonth, currentYear));
    const previousMonthExpenses = expenses.filter(expense => isSameMonth(toExpenseDate(expense), previousMonthDate.getMonth(), previousMonthDate.getFullYear()));
    const alerts: SmartAlert[] = [];

    const duplicateGroups = new Map<string, ExpenseItem[]>();
    expenses.forEach(expense => {
      const supplierId = expense.supplier?.id ?? expense.supplier_id ?? 'none';
      const date = expense.date?.slice(0, 10) || 'no-date';
      const amount = toAmount(expense.total_ttc || expense.ttc).toFixed(2);
      const key = `${supplierId}-${date}-${amount}`;
      duplicateGroups.set(key, [...(duplicateGroups.get(key) ?? []), expense]);
    });
    const duplicate = Array.from(duplicateGroups.values()).find(group => group.length > 1);
    if (duplicate) {
      alerts.push({
        id: `duplicate-${duplicate.map(item => item.id).sort().join('-')}`,
        severity: 'warning',
        icon: 'duplicate',
        title: t('expense_alert_duplicate_title', { defaultValue: 'Possible duplicate' }),
        description: t('expense_alert_duplicate_desc', { count: duplicate.length, defaultValue: `${duplicate.length} expenses share the same supplier, date and amount.` }),
        cta: t('action_review', { defaultValue: 'Review' }),
        expense: duplicate[0],
      });
    }

    const categoryBuckets = new Map<number, ExpenseItem[]>();
    expenses.forEach(expense => {
      const categoryId = expense.category?.id ?? expense.category_id;
      if (!categoryId) return;
      categoryBuckets.set(categoryId, [...(categoryBuckets.get(categoryId) ?? []), expense]);
    });
    const unusualCandidates: { expense: ExpenseItem; average: number }[] = [];
    categoryBuckets.forEach(group => {
      if (group.length < 2) return;
      const amounts = group.map(item => toAmount(item.total_ttc || item.ttc));
      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const candidate = group.find(item => average > 0 && toAmount(item.total_ttc || item.ttc) >= average * 2.5 && toAmount(item.total_ttc || item.ttc) >= 500);
      if (candidate) unusualCandidates.push({ expense: candidate, average });
    });
    const unusualExpense = unusualCandidates.sort((a, b) => toAmount(b.expense.total_ttc || b.expense.ttc) - toAmount(a.expense.total_ttc || a.expense.ttc))[0];
    if (unusualExpense) {
      const categoryName = getCategoryName(unusualExpense.expense, categories) || t('label_category');
      alerts.push({
        id: `unusual-${unusualExpense.expense.id}`,
        severity: 'warning',
        icon: 'amount',
        title: t('expense_alert_unusual_title', { defaultValue: 'Unusual amount' }),
        description: t('expense_alert_unusual_desc', { category: categoryName, defaultValue: `Higher than your usual ${categoryName} spending.` }),
        cta: t('action_review', { defaultValue: 'Review' }),
        expense: unusualExpense.expense,
      });
    }

    const currentCategoryTotals = new Map<number, { name: string; total: number }>();
    const previousCategoryTotals = new Map<number, number>();
    currentMonthExpenses.forEach(expense => {
      const id = expense.category?.id ?? expense.category_id;
      const current = currentCategoryTotals.get(id) ?? { name: getCategoryName(expense, categories) || t('label_category'), total: 0 };
      current.total += toAmount(expense.total_ttc || expense.ttc);
      currentCategoryTotals.set(id, current);
    });
    previousMonthExpenses.forEach(expense => {
      const id = expense.category?.id ?? expense.category_id;
      previousCategoryTotals.set(id, (previousCategoryTotals.get(id) ?? 0) + toAmount(expense.total_ttc || expense.ttc));
    });
    const increasedCategory = Array.from(currentCategoryTotals.entries())
      .map(([id, item]) => ({ id, name: item.name, total: item.total, previous: previousCategoryTotals.get(id) ?? 0 }))
      .filter(item => item.previous > 0 && item.total >= item.previous * 1.5 && item.total - item.previous >= 200)
      .sort((a, b) => (b.total - b.previous) - (a.total - a.previous))[0];
    if (increasedCategory) {
      alerts.push({
        id: `category-increase-${increasedCategory.id}`,
        severity: 'info',
        icon: 'category',
        title: t('expense_alert_category_up_title', { defaultValue: 'Category increased' }),
        description: t('expense_alert_category_up_desc', { category: increasedCategory.name, defaultValue: `${increasedCategory.name} is up vs previous month.` }),
        cta: t('filter_this_month', { defaultValue: 'This month' }),
        categoryId: increasedCategory.id,
        action: 'category',
      });
    }

    const missingDocument = dateScopedExpenses.find(expense => !hasDocument(expense));
    if (missingDocument) {
      const missingCount = dateScopedExpenses.filter(expense => !hasDocument(expense)).length;
      alerts.push({
        id: `missing-document-${missingCount}`,
        severity: 'warning',
        icon: 'document',
        title: t('expense_alert_missing_doc_title', { defaultValue: 'Missing receipt' }),
        description: t('expense_alert_missing_doc_desc', { count: missingCount, defaultValue: `${missingCount} expenses have no supporting document.` }),
        cta: t('filter_missing_document', { defaultValue: 'Show' }),
        action: 'missing_document',
      });
    }

    const weakOcr = dateScopedExpenses.find(expense => isOcrExpense(expense) && (hasOcrWarning(expense) || (getOcrConfidence(expense) !== null && (getOcrConfidence(expense) ?? 1) < 0.7)));
    if (weakOcr) {
      alerts.push({
        id: `ocr-low-${weakOcr.id}`,
        severity: 'warning',
        icon: 'ocr',
        title: t('expense_alert_ocr_title', { defaultValue: 'OCR needs review' }),
        description: t('expense_alert_ocr_desc', { defaultValue: 'One scanned receipt has warnings or low confidence.' }),
        cta: t('action_review', { defaultValue: 'Review' }),
        expense: weakOcr,
      });
    }

    const supplierLegal = dateScopedExpenses.find(expense => toAmount(expense.total_tva || expense.tva) > 0 && (expense.supplier?.id || expense.supplier_id) && !getSupplierIce(expense, suppliers));
    if (supplierLegal) {
      alerts.push({
        id: `supplier-legal-${supplierLegal.id}`,
        severity: 'critical',
        icon: 'supplier',
        title: t('expense_alert_supplier_legal_title', { defaultValue: 'TVA needs review' }),
        description: t('expense_alert_supplier_legal_desc', { defaultValue: 'Supplier ICE is missing while TVA is detected.' }),
        cta: t('action_review', { defaultValue: 'Review' }),
        expense: supplierLegal,
      });
    }

    const otherCategory = analytics.breakdown.find(item => {
      const normalized = item.name.toLowerCase();
      return normalized.includes('autres') || normalized.includes('other');
    });
    if (otherCategory && analytics.total > 0 && otherCategory.total / analytics.total >= 0.4) {
      alerts.push({
        id: `other-category-${otherCategory.id}`,
        severity: 'info',
        icon: 'category',
        title: t('expense_alert_uncategorized_title', { defaultValue: 'Categorization opportunity' }),
        description: t('expense_alert_uncategorized_desc', { defaultValue: 'Many expenses are in “Autres dépenses”.' }),
        cta: t('action_review', { defaultValue: 'Review' }),
        categoryId: otherCategory.id,
        action: 'category',
      });
    }

    const today = new Date();
    if (today.getDate() >= 25 && currentMonthExpenses.some(expense => !hasDocument(expense))) {
      alerts.push({
        id: `month-end-${currentMonth}-${currentYear}`,
        severity: 'info',
        icon: 'month',
        title: t('expense_alert_month_end_title', { defaultValue: 'Month-end reminder' }),
        description: t('expense_alert_month_end_desc', { defaultValue: 'Review receipts before closing this month.' }),
        cta: t('filter_this_month', { defaultValue: 'This month' }),
        action: 'this_month',
      });
    }

    const quotaUsed = Number(subscription?.ocr_used ?? subscription?.storage_used ?? 0);
    const quotaLimit = Number(subscription?.ocr_limit ?? subscription?.storage_limit ?? 0);
    if (quotaLimit > 0 && quotaUsed / quotaLimit >= 0.85) {
      alerts.push({
        id: 'quota-warning',
        severity: 'warning',
        icon: 'quota',
        title: t('expense_alert_quota_title', { defaultValue: 'Quota warning' }),
        description: t('expense_alert_quota_desc', { defaultValue: 'Your OCR or storage usage is close to the plan limit.' }),
        cta: t('button_upgrade_plan', { defaultValue: 'Upgrade' }),
      });
    }

    const severityRank: Record<SmartAlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
    return alerts
      .filter(alert => !dismissedAlertIds.includes(alert.id))
      .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
      .slice(0, 3);
  }, [expenses, currentMonth, currentYear, previousMonthDate, categories, dateScopedExpenses, analytics, suppliers, subscription, dismissedAlertIds, t]);

  const smartInsights = React.useMemo(() => {
    const missingDocs = dateScopedExpenses.filter(expense => !hasDocument(expense)).length;
    return [
      analytics.topSupplier?.name ? t('expense_insight_top_supplier', { supplier: analytics.topSupplier.name, defaultValue: `Your top supplier is ${analytics.topSupplier.name}` }) : null,
      analytics.topCategory?.name ? t('expense_insight_top_category', { category: analytics.topCategory.name, amount: formatCurrency(analytics.topCategory.total), defaultValue: `${analytics.topCategory.name}: ${formatCurrency(analytics.topCategory.total)}` }) : null,
      analytics.scannedCount > 0 ? t('expense_insight_scanned_count', { count: analytics.scannedCount, defaultValue: `You scanned ${analytics.scannedCount} receipts this month` }) : null,
      analytics.tva > 0 ? t('expense_insight_tva_detected', { amount: formatCurrency(analytics.tva), defaultValue: `TVA detected: ${formatCurrency(analytics.tva)}` }) : null,
      missingDocs > 0 ? t('expense_insight_missing_docs', { count: missingDocs, defaultValue: `${missingDocs} expenses without documents` }) : null,
    ].filter(Boolean).slice(0, 4) as string[];
  }, [analytics, dateScopedExpenses, t]);

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

  const setDateFilter = (preset: DatePreset) => {
    haptic();
    setDatePreset(preset);
  };

  const resetSmartFilters = () => {
    haptic();
    setDatePreset('all');
    setSelectedCategoryId(null);
    setSelectedSupplierId(null);
    setWithDocumentOnly(false);
    setMissingDocumentOnly(false);
    setOcrOnly(false);
  };

  const openCreate = () => {
    haptic();
    setShowCreateModal(true);
  };

  const dashboardScopeLabel = selectedMonth || selectedYear
    ? [selectedMonth, selectedYear].filter(Boolean).join(' ')
    : datePreset === 'this_month'
      ? t('filter_this_month', { defaultValue: 'This month' })
      : datePreset === 'last_month'
        ? t('filter_last_month', { defaultValue: 'Last month' })
        : datePreset === 'last_7_days'
          ? t('filter_last_7_days', { defaultValue: 'Last 7 days' })
          : t('filter_all', { defaultValue: 'All' });

  const trendLabel = analytics.trendPct === null
    ? t('expense_metric_count', { defaultValue: 'Expenses' })
    : analytics.trendPct >= 0
      ? t('expense_trend_up', { pct: Math.abs(analytics.trendPct).toFixed(0), defaultValue: `+${Math.abs(analytics.trendPct).toFixed(0)}% vs last month` })
      : t('expense_trend_down', { pct: Math.abs(analytics.trendPct).toFixed(0), defaultValue: `-${Math.abs(analytics.trendPct).toFixed(0)}% vs last month` });

  const getAlertAccent = (severity: SmartAlertSeverity) => {
    if (severity === 'critical') return '#DC2626';
    if (severity === 'warning') return '#D97706';
    return '#1E5BAC';
  };

  const renderAlertIcon = (alert: SmartAlert) => {
    const color = getAlertAccent(alert.severity);
    const size = 16;
    if (alert.icon === 'document') return <FileText size={size} color={color} />;
    if (alert.icon === 'ocr' || alert.icon === 'quota') return <Sparkles size={size} color={color} />;
    if (alert.icon === 'supplier') return <Store size={size} color={color} />;
    if (alert.icon === 'category') return <Tags size={size} color={color} />;
    if (alert.icon === 'amount') return <TrendingUp size={size} color={color} />;
    return <AlertTriangle size={size} color={color} />;
  };

  const handleSmartAlertPress = (alert: SmartAlert) => {
    haptic();
    if (alert.expense) {
      setSelectedItem(alert.expense);
      return;
    }
    if (alert.action === 'missing_document') {
      setWithDocumentOnly(false);
      setMissingDocumentOnly(true);
      return;
    }
    if (alert.action === 'ocr') {
      setOcrOnly(true);
      return;
    }
    if (alert.action === 'category' && alert.categoryId) {
      setSelectedCategoryId(alert.categoryId);
      if (datePreset === 'all') setDatePreset('this_month');
      return;
    }
    if (alert.action === 'supplier' && alert.supplierId) {
      setSelectedSupplierId(alert.supplierId);
      return;
    }
    if (alert.action === 'this_month') {
      setDatePreset('this_month');
    }
  };

  const dismissSmartAlert = (alertId: string) => {
    haptic();
    setDismissedAlertIds(current => current.includes(alertId) ? current : [...current, alertId]);
  };

  const renderTopContent = () => (
    <View style={{ gap: 12 }}>
      {!!smartAlerts.length && (
        <FadeInView delay={30} style={styles.expenseSmartAlertsCard}>
          <View style={styles.expenseSectionHeader}>
            <Text style={styles.expenseSectionTitle}>{t('expense_smart_alerts_title', { defaultValue: 'Smart alerts' })}</Text>
            <Text style={styles.expenseSectionSub}>{smartAlerts.length}/3</Text>
          </View>
          <View style={styles.smartAlertList}>
            {smartAlerts.map(alert => {
              const accent = getAlertAccent(alert.severity);
              return (
                <TouchableOpacity key={alert.id} style={[styles.smartAlertItem, { borderLeftColor: accent }]} activeOpacity={0.86} onPress={() => handleSmartAlertPress(alert)}>
                  <View style={[styles.smartAlertIcon, { backgroundColor: `${accent}14` }]}>
                    {renderAlertIcon(alert)}
                  </View>
                  <View style={styles.smartAlertBody}>
                    <Text style={styles.smartAlertTitle} numberOfLines={1}>{alert.title}</Text>
                    <Text style={styles.smartAlertDescription} numberOfLines={2}>{alert.description}</Text>
                    {!!alert.cta && <Text style={[styles.smartAlertCta, { color: accent }]}>{alert.cta}</Text>}
                  </View>
                  <TouchableOpacity style={styles.smartAlertDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => dismissSmartAlert(alert.id)}>
                    <X size={15} color="#94A3B8" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </FadeInView>
      )}

      {!!smartInsights.length && (
        <FadeInView delay={45} style={styles.expenseSmartInsightsStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smartInsightContent}>
            {smartInsights.map((insight, index) => (
              <View key={`${insight}-${index}`} style={styles.smartInsightPill}>
                <Sparkles size={12} color="#1E5BAC" />
                <Text style={styles.smartInsightText} numberOfLines={1}>{insight}</Text>
              </View>
            ))}
          </ScrollView>
        </FadeInView>
      )}

      <FadeInView delay={40} style={styles.expenseDashboardCard}>
        <View style={styles.expenseDashboardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.expenseDashboardEyebrow}>{dashboardScopeLabel}</Text>
            <Text style={styles.expenseDashboardTotal}>{formatCurrency(analytics.total)}</Text>
            <Text style={styles.expenseDashboardTrend}>{trendLabel}</Text>
          </View>
          <View style={styles.expenseDashboardIcon}>
            {analytics.trendPct !== null && analytics.trendPct <= 0 ? (
              <TrendingDown size={22} color="#16A34A" />
            ) : (
              <TrendingUp size={22} color="#1E5BAC" />
            )}
          </View>
        </View>

        <View style={styles.expenseMetricGrid}>
          <View style={styles.expenseMetricTile}>
            <Text style={styles.expenseMetricLabel}>{t('expense_metric_tva', { defaultValue: 'TVA' })}</Text>
            <Text style={styles.expenseMetricValue}>{formatCurrency(analytics.tva)}</Text>
            <Text style={styles.expenseMetricHint}>{t('expense_metric_detected', { defaultValue: 'detected' })}</Text>
          </View>
          <View style={styles.expenseMetricTile}>
            <Text style={styles.expenseMetricLabel}>{t('expense_metric_count', { defaultValue: 'Expenses' })}</Text>
            <Text style={styles.expenseMetricValue}>{analytics.count}</Text>
            <Text style={styles.expenseMetricHint}>{t('expense_metric_scanned', { count: analytics.scannedCount, defaultValue: `${analytics.scannedCount} scanned` })}</Text>
          </View>
          <View style={styles.expenseMetricTile}>
            <Text style={styles.expenseMetricLabel}>{t('expense_metric_top_category', { defaultValue: 'Top category' })}</Text>
            <Text style={styles.expenseMetricValue} numberOfLines={1}>
              {analytics.topCategory
                ? t(resolveCategoryKey(analytics.topCategory.name), { defaultValue: analytics.topCategory.name })
                : '—'}
            </Text>
            <Text style={styles.expenseMetricHint}>{analytics.topCategory ? formatCurrency(analytics.topCategory.total) : t('expense_metric_no_data', { defaultValue: 'No data' })}</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={90} style={styles.expenseQuickActions}>
        <TouchableOpacity style={styles.expenseQuickAction} activeOpacity={0.86} onPress={openCreate}>
          <View style={styles.expenseQuickActionIcon}><ScanLine size={17} color="#1E5BAC" /></View>
          <Text style={styles.expenseQuickActionText}>{t('expense_action_scan_receipt', { defaultValue: 'Scan receipt' })}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.expenseQuickAction} activeOpacity={0.86} onPress={openCreate}>
          <View style={styles.expenseQuickActionIcon}><HandCoins size={17} color="#1E5BAC" /></View>
          <Text style={styles.expenseQuickActionText}>{t('expense_action_add_manual', { defaultValue: 'Add expense' })}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.expenseQuickAction} activeOpacity={0.86} onPress={() => { haptic(); navigation.navigate('Suppliers' as any); }}>
          <View style={styles.expenseQuickActionIcon}><Store size={17} color="#1E5BAC" /></View>
          <Text style={styles.expenseQuickActionText}>{t('expense_action_add_supplier', { defaultValue: 'Add supplier' })}</Text>
        </TouchableOpacity>
      </FadeInView>

      <FadeInView delay={130} style={styles.expenseSectionCard}>
        <View style={styles.expenseSectionHeader}>
          <Text style={styles.expenseSectionTitle}>{t('expense_filters_title', { defaultValue: 'Smart filters' })}</Text>
          <TouchableOpacity onPress={resetSmartFilters} activeOpacity={0.7}>
            <Text style={styles.expenseSectionSub}>{t('expense_filters_reset', { defaultValue: 'Reset' })}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smartFilterScroll} contentContainerStyle={styles.smartFilterContent}>
          {([
            ['all', t('filter_all', { defaultValue: 'All' })],
            ['this_month', t('filter_this_month', { defaultValue: 'This month' })],
            ['last_month', t('filter_last_month', { defaultValue: 'Last month' })],
            ['last_7_days', t('filter_last_7_days', { defaultValue: 'Last 7 days' })],
          ] as [DatePreset, string][]).map(([preset, label]) => (
            <TouchableOpacity key={preset} style={[styles.smartFilterChip, datePreset === preset && styles.smartFilterChipActive]} activeOpacity={0.82} onPress={() => setDateFilter(preset)}>
              <Text style={[styles.smartFilterChipText, datePreset === preset && styles.smartFilterChipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.smartFilterChip, withDocumentOnly && styles.smartFilterChipActive]} activeOpacity={0.82} onPress={() => { haptic(); setWithDocumentOnly(v => !v); if (!withDocumentOnly) setMissingDocumentOnly(false); }}>
            <FileText size={13} color={withDocumentOnly ? '#FFFFFF' : '#334155'} />
            <Text style={[styles.smartFilterChipText, withDocumentOnly && styles.smartFilterChipTextActive]}>{t('filter_with_document', { defaultValue: 'With document' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smartFilterChip, missingDocumentOnly && styles.smartFilterChipActive]} activeOpacity={0.82} onPress={() => { haptic(); setMissingDocumentOnly(v => !v); if (!missingDocumentOnly) setWithDocumentOnly(false); }}>
            <AlertTriangle size={13} color={missingDocumentOnly ? '#FFFFFF' : '#334155'} />
            <Text style={[styles.smartFilterChipText, missingDocumentOnly && styles.smartFilterChipTextActive]}>{t('filter_missing_document', { defaultValue: 'Missing document' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smartFilterChip, ocrOnly && styles.smartFilterChipActive]} activeOpacity={0.82} onPress={() => { haptic(); setOcrOnly(v => !v); }}>
            <Sparkles size={13} color={ocrOnly ? '#FFFFFF' : '#334155'} />
            <Text style={[styles.smartFilterChipText, ocrOnly && styles.smartFilterChipTextActive]}>{t('filter_ocr_only', { defaultValue: 'OCR scanned' })}</Text>
          </TouchableOpacity>
        </ScrollView>

        {!!activeSupplierOptions.length && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smartFilterScroll} contentContainerStyle={styles.smartFilterContent}>
            {activeSupplierOptions.map(supplier => (
              <TouchableOpacity key={supplier.id} style={[styles.smartFilterChip, selectedSupplierId === supplier.id && styles.smartFilterChipActive]} activeOpacity={0.82} onPress={() => { haptic(); setSelectedSupplierId(id => id === supplier.id ? null : supplier.id); }}>
                <Store size={13} color={selectedSupplierId === supplier.id ? '#FFFFFF' : '#334155'} />
                <Text style={[styles.smartFilterChipText, selectedSupplierId === supplier.id && styles.smartFilterChipTextActive]} numberOfLines={1}>{supplier.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {!!recentCategories.length && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smartFilterScroll} contentContainerStyle={styles.smartFilterContent}>
            {recentCategories.map(category => (
              <TouchableOpacity key={category.id} style={[styles.smartFilterChip, selectedCategoryId === category.id && styles.smartFilterChipActive]} activeOpacity={0.82} onPress={() => { haptic(); setSelectedCategoryId(id => id === category.id ? null : category.id); }}>
                <Tags size={13} color={selectedCategoryId === category.id ? '#FFFFFF' : '#334155'} />
                <Text style={[styles.smartFilterChipText, selectedCategoryId === category.id && styles.smartFilterChipTextActive]} numberOfLines={1}>
                  {t(resolveCategoryKey(category.name), { defaultValue: category.name })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </FadeInView>

      {!!analytics.breakdown.length && (
        <FadeInView delay={170} style={styles.expenseSectionCard}>
          <View style={styles.expenseSectionHeader}>
            <Text style={styles.expenseSectionTitle}>{t('expense_category_breakdown_title', { defaultValue: 'By category' })}</Text>
            <Text style={styles.expenseSectionSub}>{filtered.length} {t('label_expenses', { defaultValue: 'expenses' })}</Text>
          </View>
          <View style={styles.categoryBreakdownRow}>
            {analytics.breakdown.slice(0, 5).map(item => {
              const pct = analytics.total > 0 ? (item.total / analytics.total) * 100 : 0;
              const active = selectedCategoryId === item.id;
              return (
                <TouchableOpacity key={item.id} style={[styles.categoryBreakdownItem, active && styles.categoryBreakdownItemActive]} activeOpacity={0.82} onPress={() => { haptic(); setSelectedCategoryId(id => id === item.id ? null : item.id); }}>
                  <View style={styles.categoryBreakdownTop}>
                    <Text style={styles.categoryBreakdownName} numberOfLines={1}>{t(resolveCategoryKey(item.name), { defaultValue: item.name })}</Text>
                    <Text style={styles.categoryBreakdownAmount}>{formatCurrency(item.total)}</Text>
                  </View>
                  <View style={styles.categoryBreakdownTrack}>
                    <View style={[styles.categoryBreakdownFill, { width: `${Math.min(100, Math.max(4, pct))}%` }]} />
                  </View>
                  <Text style={styles.categoryBreakdownMeta}>{pct.toFixed(0)}% • {item.count} {t('label_expenses', { defaultValue: 'expenses' })}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </FadeInView>
      )}

      {!!insights.length && (
        <FadeInView delay={210} style={styles.expenseSectionCard}>
          <View style={styles.expenseSectionHeader}>
            <Text style={styles.expenseSectionTitle}>{t('expense_insights_title', { defaultValue: 'Insights' })}</Text>
            <Lightbulb size={16} color="#F59E0B" />
          </View>
          {insights.map((insight, index) => (
            <View key={`${insight}-${index}`} style={styles.insightCard}>
              <View style={styles.insightIcon}><Sparkles size={15} color="#16A34A" /></View>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </FadeInView>
      )}
    </View>
  );

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
        onMonthSelect={m => { setSelectedMonth(m); setDatePreset('all'); setShowMonthPicker(false); }}
        onYearSelect={y => { setSelectedYear(y); setDatePreset('all'); setShowYearPicker(false); }}
      />

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
          ListHeaderComponent={renderTopContent}
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
        onPress={openCreate}
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
        onClose={() => {
          setShowCreateModal(false);
          setDefaultSupplierId(undefined);
          setOcrSupplierData(undefined);
        }}
        onCreated={async () => {
          await fetchData();
          if (fromChecklistRef.current) {
            fromChecklistRef.current = false;
            dispatch(fetchChecklist() as any);
            navigation.navigate('Home' as any);
          }
        }}
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
