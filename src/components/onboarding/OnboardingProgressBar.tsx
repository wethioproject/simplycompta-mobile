import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface OnboardingProgressBarProps {
  completed: number;
  total: number;
}

const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({ completed, total }) => {
  const { t } = useTranslation();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>
          {t('checklist_progress_label', { completed, total })}
        </Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  percentage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  track: {
    height: 7,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#16A34A',
  },
});

export default OnboardingProgressBar;
