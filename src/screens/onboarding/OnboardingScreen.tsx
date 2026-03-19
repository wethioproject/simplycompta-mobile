import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import OnboardingSlide from '../../components/onboarding/OnboardingSlide';
import { onboardingStyles as styles } from '../../styles/onboarding.styles';
import { useOnboarding } from '../../hooks/useOnboarding';
import type { OnboardingSlideData } from '../../types/onboarding.types';

const SLIDES: OnboardingSlideData[] = [
  {
    id: '1',
    titleKey: 'onboarding_title_1',
    descriptionKey: 'onboarding_desc_1',
    icon: 'fileText',
    accentColor: '#1E5BAC',
    // Replace with: require('../../assets/images/onboarding1.png')
    screenshotSource: require('../../assets/images/onboarding4.png'),
  },
  {
    id: '2',
    titleKey: 'onboarding_title_2',
    descriptionKey: 'onboarding_desc_2',
    icon: 'creditCard',
    accentColor: '#16A34A',
    // Replace with: require('../../assets/images/onboarding2.png')
    screenshotSource: require('../../assets/images/onboarding1.png'),
  },
  {
    id: '3',
    titleKey: 'onboarding_title_3',
    descriptionKey: 'onboarding_desc_3',
    icon: 'barChart',
    accentColor: '#7C3AED',
    // Replace with: require('../../assets/images/onboarding3.png')
    screenshotSource: require('../../assets/images/onboarding3.png'),
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (isLastSlide) {
      handleGetStarted();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.replace('Login');
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    navigation.replace('Login');
  };

  const renderItem = ({ item }: { item: OnboardingSlideData }) => (
    <OnboardingSlide slide={item} />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip button */}
      {!isLastSlide && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + 16 }]}
          onPress={handleSkip}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>{t('onboarding_skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {isLastSlide ? t('onboarding_get_started') : t('onboarding_next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;
