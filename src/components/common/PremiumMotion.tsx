import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  Vibration,
  ViewStyle,
} from 'react-native';
import { premiumTheme } from '../../theme/premiumTheme';

type FadeInViewProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 240,
  distance = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

type PremiumTouchableProps = TouchableOpacityProps & {
  haptic?: boolean;
  pressScale?: number;
  children: React.ReactNode;
};

export const PremiumTouchable: React.FC<PremiumTouchableProps> = ({
  children,
  haptic = false,
  pressScale = 0.98,
  onPress,
  onPressIn,
  onPressOut,
  style,
  activeOpacity = 0.9,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.timing(scale, {
      toValue: value,
      duration: value === 1 ? premiumTheme.motion.fast : 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        {...props}
        activeOpacity={activeOpacity}
        style={style}
        onPressIn={event => {
          animateTo(pressScale);
          onPressIn?.(event);
        }}
        onPressOut={event => {
          animateTo(1);
          onPressOut?.(event);
        }}
        onPress={event => {
          if (haptic) Vibration.vibrate(12);
          onPress?.(event);
        }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

type ShimmerProps = {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export const PremiumShimmer: React.FC<ShimmerProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.38)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.82, duration: 850, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.38, duration: 850, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5ECF6',
          opacity,
        },
        style,
      ]}
    />
  );
};
