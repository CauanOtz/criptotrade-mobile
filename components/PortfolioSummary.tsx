import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { GlassContainer } from './GlassContainer';
import { TrendingUp, Wallet, DollarSign } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { walletApi, marketApi } from '@/lib/apiClient';

interface PortfolioSummaryProps {
  totalValue: number;
  change24h: number;
  totalInvested: number;
}

export function PortfolioSummary({ refreshToggle = 0 }: { refreshToggle?: number }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [change24h, setChange24h] = useState<number>(0);

  const fetchPortfolio = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await walletApi.getuserWallets(user.id);
      const wallets = res.data || [];

      // Fetch all tickers once to avoid multiple network calls
      const tickersRes = await marketApi.getAllTickers();
      const tickers = tickersRes.data || [];
      const priceMap: Record<string, number> = {};
      for (const t of tickers) {
        const s = (t.symbol || t.pair || '').toString().toUpperCase();
        const p = Number(t.price ?? 0);
        if (s) priceMap[s] = p;
      }

      // Attempt to compute totals from returned wallets.
      // Common shapes: wallet.balance (number) or wallet.holdings [{ symbol, amount, invested }]
      let tv = 0;
      let invested = 0;
      let changeAcc = 0;

      for (const w of wallets) {
        if (typeof w.balance === 'number') {
          tv += w.balance;
        }
        if (Array.isArray(w.holdings)) {
          for (const h of w.holdings) {
            const amount = Number(h.amount || 0);
            const investedAmount = Number(h.invested || 0);
            const symbol = (h.symbol || h.asset || '').toString().toUpperCase();
            invested += investedAmount;
            const price = priceMap[symbol] ?? 0;
            if (price > 0) {
              const current = amount * price;
              tv += current;
              changeAcc += current - investedAmount;
            } else {
              tv += investedAmount;
            }
          }
        }
      }

      setTotalValue(tv || 0);
      setTotalInvested(invested || 0);
      setChange24h(((changeAcc / (invested || 1)) * 100) || 0);
    } catch (err: any) {
      Alert.alert('Erro', 'Não foi possível carregar o portfólio');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio, refreshToggle]);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Use timing instead of spring to avoid bounce when the screen reloads
    scale.value = withTiming(1, { duration: 400 });
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
            icon={<Wallet size={18} color="#eab308" />}
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
    // Slide in without spring bounce
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 350 }));
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
    backgroundColor: 'rgba(234, 179, 8, 0.06)',
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
