import React from 'react';
import { I18nManager, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Camera, Sparkles, ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { PremiumTouchable } from '../common/PremiumMotion';

interface Props {
  onScan?: () => void;
}

const OCRScannerCard: React.FC<Props> = ({ onScan }) => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#1E5BAC', '#0066CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCard}
    >
    <View
    style={styles.card}
    >
      {/* Top row: badge + camera icon */}
      <View style={[styles.topRow, I18nManager.isRTL && styles.rowReverse]}>
        <View style={styles.ocrBadge}>
          <Sparkles size={13} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.ocrBadgeText}>{t('ocr_card_badge')}</Text>
        </View>
        <View style={styles.cameraBox}>
          <Camera size={20} color="#FFFFFF" />
        </View>
      </View>

      {/* Titles */}
      <Text style={styles.title}>{t('ocr_card_title')}</Text>
      <Text style={styles.subtitle}>{t('ocr_card_subtitle')}</Text>

      {/* CTA Button */}
      <PremiumTouchable style={[styles.ctaBtn, I18nManager.isRTL && styles.rowReverse]} onPress={onScan} haptic>
        <Camera size={16} color="#1E5BAC" />
        <Text style={styles.ctaText}>{t('ocr_card_cta')}</Text>
        <ArrowRight size={16} color="#1E5BAC" />
      </PremiumTouchable>
    </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  }, 
  card: {
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  ocrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ocrBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraBox: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 18,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    height: 44,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E5BAC',
  },
});

export default OCRScannerCard;
