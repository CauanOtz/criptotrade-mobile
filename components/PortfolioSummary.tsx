import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassContainer } from './GlassContainer';
import { TrendingUp, Wallet, DollarSign } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface PortfolioSummaryProps {
  totalValue: number;
  change24h: number;
  totalInvested: number;
}

export function PortfolioSummary({
  totalValue,
  change24h,
  totalInvested,
}: PortfolioSummaryProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const profit = totalValue - totalInvested;
  const profitPercentage = (profit / totalInvested) * 100;
  const isPositive = profit >= 0;

  return (
    <Animated.View style={animatedStyle}>
      <GlassContainer style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Portfólio Total</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isPositive ? '#10b98122' : '#ef444422' },
            ]}
          >
            <TrendingUp
              size={14}
              color={isPositive ? '#10b981' : '#ef4444'}
            />
            <Text
              style={[
                styles.badgeText,
                { color: isPositive ? '#10b981' : '#ef4444' },
              ]}
            >
              {isPositive ? '+' : ''}
              {profitPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>

        <Text style={styles.totalValue}>
          ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>

        <View style={styles.stats}>
          <StatItem
            icon={<Wallet size={18} color="#3b82f6" />}
            label="Investido"
            value={`$${totalInvested.toLocaleString('pt-BR')}`}
            delay={200}
          />
          <StatItem
            icon={<DollarSign size={18} color="#10b981" />}
            label="Lucro/Perda"
            value={`${isPositive ? '+' : ''}$${Math.abs(profit).toLocaleString('pt-BR')}`}
            valueColor={isPositive ? '#10b981' : '#ef4444'}
            delay={400}
          />
        </View>
      </GlassContainer>
    </Animated.View>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  delay?: number;
}

function StatItem({ icon, label, value, valueColor, delay = 0 }: StatItemProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(delay, withSpring(0, { damping: 15 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.statItem, animatedStyle]}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, valueColor && { color: valueColor }]}>
          {value}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  stats: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
