import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CreditCard, FileText } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ClientFinanceCardProps {
  totalPriceHt: number;
  invoiceCount: number;
  onViewHistory: () => void;
}

export const ClientFinanceCard: React.FC<ClientFinanceCardProps> = ({
  totalPriceHt,
  invoiceCount,
  onViewHistory,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <CreditCard size={18} color="#1E5BAC" />
        <Text style={styles.sectionTitle}>{t('section_finances')}</Text>
      </View>
      <View style={styles.financeStatsRow}>
        <View style={styles.statBoxBlue}>
          <Text style={styles.statLabel}>{t('label_revenue')}</Text>
          <Text style={styles.statValueBlue}>{totalPriceHt.toLocaleString('fr-FR')} MAD</Text>
        </View>
        <View style={styles.statBoxOrange}>
          <Text style={styles.statLabelOrange}>{t('label_pending')}</Text>
          <Text style={styles.statValueOrange}>
            {invoiceCount} facture{invoiceCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.historiqueBtn} onPress={onViewHistory} activeOpacity={0.85}>
        <FileText size={16} color="#1E5BAC" />
        <Text style={styles.historiqueBtnText}>{t('button_view_history')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  financeStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statBoxBlue: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
  },
  statLabel: { fontSize: 12, color: '#3B82F6', marginBottom: 6 },
  statValueBlue: { fontSize: 18, fontWeight: '700', color: '#1E5BAC' },
  statBoxOrange: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 14,
  },
  statLabelOrange: { fontSize: 12, color: '#EA580C', marginBottom: 6 },
  statValueOrange: { fontSize: 18, fontWeight: '700', color: '#EA580C' },
  historiqueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 13,
  },
  historiqueBtnText: { fontSize: 14, fontWeight: '600', color: '#1E5BAC' },
});
