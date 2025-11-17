import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <GlassContainer style={styles.container}>
          <View style={styles.header}>
            <View style={styles.cryptoInfo}>
              <Text style={styles.symbol}>{crypto.symbol}</Text>
              <Text style={styles.name}>{crypto.name}</Text>
            </View>
            <View
              style={[
                styles.changeBadge,
                { backgroundColor: isPositive ? '#10b98122' : '#ef444422' },
              ]}
            >
              {isPositive ? (
                <TrendingUp size={14} color="#10b981" />
              ) : (
                <TrendingDown size={14} color="#ef4444" />
              )}
              <Text
                style={[
                  styles.changeText,
                  { color: isPositive ? '#10b981' : '#ef4444' },
                ]}
              >
                {isPositive ? '+' : ''}
                {crypto.change24h.toFixed(2)}%
              </Text>
            </View>
          </View>

          <Text style={styles.price}>
            ${crypto.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>

          <Sparkline data={sparkData} width={180} height={48} />

          <View style={styles.footer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Cap. Mercado</Text>
              <Text style={styles.statValue}>
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
        </GlassContainer>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 4,
    minHeight: 96,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cryptoInfo: {
    flex: 1,
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
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
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
    color: '#94a3b8',
  },
});
