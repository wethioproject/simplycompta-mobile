import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { InvoiceItem } from '../types/invoice.types';
import { useQuote } from './useQuote';



interface QuoteStats {
  total_sum_all: number;
  total_sum_accepted: number;
  total_sum_sent: number;
  total_sum_overdue: number;
}

interface UseQuoteListReturn {
  quotes: InvoiceItem[];
  stats: QuoteStats | null;
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
  fetchQuotes: (params?: { month?: number; year?: number }) => Promise<void>;
  getFilterParams: () => { month?: number; year?: number } | undefined;
}

export const useQuoteList = (): UseQuoteListReturn => {
  const { t } = useTranslation();
  const { getQuotes } = useQuote();

  const [quotes, setQuotes] = useState<InvoiceItem[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
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

  const fetchQuotes = async (params?: { month?: number; year?: number }) => {
    try {
      const quotesResult = await getQuotes(params);
      if (quotesResult.success) {
        setQuotes(quotesResult.quotes ?? []);
        setStats(quotesResult.stats ?? null);
      }
    } catch (error) {
      Alert.alert(t('error_title'), t('error_generic'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // Filter-triggered reload
  useEffect(() => {
    if (!isFilterMount.current) {
      isFilterMount.current = true;
      return;
    }
    setLoading(true);
    fetchQuotes(getFilterParams());
  }, [selectedMonth, selectedYear]);

  return {
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
  };
};
