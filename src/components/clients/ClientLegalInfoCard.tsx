import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LayoutGrid } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ClientLegalInfoCardProps {
  registreCommerce: string;
  ice: string;
}

export const ClientLegalInfoCard: React.FC<ClientLegalInfoCardProps> = ({
  registreCommerce,
  ice,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <LayoutGrid size={18} color="#1E5BAC" />
        <Text style={styles.sectionTitle}>{t('section_legal_info')}</Text>
      </View>
      <View style={styles.legalRow}>
        <Text style={styles.legalLabel}>{t('label_rc')}</Text>
        <Text style={styles.legalValue}>{registreCommerce}</Text>
      </View>
      <View style={styles.legalRow}>
        <Text style={styles.legalLabel}>{t('label_ice')}</Text>
        <Text style={styles.legalValue}>{ice}</Text>
      </View>
      <View style={[styles.legalRow, { borderBottomWidth: 0 }]}>
        <Text style={styles.legalLabel}>{t('label_status')}</Text>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>{t('status_active')}</Text>
        </View>
      </View>
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
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  legalLabel: { fontSize: 14, color: '#6B7280' },
  legalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
});
