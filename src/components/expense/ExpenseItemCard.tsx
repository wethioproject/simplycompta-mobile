import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Minus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ExpenseItem } from '../../types/expense.types';
import { formatDate, formatCurrency, capitalise, resolveCategoryKey } from '../../utils/expense.helpers';
import { resolvePaymentMethod } from '../../types/invoice.types';
import { styles } from '../../styles/expenses.styles';

interface ExpenseItemCardProps {
  item: ExpenseItem;
  onPress: (item: ExpenseItem) => void;
}

const ExpenseItemCard: React.FC<ExpenseItemCardProps> = ({ item, onPress }) => {
  const { t, i18n } = useTranslation();
  const formattedDate = formatDate(item.date);

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
            {(() => { const key = resolveCategoryKey(item.category?.name); return key ? t(key, { defaultValue: item.category?.name }) : capitalise(item.category?.name ?? ''); })()}
          </Text>
          <Text style={styles.expenseMeta}>
            {formattedDate} • {resolvePaymentMethod(item.payment_method, i18n.language)}
          </Text>
        </View>
      </View>
      <Text style={styles.expenseAmount}>-{formatCurrency(item.total_ttc)}</Text>
    </TouchableOpacity>
  );
};

export default ExpenseItemCard;
