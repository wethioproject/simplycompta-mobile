import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  MoreVertical,
  Calendar,
  Coins,
  CreditCard,
  Banknote,
  FileText,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react-native';
import type { ReceiptItem } from '../../types/receipt.types';

interface ReceiptCardProps {
  item: ReceiptItem;
  onPress: (item: ReceiptItem) => void;
  openMenuId: string | null;
  onMenuToggle: (id: string | null) => void;
  onEdit: (item: ReceiptItem) => void;
  onDelete: (id: string) => void;
}

export const getPaymentMethodLabel = (method: string, t: (k: string) => string): string => {
  switch (method) {
    case 'cash':     return t('receipt_method_cash');
    case 'card':     return t('receipt_method_card');
    case 'transfer': return t('receipt_method_transfer');
    case 'check':    return t('receipt_method_check');
    default:         return t('receipt_method_other');
  }
};

export const PaymentMethodIcon: React.FC<{ method: string; size?: number; color?: string }> = ({
  method,
  size = 16,
  color = '#6B7280',
}) => {
  switch (method) {
    case 'cash':     return <Coins size={size} color={color} />;
    case 'card':     return <CreditCard size={size} color={color} />;
    case 'transfer': return <Banknote size={size} color={color} />;
    case 'check':    return <FileText size={size} color={color} />;
    default:         return <Coins size={size} color={color} />;
  }
};

const ReceiptCard: React.FC<ReceiptCardProps> = ({
  item,
  onPress,
  openMenuId,
  onMenuToggle,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const isMenuOpen = openMenuId === item.id;
  const dotsRef = useRef<View>(null);
  const [menuPos, setMenuPos] = React.useState({ top: 0, right: 0 });

  const handleDotsPress = () => {
    if (isMenuOpen) { onMenuToggle(null); return; }
    dotsRef.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setMenuPos({ top: py + h + 4, right: 0 });
      onMenuToggle(item.id);
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { onMenuToggle(null); onPress(item); }}
      activeOpacity={0.85}
    >
      {/* Top row: date + dots */}
      <View style={styles.topRow}>
        <View style={styles.dateRow}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.dateTxt}>{item.date}</Text>
        </View>
        <TouchableOpacity
          ref={dotsRef as any}
          style={styles.dotsBtn}
          onPress={handleDotsPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MoreVertical size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Text style={styles.amount}>
        + {item.amount.toLocaleString('fr-FR')} MAD
      </Text>

      {/* Bottom row: method + note */}
      <View style={styles.bottomRow}>
        <View style={styles.methodRow}>
          <PaymentMethodIcon method={item.paymentMethod} size={15} color="#6B7280" />
          <Text style={styles.methodTxt}>
            {getPaymentMethodLabel(item.paymentMethod, t)}
          </Text>
        </View>
        {item.note ? (
          <Text style={styles.noteTxt} numberOfLines={1}>{item.note}</Text>
        ) : null}
      </View>

      {/* Floating dropdown menu */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="none"
        onRequestClose={() => onMenuToggle(null)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => onMenuToggle(null)}>
          <View style={[styles.menu, { position: 'absolute', top: menuPos.top, right: 20 }]}>
            {/* View */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { onMenuToggle(null); onPress(item); }}
              activeOpacity={0.7}
            >
              <Eye size={15} color="#374151" />
              <Text style={styles.menuItemTxt}>{t('action_view_details')}</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Edit */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { onMenuToggle(null); onEdit(item); }}
              activeOpacity={0.7}
            >
              <Edit2 size={15} color="#1E5BAC" />
              <Text style={[styles.menuItemTxt, { color: '#1E5BAC' }]}>{t('action_edit')}</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Delete */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { onMenuToggle(null); onDelete(item.id); }}
              activeOpacity={0.7}
            >
              <Trash2 size={15} color="#EF4444" />
              <Text style={[styles.menuItemTxt, { color: '#EF4444' }]}>{t('action_delete')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTxt: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  dotsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#16A34A',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodTxt: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  noteTxt: {
    fontSize: 12,
    color: '#9CA3AF',
    maxWidth: 180,
    textAlign: 'right',
  },
  // Dropdown menu
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuItemTxt: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});

export default ReceiptCard;
