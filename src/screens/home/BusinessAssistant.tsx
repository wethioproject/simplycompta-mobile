import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  I18nManager,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';
import { useExpense } from '../../hooks/useExpense';
import { useInvoice } from '../../hooks/useInvoice';
import { useQuote } from '../../hooks/useQuote';
import { useSupplier } from '../../hooks/useSupplier';
import { getClients } from '../../services/client.service';
import { FadeInView } from '../../components/common/PremiumMotion';
import { useSecurity } from '../../contexts/SecurityContext';

const amount = (value: any) => Number(value?.total_ttc ?? value?.ttc ?? value?.total ?? value ?? 0) || 0;
const vat = (value: any) => Number(value?.total_tva ?? value?.tva ?? value?.vat ?? 0) || 0;
const dateValue = (value: any) => new Date(value?.date ?? value?.created_at ?? value?.updated_at ?? Date.now()).getTime();

const normalize = (payload: any) => {
  const source = payload?.data ?? payload;
  const candidates = [source?.data, source?.items, source?.invoices, source?.quotes, source?.expenses, source];
  return candidates.find(Array.isArray) ?? [];
};

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
};

const BusinessAssistant: React.FC = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { getExpenses } = useExpense();
  const { getInvoices } = useInvoice();
  const { getQuotes } = useQuote();
  const { getSuppliers } = useSupplier();
  const { maskAmount, privateModeEnabled } = useSecurity();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    const [expenseResult, invoiceResult, quoteResult, supplierResult, clientsResult] = await Promise.all([
      getExpenses(),
      getInvoices(),
      getQuotes(),
      getSuppliers(),
      getClients().catch(() => []),
    ]);
    setExpenses(normalize(expenseResult.expenses));
    setInvoices(normalize(invoiceResult.invoices));
    setQuotes(normalize(quoteResult.quotes));
    setSuppliers(normalize(supplierResult.suppliers));
    setClients(normalize(clientsResult));
    setLoading(false);
  }, [getExpenses, getInvoices, getQuotes, getSuppliers]);

  useEffect(() => { loadData(); }, [loadData]);

  const currentExpenses = useMemo(() => expenses.filter(item => dateValue(item) >= startOfMonth()), [expenses]);
  const currentInvoices = useMemo(() => invoices.filter(item => dateValue(item) >= startOfMonth()), [invoices]);
  const documentedExpenses = currentExpenses.filter(item => !!(item.file || item.file_url || item.document_path)).length;
  const missingIceSuppliers = suppliers.filter(item => !(item.ice || item.ice_number)).length;
  const unpaidInvoices = invoices.filter(item => !['paid', 'cancelled'].includes(String(item.status ?? '').toLowerCase()));
  const deductibleVat = currentExpenses.reduce((sum, item) => sum + vat(item), 0);
  const collectedVat = currentInvoices.reduce((sum, item) => {
    const articles = Array.isArray(item.articles) ? item.articles : [];
    const articleVat = articles.reduce((total: number, article: any) => total + (Number(article.total_price_ht ?? 0) * Number(article.tva_percentage ?? 0) / 100), 0);
    return sum + articleVat;
  }, 0);

  const healthScore = useMemo(() => {
    const paidRatio = invoices.length ? invoices.filter(item => String(item.status).toLowerCase() === 'paid').length / invoices.length : 0.7;
    const docRatio = currentExpenses.length ? documentedExpenses / currentExpenses.length : 0.8;
    const supplierRatio = suppliers.length ? (suppliers.length - missingIceSuppliers) / suppliers.length : 0.75;
    const overduePenalty = Math.min(0.25, unpaidInvoices.length * 0.03);
    return Math.max(0, Math.min(100, Math.round((paidRatio * 36 + docRatio * 34 + supplierRatio * 30 - overduePenalty * 100))));
  }, [currentExpenses.length, documentedExpenses, invoices, missingIceSuppliers, suppliers.length, unpaidInvoices.length]);

  const checklist = [
    { key: 'receipts', label: t('assistant_check_receipts'), done: currentExpenses.length > 0 && documentedExpenses === currentExpenses.length, route: 'Expenses' },
    { key: 'ice', label: t('assistant_check_supplier_ice'), done: missingIceSuppliers === 0, route: 'Suppliers' },
    { key: 'dgi', label: t('assistant_check_dgi'), done: false, route: 'Export DGI Compatible' },
    { key: 'bank', label: t('assistant_check_bank_statement'), done: false, route: 'Bank Statements' },
    { key: 'vat', label: t('assistant_check_vat'), done: deductibleVat >= 0 && collectedVat >= 0, route: 'Export DGI Compatible' },
  ];

  const timeline = useMemo(() => [
    ...expenses.map(item => ({ id: `e-${item.id}`, type: t('assistant_type_expense'), title: item.supplier?.supplier_name || item.category?.name || t('assistant_type_expense'), date: dateValue(item), value: amount(item), route: 'Expenses' })),
    ...invoices.map(item => ({ id: `i-${item.id}`, type: t('assistant_type_invoice'), title: item.invoice_number_formatted || item.invoice_number || item.client?.client_name || t('assistant_type_invoice'), date: dateValue(item), value: amount(item), route: 'Invoice' })),
    ...quotes.map(item => ({ id: `q-${item.id}`, type: t('assistant_type_quote'), title: item.quote_number_formatted || item.quote_number || item.client?.client_name || t('assistant_type_quote'), date: dateValue(item), value: amount(item), route: 'Quote' })),
    ...suppliers.map(item => ({ id: `s-${item.id}`, type: t('assistant_type_supplier'), title: item.supplier_name || item.company_name || item.name || t('assistant_type_supplier'), date: dateValue(item), value: 0, route: 'Suppliers' })),
  ].sort((a, b) => b.date - a.date).slice(0, 8), [expenses, invoices, quotes, suppliers, t]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return [
      ...invoices.map(item => ({ label: item.invoice_number_formatted || item.invoice_number || t('assistant_type_invoice'), type: t('assistant_type_invoice'), route: 'Invoice' })),
      ...expenses.map(item => ({ label: item.supplier?.supplier_name || item.category?.name || t('assistant_type_expense'), type: t('assistant_type_expense'), route: 'Expenses' })),
      ...quotes.map(item => ({ label: item.quote_number_formatted || item.quote_number || t('assistant_type_quote'), type: t('assistant_type_quote'), route: 'Quote' })),
      ...clients.map(item => ({ label: item.client_name || item.company_name || item.name || t('assistant_type_client'), type: t('assistant_type_client'), route: 'Contacts' })),
      ...suppliers.map(item => ({ label: item.supplier_name || item.company_name || item.name || t('assistant_type_supplier'), type: t('assistant_type_supplier'), route: 'Suppliers' })),
    ].filter(item => item.label.toLowerCase().includes(q)).slice(0, 6);
  }, [clients, expenses, invoices, query, quotes, suppliers, t]);

  const topSupplier = useMemo(() => {
    const totals = currentExpenses.reduce<Record<string, number>>((acc, item) => {
      const name = item.supplier?.supplier_name || item.supplier?.company_name || t('assistant_other_supplier');
      acc[name] = (acc[name] ?? 0) + amount(item);
      return acc;
    }, {});
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  }, [currentExpenses, t]);

  const shareReminder = async (invoice: any) => {
    const clientName = invoice.client?.client_name || t('assistant_type_client').toLowerCase();
    const text = t('assistant_reminder_message', {
      client: clientName,
      invoice: invoice.invoice_number_formatted || invoice.invoice_number || '',
      amount: privateModeEnabled ? t('assistant_private_invoice_amount') : maskAmount(amount(invoice)),
    });
    await Share.share({ message: text });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('assistant_title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E5BAC" />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#1E5BAC" />
            <Text style={styles.muted}>{t('assistant_loading')}</Text>
          </View>
        ) : (
          <>
            <FadeInView delay={20}>
              <View style={styles.scoreCard}>
                <View style={styles.scoreTextBlock}>
                  <Text style={styles.eyebrow}>{t('assistant_health_score')}</Text>
                  <Text style={styles.score}>{healthScore}/100</Text>
                  <Text style={styles.muted}>{t('assistant_health_desc')}</Text>
                </View>
                <View style={styles.scoreRing}><ShieldCheck size={30} color="#16A34A" /></View>
              </View>
            </FadeInView>

            <FadeInView delay={40}>
              <View style={styles.timelinePreviewCard}>
                <View style={styles.timelinePreviewHeader}>
                  <View style={styles.sectionHeaderInline}>
                    <TrendingUp size={18} color="#1E5BAC" />
                    <Text style={styles.timelinePreviewTitle}>{t('assistant_timeline_title')}</Text>
                  </View>
                  <Text style={styles.timelinePreviewHint}>{t('assistant_timeline_hint')}</Text>
                </View>
                {timeline.slice(0, 2).map(item => (
                  <TouchableOpacity key={`preview-${item.id}`} style={styles.timelinePreviewRow} onPress={() => navigation.navigate(item.route)} activeOpacity={0.8}>
                    <Text style={styles.timelinePreviewType}>{item.type}</Text>
                    <Text style={styles.timelinePreviewText} numberOfLines={1}>{item.title}</Text>
                    {!!item.value && <Text style={styles.timelinePreviewAmount}>{maskAmount(item.value)}</Text>}
                  </TouchableOpacity>
                ))}
                {!timeline.length && <Text style={styles.muted}>{t('assistant_no_recent_activity')}</Text>}
              </View>
            </FadeInView>

            <FadeInView delay={70}>
              <View style={styles.searchCard}>
                <Search size={18} color="#64748B" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('assistant_search_placeholder')}
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  textAlign={I18nManager.isRTL ? 'right' : 'left'}
                />
              </View>
              {searchResults.map(item => (
                <TouchableOpacity key={`${item.type}-${item.label}`} style={styles.resultRow} onPress={() => navigation.navigate(item.route)} activeOpacity={0.8}>
                  <Text style={styles.resultType}>{item.type}</Text>
                  <Text style={styles.resultLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </FadeInView>

            <Section title={t('assistant_month_end_title')} icon={ClipboardCheck}>
              {checklist.map(item => (
                <TouchableOpacity key={item.key} style={styles.checkRow} onPress={() => navigation.navigate(item.route)} activeOpacity={0.8}>
                  <CheckCircle2 size={19} color={item.done ? '#16A34A' : '#CBD5E1'} />
                  <Text style={styles.checkText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </Section>

            <Section title={t('assistant_vat_title')} icon={Banknote}>
              <Metric label={t('assistant_vat_collected')} value={maskAmount(collectedVat)} />
              <Metric label={t('assistant_vat_deductible')} value={maskAmount(deductibleVat)} />
              <Metric label={t('assistant_vat_net')} value={maskAmount(collectedVat - deductibleVat)} strong />
              {currentExpenses.length > documentedExpenses && <Text style={styles.warning}>{t('assistant_vat_missing_docs')}</Text>}
            </Section>

            <Section title={t('assistant_insights_title')} icon={Sparkles}>
              <Text style={styles.insight}>{t('assistant_top_supplier', { supplier: topSupplier?.[0] ?? t('assistant_no_expense_this_month') })}</Text>
              <Text style={styles.insight}>{t('assistant_documented_expenses', { documented: documentedExpenses, total: currentExpenses.length })}</Text>
              <Text style={styles.insight}>{t('assistant_invoices_to_follow', { count: unpaidInvoices.length })}</Text>
            </Section>

            <Section title={t('assistant_reminders_title')} icon={MessageCircle}>
              {unpaidInvoices.slice(0, 3).map(invoice => (
                <TouchableOpacity key={invoice.id} style={styles.reminderRow} onPress={() => shareReminder(invoice)} activeOpacity={0.85}>
                  <View>
                    <Text style={styles.reminderTitle}>{invoice.client?.client_name || t('assistant_type_client')}</Text>
                    <Text style={styles.muted}>{invoice.invoice_number_formatted || invoice.invoice_number || t('assistant_type_invoice')}</Text>
                  </View>
                  <Text style={styles.reminderAmount}>{maskAmount(amount(invoice))}</Text>
                </TouchableOpacity>
              ))}
              {!unpaidInvoices.length && <Text style={styles.muted}>{t('assistant_no_urgent_reminder')}</Text>}
            </Section>

            <Section title={t('assistant_timeline_title')} icon={TrendingUp}>
              {timeline.map(item => (
                <TouchableOpacity key={item.id} style={styles.timelineRow} onPress={() => navigation.navigate(item.route)} activeOpacity={0.8}>
                  <View style={styles.timelineDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timelineTitle}>{item.type} · {item.title}</Text>
                    <Text style={styles.muted}>{new Date(item.date).toLocaleDateString(i18n.language)}</Text>
                  </View>
                  {!!item.value && <Text style={styles.timelineAmount}>{maskAmount(item.value)}</Text>}
                </TouchableOpacity>
              ))}
            </Section>

            <TouchableOpacity style={styles.exportCard} onPress={() => navigation.navigate('Export DGI Compatible')} activeOpacity={0.86}>
              <FileSpreadsheet size={22} color="#FFFFFF" />
              <Text style={styles.exportText}>{t('assistant_prepare_dgi')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Section: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <FadeInView delay={90}>
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon size={19} color="#1E5BAC" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  </FadeInView>
);

const Metric: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, strong && styles.metricStrong]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 21, fontWeight: '800', color: '#111827' },
  content: { padding: 18, paddingBottom: 34, gap: 14 },
  loadingCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 24, alignItems: 'center', gap: 10 },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  scoreTextBlock: { flex: 1, paddingRight: 14 },
  eyebrow: { fontSize: 13, fontWeight: '800', color: '#1E5BAC', marginBottom: 4 },
  score: { fontSize: 39, fontWeight: '900', color: '#0F172A', letterSpacing: 0 },
  scoreRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  muted: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  timelinePreviewCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, gap: 10 },
  timelinePreviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderInline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelinePreviewTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  timelinePreviewHint: { fontSize: 12, fontWeight: '800', color: '#1E5BAC' },
  timelinePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timelinePreviewType: { fontSize: 12, fontWeight: '900', color: '#1E5BAC' },
  timelinePreviewText: { flex: 1, fontSize: 13, fontWeight: '800', color: '#334155' },
  timelinePreviewAmount: { fontSize: 12, fontWeight: '900', color: '#111827' },
  searchCard: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 14, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  resultRow: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  resultType: { fontSize: 12, fontWeight: '800', color: '#1E5BAC' },
  resultLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  section: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#111827' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  checkText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#334155' },
  metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  metricLabel: { fontSize: 14, color: '#475569', fontWeight: '700' },
  metricValue: { fontSize: 15, color: '#111827', fontWeight: '800' },
  metricStrong: { color: '#1E5BAC', fontSize: 17 },
  warning: { fontSize: 13, fontWeight: '700', color: '#B45309', backgroundColor: '#FFFBEB', borderRadius: 12, padding: 10 },
  insight: { fontSize: 14, color: '#334155', fontWeight: '700', lineHeight: 20 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9 },
  reminderTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  reminderAmount: { fontSize: 14, fontWeight: '900', color: '#DC2626' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  timelineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#1E5BAC' },
  timelineTitle: { fontSize: 14, color: '#111827', fontWeight: '800' },
  timelineAmount: { fontSize: 13, fontWeight: '900', color: '#111827' },
  exportCard: { backgroundColor: '#1E5BAC', borderRadius: 18, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  exportText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
});

export default BusinessAssistant;
