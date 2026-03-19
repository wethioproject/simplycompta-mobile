import React from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';
import { FileText, CreditCard, BarChart3 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { onboardingStyles as styles } from '../../styles/onboarding.styles';
import type { OnboardingSlideData } from '../../types/onboarding.types';

const ICON_MAP: Record<string, React.FC<{ size: number; color: string; strokeWidth?: number }>> = {
  fileText: FileText,
  creditCard: CreditCard,
  barChart: BarChart3,
};

interface Props {
  slide: OnboardingSlideData;
}

const OnboardingSlide: React.FC<Props> = ({ slide }) => {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const IconComponent = ICON_MAP[slide.icon];

  const phoneWidth = width * 0.72;
  // Use a percentage of screen height — more reliable than subtracting fixed px
  // 52% leaves room for status bar + title + desc + pagination + CTA on all devices
  const phoneHeight = height * 0.52;

  return (
    <View style={[styles.slide, { width }]}>
      {/* Phone frame */}
      <View style={styles.phoneContainer}>
        <View style={[styles.phoneFrame, { width: phoneWidth, height: phoneHeight }]}>
          {slide.screenshotSource ? (
            <Image
              source={slide.screenshotSource}
              style={styles.screenshot}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[
                styles.screenshotPlaceholder,
                { backgroundColor: `${slide.accentColor}0D` },
              ]}
            >
              {IconComponent && (
                <IconComponent size={56} color={slide.accentColor} strokeWidth={1.5} />
              )}
            </View>
          )}
        </View>
      </View>

      <Text style={styles.title}>{t(slide.titleKey)}</Text>
      <Text style={styles.description}>{t(slide.descriptionKey)}</Text>
    </View>
  );
};

export default OnboardingSlide;
