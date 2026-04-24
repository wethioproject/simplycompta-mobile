import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { InvoiceItem } from '../types/invoice.types';
import { useInvoice } from './useInvoice';

interface InvoiceStats {
  total_sum_all: number;
  total_sum_paid: number;
  total_sum_issued: number;
  total_sum_cancelled: number;
  total_sum_overdue: number;
}

interface UseInvoiceListReturn {
  invoices: InvoiceItem[];
  stats: InvoiceStats | null;
  loading: boolean;
  refreshing: boolean;
  selectedMonth: string | null;
  selectedYear: string | null;
  showMonthPicker: boolean;
  showYearPicker: boolean;
  setSelectedMonth: (month: string | null) => void;
  setSelectedYear: (year: string | null) => void;
  setShowMonthPicker: (show: boolean) => void;
  setShowYearPicker: (show: boolean) => void;
  fetchInvoices: (params?: { month?: number; year?: number }) => Promise<void>;
  getFilterParams: () => { month?: number; year?: number } | undefined;
}

export const useInvoiceList = (): UseInvoiceListReturn => {
  const { t } = useTranslation();
  const { getInvoices } = useInvoice();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const MONTHS = [
    t('month_january'),
    t('month_february'),
    t('month_march'),
    t('month_april'),
    t('month_may'),
    t('month_june'),
    t('month_july'),
    t('month_august'),
    t('month_september'),
    t('month_october'),
    t('month_november'),
    t('month_december'),
  ];

  const isFilterMount = useRef(false);

  const getFilterParams = () => {
    const monthNum = selectedMonth !== null ? MONTHS.indexOf(selectedMonth) + 1 : undefined;
    const yearNum = selectedYear !== null ? parseInt(selectedYear) : undefined;
    return (monthNum || yearNum) ? { month: monthNum, year: yearNum } : undefined;
  };

  const fetchInvoices = async (params?: { month?: number; year?: number }) => {
    try {
      const invoicesResult = await getInvoices(params);
      if (invoicesResult.success) {
        setInvoices(invoicesResult.invoices ?? []);
        setStats(invoicesResult.stats ?? null);
      }
    } catch (error) {
      Alert.alert(t('error_title'), t('error_generic'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter-triggered reload
  useEffect(() => {
    if (!isFilterMount.current) {
      isFilterMount.current = true;
      return;
    }
    setLoading(true);
    fetchInvoices(getFilterParams());
  }, [selectedMonth, selectedYear]);

  return {
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
  };
};
