import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MoreVertical } from 'lucide-react-native';
import type { InvoiceItem } from '../../types/invoice.types';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import { calculateInvoiceTotals } from '../../utils/invoiceCalculations';
import { t } from 'i18next';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  Quotes:    { bg: '#6B7280', label: t('status_quotes')    },
  Issued:    { bg: '#3B82F6', label: t('status_issued') },
  Paid:      { bg: '#16A34A', label: t('status_paid') },
  Cancelled: { bg: '#EF4444', label: t('status_cancelled') },
  Canceled:  { bg: '#EF4444', label: t('status_cancelled') },
};

const DEFAULT_STATUS = { bg: '#E5E7EB', label: t('status_unknown') };

const AMOUNT_COLORS: Record<string, string> = {
  Quotes:    '#6B7280',
  Issued:    '#3B82F6',
  Paid:      '#16A34A',
  Cancelled: '#EF4444',
  Canceled:  '#EF4444',
};

interface InvoiceCardProps {
  item: InvoiceItem;
  onPress: (item: InvoiceItem) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ item, onPress }) => {
  const { t } = useTranslation();
  const { totalTTC } = calculateInvoiceTotals(item.articles);
  const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
  const { bg, label } = STATUS_CONFIG[item.status] ?? DEFAULT_STATUS;
  const amountColor = AMOUNT_COLORS[item.status] ?? '#111827';

  return (
    <TouchableOpacity
      style={styles.newInvoiceCard}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      <View style={styles.newInvoiceCardRow}>
        {/* Left */}
        <View style={styles.newInvoiceLeft}>
          <Text style={styles.newInvoiceClientName} numberOfLines={1}>
            {item.client?.client_name ?? '—'}
          </Text>
          <Text style={styles.newInvoiceMeta}>
            {t('label_invoice')} #{item.invoice_number} • {formattedDate}
          </Text>
          <Text style={[styles.invoiceAmount, { fontSize: 17, color: amountColor }]}>
            + {totalTTC.toLocaleString('fr-FR')} MAD
          </Text>
        </View>

        {/* Right */}
        <View style={styles.newInvoiceRight}>
          <View style={[styles.newInvoiceStatusPill, { backgroundColor: bg }]}>
            <Text style={styles.newInvoiceStatusText}>{label}</Text>
          </View>
          <TouchableOpacity
            style={styles.newInvoiceDotsBtn}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default InvoiceCard;

