import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import { getStatusConfig } from '../../utils/badgeConfig';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { badge, text } = getStatusConfig(status, styles);
  return (
    <View style={[styles.badge, badge]}>
      <Text style={[styles.badgeText, text]}>{status}</Text>
    </View>
  );
};

export default StatusBadge;
