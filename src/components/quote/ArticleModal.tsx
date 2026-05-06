import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown, Check } from 'lucide-react-native';
import { useProducts } from '../../hooks/useProduct';
import { useQuote } from '../../hooks/useQuote';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import type { Article } from '../../types/invoice.types';

const TYPE_OPTIONS = ['Product', 'Service'] as const;

const ArticleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (article: Article) => void;
  customerId?: number;
}> = ({ visible, onClose, onConfirm, customerId }) => {
  const { t } = useTranslation();
  const { getProducts } = useProducts();
  const { createProduct, getProductResources } = useQuote();

  const [form, setForm] = useState<Article & { description?: string; reference?: string; type?: string; unit_id?: number; discount?: number }>({
    designation: '',
    unitPriceHT: 0,
    quantity: 1,
    totalHT: 0,
    tva: null as any,
    description: '',
    reference: '',
    type: 'Product',
  });
  const [tvaOptions, setTvaOptions] = useState<{ id: number; name: string; rate: string }[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ id: number; name: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ id: number; name: string; type: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showTvaPicker, setShowTvaPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      totalHT: prev.unitPriceHT * prev.quantity,
    }));
  }, [form.unitPriceHT, form.quantity, form.discount]);

  useEffect(() => {
    if (!visible) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    }
  }, [visible]);

  const handleDesignationChange = (value: string) => {
    setForm(prev => ({ ...prev, designation: value }));
    setSelectedProductId(undefined);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      setShowSuggestions(true);
      const result = await getProducts({ like: value });
      setSuggestionsLoading(false);
      if (result.success) {
        const raw = result.products;
        const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (product: any) => {
    const unitPrice = parseFloat(product.sale_price) || 0;
    const qty = parseFloat(product.quantity) || form.quantity;
    const tva = parseFloat(product.tax_id) || form.tva;
    console.log('gggggggrrttt', product)
    setSelectedProductId(product.id ?? undefined);
    setForm({
      designation: product.name ?? product.designation ?? '',
      unitPriceHT: unitPrice,
      quantity: qty,
      totalHT: unitPrice * qty,
      tva,
      description: product.description ?? '',
      reference: product.sku ?? product.reference ?? '',
      type: product.type ?? 'Product',
      unit_id: product.unit_id ?? undefined,
      discount: product.discount ? parseFloat(product.discount) : undefined,
    });
    setSelectedCategoryId(product.category_id ?? null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleConfirm = async () => {
    if (!form.designation.trim()) {
      Alert.alert(t('alert_field_required'), t('message_designation_required'));
      return;
    }
    if (selectedCategoryId == null) {
      Alert.alert(t('alert_field_required'), t('message_category_required'));
      return;
    }
    if ((form as any).unit_id == null) {
      Alert.alert(t('alert_field_required'), t('message_unit_required'));
      return;
    }
    let product_id: number | undefined = selectedProductId;
    if (customerId) {
      const result = await createProduct({
        customer_id: customerId,
        designation: form.designation,
        description: form.description ?? '',
        reference: form.reference ?? '',
        type: form.type ?? 'Product',
        category_id: selectedCategoryId,
        unit_price_ht: form.unitPriceHT,
        tva_percentage: form.tva,
        quantity: form.quantity,
        total_price_ht: form.totalHT,
        unit_id: form.unit_id ?? null,
      });
      if (result.success) {
        product_id = (result.data as any)?.id ?? (result as any)?.product_id;
      }
    }
    onConfirm({ ...form, product_id } as any);
    setForm({ designation: '', unitPriceHT: 0, quantity: 1, totalHT: 0, tva: null as any, description: '', reference: '', type: 'Product', unit_id: undefined, discount: undefined });
    setSelectedProductId(undefined);
    setSelectedCategoryId(null);
    setShowSuggestions(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.modalSheet} edges={['top']}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('modal_title_article_designation')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Désignation */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_designation')}</Text>
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder={t('placeholder_designation')}
                placeholderTextColor="#BBBBBB"
                value={form.designation}
                onChangeText={handleDesignationChange}
                autoCorrect={false}
              />
              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  {suggestionsLoading ? (
                    <View style={styles.suggestionLoadingRow}>
                      <ActivityIndicator size="small" color="#1E5BAC" />
                      <Text style={styles.suggestionLoadingText}>{t('text_searching')}</Text>
                    </View>
                  ) : (
                    suggestions.map((product, index) => (
                      <TouchableOpacity
                        key={product.id ?? index}
                        style={[styles.suggestionItem, index < suggestions.length - 1 && styles.suggestionItemBorder]}
                        onPress={() => handleSelectSuggestion(product)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.suggestionDesignation}>{product.name ?? product.designation}</Text>
                        <Text style={styles.suggestionMeta}>
                          {parseFloat(product.sale_price ?? product.unit_price_ht ?? '0').toLocaleString('fr-FR')} MAD HT · TVA {product.tax_id ?? product.tva_percentage ?? 0}%
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_description')}</Text>
              </View>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMultiline]}
                placeholder={t('placeholder_description')}
                placeholderTextColor="#BBBBBB"
                value={form.description || ''}
                onChangeText={v => setForm(prev => ({ ...prev, description: v }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Reference */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_reference')}</Text>
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder={t('placeholder_reference')}
                placeholderTextColor="#BBBBBB"
                value={form.reference || ''}
                onChangeText={v => setForm(prev => ({ ...prev, reference: v }))}
              />
            </View>

            {/* Type */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_type')}</Text>
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TouchableOpacity
                style={styles.pickerRow}
                onPress={() => setShowTypePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerValueText}>{form.type === 'Product' ? t('category_product') : form.type === 'Service' ? t('category_service') : form.type ?? t('category_product')}</Text>
                <ChevronDown size={18} color="#0B5FA5" />
              </TouchableOpacity>
            </View>

            {/* Category */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_category')}</Text>
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TouchableOpacity
                style={styles.pickerRow}
                onPress={() => setShowCategoryPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={selectedCategoryId ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {categoryOptions.find(c => c.id === selectedCategoryId)?.name ?? t('placeholder_select')}
                </Text>
                <ChevronDown size={18} color="#0B5FA5" />
              </TouchableOpacity>
            </View>

            {/* Prix H.T. unitaire */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_unit_price_ht')}</Text>
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder="0.00"
                placeholderTextColor="#BBBBBB"
                keyboardType="decimal-pad"
                value={form.unitPriceHT > 0 ? String(form.unitPriceHT) : ''}
                onChangeText={v =>
                  setForm(prev => ({
                    ...prev,
                    unitPriceHT: parseFloat(v) || 0,
                    totalHT: (parseFloat(v) || 0) * prev.quantity,
                  }))
                }
              />
            </View>

            {/* Quantité */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_quantity')}</Text>
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder="1"
                placeholderTextColor="#BBBBBB"
                keyboardType="decimal-pad"
                value={form.quantity > 0 ? String(form.quantity) : ''}
                onChangeText={v =>
                  setForm(prev => ({
                    ...prev,
                    quantity: parseFloat(v) || 0,
                    totalHT: prev.unitPriceHT * (parseFloat(v) || 0),
                  }))
                }
              />
            </View>

            {/* Unit */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_unit')}</Text>
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TouchableOpacity style={styles.pickerRow} onPress={() => setShowUnitPicker(true)} activeOpacity={0.7}>
                <Text style={form.unit_id ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {unitOptions.find(u => u.id === form.unit_id)?.name ?? t('placeholder_select')}
                </Text>
                <ChevronDown size={18} color="#0B5FA5" />
              </TouchableOpacity>
            </View>

            {/* Discount */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_discount')}</Text>
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder="0"
                placeholderTextColor="#BBBBBB"
                keyboardType="decimal-pad"
                value={form.discount != null && form.discount > 0 ? String(form.discount) : ''}
                onChangeText={v => setForm(prev => ({ ...prev, discount: parseFloat(v) || undefined }))}
              />
            </View>

            {/* TVA */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_tva_percent')}</Text>
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TouchableOpacity style={styles.pickerRow} onPress={() => setShowTvaPicker(true)} activeOpacity={0.7}>
                <Text style={styles.pickerValueText}>
                  {(() => {
                    const selected = tvaOptions.find(opt => opt.id === form.tva);
                    console.log('jkjkjk101', tvaOptions)
                    console.log('jkjkjk102', unitOptions)
                    console.log('jkjkjk103', form)
                    return selected ? `${selected.name} (${selected.rate})` : '-';
                  })()}
                </Text>
                <ChevronDown size={18} color="#0B5FA5" />
              </TouchableOpacity>
            </View>

            {/* Total H.T. computed box */}
            {form.unitPriceHT > 0 && form.quantity > 0 && (
              <View style={styles.computedBox}>
                <View style={styles.computedRow}>
                  <Text style={styles.computedLabel}>{t('label_subtotal_ht')}</Text>
                  <Text style={styles.computedValue}>
                    {(form.unitPriceHT * form.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                  </Text>
                </View>
                {(form.discount ?? 0) > 0 && (
                  <View style={styles.computedRow}>
                    <Text style={[styles.computedLabel, { color: '#EF4444' }]}>{t('label_discount')}</Text>
                    <Text style={[styles.computedValue, { color: '#EF4444' }]}>
                      - {(form.discount ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                    </Text>
                  </View>
                )}
                <View style={[styles.computedRow, { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 6, paddingTop: 6 }]}>
                  <Text style={[styles.computedLabel, { fontWeight: '700', color: '#1F2937' }]}>{t('label_price_ht_total')}</Text>
                  <Text style={[styles.computedValue, { fontWeight: '700', color: '#1F2937' }]}>
                    {((form.unitPriceHT * form.quantity) - (form.discount ?? 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                  </Text>
                </View>
              </View>
            )}

            {/* T.T.C. computed box */}
            {form.unitPriceHT > 0 && (
              <View style={styles.ttcBox}>
                <Text style={styles.ttcLabel}>{t('label_price_ttc')}</Text>
                <Text style={styles.ttcValue}>
                  {(() => {
                    const selectedTva = tvaOptions.find(t => t.id === form.tva);
                    const vatRate = parseFloat(String(selectedTva?.rate ?? 0)) || 0;
                    const baseHT = (form.unitPriceHT * form.quantity) - (form.discount ?? 0);
                    return (baseHT * (1 + vatRate / 100)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  })()} MAD
                </Text>
              </View>
            )}

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>{t('modal_cancel_text')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.saveBtn, (!form.designation.trim() || !form.unitPriceHT || form.tva == null || selectedCategoryId == null || (form as any).unit_id == null) && styles.saveBtnDisabled]}
              onPress={handleConfirm}
              disabled={!form.designation.trim() || !form.unitPriceHT || form.tva == null || selectedCategoryId == null || (form as any).unit_id == null}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>{t('button_add')}</Text>
            </TouchableOpacity>
          </View>

          {/* Type Picker inline overlay */}
          {showTypePicker && (
            <TouchableOpacity
              style={styles.inlinePickerOverlay}
              activeOpacity={1}
              onPress={() => setShowTypePicker(false)}
            >
              <View style={styles.inlinePickerSheet}>
                <Text style={styles.pickerSheetTitle}>{t('label_type')}</Text>
                {TYPE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.pickerOption}
                    onPress={() => { setForm(prev => ({ ...prev, type: opt })); setShowTypePicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerOptionText, form.type === opt && styles.pickerOptionSelected]}>
                      {opt === 'Product' ? t('category_product') : t('category_service')}
                    </Text>
                    {form.type === opt && <Check size={16} color="#0B5FA5" />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          )}

          {/* Category Picker inline overlay */}
          {showCategoryPicker && (
            <TouchableOpacity
              style={styles.inlinePickerOverlay}
              activeOpacity={1}
              onPress={() => setShowCategoryPicker(false)}
            >
              <View style={styles.inlinePickerSheet}>
                <Text style={styles.pickerSheetTitle}>{t('label_category')}</Text>
                {categoryOptions.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.pickerOption}
                    onPress={() => { setSelectedCategoryId(cat.id); setShowCategoryPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerOptionText, selectedCategoryId === cat.id && styles.pickerOptionSelected]}>
                      {cat.name}
                    </Text>
                    {selectedCategoryId === cat.id && <Check size={16} color="#0B5FA5" />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          )}

          {/* TVA Picker inline overlay */}
          {showTvaPicker && (
            <TouchableOpacity
              style={styles.inlinePickerOverlay}
              activeOpacity={1}
              onPress={() => setShowTvaPicker(false)}
            >
              <View style={styles.inlinePickerSheet}>
                <Text style={styles.pickerSheetTitle}>{t('label_tva_percent')}</Text>
                {tvaOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={styles.pickerOption}
                    onPress={() => { setForm(prev => ({ ...prev, tva: opt.id })); setShowTvaPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerOptionText, form.tva === opt.id && styles.pickerOptionSelected]}>
                      {opt.name} ({opt.rate})
                    </Text>
                    {form.tva === opt.id && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          )}

          {/* Unit Picker inline overlay */}
          {showUnitPicker && (
            <TouchableOpacity
              style={styles.inlinePickerOverlay}
              activeOpacity={1}
              onPress={() => setShowUnitPicker(false)}
            >
              <View style={styles.inlinePickerSheet}>
                <Text style={styles.pickerSheetTitle}>{t('label_unit')}</Text>
                <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {unitOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={styles.pickerOption}
                    onPress={() => { setForm(prev => ({ ...prev, unit_id: opt.id })); setShowUnitPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerOptionText, (form as any).unit_id === opt.id && styles.pickerOptionSelected]}>
                      {opt.name}
                    </Text>
                    {(form as any).unit_id === opt.id && <Check size={16} color="#0B5FA5" />}
                  </TouchableOpacity>
                ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ArticleModal;
