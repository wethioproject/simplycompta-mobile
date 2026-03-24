import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  RefreshControl,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { ArrowLeft, FileText, Download, Receipt, X, ExternalLink, Calendar, CreditCard, Clock, BadgeCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

interface InvoiceItem {
  id: number;
  customer_id: number;
  client_id: number;
  date: string;
  invoice_number: string;
  payment_method: string;
  status: string;
  review_status: string | null;
  notes: string | null;
  document_path: string | null;
  invoice_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Quotes:    { bg: '#4FA3D1', text: '#FFFFFF' },
  Payé:      { bg: '#6FB13F', text: '#FFFFFF' },
  Paid:      { bg: '#6FB13F', text: '#FFFFFF' },
  Issued:    { bg: '#8d3fb1', text: '#FFFFFF' },
  Annulé:    { bg: '#FF0000', text: '#FFFFFF' },
  Canceled:  { bg: '#FF0000', text: '#FFFFFF' },
  Cancelled: { bg: '#FF0000', text: '#FFFFFF' },
};

const DEFAULT_STATUS = { bg: '#F3F4F6', text: '#6B7280' };

const REVIEW_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:  { bg: '#FEF3C7', text: '#D97706' },
  APPROVED: { bg: '#DCFCE7', text: '#16A34A' },
  REJECTED: { bg: '#FEE2E2', text: '#DC2626' },
};
const DEFAULT_REVIEW = { bg: '#F3F4F6', text: '#6B7280' };

const REVIEW_LABEL_KEYS: Record<string, string> = {
  PENDING:  'review_status_pending',
  APPROVED: 'review_status_approved',
  REJECTED: 'review_status_rejected',
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { bg, text } = STATUS_COLORS[status] ?? DEFAULT_STATUS;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
};

