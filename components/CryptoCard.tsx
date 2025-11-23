import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from './GlassContainer';
import Sparkline from './Sparkline';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Crypto } from '@/types/crypto';
import * as Haptics from 'expo-haptics';

interface CryptoCardProps {
  crypto: Crypto;
  index: number;
  onPress?: () => void;
}

type TokenVisual = {
  colors: [string, string];
  accent: string;
  icon: string;
};

const tokenVisuals: Record<string, TokenVisual> = {
  BTC: {
    colors: ['rgba(247, 147, 26, 0.22)', 'rgba(247, 147, 26, 0.05)'],
    accent: '#f7931a',
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=032',
  },
  ETH: {
    colors: ['rgba(98, 126, 234, 0.22)', 'rgba(15, 23, 42, 0.6)'],
    accent: '#627eea',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=032',
  },
  SOL: {
    colors: ['rgba(56, 25, 87, 0.35)', 'rgba(6, 182, 212, 0.08)'],
    accent: '#14f195',
    icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=032',
  },
  ADA: {
    colors: ['rgba(0, 103, 255, 0.25)', 'rgba(6, 182, 212, 0.05)'],
    accent: '#0067ff',
    icon: 'https://cryptologos.cc/logos/cardano-ada-logo.png?v=032',
  },
  USDT: {
    colors: ['rgba(16, 185, 129, 0.24)', 'rgba(6, 78, 59, 0.05)'],
    accent: '#26a17b',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=032',
  },
  BNB: {
    colors: ['rgba(251, 191, 36, 0.22)', 'rgba(15, 15, 15, 0.6)'],
    accent: '#f3ba2f',
    icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=032',
  },
  XRP: {
    colors: ['rgba(148, 163, 184, 0.25)', 'rgba(15, 23, 42, 0.5)'],
    accent: '#b1bccd',
    icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.png?v=032',
  },
  DOGE: {
    colors: ['rgba(245, 158, 11, 0.23)', 'rgba(15, 23, 42, 0.4)'],
    accent: '#c2a633',
    icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png?v=032',
  },
  MATIC: {
    colors: ['rgba(168, 85, 247, 0.25)', 'rgba(15, 23, 42, 0.5)'],
    accent: '#8247e5',
    icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=032',
  },
  DOT: {
    colors: ['rgba(236, 72, 153, 0.25)', 'rgba(15, 23, 42, 0.5)'],
    accent: '#e6007a',
    icon: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png?v=032',
  },
  LTC: {
    colors: ['rgba(148, 163, 184, 0.25)', 'rgba(96, 165, 250, 0.06)'],
    accent: '#b8c4ce',
    icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png?v=032',
  },
  AVAX: {
    colors: ['rgba(248, 113, 113, 0.28)', 'rgba(15, 23, 42, 0.5)'],
    accent: '#e84142',
    icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.png?v=032',
  },
};

const getFallbackVisual = (symbol: string): TokenVisual => {
  const palette = ['#38bdf8', '#14b8a6', '#f472b6', '#f59e0b', '#8b5cf6'];
  const key = symbol && symbol.length > 0 ? symbol : 'TOKEN';
  const index = key.charCodeAt(0) % palette.length;
  const accent = palette[index];
  return {
    colors: [`${accent}22`, 'rgba(15,23,42,0.4)'],
    accent,
    icon: `https://ui-avatars.com/api/?name=${key}&background=0f172a&color=f8fafc&size=128`,
  };
};

export function CryptoCard({ crypto, index, onPress }: CryptoCardProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 400 });
      opacity.value = withTiming(1, { duration: 400 });
    }, index * 100);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = async () => {
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // ignore if haptics not available
    }
    scale.value = withTiming(0.95, { duration: 120 }, () => {
      scale.value = withTiming(1, { duration: 140 });
    });
    if (onPress) onPress();
  };

  const isPositive = crypto.change24h >= 0;

  // generate simple sparkline data based on current price and change24h
  const generateSpark = (price: number, changePercent: number, points = 12) => {
    const arr: number[] = [];
    const start = price / (1 + changePercent / 100);
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      // linear interpolate with small noise
      const value = start + (price - start) * t + (Math.sin(i * 2 + price) * price * 0.002);
      arr.push(value);
    }
    return arr;
  };

  const sparkData = generateSpark(crypto.price, crypto.change24h);
  const symbol = crypto.symbol?.toUpperCase?.() ?? crypto.symbol ?? 'TOKEN';
  const visual = tokenVisuals[symbol] ?? getFallbackVisual(symbol);
  const accent = visual.accent;
  const changeBadgeBackground = isPositive ? `${accent}22` : '#ef444422';
  const changeBadgeColor = isPositive ? accent : '#ef4444';
  const logoUri = crypto.image || visual.icon;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <GlassContainer style={[styles.container, { overflow: 'hidden' }] }>
          <LinearGradient
            colors={visual.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.inner}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View
                  style={[
                    styles.logoWrapper,
                    {
                      borderColor: `${accent}55`,
                      backgroundColor: `${accent}12`,
                    },
                  ]}
                >
                  <Image source={{ uri: logoUri }} style={styles.logo} resizeMode="contain" />
                </View>
                <View>
                  <Text style={styles.symbol}>{symbol}</Text>
                  <Text style={styles.name}>{crypto.name}</Text>
                  <Text style={styles.pair}>{crypto.pair}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.changeBadge,
                  { backgroundColor: changeBadgeBackground },
                ]}
              >
                {isPositive ? (
                  <TrendingUp size={14} color={changeBadgeColor} />
                ) : (
                  <TrendingDown size={14} color={changeBadgeColor} />
                )}
                <Text
                  style={[
                    styles.changeText,
                    { color: changeBadgeColor },
                  ]}
                >
                  {isPositive ? '+' : ''}
                  {crypto.change24h.toFixed(2)}%
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: accent }]}>
                ${crypto.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
              <Sparkline data={sparkData} width={160} height={52} stroke={accent} strokeWidth={2.5} />
            </View>

            <View style={styles.footer}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Cap. Mercado</Text>
                <Text style={[styles.statValue, styles.statValueAccent]}>
                  ${(crypto.marketCap / 1e9).toFixed(2)}B
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Volume 24h</Text>
                <Text style={styles.statValue}>
                  ${(crypto.volume24h / 1e9).toFixed(2)}B
                </Text>
              </View>
            </View>
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.lightOrb,
              {
                shadowColor: accent,
                backgroundColor: `${accent}1a`,
              },
            ]}
          />
        </GlassContainer>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 4,
    minHeight: 120,
    padding: 0,
    borderRadius: 18,
  },
  inner: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  logo: {
    width: 28,
    height: 28,
  },
  symbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: '#94a3b8',
  },
  pair: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  statValueAccent: {
    color: '#fef3c7',
  },
  lightOrb: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -30,
    right: -20,
    opacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    shadowOpacity: 0.6,
  },
});
