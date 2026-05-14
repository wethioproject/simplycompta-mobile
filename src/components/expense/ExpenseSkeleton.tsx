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

const AlertCardSkeleton: React.FC = () => (
  <View style={sk.alertCard}>
    {/* Left: icon circle + text line */}
    <View style={sk.alertLeft}>
      <Shimmer width={40} height={40} borderRadius={20} />
      <Shimmer width="55%" height={13} borderRadius={7} />
    </View>
    {/* Right: button pill */}
    <Shimmer width={90} height={36} borderRadius={20} />
  </View>
);

const ExpenseCardSkeleton: React.FC = () => (
  <View style={sk.card}>
    {/* Left: icon + text stack */}
    <View style={sk.cardLeft}>
      {/* Pink icon circle */}
      <Shimmer width={40} height={40} borderRadius={20} style={{ flexShrink: 0 }} />
      <View style={{ flex: 1, gap: 8 }}>
        {/* Category name */}
        <Shimmer width="55%" height={14} borderRadius={7} />
        {/* Date • method meta */}
        <Shimmer width="75%" height={12} borderRadius={6} />
      </View>
    </View>
    {/* Right: amount */}
    <Shimmer width={72} height={16} borderRadius={7} />
  </View>
);

const ExpenseSkeleton: React.FC = () => (
  <View style={sk.container}>
    {/* Alert card placeholder */}
    <AlertCardSkeleton />
    {/* Expense rows */}
    {[0, 1, 2, 3, 4, 5, 6].map(i => (
      <ExpenseCardSkeleton key={i} />
    ))}
  </View>
);

export default ExpenseSkeleton;

const sk = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 2,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
});
