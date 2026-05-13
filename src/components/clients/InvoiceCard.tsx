import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { FileText, Download } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ClientInvoiceItem } from '../../types/client.types';
import { resolvePaymentMethod } from '../../types/invoice.types';
import { StatusBadge } from './StatusBadge';

interface InvoiceCardProps {
  item: ClientInvoiceItem;
  onPress: () => void;
  onDownloadPdf: () => void;
  downloadingPdfId: number | null;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  item,
  onPress,
  onDownloadPdf,
  downloadingPdfId,
}) => {
  const { i18n } = useTranslation();
  const formattedDate = new Date(item.date).toLocaleDateString(i18n.language);
  const hasDoc = !!(item.pdf_url ?? item.invoice_url);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <FileText size={20} color="#1E5BAC" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
          <Text style={styles.invoiceMeta}>
            {formattedDate} · {resolvePaymentMethod(item.payment_method, i18n.language)}
          </Text>
          <View style={{ marginTop: 6 }}>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </View>
      {hasDoc ? (
        <TouchableOpacity
          style={[styles.downloadBtn, downloadingPdfId === item.id && { opacity: 0.5 }]}
          onPress={onDownloadPdf}
          disabled={downloadingPdfId === item.id}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {downloadingPdfId === item.id ? (
            <ActivityIndicator size="small" color="#1E5BAC" />
          ) : (
            <Download size={18} color="#1E5BAC" />
          )}
        </TouchableOpacity>
      ) : (
        <View style={{ width: 36 }} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  invoiceNumber: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 3 },
  invoiceMeta: { fontSize: 12, color: '#6B7280' },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
