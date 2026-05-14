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

const SectionHeaderSkeleton: React.FC = () => (
  <View style={sk.sectionRow}>
    <Shimmer width={120} height={14} borderRadius={7} />
    <Shimmer width={52} height={12} borderRadius={6} />
  </View>
);

const ReceiptCardSkeleton: React.FC = () => (
  <View style={sk.card}>
    {/* Top row: date + dots */}
    <View style={sk.topRow}>
      <View style={sk.dateRow}>
        <Shimmer width={14} height={14} borderRadius={7} />
        <Shimmer width={72} height={12} borderRadius={6} />
      </View>
      <Shimmer width={22} height={22} borderRadius={11} />
    </View>

    {/* Amount */}
    <Shimmer width="50%" height={22} borderRadius={8} style={{ marginVertical: 10 }} />

    {/* Bottom row: method chip + note chip */}
    <View style={sk.bottomRow}>
      <View style={sk.methodRow}>
        <Shimmer width={15} height={15} borderRadius={8} />
        <Shimmer width={80} height={12} borderRadius={6} />
      </View>
      <Shimmer width={100} height={12} borderRadius={6} />
    </View>
  </View>
);

const ReceiptSkeleton: React.FC = () => (
  <View style={sk.container}>
    <SectionHeaderSkeleton />
    {[0, 1, 2, 3, 4, 5].map(i => (
      <ReceiptCardSkeleton key={i} />
    ))}
  </View>
);

export default ReceiptSkeleton;

const sk = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
