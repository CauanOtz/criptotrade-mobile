import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

interface ChartDataPoint {
  time: string;
  price: number;
  fullDate?: string;
}

interface CryptoChartProps {
  data?: ChartDataPoint[];
  isLoading?: boolean;
  color?: string;
  height?: number;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({ 
  data = [], 
  isLoading = false, 
  color = '#F7931A',
  height = 250
}) => {
  const { width } = Dimensions.get('window');
  const chartWidth = width - 80;

  const { bars, minPrice, maxPrice, priceChange } = useMemo(() => {
    if (!data || data.length === 0) {
      return { bars: [], minPrice: 0, maxPrice: 0, priceChange: 0 };
    }

    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const barsCount = Math.min(data.length, 50); 
    const step = Math.floor(data.length / barsCount);
    
    const bars = [];
    for (let i = 0; i < barsCount; i++) {
      const dataIndex = i * step;
      if (dataIndex < data.length) {
        const point = data[dataIndex];
        const heightPercent = ((point.price - min) / range) * 100;
        bars.push({ height: heightPercent, price: point.price });
      }
    }

    const firstPrice = data[0]?.price || 0;
    const lastPrice = data[data.length - 1]?.price || 0;
    const change = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

    return { bars, minPrice: min, maxPrice: max, priceChange: change };
  }, [data]);

  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color={color} />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <TrendingUp size={40} color="#E5E7EB" />
        <Text style={styles.noData}>Sem dados disponíveis</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {/* Price Info */}
      <View style={styles.priceInfo}>
        <View>
          <Text style={styles.currentPrice}>
            R$ {data[data.length - 1]?.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.priceChange, { color: priceChange >= 0 ? '#10B981' : '#EF4444' }]}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </Text>
        </View>
        <View style={styles.priceRange}>
          <Text style={styles.rangeText}>Máx: R$ {maxPrice.toFixed(2)}</Text>
          <Text style={styles.rangeText}>Mín: R$ {minPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Simple Bar Chart */}
      <View style={[styles.chartArea, { width: chartWidth }]}>
        <View style={styles.barsContainer}>
          {bars.map((bar, index) => (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: `${bar.height}%`,
                  backgroundColor: color,
                  opacity: 0.7 + (bar.height / 100) * 0.3,
                }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Time labels */}
      <View style={styles.timeLabels}>
        <Text style={styles.timeLabel}>{data[0]?.time || ''}</Text>
        <Text style={styles.timeLabel}>{data[Math.floor(data.length / 2)]?.time || ''}</Text>
        <Text style={styles.timeLabel}>{data[data.length - 1]?.time || ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noData: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  priceRange: {
    alignItems: 'flex-end',
  },
  rangeText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  chartArea: {
    height: 150,
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    justifyContent: 'space-between',
  },
  bar: {
    flex: 1,
    marginHorizontal: 0.5,
    borderRadius: 2,
    minHeight: 2,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
});