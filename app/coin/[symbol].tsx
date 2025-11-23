import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GlassContainer } from '@/components/GlassContainer';
import { marketApi } from '@/lib/apiClient';
import Svg, { Polyline, Rect, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type KlinePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

function parseKlines(raw: any[]): KlinePoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: any) => {
    if (Array.isArray(r)) {
      return {
        time: Number(r[0]),
        open: Number(r[1]),
        high: Number(r[2]),
        low: Number(r[3]),
        close: Number(r[4]),
        volume: Number(r[5]),
      } as KlinePoint;
    }
    // if object shape
    return {
      time: Number(r.openTime ?? r.time ?? r.t ?? 0),
      open: Number(r.open ?? r.o ?? 0),
      high: Number(r.high ?? r.h ?? 0),
      low: Number(r.low ?? r.l ?? 0),
      close: Number(r.close ?? r.c ?? r.price ?? 0),
      volume: Number(r.volume ?? r.v ?? 0),
    } as KlinePoint;
  });
}

function Chart({ data }: { data: KlinePoint[] }) {
  const w = Math.min(width - 48, 820);
  const h = 220;

  const points = useMemo(() => {
    if (!data || data.length === 0) return '';
    const closes = data.map(d => d.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    return data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((d.close - min) / range) * h;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, w, h]);

  if (!data || data.length === 0) return <View style={{ height: h, justifyContent: 'center' }}><Text style={{ color: '#94a3b8' }}>Sem dados históricos</Text></View>;

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <Svg width={w} height={h}>
        <Rect x={0} y={0} width={w} height={h} fill="transparent" />
        <Polyline points={points} fill="none" stroke="#eab308" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export default function CoinScreen() {
  const { symbol } = useLocalSearchParams() as { symbol?: string };
  const router = useRouter();
  const [interval, setInterval] = useState('15m');
  const [limit, setLimit] = useState(200);
  const [loading, setLoading] = useState(false);
  const [klines, setKlines] = useState<KlinePoint[]>([]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await marketApi.getKlines(symbol, interval, limit);
        const raw = res.data;
        const parsed = parseKlines(raw);
        if (!cancelled) setKlines(parsed);
      } catch (e) {
        console.warn('Failed loading klines', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [symbol, interval, limit]);

  const intervals = ['1m', '5m', '15m', '1h', '4h', '1d'];

  const handleBuy = () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert('Valor inválido', 'Informe a quantidade a comprar');
      return;
    }
    // Placeholder: integrate with wallet/transaction APIs
    Alert.alert('Compra', `Comprar ${amount} ${symbol}`);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={["#000000ff","#111111ff"]} style={StyleSheet.absoluteFill} />
      <SafeHeader title={symbol ?? 'Moeda'} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <GlassContainer style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: '#94a3b8', marginBottom: 6 }}>Histórico — {symbol}</Text>
          {loading ? (
            <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#eab308" />
            </View>
          ) : (
            <Chart data={klines} />
          )}

          <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
            {intervals.map(i => (
              <TouchableOpacity key={i} onPress={() => setInterval(i)} style={[styles.intervalBtn, interval === i && styles.intervalActive]}>
                <Text style={{ color: interval === i ? '#071124' : '#eab308', fontWeight: '700' }}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassContainer>

        <GlassContainer style={{ padding: 16 }}>
          <Text style={{ color: '#94a3b8', marginBottom: 8 }}>Comprar {symbol}</Text>
          <TextInput
            placeholder="Quantidade"
            placeholderTextColor="#64748b"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{ height: 48, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 12, color: '#fff', marginBottom: 12 }}
          />
          <TouchableOpacity onPress={handleBuy} style={{ backgroundColor: '#eab308', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ color: '#071124', fontWeight: '700' }}>Comprar</Text>
          </TouchableOpacity>
        </GlassContainer>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function SafeHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={{ height: 80, paddingTop: 36, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
        <Text style={{ color: '#eab308', fontWeight: '700' }}>{'< Voltar'}</Text>
      </TouchableOpacity>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{title}</Text>
      <View style={{ width: 56 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  intervalBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.18)',
  },
  intervalActive: {
    backgroundColor: '#eab308',
  },
});
