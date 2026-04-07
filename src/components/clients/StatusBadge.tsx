import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Quotes:    { bg: '#4FA3D1', text: '#FFFFFF' },
  Payé:      { bg: '#6FB13F', text: '#FFFFFF' },
  Paid:      { bg: '#6FB13F', text: '#FFFFFF' },
  Issued:    { bg: '#8d3fb1', text: '#FFFFFF' },
  Annulé:    { bg: '#FF0000', text: '#FFFFFF' },
  Canceled:  { bg: '#FF0000', text: '#FFFFFF' },
  Cancelled: { bg: '#FF0000', text: '#FFFFFF' },
};

const DEFAULT_STATUS = { bg: '#F3F4F6', text: '#6B7280' };

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { bg, text } = STATUS_COLORS[status] ?? DEFAULT_STATUS;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
