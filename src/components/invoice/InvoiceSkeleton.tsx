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
      style={[
        { width, height, borderRadius, backgroundColor: '#E5E7EB', opacity },
        style,
      ]}
    />
  );
};

const SummaryCardSkeleton: React.FC = () => (
  <View style={sk.summaryCard}>
    <Shimmer width="55%" height={14} borderRadius={7} style={{ alignSelf: 'center', marginBottom: 16 }} />
    <View style={sk.summaryRow}>
      {[0, 1, 2].map(i => (
        <View key={i} style={sk.summaryItem}>
          <Shimmer width={10} height={10} borderRadius={5} />
          <View style={{ gap: 4 }}>
            <Shimmer width={52} height={12} borderRadius={6} />
            <Shimmer width={36} height={10} borderRadius={5} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

const InvoiceRowSkeleton: React.FC = () => (
  <View style={sk.card}>
    <View style={sk.cardLeft}>
      <Shimmer width={44} height={44} borderRadius={22} />
      <View style={{ gap: 6, flex: 1 }}>
        <Shimmer width="60%" height={13} />
        <Shimmer width="40%" height={11} />
        <Shimmer width="30%" height={10} borderRadius={5} />
      </View>
    </View>
    <View style={sk.cardRight}>
      <Shimmer width={56} height={18} borderRadius={9} />
      <Shimmer width={44} height={12} />
    </View>
  </View>
);

const InvoiceSkeleton: React.FC = () => (
  <View style={sk.container}>
    <SummaryCardSkeleton />
    {[0, 1, 2, 3, 4].map(i => (
      <InvoiceRowSkeleton key={i} />
    ))}
  </View>
);

export default InvoiceSkeleton;

const sk = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    gap: 10,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
});
