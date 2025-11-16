import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassContainer } from './GlassContainer';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Crypto } from '@/types/crypto';

interface CryptoCardProps {
  crypto: Crypto;
  index: number;
}

export function CryptoCard({ crypto, index }: CryptoCardProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 400 });
    }, index * 100);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
  };

  const isPositive = crypto.change24h >= 0;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
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
