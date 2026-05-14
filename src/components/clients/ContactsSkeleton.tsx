import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface ShimmerProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}

const Shimmer: React.FC<ShimmerProps> = ({ width, height, borderRadius = 6, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#E5E7EB', opacity }, style]}
    />
  );
};

const ContactCardSkeleton: React.FC<{ isSupplier?: boolean }> = ({ isSupplier }) => (
  <View style={sk.card}>
    {/* Avatar */}
    <Shimmer
      width={48}
      height={48}
      borderRadius={24}
      style={{ backgroundColor: isSupplier ? '#FFEDD5' : '#DBEAFE' }}
    />

    {/* Info column */}
    <View style={sk.info}>
      <Shimmer width="65%" height={14} borderRadius={7} />
      <Shimmer width="40%" height={11} borderRadius={6} style={{ marginTop: 6 }} />
    </View>

    {/* Right: badge + amount */}
    <View style={sk.right}>
      <Shimmer width={80} height={24} borderRadius={8} />
      <Shimmer width={60} height={12} borderRadius={6} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const ContactsSkeleton: React.FC<{ isSupplier?: boolean }> = ({ isSupplier }) => (
  <View style={sk.container}>
    {[0, 1, 2, 3, 4, 5, 6].map(i => (
      <ContactCardSkeleton key={i} isSupplier={isSupplier} />
    ))}
  </View>
);

export default ContactsSkeleton;

const sk = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
});
