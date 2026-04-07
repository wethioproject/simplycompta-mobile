import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Receipt } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';

import { ClientInvoiceItem } from '../../types/client.types';
import { getClientInvoices, getInvoiceDetail } from '../../services/client.service';
import { styles } from '../../styles/accountStatement.styles';
import { ClientHeader } from '../../components/clients/ClientHeader';
import { InvoiceCard } from '../../components/clients/InvoiceCard';
import { InvoiceDetailModal } from '../../components/clients/InvoiceDetailModal';

const AccountStatement: React.FC = ({ navigation, route }: any) => {
  console.log('AccountStatement route params:', route.params);
  const { t, i18n } = useTranslation();
  const { client } = route.params ?? {};
  const token = useSelector((state: any) => state.user.token);

  const [invoices, setInvoices] = useState<ClientInvoiceItem[]>([]);
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoiceItem | null>(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getClientInvoices(client?.id);
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
      const res = await getInvoiceDetail(id);
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

  const handleDownloadPdf = async (item: ClientInvoiceItem) => {
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ClientHeader
        title={t('title_account_statement')}
        onBack={() => navigation.goBack()}
      />

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
            <Text style={styles.clientSub}>
              {invoices.length} {invoices.length !== 1 ? t('as_invoices_plural') : t('as_invoice_singular')}
            </Text>
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
          renderItem={({ item }) => (
            <InvoiceCard
              item={item}
              onPress={() => {
                setSelectedInvoice(item);
                fetchInvoiceDetail(item.id);
              }}
              onDownloadPdf={() => handleDownloadPdf(item)}
              downloadingPdfId={downloadingPdfId}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(); }}
              tintColor="#1E5BAC"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Receipt size={44} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('empty_no_invoices')}</Text>
            </View>
          }
        />
      )}

      <InvoiceDetailModal
        invoice={selectedInvoice}
        invoiceDetail={selectedInvoiceDetail}
        loadingDetail={loadingDetail}
        onClose={() => {
          setSelectedInvoice(null);
          setSelectedInvoiceDetail(null);
        }}
      />
    </SafeAreaView>
  );
};

export default AccountStatement;
