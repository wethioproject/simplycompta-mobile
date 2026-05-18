import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RNShare from 'react-native-share';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, CheckCircle2, Download, FileSpreadsheet, ReceiptText } from 'lucide-react-native';
import { useInvoice } from '../../hooks/useInvoice';
import { useExpense } from '../../hooks/useExpense';
import type { ExpenseItem } from '../../types/expense.types';
import type { InvoiceItem } from '../../types/invoice.types';
import {
  buildDgiFileName,
  buildDgiHtmlWorkbook,
  expensesToDgiRows,
  invoicesToDgiRows,
  type DgiExportKind,
} from '../../utils/dgiExport';
import { useSecurity } from '../../contexts/SecurityContext';

type ExportScope = DgiExportKind | 'both';

const normalizeInvoiceList = (payload: any): InvoiceItem[] => {
  const source = payload?.data ?? payload;
  const candidates = [
    source?.invoices,
    source?.data?.invoices,
    source?.data?.data,
    source?.data,
    source,
  ];
  return candidates.find(Array.isArray) ?? [];
};

const DgiExport: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { getInvoices, getInvoice } = useInvoice();
  const { getExpenses } = useExpense();
  const { requestSensitiveAuth, recordSecurityEvent } = useSecurity();
  const today = new Date();
  const [scope, setScope] = useState<ExportScope>('expenses');
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const MONTHS = useMemo(() => [
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
  ], [t]);

  const scopeOptions = useMemo(() => [
    { key: 'expenses' as ExportScope, label: t('dgi_scope_expenses', { defaultValue: 'Dépenses' }) },
    { key: 'invoices' as ExportScope, label: t('dgi_scope_invoices', { defaultValue: 'Factures' }) },
    { key: 'both' as ExportScope, label: t('dgi_scope_both', { defaultValue: 'Les deux' }) },
  ], [t]);

  const updateMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    setMonth(next.getMonth() + 1);
    setYear(next.getFullYear());
  };

  const writeAndShare = async (fileName: string, html: string) => {
    const { fs } = ReactNativeBlobUtil;
    const filePath = `${fs.dirs.CacheDir}/${fileName}`;
    if (await fs.exists(filePath)) await fs.unlink(filePath);
    await fs.writeFile(filePath, html, 'utf8');

    if (Platform.OS === 'ios') {
      await RNShare.open({
        url: `file://${filePath}`,
        type: 'application/vnd.ms-excel',
        failOnCancel: false,
      });
      return;
    }

    await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'application/vnd.ms-excel');
  };

  const fetchInvoiceDetails = async (invoices: InvoiceItem[]): Promise<InvoiceItem[]> => {
    const detailed = await Promise.all(invoices.map(async invoice => {
      if (invoice.articles?.length) return invoice;
      const result = await getInvoice(invoice.id);
      const payload = result.invoice?.invoice ?? result.invoice?.data ?? result.invoice;
      return {
        ...invoice,
        ...payload,
        articles: payload?.articles ?? invoice.articles ?? [],
      };
    }));
    return detailed;
  };

  const exportKind = async (kind: DgiExportKind) => {
    if (kind === 'expenses') {
      const result = await getExpenses({ month, year });
      if (!result.success) throw new Error(result.error || t('error_export_expenses', { defaultValue: 'Impossible d’exporter les dépenses' }));
      const expenses = (result.expenses ?? []) as ExpenseItem[];
      const rows = expensesToDgiRows(expenses);
      const title = `${t('dgi_title', { defaultValue: 'Export DGI Compatible' })} - ${t('dgi_scope_expenses', { defaultValue: 'Dépenses' })} - ${MONTHS[month - 1]} ${year}`;
      await writeAndShare(buildDgiFileName('expenses', month, year), buildDgiHtmlWorkbook(title, rows));
      return rows.length;
    }

    const result = await getInvoices({ month, year });
    if (!result.success) throw new Error(result.error || t('error_generic'));
    const invoices = normalizeInvoiceList(result.invoices);
    const detailedInvoices = await fetchInvoiceDetails(invoices);
    const rows = invoicesToDgiRows(detailedInvoices);
    const title = `${t('dgi_title', { defaultValue: 'Export DGI Compatible' })} - ${t('dgi_scope_invoices', { defaultValue: 'Factures' })} - ${MONTHS[month - 1]} ${year}`;
    await writeAndShare(buildDgiFileName('invoices', month, year), buildDgiHtmlWorkbook(title, rows));
    return rows.length;
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setLastExport(null);
    try {
      const allowed = await requestSensitiveAuth(t('security_confirm_dgi_export', { defaultValue: 'Confirmer l’export DGI' }));
      if (!allowed) return;
      const exportedKinds: DgiExportKind[] = scope === 'both' ? ['expenses', 'invoices'] : [scope];
      let totalRows = 0;
      for (const kind of exportedKinds) {
        totalRows += await exportKind(kind);
      }
      await recordSecurityEvent(t('security_event_dgi_export', { defaultValue: 'Export DGI généré' }));
      setLastExport(t('dgi_export_success', {
        count: totalRows,
        defaultValue: `${totalRows} ligne(s) exportée(s) au format DGI.`,
      }));
    } catch (error: any) {
      Alert.alert(t('error_title'), error?.message || t('error_document_unavailable'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('dgi_title', { defaultValue: 'Export DGI Compatible' })}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <FileSpreadsheet size={30} color="#1E5BAC" />
          </View>
          <Text style={styles.heroTitle}>{t('dgi_hero_title', { defaultValue: 'Préparer un fichier conforme au modèle DGI' })}</Text>
          <Text style={styles.heroText}>
            {t('dgi_hero_desc', { defaultValue: 'Générez un tableau Excel avec les colonnes N° ordre, date facture, fournisseur/client, ICE, HT, TVA, TTC et mode de règlement.' })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dgi_scope_title', { defaultValue: 'Données à exporter' })}</Text>
          <View style={styles.segment}>
            {scopeOptions.map(option => {
              const active = scope === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => setScope(option.key)}
                  activeOpacity={0.82}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dgi_period_title', { defaultValue: 'Période' })}</Text>
          <View style={styles.periodCard}>
            <TouchableOpacity style={styles.periodBtn} onPress={() => updateMonth(-1)} activeOpacity={0.75}>
              <Text style={styles.periodBtnText}>-</Text>
            </TouchableOpacity>
            <View style={styles.periodCenter}>
              <Calendar size={18} color="#1E5BAC" />
              <Text style={styles.periodText}>{MONTHS[month - 1]} {year}</Text>
            </View>
            <TouchableOpacity style={styles.periodBtn} onPress={() => updateMonth(1)} activeOpacity={0.75}>
              <Text style={styles.periodBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <ReceiptText size={18} color="#1E5BAC" />
            <Text style={styles.previewTitle}>{t('dgi_columns_title', { defaultValue: 'Colonnes incluses' })}</Text>
          </View>
          <Text style={styles.previewText}>
            {t('dgi_columns_desc', { defaultValue: 'N° ordre, Date facture, N° facture, Nom fournisseur/client, N° I.F., ICE, Désignation, MT HT, Taux TVA, MT TVA, MT TTC, Mode règlement, Date règlement, N° compte.' })}
          </Text>
        </View>

        {lastExport && (
          <View style={styles.successCard}>
            <CheckCircle2 size={18} color="#16A34A" />
            <Text style={styles.successText}>{lastExport}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
          onPress={handleExport}
          disabled={exporting}
          activeOpacity={0.86}
        >
          {exporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Download size={20} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>{t('dgi_export_button', { defaultValue: 'Générer l’export DGI' })}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSpacer: { width: 40 },
  content: { padding: 20, paddingBottom: 36, gap: 18 },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7EEF8',
    gap: 10,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 19, fontWeight: '900', color: '#0F172A' },
  heroText: { fontSize: 13, lineHeight: 20, color: '#64748B', fontWeight: '600' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#334155', textTransform: 'uppercase' },
  segment: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#EAF0F8',
    borderRadius: 16,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentBtnActive: { backgroundColor: '#1E5BAC' },
  segmentText: { fontSize: 12, fontWeight: '800', color: '#475569', textAlign: 'center' },
  segmentTextActive: { color: '#FFFFFF' },
  periodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7EEF8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBtnText: { fontSize: 22, fontWeight: '900', color: '#1E5BAC' },
  periodCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  periodText: { fontSize: 16, fontWeight: '900', color: '#111827' },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EEF8',
    gap: 9,
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewTitle: { fontSize: 15, fontWeight: '900', color: '#111827' },
  previewText: { fontSize: 12, lineHeight: 19, color: '#64748B', fontWeight: '600' },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successText: { flex: 1, fontSize: 13, fontWeight: '800', color: '#166534' },
  exportBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#1E5BAC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#1E5BAC',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  exportBtnDisabled: { opacity: 0.72 },
  exportBtnText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
});

export default DgiExport;
