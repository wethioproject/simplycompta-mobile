import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ArrowLeft, Plus, Pencil, Trash2, Package, X } from 'lucide-react-native';
import { useProducts } from '../../hooks/useProduct';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface Product {
  id: number;
  customer_id: number;
  designation: string;
  unit_price_ht: string;
  tva_percent: string;
  quantity: string;
  total_price_ht: string;
}

const productSchema = yup.object({
  designation: yup.string().trim().required('error_designation_required'),
  unit_price_ht: yup
    .string()
    .trim()
    .required('error_unit_price_required')
    .test('is-number', 'error_unit_price_invalid', v => !v || !isNaN(parseFloat(v))),
  tva_percent: yup
    .string()
    .trim()
    .required('error_tva_required')
    .test('is-number', 'error_tva_invalid', v => !v || !isNaN(parseFloat(v))),
  quantity: yup
    .string()
    .trim()
    .required('error_quantity_required')
    .test('is-number', 'error_quantity_invalid', v => !v || !isNaN(parseFloat(v))),
  total_price_ht: yup.string().default(''),
});

interface ProductFormValues {
  designation: string;
  unit_price_ht: string;
  tva_percent: string;
  quantity: string;
  total_price_ht: string;
}

const Products: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const customer = useSelector((state: any) => state.user.customer);
  console.log('added prod100', customer);
  const { getProducts, createProduct, updateProduct, deleteProduct } = useProducts();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // ── react-hook-form ──────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ProductFormValues>({
    resolver: yupResolver(productSchema) as any,
    mode: 'onChange',
    defaultValues: {
      designation: '',
      unit_price_ht: '',
      tva_percent: '',
      quantity: '',
      total_price_ht: '',
    },
  });

  const watchedUnitPrice = watch('unit_price_ht');
  const watchedQty = watch('quantity');

  // ── Auto-calculate total_price_ht when qty or unit price changes ────────────
  useEffect(() => {
    const qty = parseFloat(watchedQty) || 0;
    const price = parseFloat(watchedUnitPrice) || 0;
    if (qty > 0 && price > 0) {
      setValue('total_price_ht', (qty * price).toFixed(2));
    }
  }, [watchedUnitPrice, watchedQty, setValue]);

  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    console.log('added prod103', silent);
    const result = await getProducts();
    console.log('added prod104', result);
    if (result.success) {
      console.log('added prod105', result.success);
      const raw = result.products;
      setProducts(Array.isArray(raw) ? raw : (raw as any)?.data ?? []);
      console.log('added prod106', raw);
    }
    if (!silent) setLoading(false);
  }, [getProducts]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(true);
    setRefreshing(false);
  };

  // ── Open modal ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingProduct(null);
    reset({ designation: '', unit_price_ht: '', tva_percent: '', quantity: '', total_price_ht: '' });
    setModalVisible(true);
  };

  const openEdit = (item: Product) => {
    setEditingProduct(item);
    reset({
      designation: item.designation,
      unit_price_ht: item.unit_price_ht,
      tva_percent: item.tva_percent,
      quantity: item.quantity,
      total_price_ht: item.total_price_ht,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    reset();
  };

  // ── Save (create or update) ──────────────────────────────────────────────────
  const onSubmit = async (data: ProductFormValues) => {
    setSaving(true);
    const payload = {
      customer_id: customer?.id,
      ...data,
    };
    const result = editingProduct
      ? await updateProduct(editingProduct.id, payload)
      : await createProduct(payload);
    setSaving(false);
    if (result.success) {
      closeModal();
      fetchProducts(true);
    } else {
      Alert.alert(t('error_title'), (result as any).error || t('error_save_product'));
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = (item: Product) => {
    Alert.alert(
      t('alert_delete_product_title'),
      t('alert_delete_product_message').replace('{product}', item.designation),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteProduct(item.id);
            if (result.success) {
              fetchProducts(true);
            } else {
              Alert.alert(t('error_title'), (result as any).error || t('error_delete_product'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ── Render product card ─────────────────────────────────────────────────────
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardIconWrapper}>
        <Package size={22} color="#0B5FA5" />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.designation}</Text>
        <View style={styles.cardRow}>
          <View style={styles.cardPill}>
            <Text style={styles.cardPillLabel}>{t('label_pill_unit_price')}</Text>
            <Text style={styles.cardPillValue}>{item.unit_price_ht}</Text>
          </View>
          <View style={styles.cardPill}>
            <Text style={styles.cardPillLabel}>{t('label_pill_vat')}</Text>
            <Text style={styles.cardPillValue}>{item.tva_percent} %</Text>
          </View>
          <View style={styles.cardPill}>
            <Text style={styles.cardPillLabel}>{t('label_pill_qty')}</Text>
            <Text style={styles.cardPillValue}>{item.quantity}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardTotal}>{t('label_total_ht')} : <Text style={styles.cardTotalValue}>{item.total_price_ht}</Text></Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
              <Pencil size={16} color="#0B5FA5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Trash2 size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0B5FA5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('header_products')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Product list */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0B5FA5" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          contentContainerStyle={[styles.listContent, products.length === 0 && styles.listEmpty]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0B5FA5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package size={56} color="#C7D2DC" />
              <Text style={styles.emptyTitle}>{t('empty_no_products')}</Text>
              <Text style={styles.emptySubtitle}>{t('empty_no_products_subtitle')}</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Add / Edit modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? t('modal_title_edit') : t('modal_title_create')}
              </Text>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Fields */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('label_designation')}</Text>
              <Controller
                control={control}
                name="designation"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.fieldInput, errors.designation && styles.fieldInputError]}
                    placeholder={t('placeholder_designation')}
                    placeholderTextColor="#BBBBBB"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.designation && (
                <Text style={styles.fieldError}>{t(errors.designation.message ?? '')}</Text>
              )}
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>{t('label_unit_price')}</Text>
                <Controller
                  control={control}
                  name="unit_price_ht"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.unit_price_ht && styles.fieldInputError]}
                      placeholder={t('placeholder_unit_price')}
                      placeholderTextColor="#BBBBBB"
                      keyboardType="decimal-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.unit_price_ht && (
                  <Text style={styles.fieldError}>{t(errors.unit_price_ht.message ?? '')}</Text>
                )}
              </View>
              <View style={styles.fieldRowSpacer} />
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>{t('label_vat_percent')}</Text>
                <Controller
                  control={control}
                  name="tva_percent"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.tva_percent && styles.fieldInputError]}
                      placeholder={t('placeholder_vat_percent')}
                      placeholderTextColor="#BBBBBB"
                      keyboardType="decimal-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.tva_percent && (
                  <Text style={styles.fieldError}>{t(errors.tva_percent.message ?? '')}</Text>
                )}
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>{t('label_quantity')}</Text>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.quantity && styles.fieldInputError]}
                      placeholder={t('placeholder_quantity')}
                      placeholderTextColor="#BBBBBB"
                      keyboardType="decimal-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.quantity && (
                  <Text style={styles.fieldError}>{t(errors.quantity.message ?? '')}</Text>
                )}
              </View>
              <View style={styles.fieldRowSpacer} />
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>{t('label_total_price')}</Text>
                <Controller
                  control={control}
                  name="total_price_ht"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.fieldInput, styles.fieldInputComputed]}
                      placeholder={t('placeholder_unit_price')}
                      placeholderTextColor="#BBBBBB"
                      keyboardType="decimal-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, (!isValid || saving) && styles.saveBtnDisabled]}
              onPress={handleSubmit(onSubmit as any)}
              disabled={!isValid || saving}
            >
              {saving
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.saveBtnText}>
                    {editingProduct ? t('button_save_changes') : t('button_add_product')}
                  </Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EDF2',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#1A2233' },

  // List
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 100 },
  listEmpty: { flex: 1 },

  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyTitle: { marginTop: 16, fontSize: 17, fontWeight: '600', color: '#8A9AB0' },
  emptySubtitle: { marginTop: 6, fontSize: 13, color: '#A8B5C3', textAlign: 'center', paddingHorizontal: 32 },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EAF2FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1A2233', marginBottom: 8 },
  cardRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  cardPill: {
    backgroundColor: '#F2F4F7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  cardPillLabel: { fontSize: 10, color: '#8A9AB0', fontWeight: '500' },
  cardPillValue: { fontSize: 13, color: '#1A2233', fontWeight: '600', marginTop: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTotal: { fontSize: 13, color: '#8A9AB0' },
  cardTotalValue: { color: '#0B5FA5', fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EAF2FB', justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
  },

  // FAB
  fab: {
    position: 'absolute', right: 22, bottom: 22,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#0B5FA5',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0B5FA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A2233' },

  // Form fields
  fieldGroup: { marginBottom: 14 },
  fieldRow: { flexDirection: 'row', marginBottom: 0 },
  fieldRowSpacer: { width: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#8A9AB0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#1A2233', backgroundColor: '#FAFBFC',
  },
  fieldInputComputed: { backgroundColor: '#F0F6FF', borderColor: '#C7DEFF' },
  fieldInputError: { borderColor: '#DC2626' },
  fieldError: { fontSize: 11, color: '#DC2626', marginTop: 4 },

  // Save button
  saveBtn: {
    marginTop: 20, backgroundColor: '#0B5FA5',
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  saveBtnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0, elevation: 0 },
});

export default Products;
