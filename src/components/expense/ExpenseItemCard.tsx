import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileText, Minus, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ExpenseItem } from '../../types/expense.types';
import { formatDate, capitalise, resolveCategoryKey } from '../../utils/expense.helpers';
import { resolvePaymentMethod } from '../../types/invoice.types';
import { styles } from '../../styles/expenses.styles';
import { useSecurity } from '../../contexts/SecurityContext';

interface ExpenseItemCardProps {
  item: ExpenseItem;
  onPress: (item: ExpenseItem) => void;
}

const ExpenseItemCard: React.FC<ExpenseItemCardProps> = ({ item, onPress }) => {
  const { t, i18n } = useTranslation();
  const { maskAmount } = useSecurity();
  const formattedDate = formatDate(item.date);
  const supplierName = item.supplier?.company_name || item.supplier?.supplier_name || item.supplier?.name;
  const categoryKey = resolveCategoryKey(item.category?.name);
  const categoryName = categoryKey ? t(categoryKey, { defaultValue: item.category?.name }) : capitalise(item.category?.name ?? '');
  const hasDocument = Boolean(item.file_url || item.file);
  const isOcr = Boolean(item.is_ocr || item.ocr_raw || item.ocr_items?.length);

  return (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.expenseCardLeft}>
        <View style={styles.expenseIconBox}>
          <Minus size={20} color="#DB2777" strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.expenseDesc} numberOfLines={1}>
            {supplierName || categoryName}
          </Text>
          <Text style={styles.expenseMeta} numberOfLines={1}>
            {categoryName} • {formattedDate} • {resolvePaymentMethod(item.payment_method, i18n.language)}
          </Text>
          <View style={styles.expenseBadgeRow}>
            <View style={styles.expenseCategoryBadge}>
              <Text style={styles.expenseCategoryBadgeText} numberOfLines={1}>{categoryName}</Text>
            </View>
            {hasDocument && (
              <View style={styles.expenseMiniBadge}>
                <FileText size={11} color="#1E5BAC" strokeWidth={2.4} />
                <Text style={styles.expenseMiniBadgeText}>{t('expense_badge_document', { defaultValue: 'Document' })}</Text>
              </View>
            )}
            {isOcr && (
              <View style={[styles.expenseMiniBadge, styles.expenseOcrBadge]}>
                <Sparkles size={11} color="#7C3AED" strokeWidth={2.4} />
                <Text style={[styles.expenseMiniBadgeText, styles.expenseOcrBadgeText]}>{t('expense_badge_ai_extracted', { defaultValue: 'AI extracted' })}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.expenseAmountBlock}>
        <Text style={styles.expenseAmount}>-{maskAmount(Number(item.total_ttc || 0), t('currency_mad'))}</Text>
        <Text style={styles.expenseVatText}>{t('expense_tva_short', { defaultValue: 'TVA' })} {maskAmount(Number(item.total_tva || item.tva || 0), t('currency_mad'))}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExpenseItemCard;
