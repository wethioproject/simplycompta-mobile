import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface UsageCardProps {
  label: string;
  used: number;
  limit: number | null;
  isStorage?: boolean;
}

const UsageCard: React.FC<UsageCardProps> = ({ label, used, limit, isStorage = false }) => {
  const { t } = useTranslation();

  const hasFiniteLimit = typeof limit === 'number' && limit > 0;
  const percentage = hasFiniteLimit ? Math.min(100, (used / limit) * 100) : 0;

  const barColor =
    percentage > 90 ? '#EF4444' :
    percentage > 70 ? '#F97316' :
    '#16A34A';

  const showWarning = percentage >= 80;

  const usedLabel = isStorage ? `${used}MB` : String(used);
  const limitLabel = hasFiniteLimit
    ? (isStorage ? `${limit}MB` : String(limit))
    : t('usage_unlimited', { defaultValue: 'Illimité' });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.counter, percentage > 90 && styles.counterDanger]}>
          {usedLabel}
          <Text style={styles.counterLimit}> / {limitLabel}</Text>
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%` as any, backgroundColor: barColor },
          ]}
        />
      </View>

      {/* Warning */}
      {showWarning && (
        <Text style={[styles.warning, { color: barColor }]}>
          {t('usage_near_limit')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  counterDanger: {
    color: '#EF4444',
  },
  counterLimit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  barBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  warning: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default UsageCard;
