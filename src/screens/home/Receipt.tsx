import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Coins } from 'lucide-react-native';
import type { ReceiptItem, ReceiptFormData } from '../../types/receipt.types';
import ReceiptCard from '../../components/receipt/ReceiptCard';
import CreateReceiptModal from '../../components/receipt/CreateReceiptModal';
import DetailModal from '../../components/receipt/DetailModal';
import { useReceipt } from '../../hooks/useReceipt';


const Receipt: React.FC = ({ navigation: navProp }: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const nav = navProp ?? navigation;

  const { getRevenues, createRevenue, updateRevenue, deleteRevenue } = useReceipt();

  const [receipts, setReceipts]           = useState<ReceiptItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [openMenuId, setOpenMenuId]       = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem]   = useState<ReceiptItem | null>(null);
  const [editingItem, setEditingItem]     = useState<ReceiptItem | null>(null);


  const fetchRevenues = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const result = await getRevenues();
    if (result.success) {
      const mapped: ReceiptItem[] = (result.revenues ?? []).map((r: any) => ({
        id: String(r.id),
        date: r.date
          ? new Date(r.date).toLocaleDateString('fr-FR')
          : '',
        amount: parseFloat(r.amount) || 0,
        paymentMethod: r.payment_method ?? 'other',
        note: r.description ?? undefined,
        documentUrl: r.add_receipt ?? undefined,
      }));
      setReceipts(mapped);
    } else {
      Alert.alert(t('error_title'), result.error ?? t('error_generic'));
    }
    if (!silent) setLoading(false);
    setRefreshing(false);
  }, [getRevenues, t]);

  useEffect(() => { fetchRevenues(); }, []);

  const handleSave = useCallback(async (data: ReceiptFormData) => {
    const payload = {
      date: data.date,
      amount: data.amount,
      payment_method: data.paymentMethod,
      notes: data.note || undefined,
      document: data.document ?? undefined,
    };
    if (editingItem) {
      const result = await updateRevenue(Number(editingItem.id), payload);
      setEditingItem(null);
      if (result.success) {
        fetchRevenues(true);
      } else {
        Alert.alert(t('error_title'), result.error ?? t('error_generic'));
      }
    } else {
      const result = await createRevenue(payload);
      if (result.success) {
        fetchRevenues(true);
      } else {
        Alert.alert(t('error_title'), result.error ?? t('error_generic'));
      }
    }
  }, [editingItem, createRevenue, updateRevenue, fetchRevenues, t]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      t('receipt_delete_confirm_title'),
      t('receipt_delete_confirm_msg'),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('action_delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteRevenue(Number(id));
            if (result.success) {
              fetchRevenues(true);
            } else {
              Alert.alert(t('error_title'), (result as any).error ?? t('error_generic'));
            }
          },
        },
      ],
    );
  }, [deleteRevenue, fetchRevenues, t]);

  const handleEdit = useCallback((item: ReceiptItem) => {
    setSelectedItem(null);
    setEditingItem(item);
    setShowCreateModal(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRevenues(true);
  }, [fetchRevenues]);


  const renderItem = ({ item }: { item: ReceiptItem }) => (
    <ReceiptCard
      item={item}
      onPress={setSelectedItem}
      openMenuId={openMenuId}
      onMenuToggle={setOpenMenuId}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );


  const ListEmpty = (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconCircle}>
        <Coins size={32} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>{t('receipt_empty_title')}</Text>
      <Text style={styles.emptySubtitle}>{t('receipt_empty_subtitle')}</Text>
      <TouchableOpacity
        style={styles.emptyAddBtn}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.emptyAddBtnTxt}>{t('receipt_btn_add')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => nav.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={16} color="#FFFFFF" />
          <Text style={styles.backBtnTxt}>{t('button_retour')}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('receipt_screen_title')}</Text>
          <Text style={styles.headerSub}>{t('receipt_screen_subtitle')}</Text>
        </View>

        <TouchableOpacity
          style={styles.addIconBtn}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.85}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <FlatList
          data={receipts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setOpenMenuId(null)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1E5BAC"
            />
          }
          ListHeaderComponent={
            <View style={{ gap: 16, marginBottom: 4 }}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{t('receipt_history_title')}</Text>
                <Text style={styles.sectionCount}>
                  {receipts.length} {receipts.length > 1 ? t('receipt_count_plural') : t('receipt_count_singular')}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={ListEmpty}
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

      {/* Create / Edit Modal */}
      <CreateReceiptModal
        visible={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingItem(null); }}
        onSave={handleSave}
        editItem={editingItem}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E5BAC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  backBtnTxt: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryCard: {
    borderRadius: 20,
    backgroundColor: '#1E5BAC',
    padding: 20,
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  summaryGrid: {
    flexDirection: 'row',
  },
  summaryCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryCellMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryCellLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  summaryCellAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryCellUnit: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  negativeSolde: { color: '#FCA5A5' },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  sectionCount: { fontSize: 13, fontWeight: '500', color: '#9CA3AF' },

  listContent: { padding: 16, paddingBottom: 110, gap: 12 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 8,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E5BAC',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyAddBtnTxt: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default Receipt;
