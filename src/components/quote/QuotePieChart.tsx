import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import type { QuoteChartItem } from '../../services/dashboardService';
import { invoiceStyles as styles } from '../../styles/quote.styles';

const PIE_COLORS = [
  '#F59E0B', '#16A34A', '#EF4444', '#1E5BAC', '#8B5CF6',
  '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316',
];

interface QuotePieChartProps {
  loading: boolean;
  chartData: QuoteChartItem[];
  convertedQuotes?: number;
}

const QuotePieChart: React.FC<QuotePieChartProps> = ({ loading, chartData, convertedQuotes }) => {
  const { t } = useTranslation();

  const total = chartData.reduce((sum, c) => sum + c.value, 0);
  const pieData = chartData.map((c, i) => ({
    value: c.value,
    color: PIE_COLORS[i % PIE_COLORS.length],
    label: c.label,
    percentage: total > 0 ? ((c.value / total) * 100).toFixed(1) : '0.0',
  }));

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
                  <Text style={styles.pieCenterValue}>{total}</Text>
                  <Text style={styles.pieCenterLabel}>{t('label_quotes')}</Text>
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
                <Text style={styles.pieLegendPct}>{item.value} ({item.percentage}%)</Text>
              </View>
            ))}
          </View>
          {convertedQuotes !== undefined && convertedQuotes > 0 && (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>
                {t('pie_converted_quotes', { count: convertedQuotes })}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default QuotePieChart;
