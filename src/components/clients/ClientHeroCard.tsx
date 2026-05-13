import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Phone, Mail } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ClientHeroCardProps {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
}

export const ClientHeroCard: React.FC<ClientHeroCardProps> = ({
  companyName,
  contactName,
  phone,
  email,
}) => {
  const { t } = useTranslation();
  const initial = companyName !== '—' ? companyName.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.card}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </View>
      <Text style={styles.companyName}>{companyName}</Text>
      <Text style={styles.contactName}>{contactName}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.callBtn, phone === '—' && { opacity: 0.5 }]}
          activeOpacity={0.85}
          onPress={() => phone !== '—' && Linking.openURL(`tel:${phone}`)}
        >
          <Phone size={16} color="#FFFFFF" />
          <Text style={styles.callBtnText}>{t('button_call')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emailBtn, email === '—' && { opacity: 0.5 }]}
          activeOpacity={0.85}
          onPress={() => {
            if (email === '—') return;
            Linking.openURL(`mailto:${email}`).catch(() =>
              Alert.alert(t('error_title'), t('error_open_email_app')),
            );
          }}
        >
          <Mail size={16} color="#374151" />
          <Text style={styles.emailBtnText}>{t('button_email')}</Text>
        </TouchableOpacity>
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
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: '#1E5BAC' },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E5BAC',
    borderRadius: 10,
    paddingVertical: 13,
  },
  callBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  emailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  emailBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
