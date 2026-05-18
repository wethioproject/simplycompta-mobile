import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Lock, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type FeatureLockCardProps = {
  title: string;
  subtitle: string;
  requiredPlan?: 'Pro' | 'Business';
  onUpgrade?: () => void;
};

const FeatureLockCard: React.FC<FeatureLockCardProps> = ({
  title,
  subtitle,
  requiredPlan = 'Pro',
  onUpgrade,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Lock size={20} color="#1E5BAC" />
      </View>
      <Text style={styles.badge}>{t('premium_preview_available', { defaultValue: 'Preview available' })}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onUpgrade}>
        <Sparkles size={16} color="#FFFFFF" />
        <Text style={styles.ctaText}>
          {requiredPlan === 'Business'
            ? t('premium_unlock_business', { defaultValue: 'Unlock Business' })
            : t('premium_upgrade_pro', { defaultValue: 'Upgrade to Pro' })}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 18,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E5BAC',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: { fontSize: 17, fontWeight: '900', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginTop: 8 },
  cta: {
    marginTop: 16,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: '#1E5BAC',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default FeatureLockCard;
