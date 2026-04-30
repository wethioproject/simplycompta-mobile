import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Copy, CheckCircle, X } from 'lucide-react-native';
import type { InvoiceItem } from '../../types/invoice.types';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import { calculateInvoiceTotals } from '../../utils/invoiceCalculations';
import { t } from 'i18next';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  issued:    { bg: '#3B82F6', label: t('status_issued') },
  paid:      { bg: '#16A34A', label: t('status_paid') },
  cancelled: { bg: '#EF4444', label: t('status_cancelled') },
  canceled:  { bg: '#EF4444', label: t('status_cancelled') },
};

const DEFAULT_STATUS = { bg: '#E5E7EB', label: t('status_unknown') };

const AMOUNT_COLORS: Record<string, string> = {
  issued:    '#3B82F6',
  paid:      '#16A34A',
  cancelled: '#EF4444',
  canceled:  '#EF4444',
};

interface InvoiceCardProps {
  item: InvoiceItem;
  onPress: (item: InvoiceItem) => void;
  openMenuId: number | null;
  onMenuToggle: (id: number | null) => void;
  onMarkPaid: (item: InvoiceItem) => void;
  onDuplicate: (item: InvoiceItem) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  item,
  onPress,
  openMenuId,
  onMenuToggle,
  onMarkPaid,
  onDuplicate,
}) => {
  console.log('Rendering InvoiceCard for invoice:', item);
  const { t } = useTranslation();
  const { totalTTC } = calculateInvoiceTotals(item.articles);
  const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
  const { bg, label } = STATUS_CONFIG[item.status] ?? DEFAULT_STATUS;
  const amountColor = AMOUNT_COLORS[item.status] ?? '#111827';
  const isMenuOpen = openMenuId === item.id;
  const isPaid = item.status === 'paid';

  const dotsRef = useRef<View>(null);
  const [menuPos, setMenuPos] = React.useState({ top: 0, right: 0 });

  const handleDotsPress = () => {
    if (isMenuOpen) { onMenuToggle(null); return; }
    dotsRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setMenuPos({ top: py + height + 4, right: 0 });
      onMenuToggle(item.id);
    });
  };

  return (
    <TouchableOpacity
      style={styles.newInvoiceCard}
      onPress={() => { onMenuToggle(null); onPress(item); }}
      activeOpacity={0.85}
    >
      <View style={styles.newInvoiceCardRow}>
        {/* Left */}
        <View style={styles.newInvoiceLeft}>
          <Text style={styles.newInvoiceClientName} numberOfLines={1}>
            {item.client?.client_name ?? '—'}
          </Text>
          <Text style={styles.newInvoiceMeta}>
            {t('label_invoice')} {item.invoice_number} • {formattedDate}
          </Text>
          <Text style={[styles.invoiceAmount, { fontSize: 17, color: amountColor }]}>
            + {item.total_ttc.toLocaleString('fr-FR')} MAD
          </Text>
        </View>

        {/* Right */}
        <View style={styles.newInvoiceRight}>
          <View style={[styles.newInvoiceStatusPill, { backgroundColor: bg }]}>
            <Text style={styles.newInvoiceStatusText}>{label}</Text>
          </View>

          <TouchableOpacity
            ref={dotsRef as any}
            style={styles.newInvoiceDotsBtn}
            onPress={handleDotsPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating dropdown rendered in a Modal so it escapes FlatList clipping */}
      <Modal visible={isMenuOpen} transparent animationType="none" onRequestClose={() => onMenuToggle(null)}>
        <Pressable style={{ flex: 1 }} onPress={() => onMenuToggle(null)}>
          <View style={[styles.invoiceActionMenu, { position: 'absolute', top: menuPos.top, right: 20 }]}>
            <TouchableOpacity
              style={styles.invoiceActionMenuItem}
              onPress={() => { onMenuToggle(null); onDuplicate(item); }}
              activeOpacity={0.7}
            >
              <Copy size={15} color="#374151" />
              <Text style={styles.invoiceActionMenuText}>{t('action_duplicate')}</Text>
            </TouchableOpacity>

            <View style={styles.invoiceActionMenuDivider} />

            <TouchableOpacity
              style={styles.invoiceActionMenuItem}
              onPress={() => { onMenuToggle(null); onMarkPaid(item); }}
              activeOpacity={0.7}
            >
              {isPaid
                ? <X size={15} color="#F97316" />
                : <CheckCircle size={15} color="#16A34A" />}
              <Text style={[
                styles.invoiceActionMenuText,
                isPaid ? { color: '#F97316' } : { color: '#16A34A' },
              ]}>
                {isPaid ? t('action_mark_unpaid') : t('action_mark_paid')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
};

export default InvoiceCard;

