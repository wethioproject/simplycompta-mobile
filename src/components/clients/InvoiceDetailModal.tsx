import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  FileText,
  Receipt,
  CreditCard,
  BadgeCheck,
  Clock,
  Calendar,
  X,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ClientInvoiceItem } from '../../types/client.types';
import { resolvePaymentMethod } from '../../types/invoice.types';
import { StatusBadge } from './StatusBadge';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const REVIEW_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:  { bg: '#FEF3C7', text: '#D97706' },
  APPROVED: { bg: '#DCFCE7', text: '#16A34A' },
  REJECTED: { bg: '#FEE2E2', text: '#DC2626' },
};
const DEFAULT_REVIEW = { bg: '#F3F4F6', text: '#6B7280' };

const REVIEW_LABEL_KEYS: Record<string, string> = {
  PENDING:  'review_status_pending',
  APPROVED: 'review_status_approved',
  REJECTED: 'review_status_rejected',
};

// ─── Detail row helper ────────────────────────────────────────────────────────

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconWrap}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

interface InvoiceDetailModalProps {
  invoice: ClientInvoiceItem | null;
  invoiceDetail: any | null;
  loadingDetail: boolean;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  invoiceDetail,
  loadingDetail,
  onClose,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <Modal
      visible={!!invoice}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      />
      {invoice && (
        <View style={styles.modalSheet}>
          {/* Sheet handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalIconBox}>
              <FileText size={22} color="#1E5BAC" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>
                {t('as_invoice_title', { number: invoice.invoice_number })}
              </Text>
              <Text style={styles.modalSubtitle}>ID: {invoice.id}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <StatusBadge status={invoice.status} />
            {invoice.review_status && (() => {
              const rv = REVIEW_STATUS_COLORS[invoice.review_status] ?? DEFAULT_REVIEW;
              return (
                <View style={[styles.badge, { backgroundColor: rv.bg }]}>
                  <Text style={[styles.badgeText, { color: rv.text }]}>
                    {t(REVIEW_LABEL_KEYS[invoice.review_status!] ?? invoice.review_status!)}
                  </Text>
                </View>
              );
            })()}
          </View>

          {loadingDetail && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="small" color="#1E5BAC" />
            </View>
          )}

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {invoiceDetail && (
              <>
                <DetailRow
                  icon={<FileText size={16} color="#1E5BAC" />}
                  label={t('label_invoice_number')}
                  value={invoiceDetail.invoice_number ?? '—'}
                />
                <DetailRow
                  icon={<Receipt size={16} color="#1E5BAC" />}
                  label={t('label_client_name')}
                  value={invoiceDetail.client?.client_name ?? '—'}
                />
                <DetailRow
                  icon={<CreditCard size={16} color="#1E5BAC" />}
                  label={t('label_payment_method')}
                  value={resolvePaymentMethod(invoiceDetail.payment_method, i18n.language)}
                />
                <DetailRow
                  icon={<BadgeCheck size={16} color="#1E5BAC" />}
                  label={t('label_status')}
                  value={invoiceDetail.status ?? '—'}
                />
                <DetailRow
                  icon={<Clock size={16} color="#1E5BAC" />}
                  label={t('as_detail_created_on')}
                  value={new Date(invoiceDetail.created_at).toLocaleDateString(i18n.language, {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                />
                <DetailRow
                  icon={<Calendar size={16} color="#1E5BAC" />}
                  label={t('label_last_updated')}
                  value={new Date(invoiceDetail.updated_at).toLocaleDateString(i18n.language, {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                />
              </>
            )}
          </ScrollView>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.78,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  modalIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  modalSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  modalBody: { flex: 0 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  detailLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 3 },
  detailValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
});
