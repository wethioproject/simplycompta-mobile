import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import type { ExpenseCategoryItem } from '../../services/dashboardService';
import { styles } from '../../styles/expenses.styles';
import { resolveCategoryKey } from '../../utils/expense.helpers';

const PIE_COLORS = [
  '#3B82F6', '#FEE2E2', '#10B981', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316',
];

interface ExpensePieChartProps {
  loading: boolean;
  pieCategories: ExpenseCategoryItem[];
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ loading, pieCategories }) => {
  const { t } = useTranslation();

  const total = pieCategories.reduce((sum, c) => sum + parseFloat(c.value), 0);
  const pieData = pieCategories.map((c, i) => {
    const key = resolveCategoryKey(c.label);
    return {
      value: parseFloat(c.value),
      color: PIE_COLORS[i % PIE_COLORS.length],
      label: key ? t(key, { defaultValue: c.label }) : c.label,
      percentage: total > 0 ? ((parseFloat(c.value) / total) * 100).toFixed(1) : '0.0',
    };
  });

  return (
    <View style={styles.pieCard}>
      <Text style={styles.pieTitle}>{t('pie_title_distribution')}</Text>
      {loading ? (
        <View style={styles.pieLoader}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : pieData.length === 0 ? (
        <View style={styles.pieEmpty}>
          <Text style={styles.pieEmptyText}>{t('pie_empty_message')}</Text>
        </View>
      ) : (
        <>
          <View style={styles.pieChartRow}>
            <PieChart
              data={pieData}
              donut
              radius={80}
              innerRadius={52}
              innerCircleColor="#FFFFFF"
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.pieCenterValue}>
                    {total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  </Text>
                  <Text style={styles.pieCenterLabel}>{t('currency_mad')}</Text>
                </View>
              )}
              showText={false}
              strokeWidth={2}
              strokeColor="#FFFFFF"
            />
          </View>
          <View style={styles.pieLegend}>
            {pieData.map((item, i) => (
              <View key={i} style={styles.pieLegendRow}>
                <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
                <Text style={styles.pieLegendLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.pieLegendPct}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default ExpensePieChart;
