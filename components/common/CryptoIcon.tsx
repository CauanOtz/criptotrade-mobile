import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface CryptoIconProps {
  symbol: string;
  size?: number;
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({ symbol, size = 40 }) => {
  const [iconError, setIconError] = useState(false);

  const cleanSymbol = (() => {
    if (!symbol) return '';
    const s = String(symbol).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const SUFFIXES = ['USDT', 'USDC', 'BUSD', 'TUSD', 'USDP', 'DAI', 'BIDR', 'BRL', 'EUR', 'USD'];
    const suffix = SUFFIXES.find(x => s.length > x.length && s.endsWith(x));
    const base = suffix ? s.slice(0, -suffix.length) : s;
    return base.toLowerCase();
  })();

  const iconUrl = `https://assets.coincap.io/assets/icons/${cleanSymbol}@2x.png`;

  if (iconError || !cleanSymbol) {
    // Fallback: círculo com inicial da moeda
    const initial = (symbol || '?').charAt(0).toUpperCase();
    return (
      <View style={[styles.fallbackContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.5 }]}>{initial}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: iconUrl }}
      style={[styles.icon, { width: size, height: size, borderRadius: size / 2 }]}
      onError={() => setIconError(true)}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    backgroundColor: '#F3F4F6',
  },
  fallbackContainer: {
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: 'bold',
    color: '#F7931A',
  },
});
