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
import { useInvoice } from '../../hooks/useInvoice';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import type { Article } from '../../types/invoice.types';

const CATEGORY_OPTIONS = ['Produit', 'Service'] as const;

const ArticleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (article: Article) => void;
  customerId?: number;
}> = ({ visible, onClose, onConfirm, customerId }) => {
  const { t } = useTranslation();
  const { getProducts } = useProducts();
  const { createProduct, getProductResources } = useInvoice();

  const [form, setForm] = useState<Article & { description?: string; reference?: string; category?: string }>({
    designation: '',
    unitPriceHT: 0,
    quantity: 1,
    totalHT: 0,
    tva: 20,
    description: '',
    reference: '',
    category: 'Produit',
  });
  const [tvaOptions, setTvaOptions] = useState<number[]>([0, 7, 10, 14, 20]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showTvaPicker, setShowTvaPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch product resources on mount
  useEffect(() => {
    const fetchResources = async () => {
      const result = await getProductResources();
      console.log('preeeeeeee', result);
      if (result.success && result.resources) {
        const resources = result.resources as any;
        if (resources.tva && Array.isArray(resources.tva)) {
          setTvaOptions(resources.tva.map((t: any) => typeof t === 'number' ? t : parseFloat(t)));
        }
      }
    };
    fetchResources();
  }, [getProductResources]);

  // Recalculate total whenever unit price or quantity changes
  useEffect(() => {
    setForm(prev => ({ ...prev, totalHT: prev.unitPriceHT * prev.quantity }));
  }, [form.unitPriceHT, form.quantity]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    }
  }, [visible]);

  const handleDesignationChange = (value: string) => {
    setForm(prev => ({ ...prev, designation: value }));
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
        setShowSuggestions(list.length > 0 || false);
      } else {
        setShowSuggestions(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (product: any) => {
    const unitPrice = parseFloat(product.unit_price_ht) || 0;
    const qty = parseFloat(product.quantity) || form.quantity;
    const tva = parseFloat(product.tva_percentage) || form.tva;
    setForm({
      designation: product.designation,
      unitPriceHT: unitPrice,
      quantity: qty,
      totalHT: unitPrice * qty,
      tva,
      description: product.description ?? '',
      reference: product.reference ?? '',
      category: product.category ?? 'Produit',
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleConfirm = async () => {
    if (!form.designation.trim()) {
      Alert.alert(t('alert_field_required'), t('message_designation_required'));
      return;
    }
    let product_id: number | undefined;
    if (customerId) {
      const result = await createProduct({
        customer_id: customerId,
        designation: form.designation,
        description: form.description ?? '',
        reference: form.reference ?? '',
        category: form.category ?? 'Produit',
        unit_price_ht: form.unitPriceHT,
        tva_percentage: form.tva,
        quantity: form.quantity,
        total_price_ht: form.totalHT,
      });
      if (result.success) {
        product_id = (result.data as any)?.id ?? (result as any)?.product_id;
      }
      console.log('wewewewe',product_id);
    }
    onConfirm({ ...form, product_id });
    setForm({ designation: '', unitPriceHT: 0, quantity: 1, totalHT: 0, tva: 20, description: '', reference: '', category: 'Produit' });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.modalSheet} edges={['top']}>
          {/* Sticky header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('modal_title_article_designation')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Scrollable form body */}
          <ScrollView
            style={styles.modalFormScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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
              {/* Autocomplete suggestions */}
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
                        style={[
                          styles.suggestionItem,
                          index < suggestions.length - 1 && styles.suggestionItemBorder,
                        ]}
                        onPress={() => handleSelectSuggestion(product)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.suggestionDesignation}>{product.designation}</Text>
                        <Text style={styles.suggestionMeta}>
                          {parseFloat(product.unit_price_ht).toLocaleString('fr-FR')} MAD HT  ·  TVA {product.tva_percent}%
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
                <Text style={styles.fieldRequired}>*</Text>
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
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TextInput
                style={styles.fieldInput}
                placeholder={t('placeholder_reference')}
                placeholderTextColor="#BBBBBB"
                value={form.reference || ''}
                onChangeText={v => setForm(prev => ({ ...prev, reference: v }))}
              />
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
                <Text style={styles.pickerValueText}>
                  {form.category || 'Produit'}
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
                onChangeText={v => setForm(prev => ({
                  ...prev,
                  unitPriceHT: parseFloat(v) || 0,
                  totalHT: (parseFloat(v) || 0) * prev.quantity,
                }))}
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
                onChangeText={v => setForm(prev => ({
                  ...prev,
                  quantity: parseFloat(v) || 0,
                  totalHT: prev.unitPriceHT * (parseFloat(v) || 0),
                }))}
              />
            </View>

            {/* TVA */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{t('label_tva_percent')}</Text>
                <Text style={styles.fieldRequired}>*</Text>
              </View>
              <TouchableOpacity
                style={styles.pickerRow}
                onPress={() => setShowTvaPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerValueText}>
                  {form.tva}%
                </Text>
                <ChevronDown size={18} color="#0B5FA5" />
              </TouchableOpacity>
            </View>

            {/* Total H.T. computed box */}
            {form.unitPriceHT > 0 && form.quantity > 0 && (
              <View style={styles.computedBox}>
                <View style={styles.computedRow}>
                  <Text style={styles.computedLabel}>{t('label_price_ht_total')}</Text>
                  <Text style={styles.computedValue}>
                    {form.totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                  </Text>
                </View>
              </View>
            )}

            {/* T.T.C. computed box */}
            {form.unitPriceHT > 0 && (
              <View style={styles.ttcBox}>
                <Text style={styles.ttcLabel}>{t('label_price_ttc')}</Text>
                <Text style={styles.ttcValue}>
                  {(form.totalHT * (1 + form.tva / 100)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                </Text>
              </View>
            )}

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>{t('modal_cancel_text')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!form.designation.trim() || !form.unitPriceHT) && styles.saveBtnDisabled]}
              onPress={handleConfirm}
              disabled={!form.designation.trim() || !form.unitPriceHT}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>{t('button_add')}</Text>
            </TouchableOpacity>
          </View>

          {/* Category Picker inline overlay */}
          {showCategoryPicker && (
            <TouchableOpacity
              style={styles.inlinePickerOverlay}
              activeOpacity={1}
              onPress={() => setShowCategoryPicker(false)}
            >
              <View style={styles.inlinePickerSheet}>
                <Text style={styles.pickerSheetTitle}>{t('label_category')}</Text>
                {CATEGORY_OPTIONS.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.pickerOption}
                    onPress={() => { setForm(prev => ({ ...prev, category: cat })); setShowCategoryPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerOptionText, form.category === cat && styles.pickerOptionSelected]}>
                      {cat}
                    </Text>
                    {form.category === cat && <Check size={16} color="#0B5FA5" />}
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
                    key={opt}
                    style={styles.pickerOption}
                    onPress={() => { setForm(prev => ({ ...prev, tva: opt })); setShowTvaPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerOptionText, form.tva === opt && styles.pickerOptionSelected]}>
                      {opt}%
                    </Text>
                    {form.tva === opt && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ArticleModal;
