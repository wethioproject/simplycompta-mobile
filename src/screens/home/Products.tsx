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
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ArrowLeft, Plus, Edit2, Trash2, Package, X, Search, ChevronDown, Check } from 'lucide-react-native';
import { useProducts } from '../../hooks/useProduct';
import { useInvoice } from '../../hooks/useInvoice';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const TYPE_OPTIONS = ['Product', 'Service'] as const;

interface Product {
  id: number;
  customer_id: number;
  name: string;
  sale_price: string;
  tax_id: string;
  quantity: string | number;
  total_price_ht?: string;
  description?: string;
  sku?: string;
  type?: string;
  category_id?: number | null;
}

const productSchema = yup.object({
  designation: yup.string().trim().required('error_designation_required'),
  description: yup.string().trim().optional(),
  reference: yup.string().trim().optional(),
  type: yup.string().trim().required('error_type_required'),
  category_id: yup.string().trim().required('error_category_required'),
  unit_price_ht: yup
    .string()
    .trim()
    .required('error_unit_price_required')
    .test('is-number', 'error_unit_price_invalid', v => !v || !isNaN(parseFloat(v))),
  tva_percentage: yup
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
  unit_id: yup.string().trim().required('error_unit_required'),
});

interface ProductFormValues {
  designation: string;
  description: string;
  reference: string;
  type: string;
  category_id: string;
  unit_price_ht: string;
  tva_percentage: string;
  quantity: string;
  total_price_ht: string;
  unit_id: string;
}

