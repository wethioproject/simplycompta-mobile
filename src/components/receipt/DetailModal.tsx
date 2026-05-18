import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { X, Edit2, Trash2 } from 'lucide-react-native';
import type { ReceiptItem } from '../../types/receipt.types';
import { getPaymentMethodLabel, PaymentMethodIcon } from './ReceiptCard';
import { useSecurity } from '../../contexts/SecurityContext';

interface DetailModalProps {
  item: ReceiptItem;
  onClose: () => void;
  onEdit: (item: ReceiptItem) => void;
  onDelete: (id: string) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const { maskAmount } = useSecurity();

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('receipt_detail_title')}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Amount highlight */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>{t('receipt_detail_amount_label')}</Text>
              <Text style={styles.amountValue}>
                + {maskAmount(item.amount, t('currency_mad'))}
              </Text>
            </View>

            {/* Detail rows */}
            <View style={styles.detailCard}>
              {/* Date */}
              <View style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>{t('receipt_field_date')}</Text>
                <Text style={styles.detailRowValue}>{item.date}</Text>
              </View>

              {/* Payment method */}
              <View style={[styles.detailRow, !item.note && styles.detailRowLast]}>
                <Text style={styles.detailRowLabel}>{t('receipt_field_method')}</Text>
                <View style={styles.methodRow}>
                  <PaymentMethodIcon method={item.paymentMethod} size={15} color="#374151" />
                  <Text style={styles.detailRowValue}>
                    {getPaymentMethodLabel(item.paymentMethod, t)}
                  </Text>
                </View>
              </View>

              {/* Note */}
              {item.note ? (
                <View style={[styles.detailRow, styles.noteBlock]}>
                  <Text style={styles.detailRowLabel}>{t('receipt_field_note')}</Text>
                  <Text style={[styles.detailRowValue, styles.noteTxt]}>{item.note}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => { onClose(); onEdit(item); }}
              activeOpacity={0.85}
            >
              <Edit2 size={16} color="#FFFFFF" />
              <Text style={styles.editBtnTxt}>{t('action_edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => { onClose(); onDelete(item.id); }}
              activeOpacity={0.85}
            >
              <Trash2 size={16} color="#FFFFFF" />
              <Text style={styles.deleteBtnTxt}>{t('action_delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 20,
    gap: 16,
    paddingBottom: 8,
  },
  // Amount highlight card
  amountCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 6,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#16A34A',
  },
  // Detail card
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailRowLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
    textAlign: 'right',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 0,
    paddingVertical: 14,
  },
  noteTxt: {
    flexShrink: 1,
    textAlign: 'right',
    color: '#374151',
    fontWeight: '400',
    lineHeight: 20,
    marginLeft: 16,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1E5BAC',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  editBtnTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteBtnTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default DetailModal;
