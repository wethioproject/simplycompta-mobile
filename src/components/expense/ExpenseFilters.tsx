import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../../styles/expenses.styles';

interface ExpenseFiltersProps {
  selectedMonth: string | null;
  selectedYear: string | null;
  showMonthPicker: boolean;
  showYearPicker: boolean;
  months: string[];
  years: string[];
  onMonthToggle: () => void;
  onYearToggle: () => void;
  onMonthSelect: (month: string | null) => void;
  onYearSelect: (year: string | null) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  selectedMonth,
  selectedYear,
  showMonthPicker,
  showYearPicker,
  months,
  years,
  onMonthToggle,
  onYearToggle,
  onMonthSelect,
  onYearSelect,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.filtersRow}>
      {/* Month filter */}
      <View style={{ position: 'relative' }}>
        <TouchableOpacity
          style={[styles.filterBtn, selectedMonth !== null && styles.filterBtnActive]}
          onPress={onMonthToggle}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterBtnText, selectedMonth !== null && styles.filterBtnTextActive]}>
            {selectedMonth ?? t('filter_month')}
          </Text>
          <ChevronDown size={14} color={selectedMonth !== null ? '#1E5BAC' : '#6B7280'} />
        </TouchableOpacity>
        {showMonthPicker && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => onMonthSelect(null)}>
              <Text style={styles.dropdownItemText}>{t('filter_all_months')}</Text>
            </TouchableOpacity>
            {months.map(m => (
              <TouchableOpacity
                key={m}
                style={styles.dropdownItem}
                onPress={() => onMonthSelect(m)}
              >
                <Text style={[styles.dropdownItemText, selectedMonth === m && styles.dropdownItemSelected]}>
                  {m}
                </Text>
                {selectedMonth === m && <Text style={styles.dropdownCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Year filter */}
      <View style={{ position: 'relative' }}>
        <TouchableOpacity
          style={[styles.filterBtn, selectedYear !== null && styles.filterBtnActive]}
          onPress={onYearToggle}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterBtnText, selectedYear !== null && styles.filterBtnTextActive]}>
            {selectedYear ?? t('filter_year')}
          </Text>
          <ChevronDown size={14} color={selectedYear !== null ? '#1E5BAC' : '#6B7280'} />
        </TouchableOpacity>
        {showYearPicker && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => onYearSelect(null)}>
              <Text style={styles.dropdownItemText}>{t('filter_all_years')}</Text>
            </TouchableOpacity>
            {years.map(y => (
              <TouchableOpacity
                key={y}
                style={styles.dropdownItem}
                onPress={() => onYearSelect(y)}
              >
                <Text style={[styles.dropdownItemText, selectedYear === y && styles.dropdownItemSelected]}>
                  {y}
                </Text>
                {selectedYear === y && <Text style={styles.dropdownCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default ExpenseFilters;
