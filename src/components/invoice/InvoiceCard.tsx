import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import type { InvoiceItem } from '../../types/invoice.types';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import { calculateInvoiceTotals } from '../../utils/invoiceCalculations';
import { ReviewBadge } from './ReviewBadge';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Quotes:    { bg: '#4FA3D1', text: '#FFFFFF' },
  Paid:      { bg: '#6FB13F', text: '#FFFFFF' },
  Issued:    { bg: '#8d3fb1', text: '#FFFFFF' },
  Cancelled: { bg: '#FF0000', text: '#FFFFFF' },
  Canceled:  { bg: '#FF0000', text: '#FFFFFF' },
};
const DEFAULT_STATUS = { bg: '#E5E7EB', text: '#6B7280' };

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { bg, text } = STATUS_COLORS[status] ?? DEFAULT_STATUS;
  return (
    <View style={[styles.badge, { backgroundColor: bg, alignSelf: 'flex-start' }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
};

interface InvoiceCardProps {
  item: InvoiceItem;
  onPress: (item: InvoiceItem) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ item, onPress }) => {
  const { totalTTC } = calculateInvoiceTotals(item.articles);
  const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');

  return (
    <TouchableOpacity
      style={styles.invoiceCard}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.invoiceCardLeft}>
        <View style={styles.invoiceIconBox}>
          <Plus size={20} color="#16A34A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.invoiceDesc} numberOfLines={1}>
            {item.invoice_number}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.invoiceMeta}>{formattedDate}</Text>
            <StatusBadge status={item.status} />
          </View>
          {item.client && (
            <Text style={styles.invoiceRef}>{item.client.client_name}</Text>
          )}
        </View>
      </View>
      <View style={styles.invoiceCardRight}>
        <Text style={styles.invoiceAmount}>
          +{totalTTC.toLocaleString('fr-FR')} MAD
        </Text>
        <ReviewBadge reviewStatus={item.review_status} />
      </View>
    </TouchableOpacity>
  );
};

export default InvoiceCard;
