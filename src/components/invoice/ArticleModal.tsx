import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { X } from 'lucide-react-native';
import { useProducts } from '../../hooks/useProduct';
import type { Article } from '../../types/invoice.types';

const ArticleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (article: Article) => void;
}> = ({ visible, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const { getProducts } = useProducts();

  const [form, setForm] = useState<Article>({
    designation: '',
    unitPriceHT: 0,
    quantity: 1,
    totalHT: 0,
    tva: 20,
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const tva = parseFloat(product.tva_percent) || form.tva;
    setForm({
      designation: product.designation,
      unitPriceHT: unitPrice,
      quantity: qty,
      totalHT: unitPrice * qty,
      tva,
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleConfirm = () => {
    if (!form.designation.trim()) {
      Alert.alert(t('alert_field_required'), t('message_designation_required'));
      return;
    }
    onConfirm(form);
    setForm({ designation: '', unitPriceHT: 0, quantity: 1, totalHT: 0, tva: 20 });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>{t('modal_cancel_text')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('modal_title_article_designation')}</Text>
            <TouchableOpacity style={[styles.modalConfirmBtn, (!form.designation.trim() || !form.unitPriceHT) && styles.modalConfirmBtnDisabled]} onPress={handleConfirm} disabled={!form.designation.trim() || !form.unitPriceHT} activeOpacity={0.85}>
              <Text style={styles.modalConfirmText}>{t('modal_confirm_text')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Désignation */}
            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_designation')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={t('placeholder_designation')}
                  placeholderTextColor="#9CA3AF"
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

              {/* Prix H.T. unitaire */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_unit_price_ht')} <Text style={styles.required}>*</Text></Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={form.unitPriceHT > 0 ? String(form.unitPriceHT) : ''}
                    onChangeText={v => setForm(prev => ({
                      ...prev,
                      unitPriceHT: parseFloat(v) || 0,
                      totalHT: (parseFloat(v) || 0) * prev.quantity,
                    }))}
                  />
                  <Text style={styles.fieldUnit}>{t('field_unit')}</Text>
                </View>
              </View>

              {/* Quantité */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_quantity')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={form.quantity > 0 ? String(form.quantity) : ''}
                  onChangeText={v => setForm(prev => ({
                    ...prev,
                    quantity: parseFloat(v) || 0,
                    totalHT: prev.unitPriceHT * (parseFloat(v) || 0),
                  }))}
                />
              </View>

              {/* Prix H.T. total (read-only) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_price_ht_total')}</Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputReadOnly, { flex: 1 }]}
                    value={form.totalHT.toLocaleString('fr-FR')}
                    editable={false}
                  />
                  <Text style={styles.fieldUnit}>{t('field_unit')}</Text>
                </View>
              </View>

              {/* TVA */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_tva_percent')}</Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    placeholder="20"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={String(form.tva)}
                    onChangeText={v => setForm({ ...form, tva: parseFloat(v) || 0 })}
                  />
                  <Text style={styles.fieldUnit}>%</Text>
                </View>
              </View>

              <TouchableOpacity style={[styles.addArticleBtn, !form.designation.trim() && !form.unitPriceHT && styles.addArticleBtnDisabled]} onPress={handleConfirm} disabled={!form.designation.trim() || !form.unitPriceHT} activeOpacity={0.85}>
                <Text style={styles.addArticleBtnText}>{t('button_add')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Container
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  modalConfirmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E5BAC',
  },
  modalConfirmBtnDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Form Card
  formCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
  },
  fieldBlock: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  fieldInput: {
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    paddingRight: 4,
  },
  fieldInputReadOnly: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },

  // Autocomplete Suggestions
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    maxHeight: 300,
  },
  suggestionLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  suggestionLoadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  suggestionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionDesignation: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  suggestionMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Add Article Button
  addArticleBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E5BAC',
    borderRadius: 8,
    alignItems: 'center',
  },
  addArticleBtnDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  addArticleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ArticleModal;
