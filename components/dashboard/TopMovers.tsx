import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { CryptoIcon } from '@/components/common/CryptoIcon';

interface MoverData {
  symbol: string;
  coin: string;
  price: number;
  change: number;
  volume: number;
}

interface TopMoversProps {
  data?: MoverData[];
  type?: 'gainers' | 'losers';
}

export const TopMovers: React.FC<TopMoversProps> = ({ data = [], type = 'gainers' }) => {
  const title = type === 'gainers' ? 'Maiores Altas' : 'Maiores Baixas';
  const iconColor = type === 'gainers' ? '#10B981' : '#EF4444';
  const Icon = type === 'gainers' ? TrendingUp : TrendingDown;

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon size={20} color={iconColor} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.noData}>Nenhum dado disponível</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon size={20} color={iconColor} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data.slice(0, 5).map((mover, index) => (
          <View key={mover.symbol || index} style={styles.card}>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <CryptoIcon symbol={mover.coin} size={32} />
            </View>
            <Text style={styles.coinName}>{mover.coin}</Text>
            <Text style={styles.price}>
              R$ {mover.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </Text>
            <Text style={[styles.change, { color: iconColor }]}>
              {type === 'gainers' ? '+' : ''}{mover.change?.toFixed(2) || '0.00'}%
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  noData: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coinName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
});