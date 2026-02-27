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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, Download, Receipt } from 'lucide-react-native';
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
  document_path: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isPaid = status === 'Payé';
  const isCancelled = status === 'Annulé';
  const bg = isPaid ? '#DCFCE7' : isCancelled ? '#FEE2E2' : '#FFEDD5';
  const color = isPaid ? '#16A34A' : isCancelled ? '#DC2626' : '#EA580C';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{status}</Text>
    </View>
  );
};

const AccountStatement: React.FC = ({ navigation, route }: any) => {
  const { client } = route.params ?? {};
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get(`${Api_Endpoints.customerClientInvoice}/${client?.id}`);
      if (res.data?.success) {
        setInvoices(res.data.data ?? []);
      } else {
        setError('Impossible de charger les factures.');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erreur lors du chargement.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (client?.id) fetchData();
  }, [client?.id]);

  const handleDownload = (item: InvoiceItem) => {
    if (!item.invoice_url) return;
    Linking.openURL(item.invoice_url).catch(() =>
      Alert.alert('Erreur', "Impossible d'ouvrir le document.")
    );
  };

  const renderItem = ({ item }: { item: InvoiceItem }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
    return (
      <View style={styles.card}>
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
        {item.invoice_url ? (
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => handleDownload(item)}
            activeOpacity={0.7}
          >
            <Download size={18} color="#1E5BAC" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>
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
          <Text style={styles.headerTitle}>Historique des factures</Text>
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
            <Text style={styles.clientSub}>{invoices.length} facture{invoices.length !== 1 ? 's' : ''}</Text>
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
              <Text style={styles.emptyText}>Aucune facture trouvée</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

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
});

export default AccountStatement;
