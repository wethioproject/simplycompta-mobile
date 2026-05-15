import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  Vibration,
  View,
  ViewStyle,
} from 'react-native';
import { Check } from 'lucide-react-native';
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

type SuccessMorphButtonProps = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
  success?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  successLabel?: string;
};

export const SuccessMorphButton: React.FC<SuccessMorphButtonProps> = ({
  label,
  loading = false,
  success = false,
  style,
  textStyle,
  successLabel,
  disabled,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!success) {
      successScale.setValue(0.8);
      successOpacity.setValue(0);
      return;
    }

    Vibration.vibrate(14);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [success, successOpacity, successScale]);

  const animatePress = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        {...props}
        disabled={disabled || loading || success}
        activeOpacity={0.88}
        onPressIn={event => {
          animatePress(0.98);
          props.onPressIn?.(event);
        }}
        onPressOut={event => {
          animatePress(1);
          props.onPressOut?.(event);
        }}
        style={[
          style,
          success && {
            backgroundColor: premiumTheme.colors.success,
            borderColor: premiumTheme.colors.success,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : success ? (
          <Animated.View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            }}
          >
            <Check size={17} color="#FFFFFF" strokeWidth={3} />
            {!!successLabel && <Text style={textStyle}>{successLabel}</Text>}
          </Animated.View>
        ) : (
          <View>
            <Text style={textStyle}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
