import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CryptoCard } from '@/components/CryptoCard';
import { Search } from 'lucide-react-native';
import { Crypto } from '@/types/crypto';
import { GlassContainer } from '@/components/GlassContainer';

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
  {
    id: '5',
    name: 'Polkadot',
    symbol: 'DOT',
    price: 7.89,
    change24h: -2.34,
    marketCap: 9000000000,
    volume24h: 320000000,
    image: '',
  },
  {
    id: '6',
    name: 'Avalanche',
    symbol: 'AVAX',
    price: 38.45,
    change24h: 4.56,
    marketCap: 14000000000,
    volume24h: 580000000,
    image: '',
  },
];

export default function MarketScreen() {
  const [search, setSearch] = useState('');
  const [cryptos] = useState<Crypto[]>(mockCryptos);

  const filteredCryptos = cryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(search.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000ff', '#222222ff', '#363636ff']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Mercado</Text>
          <Text style={styles.subtitle}>
            Explore as principais criptomoedas
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <GlassContainer>
            <View style={styles.searchBox}>
              <Search color="#64748b" size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar criptomoeda..."
                placeholderTextColor="#64748b"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </GlassContainer>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredCryptos.map((crypto, index) => (
            <CryptoCard key={crypto.id} crypto={crypto} index={index} />
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#ffffff',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
});