const AccountStatement: React.FC = ({ navigation, route }: any) => {
  console.log('AccountStatement route params:', route.params);
  const { t, i18n } = useTranslation();
  const { client } = route.params ?? {};
  const token = useSelector((state: any) => state.user.token);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`${Api_Endpoints.customerClientInvoice}/${client?.id}`);
      if (res.data?.success) {
        console.log('Invoices fetch response:', res.data);
        setInvoices(res.data.data ?? []);
      } else {
        setError(t('as_error_load_invoices'));
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? t('as_error_loading');
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchInvoiceDetail = async (id: number) => {
    setLoadingDetail(true);
    setSelectedInvoiceDetail(null);
    try {
      const res = await api.get(`${Api_Endpoints.customerInvoice}/${id}`);
      console.log('Invoice detail response:', JSON.stringify(res.data, null, 2));
      setSelectedInvoiceDetail(res.data?.data ?? res.data);
    } catch (e: any) {
      console.error('Failed to fetch invoice detail:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (client?.id) fetchData();
  }, [client?.id]);

  const handleDownload = (item: InvoiceItem) => {
    console.log('atttem iteeem', item.pdf_url, item.invoice_url);
    const url = item.pdf_url ?? item.invoice_url;
    if (!url) return;
    Linking.openURL(url).catch(() =>
      Alert.alert(t('error_title'), t('as_error_open_document'))
    );
  };

  const handleDownloadPdf = async (item: InvoiceItem) => {
      setDownloadingPdfId(item.id);
      let pdfPath: string | null = null;
      try {
        const url: any = item.pdf_url ?? item.invoice_url;
        const { fs, config } = ReactNativeBlobUtil;
        const safeNumber = item.invoice_number.replace(/[^a-zA-Z0-9]/g, '_');
        const filePath =
          Platform.OS === 'ios'
            ? `${fs.dirs.DocumentDir}/invoice_pdf_${safeNumber}.pdf`
            : `${fs.dirs.DownloadDir}/invoice_pdf_${safeNumber}.pdf`;
  
        if (await fs.exists(filePath)) await fs.unlink(filePath);
  
        const res = await config({ fileCache: true, path: filePath }).fetch('GET', url, {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        });
  
        const headers = res.respInfo.headers;
        const contentType = (headers['Content-Type'] || headers['content-type'] || 'application/pdf')
          .split(';')[0]
          .trim();
  
        if (contentType.includes('text/html')) {
          await fs.unlink(filePath).catch(() => {});
          Alert.alert(t('error_title'), t('error_pdf_expired'));
          return;
        }
  
        pdfPath = res.path();
      } catch (e: any) {
        console.error('PDF download error:', e);
        Alert.alert(t('error_title'), t('error_unable_to_download_pdf'));
      } finally {
        setDownloadingPdfId(null);
      }
  
      if (pdfPath) {
        // onClose();
        const path = pdfPath;
        setTimeout(() => {
          if (Platform.OS === 'ios') {
            ReactNativeBlobUtil.ios.openDocument(path);
          } else {
            ReactNativeBlobUtil.android.actionViewIntent(path, 'application/pdf');
          }
        }, 400);
      }
    };

  const renderItem = ({ item }: { item: InvoiceItem }) => {
    const formattedDate = new Date(item.date).toLocaleDateString(i18n.language);
    const hasDoc = !!(item.pdf_url ?? item.invoice_url);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedInvoice(item);
          fetchInvoiceDetail(item.id);
        }}
        activeOpacity={0.75}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconBox}>
            <FileText size={20} color="#1E5BAC" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>{formattedDate} · {item.payment_method}</Text>
            <View style={{ marginTop: 6 }}>
              <StatusBadge status={item.status} />
            </View>
          </View>
        </View>
        {hasDoc ? (
          <TouchableOpacity
            style={[styles.downloadBtn, downloadingPdfId === item.id && { opacity: 0.5 }]}
            onPress={() => handleDownloadPdf(item)}
            disabled={downloadingPdfId === item.id}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {downloadingPdfId === item.id ? (
              <ActivityIndicator size="small" color="#1E5BAC" />
            ) : (
              <Download size={18} color="#1E5BAC" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('title_account_statement')}</Text>
        </View>
      </View>

      {/* Client Banner */}
      <LinearGradient
        colors={['#EFF6FF', '#DBEAFE']}
        style={styles.clientBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.clientBannerInner}>
          <View style={styles.clientAvatarCircle}>
            <Text style={styles.clientAvatarInitial}>
              {client?.company_name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.clientName}>{client?.company_name ?? '—'}</Text>
            <Text style={styles.clientSub}>{invoices.length} {invoices.length !== 1 ? t('as_invoices_plural') : t('as_invoice_singular')}</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#1E5BAC" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Receipt size={44} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('empty_no_invoices')}</Text>
            </View>
          }
        />
      )}

      {/* Invoice Detail Modal */}
      <Modal
        visible={!!selectedInvoice}
        transparent
        animationType="slide"
        onRequestClose={() => { setSelectedInvoice(null); setSelectedInvoiceDetail(null); }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { setSelectedInvoice(null); setSelectedInvoiceDetail(null); }}
        />
        {selectedInvoice && (
          <View style={styles.modalSheet}>
            {/* Sheet handle */}
            <View style={styles.sheetHandle} />

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <FileText size={22} color="#1E5BAC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{t('as_invoice_title', { number: selectedInvoice.invoice_number })}</Text>
                <Text style={styles.modalSubtitle}>ID: {selectedInvoice.id}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => { setSelectedInvoice(null); setSelectedInvoiceDetail(null); }}
                activeOpacity={0.7}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Badges row */}
            <View style={styles.badgesRow}>
              <StatusBadge status={selectedInvoice.status} />
              {selectedInvoice.review_status && (() => {
                const rv = REVIEW_STATUS_COLORS[selectedInvoice.review_status] ?? DEFAULT_REVIEW;
                return (
                  <View style={[styles.badge, { backgroundColor: rv.bg }]}>
                    <Text style={[styles.badgeText, { color: rv.text }]}>
                      {t(REVIEW_LABEL_KEYS[selectedInvoice.review_status!] ?? selectedInvoice.review_status!)}
                    </Text>
                  </View>
                );
              })()}
            </View>

            {loadingDetail && (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#1E5BAC" />
              </View>
            )}

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              {/* Detail rows — sourced from selectedInvoiceDetail */}
              {selectedInvoiceDetail && (
                <>
                  <DetailRow
                    icon={<FileText size={16} color="#1E5BAC" />}
                    label={t('label_invoice_number')}
                    value={selectedInvoiceDetail.invoice_number ?? '—'}
                  />
                  <DetailRow
                    icon={<Receipt size={16} color="#1E5BAC" />}
                    label={t('label_client_name')}
                    value={selectedInvoiceDetail.client?.client_name ?? '—'}
                  />
                  <DetailRow
                    icon={<CreditCard size={16} color="#1E5BAC" />}
                    label={t('label_payment_method')}
                    value={selectedInvoiceDetail.payment_method ?? '—'}
                  />
                  <DetailRow
                    icon={<BadgeCheck size={16} color="#1E5BAC" />}
                    label={t('label_status')}
                    value={selectedInvoiceDetail.status ?? '—'}
                  />
                  <DetailRow
                    icon={<Clock size={16} color="#1E5BAC" />}
                    label={t('as_detail_created_on')}
                    value={new Date(selectedInvoiceDetail.created_at).toLocaleDateString(i18n.language, {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  />
                  <DetailRow
                    icon={<Calendar size={16} color="#1E5BAC" />}
                    label={t('label_last_updated')}
                    value={new Date(selectedInvoiceDetail.updated_at).toLocaleDateString(i18n.language, {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  />
                </>
              )}

              {/* PDF Download button */}
              {/* {(selectedInvoice.pdf_url ?? selectedInvoice.invoice_url) && (
                <TouchableOpacity
                  style={styles.pdfBtn}
                  onPress={() => handleDownloadPdf(selectedInvoice)}
                  activeOpacity={0.8}
                >
                  <ExternalLink size={18} color="#FFFFFF" />
                  <Text style={styles.pdfBtnText}>{t('as_view_download_invoice')}</Text>
                </TouchableOpacity>
              )} */}
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

/* ─── Helper sub-component ─────────────────────────────────────── */
const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconWrap}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: { alignItems: 'center', marginBottom: 12 },
  logo: { height: 48, width: 160 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },

  // Client banner
  clientBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  clientBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  clientAvatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center', alignItems: 'center',
  },
  clientAvatarInitial: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  clientName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  clientSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  // List
  listContent: { padding: 16, gap: 10, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  invoiceNumber: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 3 },
  invoiceMeta: { fontSize: 12, color: '#6B7280' },

  // Badge
  badge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  // Download
  downloadBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center', paddingHorizontal: 24 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  // Modal / bottom sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.78,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  modalIconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  modalSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  modalBody: { flex: 0 },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  detailLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 3 },
  detailValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },

  // PDF button
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1E5BAC',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 24,
  },
  pdfBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default AccountStatement;
