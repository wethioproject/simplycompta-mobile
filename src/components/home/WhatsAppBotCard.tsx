import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  enabled: boolean;
  onActivate: () => void;
}

const WhatsAppBotCard: React.FC<Props> = ({ enabled, onActivate }) => {
  const { t } = useTranslation();

  if (!enabled) {
    return (
      <TouchableOpacity style={styles.cardInactive} onPress={onActivate} activeOpacity={0.8}>
        <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
          <AlertCircle size={20} color="#EF4444" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.titleInactive}>{t('whatsapp_activate_title')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      {/* Icon with badge */}
      <View style={styles.iconWrap}>
        <MessageCircle size={20} color="#25D366" fill="#25D366" />
        <View style={styles.badge}>
          <CheckCircle2 size={12} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={styles.title}>{t('whatsapp_card_title')}</Text>
        <Text style={styles.subtitle}>{t('whatsapp_card_subtitle')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  titleInactive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default WhatsAppBotCard;