const Products: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const customer = useSelector((state: any) => state.user.customer);
  const { getProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const { getProductResources } = useInvoice();

  const [tvaOptions, setTvaOptions] = useState<{ id: number; name: string; rate: string }[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ id: number; name: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ id: number; name: string; type?: string }[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTvaPicker, setShowTvaPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
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
      description: '',
      reference: '',
      type: 'Product',
      category_id: '',
      unit_price_ht: '',
      tva_percentage: '20',
      quantity: '',
      total_price_ht: '',
      unit_id: '',
    },
  });

  const watchedUnitPrice = watch('unit_price_ht');
  const watchedQty = watch('quantity');
  const watchedTva = watch('tva_percentage');

  useEffect(() => {
    const qty = parseFloat(watchedQty) || 0;
    const price = parseFloat(watchedUnitPrice) || 0;
    if (qty > 0 && price > 0) {
      setValue('total_price_ht', (qty * price).toFixed(2));
    }
  }, [watchedUnitPrice, watchedQty, setValue]);

  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const result = await getProducts();
    if (result.success) {
      const raw = result.products;
      setProducts(Array.isArray(raw) ? raw : (raw as any)?.data ?? []);
    }
    if (!silent) setLoading(false);
  }, [getProducts]);

  useEffect(() => {
    const fetchResources = async () => {
      const result = await getProductResources();
      if (result.success && result.resources) {
        const resources = result.resources as any;
        if (resources.tax && Array.isArray(resources.tax)) {
          setTvaOptions(resources.tax);
        }
        if (resources.units && Array.isArray(resources.units)) {
          setUnitOptions(resources.units);
        }
        if (resources.categories && Array.isArray(resources.categories)) {
          setCategoryOptions(resources.categories);
        }
      }
    };
    fetchResources();
  }, [getProductResources]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(true);
    setRefreshing(false);
  };

  // Open modal
  const openCreate = () => {
    setEditingProduct(null);
    reset({ designation: '', description: '', reference: '', type: 'Product', category_id: '', unit_price_ht: '', tva_percentage: '', quantity: '', total_price_ht: '', unit_id: '' });
    setModalVisible(true);
  };

  const openEdit = (item: Product) => {
    setEditingProduct(item);
    reset({
      designation: item.name,
      description: item.description ?? '',
      reference: item.sku ?? '',
      type: item.type ?? 'Product',
      category_id: item.category_id != null ? String(item.category_id) : '',
      unit_price_ht: item.sale_price,
      tva_percentage: item.tax_id,
      quantity: String(item.quantity),
      total_price_ht: item.total_price_ht ?? '',
      unit_id: (item as any).unit_id ? String((item as any).unit_id) : '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    reset();
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedProduct(null);
  };

  // Save (create or update)
  const onSubmit = async (data: ProductFormValues) => {
    setSaving(true);
    const payload = {
      customer_id: customer?.id,
      designation: data.designation,
      description: data.description,
      reference: data.reference,
      type: data.type,
      category_id: data.category_id ? Number(data.category_id) : null,
      unit_price_ht: data.unit_price_ht,
      tva_percentage: data.tva_percentage,
      quantity: data.quantity,
      unit_id: data.unit_id ? Number(data.unit_id) : null,
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

  const handleDelete = (item: Product) => {
    Alert.alert(
      t('alert_delete_product_title'),
      t('alert_delete_product_message').replace('{product}', item.name),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteProduct(item.id);
            if (result.success) {
              closeDetailModal();
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

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return product.name.toLowerCase().includes(query);
  });

  // ── Render product card ─────────────────────────────────────────────────────
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(item);
        setDetailModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      {/* Action buttons */}
      <View style={styles.cardActionButtons}>
        <TouchableOpacity
          style={styles.editIconBtn}
          onPress={() => {
            openEdit(item);
            setDetailModalVisible(false);
          }}
        >
          <Edit2 size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteIconBtn}
          onPress={() => handleDelete(item)}
        >
          <Trash2 size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Icon box */}
      <View style={styles.productIconBox}>
        <Package size={24} color="#0B5FA5" />
      </View>

      {/* Content */}
      <View style={styles.productContent}>
        {/* Name + type badge */}
        <View style={styles.productNameRow}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <View style={[
            styles.typeBadge,
            (item.type ?? '').toLowerCase() === 'product' ? styles.typeBadgeProduct : styles.typeBadgeService,
          ]}>
            <Text style={[
              styles.typeBadgeText,
              (item.type ?? '').toLowerCase() === 'product' ? styles.typeBadgeTextProduct : styles.typeBadgeTextService,
            ]}>
              {(item.type ?? '').toLowerCase() === 'product' ? t('type_badge_product') : t('type_badge_service')}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>

        {/* Footer: category badge + price */}
        <View style={styles.productFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {categoryOptions.find(c => c.id === item.category_id)?.name ?? (item.type ?? 'Produit')}
            </Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.priceValue}>
              {parseFloat(item.sale_price).toLocaleString('fr-FR')}
            </Text>
            <Text style={styles.priceLabel}>MAD H.T.</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isSearchActive) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.searchInputBox}>
            <Search size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('header_products')}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {filteredProducts.length === 0 && searchQuery ? (
          <View style={styles.emptySearchState}>
            <Package size={48} color="#D1D5DB" />
            <Text style={styles.emptySearchTitle}>{t('empty_no_products')}</Text>
            <Text style={styles.emptySearchSubtitle}>{t('empty_search_no_products', { query: searchQuery })}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderProduct}
            contentContainerStyle={styles.listContent}
            scrollEnabled
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('header_products')}</Text>
        <TouchableOpacity onPress={() => setIsSearchActive(true)}>
          <Search size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCardWrapper}>
        <View style={styles.statsCard}>
          <View style={styles.statsCardTop}>
            <Text style={styles.statsLabel}>{t('header_products')}</Text>
            <Package size={20} color="rgba(255,255,255,0.75)" />
          </View>
          <Text style={styles.statsValue}>{products.length}</Text>
          <Text style={styles.statsSubtitle}>{t('stats_products_subtitle')}</Text>
        </View>
      </View>

      {/* Product list */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0B5FA5" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          contentContainerStyle={[styles.listContent, filteredProducts.length === 0 && styles.listEmpty]}
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

      {/* Detail Modal */}
      {selectedProduct && (
        <Modal visible={detailModalVisible} animationType="slide" transparent onRequestClose={closeDetailModal}>
          <View style={styles.detailModalOverlay}>
            <View style={styles.detailModalSheet}>
              {/* Header */}
              <View style={styles.detailModalHeader}>
                <Text style={styles.detailModalTitle}>{t('detail_modal_title_product')}</Text>
                <TouchableOpacity onPress={closeDetailModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.detailModalContent} showsVerticalScrollIndicator={false}>
                {/* Icon + name + type badge */}
                <View style={styles.detailIconSection}>
                  <View style={styles.detailIcon}>
                    <Package size={32} color="#0B5FA5" />
                  </View>
                  <View style={styles.detailNameRow}>
                    <Text style={styles.detailName}>{selectedProduct.name}</Text>
                    <View style={[
                      styles.typeBadge,
                      (selectedProduct.type ?? '').toLowerCase() === 'product' ? styles.typeBadgeProduct : styles.typeBadgeService,
                    ]}>
                      <Text style={[
                        styles.typeBadgeText,
                        (selectedProduct.type ?? '').toLowerCase() === 'product' ? styles.typeBadgeTextProduct : styles.typeBadgeTextService,
                      ]}>
                        {(selectedProduct.type ?? '').toLowerCase() === 'product' ? t('type_badge_product') : t('type_badge_service')}
                      </Text>
                    </View>
                  </View>
                  {selectedProduct.description ? (
                    <Text style={styles.detailDesc}>{selectedProduct.description}</Text>
                  ) : null}
                </View>

                {/* Details */}
                <View style={styles.detailSection}>
                  {selectedProduct.sku ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('label_reference')}</Text>
                      <Text style={styles.detailValue}>{selectedProduct.sku}</Text>
                    </View>
                  ) : null}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('label_category')}</Text>
                    <View style={styles.detailCategoryRow}>
                      <View style={styles.detailCategoryDot} />
                      <Text style={styles.detailValue}>
                        {categoryOptions.find(c => c.id === selectedProduct.category_id)?.name ?? '—'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('label_price_ht')}</Text>
                    <Text style={styles.detailValue}>
                      {parseFloat(selectedProduct.sale_price).toLocaleString('fr-FR')} MAD
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('label_tva_short')}</Text>
                    <Text style={styles.detailValue}>
                      {(() => {
                        const tax = tvaOptions.find(t => String(t.id) === String(selectedProduct.tax_id));
                        return tax ? `${tax.name} (${tax.rate})` : selectedProduct.tax_id;
                      })()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('label_quantity')}</Text>
                    <Text style={styles.detailValue}>{selectedProduct.quantity}</Text>
                  </View>
                  <View style={styles.detailRowTotal}>
                    <Text style={styles.detailLabelTotal}>{t('label_price_ttc_short')}</Text>
                    <Text style={styles.detailValueTotal}>
                      {(() => {
                        const tax = tvaOptions.find(t => String(t.id) === String(selectedProduct.tax_id));
                        const rate = tax ? parseFloat(tax.rate) : 0;
                        const total = parseFloat(selectedProduct.sale_price) * Number(selectedProduct.quantity) * (1 + rate / 100);
                        return total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      })()} MAD
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={styles.detailModalActions}>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => { handleDelete(selectedProduct); }}>
                  <Trash2 size={16} color="#DC2626" />
                  <Text style={styles.deleteBtnText}>{t('button_delete')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBtn} onPress={() => { openEdit(selectedProduct); closeDetailModal(); }}>
                  <Edit2 size={16} color="#FFFFFF" />
                  <Text style={styles.editBtnText}>{t('button_edit')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add / Edit modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>

            {/* Sticky header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? t('modal_title_edit') : t('modal_title_create')}
              </Text>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Scrollable form body */}
            <ScrollView
              style={styles.modalFormScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* ── Designation ──────────────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_designation')}</Text>
                  <Text style={styles.fieldRequired}>*</Text>
                </View>
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

              {/* ── Description ──────────────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_description')}</Text>
                </View>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.fieldInput, styles.fieldInputMultiline, errors.description && styles.fieldInputError]}
                      placeholder={t('placeholder_description')}
                      placeholderTextColor="#BBBBBB"
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  )}
                />
                {errors.description && (
                  <Text style={styles.fieldError}>{t(errors.description.message ?? '')}</Text>
                )}
              </View>

              {/* ── Reference ────────────────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_reference')}</Text>
                </View>
                <Controller
                  control={control}
                  name="reference"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.reference && styles.fieldInputError]}
                      placeholder={t('placeholder_reference')}
                      placeholderTextColor="#BBBBBB"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.reference && (
                  <Text style={styles.fieldError}>{t(errors.reference.message ?? '')}</Text>
                )}
              </View>

              {/* ── Type toggle (2-button) ──────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_type')}</Text>
                  <Text style={styles.fieldRequired}>*</Text>
                </View>
                <Controller
                  control={control}
                  name="type"
                  render={({ field: { value } }) => (
                    <View style={styles.typeToggleRow}>
                      <TouchableOpacity
                        style={[
                          styles.typeToggleBtn,
                          value === 'Service' && styles.typeToggleBtnServiceActive,
                        ]}
                        onPress={() => setValue('type', 'Service', { shouldValidate: true })}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.typeToggleBtnText,
                          value === 'Service' && styles.typeToggleBtnTextServiceActive,
                        ]}>Service</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.typeToggleBtn,
                          value === 'Product' && styles.typeToggleBtnProductActive,
                        ]}
                        onPress={() => setValue('type', 'Product', { shouldValidate: true })}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.typeToggleBtnText,
                          value === 'Product' && styles.typeToggleBtnTextProductActive,
                        ]}>{t('type_product')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.type && (
                  <Text style={styles.fieldError}>{t(errors.type.message ?? '')}</Text>
                )}
              </View>

              {/* ── Category dropdown (API-driven) ──────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_category')}</Text>
                  <Text style={styles.fieldRequired}>*</Text>
                </View>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      style={[styles.pickerRow, errors.category_id && styles.fieldInputError]}
                      onPress={() => setShowCategoryPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={value ? styles.pickerValueText : styles.pickerPlaceholderText}>
                        {categoryOptions.find(c => String(c.id) === value)?.name ?? t('placeholder_select')}
                      </Text>
                      <ChevronDown size={18} color="#0B5FA5" />
                    </TouchableOpacity>
                  )}
                />
                {errors.category_id && (
                  <Text style={styles.fieldError}>{t(errors.category_id.message ?? '')}</Text>
                )}
              </View>

              {/* ── Prix H.T. ────────────────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_unit_price')}</Text>
                  <Text style={styles.fieldRequired}>*</Text>
                </View>
                <Controller
                  control={control}
                  name="unit_price_ht"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.unit_price_ht && styles.fieldInputError]}
                      placeholder="0.00"
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

              {/* ── TVA dropdown ────────────────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_vat_percent')}</Text>
                  <Text style={styles.fieldRequired}>*</Text>
                </View>
                <Controller
                  control={control}
                  name="tva_percentage"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      style={[styles.pickerRow, errors.tva_percentage && styles.fieldInputError]}
                      onPress={() => setShowTvaPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={value ? styles.pickerValueText : styles.pickerPlaceholderText}>
                        {(() => {
                          const selected = tvaOptions.find(t => String(t.id) === value);
                          return selected ? `${selected.name} (${selected.rate})` : (value || t('placeholder_select'));
                        })()}
                      </Text>
                      <ChevronDown size={18} color="#0B5FA5" />
                    </TouchableOpacity>
                  )}
                />
                {errors.tva_percentage && (
                  <Text style={styles.fieldError}>{t(errors.tva_percentage.message ?? '')}</Text>
                )}
              </View>

              {/* ── Unit dropdown ────────────────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_unit')}</Text>
                  <Text style={styles.fieldRequired}>*</Text>
                </View>
                <Controller
                  control={control}
                  name="unit_id"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      style={[styles.pickerRow, errors.unit_id && styles.fieldInputError]}
                      onPress={() => setShowUnitPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={value ? styles.pickerValueText : styles.pickerPlaceholderText}>
                        {(() => {
                          const selected = unitOptions.find(u => String(u.id) === value);
                          return selected ? selected.name : t('placeholder_select');
                        })()}
                      </Text>
                      <ChevronDown size={18} color="#0B5FA5" />
                    </TouchableOpacity>
                  )}
                />
                {errors.unit_id && (
                  <Text style={styles.fieldError}>{t(errors.unit_id.message ?? '')}</Text>
                )}
              </View>

              {/* ── Quantity ─────────────────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('label_quantity')}</Text>
                  <Text style={styles.fieldRequired}>*</Text>
                </View>
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

              {/* ── Total H.T. computed ───────────────────────────────── */}
              {watchedUnitPrice && watchedQty &&
                parseFloat(watchedUnitPrice) > 0 && parseFloat(watchedQty) > 0 && (
                <View style={styles.computedBox}>
                  <View style={styles.computedRow}>
                    <Text style={styles.computedLabel}>{t('label_total_ht_computed')}</Text>
                    <Text style={styles.computedValue}>
                      {(parseFloat(watchedUnitPrice) * parseFloat(watchedQty)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                    </Text>
                  </View>
                  <Text style={styles.computedHint}>{t('label_total_ht_hint')}</Text>
                </View>
              )}

              {/* ── T.T.C. computed ──────────────────────────────────── */}
              {watchedUnitPrice && parseFloat(watchedUnitPrice) > 0 && (
                <View style={styles.ttcBox}>
                  <Text style={styles.ttcLabel}>{t('label_price_ttc')}</Text>
                  <Text style={styles.ttcValue}>
                    {(() => {
                      const selectedTax = tvaOptions.find(t => String(t.id) === watchedTva);
                      const rate = selectedTax ? parseFloat(selectedTax.rate) : 0;
                      return (
                        (parseFloat(watchedUnitPrice) * (parseFloat(watchedQty) || 1))
                        * (1 + rate / 100)
                      ).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()} MAD
                  </Text>
                </View>
              )}

              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>{t('button_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!isValid || saving) && styles.saveBtnDisabled]}
                onPress={handleSubmit(onSubmit as any)}
                disabled={!isValid || saving}
                activeOpacity={0.8}
              >
                {saving
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={styles.saveBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                      {editingProduct ? t('button_save_changes') : t('button_add_product')}
                    </Text>
                }
              </TouchableOpacity>
            </View>

            {/* ── Category Picker inline overlay (API-driven) ─────── */}
            {showCategoryPicker && (
              <TouchableOpacity
                style={styles.inlinePickerOverlay}
                activeOpacity={1}
                onPress={() => setShowCategoryPicker(false)}
              >
                <View style={styles.inlinePickerSheet}>
                  <Text style={styles.pickerSheetTitle}>{t('label_category')}</Text>
                  {categoryOptions.map(cat => {
                    const isSelected = watch('category_id') === String(cat.id);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={styles.pickerOption}
                        onPress={() => { setValue('category_id', String(cat.id), { shouldValidate: true }); setShowCategoryPicker(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionSelected]}>{cat.name}</Text>
                        {isSelected && <Check size={16} color="#0B5FA5" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </TouchableOpacity>
            )}

            {/* ── TVA Picker inline overlay ───────────────────────── */}
            {showTvaPicker && (
              <TouchableOpacity
                style={styles.inlinePickerOverlay}
                activeOpacity={1}
                onPress={() => setShowTvaPicker(false)}
              >
                <View style={styles.inlinePickerSheet}>
                  <Text style={styles.pickerSheetTitle}>{t('label_vat_percent')}</Text>
                  {tvaOptions.map(opt => {
                    const isSelected = watch('tva_percentage') === String(opt.id);
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={styles.pickerOption}
                        onPress={() => { setValue('tva_percentage', String(opt.id), { shouldValidate: true }); setShowTvaPicker(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionSelected]}>{opt.name} ({opt.rate})</Text>
                        {isSelected && <Check size={16} color="#0B5FA5" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </TouchableOpacity>
            )}

            {/* ── Unit Picker inline overlay ──────────────────────── */}
            {showUnitPicker && (
              <TouchableOpacity
                style={styles.inlinePickerOverlay}
                activeOpacity={1}
                onPress={() => setShowUnitPicker(false)}
              >
                <View style={styles.inlinePickerSheet}>
                  <Text style={styles.pickerSheetTitle}>{t('label_unit')}</Text>
                  {unitOptions.map(opt => {
                    const isSelected = watch('unit_id') === String(opt.id);
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={styles.pickerOption}
                        onPress={() => { setValue('unit_id', String(opt.id), { shouldValidate: true }); setShowUnitPicker(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionSelected]}>{opt.name}</Text>
                        {isSelected && <Check size={16} color="#0B5FA5" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </TouchableOpacity>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5FA' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: '#111827' },
  
  // Stats Card
  statsCardWrapper: { paddingHorizontal: 16, paddingVertical: 12 },
  statsCard: { backgroundColor: '#0B5FA5', borderRadius: 12, padding: 16, overflow: 'hidden' },
  statsCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statsLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(255, 255, 255, 0.75)' },
  statsValue: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  statsSubtitle: { fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' },
  
  // Product Card
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  productCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2,
    position: 'relative',
  },
  cardActionButtons: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    flexDirection: 'row', 
    gap: 8,
    zIndex: 10,
  },
  editIconBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    backgroundColor: '#0B5FA5', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteIconBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    backgroundColor: '#DC2626', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  productIconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    backgroundColor: '#EAF2FB', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12,
  },
  productContent: { flex: 1, paddingRight: 44 },
  productHeader: { marginBottom: 8 },
  productInfo: { },
  productNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  productName: { fontSize: 14, fontWeight: '600', color: '#111827', flexShrink: 1 },
  productDesc: { fontSize: 12, color: '#6B7280', marginBottom: 10 },

  // Type badge (card + detail)
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  typeBadgeService: { backgroundColor: '#D1FAE5' },
  typeBadgeProduct: { backgroundColor: '#EDE9FE' },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  typeBadgeTextService: { color: '#059669' },
  typeBadgeTextProduct: { color: '#7C3AED' },

  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { backgroundColor: '#EAF2FB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, maxWidth: '55%' },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#0B5FA5' },
  priceSection: { flexDirection: 'column', alignItems: 'flex-end' },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#0B5FA5', lineHeight: 24 },
  priceLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  
  // Search View
  searchHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInputBox: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 10, 
    fontSize: 14, 
    color: '#111827' 
  },
  
  emptySearchState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptySearchTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 12 },
  emptySearchSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  
  // Detail Modal
  detailModalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end' 
  },
  detailModalSheet: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    maxHeight: '80%',
  },
  detailModalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailModalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  detailModalContent: { marginBottom: 20 },
  
  // Type toggle (form)
  typeToggleRow: { flexDirection: 'row', gap: 12 },
  typeToggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  typeToggleBtnServiceActive: { borderColor: '#059669', backgroundColor: '#D1FAE5' },
  typeToggleBtnProductActive: { borderColor: '#7C3AED', backgroundColor: '#EDE9FE' },
  typeToggleBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  typeToggleBtnTextServiceActive: { color: '#059669' },
  typeToggleBtnTextProductActive: { color: '#7C3AED' },

  detailIconSection: { alignItems: 'center', marginBottom: 20 },
  detailIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 12, 
    backgroundColor: '#EAF2FB', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 12,
  },
  detailNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 4 },
  detailName: { fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center' },
  detailDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  detailCategoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailCategoryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0B5FA5' },
  
  detailSection: { marginVertical: 12 },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  detailRowTotal: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 12,
    backgroundColor: '#EAF2FB',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailLabelTotal: { fontSize: 13, color: '#0B5FA5', fontWeight: '600' },
  detailValueTotal: { fontSize: 16, fontWeight: '700', color: '#0B5FA5' },
  
  detailModalActions: { 
    flexDirection: 'row', 
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    gap: 6,
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  editBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0B5FA5',
    gap: 6,
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingTop: 0,
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalFormScroll: { paddingHorizontal: 20, paddingTop: 20 },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  cancelBtn: {
    flex: 0,
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },

  fieldGroup: { marginBottom: 18 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  fieldRequired: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  fieldOptional: { fontSize: 11, fontWeight: '400', color: '#9CA3AF' },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  fieldInputMultiline: { minHeight: 80, paddingTop: 12 },
  fieldInputError: { borderColor: '#DC2626' },
  fieldInputComputed: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  fieldError: { fontSize: 11, color: '#DC2626', marginTop: 4 },
  fieldRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  fieldRowSpacer: { width: 12 },

  // Picker dropdown row (trigger button)
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerValueText: { fontSize: 14, color: '#111827', flex: 1 },
  pickerPlaceholderText: { fontSize: 14, color: '#BBBBBB', flex: 1 },

  // Picker sheet modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  pickerSheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  pickerOptionText: { fontSize: 15, fontWeight: '500', color: '#374151' },
  pickerOptionSelected: { color: '#0B5FA5', fontWeight: '700' },

  // Inline picker overlays (rendered inside the add/edit modal to avoid stacked-modal issues)
  inlinePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  inlinePickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // Computed boxes
  computedBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  computedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  computedLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  computedValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  computedHint: { fontSize: 11, color: '#9CA3AF' },
  ttcBox: {
    backgroundColor: '#EAF2FB',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ttcLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  ttcValue: { fontSize: 16, fontWeight: '700', color: '#0B5FA5' },

  saveBtn: { flex: 1, backgroundColor: '#0B5FA5', borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  saveBtnDisabled: { backgroundColor: '#BCC0CA' },
  
  fab: { position: 'absolute', bottom: 24, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0B5FA5', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
});

export default Products;
