import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { CryptoCard } from '@/components/CryptoCard';
import CoinPicker from '@/components/CoinPicker';
import { Crypto } from '@/types/crypto';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const mockCryptos: Crypto[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 65432.89,
    change24h: 3.45,
    marketCap: 1280000000000,
    volume24h: 45000000000,
    image: '',
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3456.78,
    change24h: -1.23,
    marketCap: 415000000000,
    volume24h: 18000000000,
    image: '',
  },
  {
    id: '3',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.5678,
    change24h: 5.67,
    marketCap: 20000000000,
    volume24h: 850000000,
    image: '',
  },
  {
    id: '4',
    name: 'Solana',
    symbol: 'SOL',
    price: 145.32,
    change24h: 8.91,
    marketCap: 65000000000,
    volume24h: 3200000000,
    image: '',
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(mockCryptos[0]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cryptos, setCryptos] = useState<Crypto[]>(mockCryptos);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const totalValue = 125430.56;
  const totalInvested = 100000;
  const change24h = 3.2;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000ff', '#222222ff', '#363636ff']}
        style={StyleSheet.absoluteFill}
      />

      <FloatingShapes />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#eab308"
            />
          }
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Olá</Text>
              <Text style={styles.userName}>
                {user?.email?.split('@')[0] || 'Usuário'}
              </Text>
            </View>
          </View>

          <PortfolioSummary
            totalValue={totalValue}
            change24h={change24h}
            totalInvested={totalInvested}
          />

          <View style={{ marginTop: 20, marginBottom: 12 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPickerVisible(true)}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>Moeda selecionada</Text>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{selected?.symbol} — {selected?.name}</Text>
                </View>
                <Text style={{ color: '#eab308', fontWeight: '700' }}>Trocar</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Principais Criptomoedas</Text>
            {cryptos.map((crypto, index) => (
              <CryptoCard
                key={crypto.id}
                crypto={crypto}
                index={index}
                onPress={() => {
                  setSelected(crypto);
                }}
              />
            ))}
          </View>

          <CoinPicker
            visible={pickerVisible}
            onClose={() => setPickerVisible(false)}
            coins={cryptos}
            onSelect={c =>
              setSelected({
                id: c.id,
                name: c.name,
                symbol: c.symbol,
                price: c.price,
                change24h: 0,
                marketCap: 0,
                volume24h: 0,
                image: '',
              })
            }
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FloatingShapes() {
  return (
    <>
      <FloatingShape index={0} />
      <FloatingShape index={1} />
      <FloatingShape index={2} />
    </>
  );
}

function FloatingShape({ index }: { index: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 3000 + index * 500 }),
        withTiming(-30, { duration: 3000 + index * 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const positions = [
    { top: height * 0.1, right: 20, width: 100, height: 100 },
    { top: height * 0.4, left: 30, width: 80, height: 80 },
    { bottom: height * 0.2, right: 40, width: 120, height: 120 },
  ];

  return (
    <Animated.View
      style={[
        styles.floatingShape,
        {
          ...positions[index],
          borderRadius: positions[index].width / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  floatingShape: {
    position: 'absolute',
    backgroundColor: 'rgba(234, 179, 8, 0.06)',
  },
});
