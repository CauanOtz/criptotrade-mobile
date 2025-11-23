import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { GlassContainer } from './GlassContainer';
import { TrendingUp, Wallet, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { walletApi, wallet2Api, marketApi } from '@/lib/apiClient';
import { useRouter } from 'expo-router';

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
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const router = useRouter();

  const fetchPortfolio = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [balancesRes, walletRes, tickersRes] = await Promise.allSettled([
        wallet2Api.getBalances(),
        wallet2Api.getWallet(),
        marketApi.getAllTickers(),
      ]);

      const tickers = (tickersRes.status === 'fulfilled' && tickersRes.value.data) ? tickersRes.value.data : [];
      const priceMap: Record<string, number> = {};
      for (const t of tickers) {
        const s = (t.symbol || t.pair || '').toString().toUpperCase();
        const p = Number(t.price ?? t.lastPrice ?? 0);
        if (s) priceMap[s] = p;
      }

      let tv = 0;
      let invested = 0;
      let changeAcc = 0;

      if (balancesRes.status === 'fulfilled' && Array.isArray(balancesRes.value.data)) {
        const balances = balancesRes.value.data;
        for (const b of balances) {
          const symbol = (b.assetSymbol || b.AssetSymbol || '').toString().toUpperCase();
          const amount = Number(b.availableAmount ?? b.AvailableAmount ?? 0);
          const price = priceMap[symbol] ?? 0;
          const current = amount * price;
          tv += current;
        }
        setTotalValue(tv || 0);
        setTotalInvested(0);
        setChange24h(0);
        const fiatSymbols = new Set(['BRL', 'USD', 'USDT', 'USDC', 'BUSD', 'DAI']);
        let avail = 0;
        for (const b of balances) {
          const symbol = (b.assetSymbol || b.AssetSymbol || '').toString().toUpperCase();
          const amount = Number(b.availableAmount ?? b.AvailableAmount ?? 0);
          if (fiatSymbols.has(symbol)) {
            const price = priceMap[symbol] ?? 1;
            avail += amount * price;
          }
        }
        setAvailableBalance(avail || 0);
      } else {
        setTotalValue(0);
        setTotalInvested(0);
        setChange24h(0);
        setAvailableBalance(0);
      }

      if (walletRes.status !== 'fulfilled' || !walletRes.value?.data) {
      }
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

  const containerStyle = StyleSheet.flatten([styles.container, styles.containerDecorated]);

  const profit = totalValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
  const isPositive = profit >= 0;
  const trendColor = isPositive ? '#34d399' : '#f87171';

  return (
    <Animated.View style={animatedStyle}>
      <GlassContainer style={containerStyle}>
        <LinearGradient
          colors={['rgba(234,179,8,0.18)', 'rgba(8,47,73,0.65)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.inner}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Portfólio</Text>
              <Text style={styles.totalValue}>
                ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.depositButton}
              onPress={() => void router.push('/wallet/deposit' as any)}
            >
              <Text style={styles.depositText}>Depositar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: `${trendColor}1c` },
              ]}
            >
              {isPositive ? (
                <ArrowUpRight size={16} color={trendColor} />
              ) : (
                <ArrowDownRight size={16} color={trendColor} />
              )}
              <Text
                style={[
                  styles.badgeText,
                  { color: trendColor },
                ]}
              >
                {isPositive ? '+' : ''}
                {profitPercentage.toFixed(2)}%
              </Text>
            </View>
            <Text style={styles.smallBalance}>Saldo disponível ${availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.metricsRow}>
            <MetricCard
              icon={<Wallet size={16} color="#facc15" />}
              label="Disponível"
              value={`$${availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              accent="#facc15"
            />
            <MetricCard
              icon={<DollarSign size={16} color="#38bdf8" />}
              label="Investido"
              value={`$${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              accent="#38bdf8"
            />
            <MetricCard
              icon={<TrendingUp size={16} color={trendColor} />}
              label="Lucro"
              value={`${isPositive ? '+' : '-'}$${Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              accent={trendColor}
            />
          </View>

          <View style={styles.stats}>
            <StatItem
              icon={<Wallet size={18} color="#eab308" />}
              label="Captação"
              value={`$${totalInvested.toLocaleString('pt-BR')}`}
              delay={200}
            />
            <StatItem
              icon={<DollarSign size={18} color={trendColor} />}
              label="Resultado 24h"
              value={`${isPositive ? '+' : ''}$${Math.abs(profit).toLocaleString('pt-BR')}`}
              valueColor={trendColor}
              delay={400}
            />
          </View>
        </View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#facc15" />
          </View>
        )}
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

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}

function MetricCard({ icon, label, value, accent }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { borderColor: `${accent}55`, backgroundColor: 'rgba(9, 9, 15, 0.3)' }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${accent}22` }]}>
        {icon}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
    </View>
  );
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
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
  },
  containerDecorated: {
    overflow: 'hidden',
  },
  inner: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 44,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
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
  smallBalance: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  depositButton: {
    marginLeft: 12,
    backgroundColor: '#eab308',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  depositText: {
    color: '#071124',
    fontWeight: '700',
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
