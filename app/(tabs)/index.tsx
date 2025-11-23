import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { CryptoCard } from '@/components/CryptoCard';
import { Crypto } from '@/types/crypto';
import { useRouter } from 'expo-router';
import { marketApi } from '@/lib/apiClient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const curatedTokenMeta: Record<string, { name: string; icon: string }> = {
  BTC: { name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=032' },
  ETH: { name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=032' },
  BNB: { name: 'BNB', icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=032' },
  XRP: { name: 'XRP', icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.png?v=032' },
  ADA: { name: 'Cardano', icon: 'https://cryptologos.cc/logos/cardano-ada-logo.png?v=032' },
  SOL: { name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=032' },
  DOGE: { name: 'Dogecoin', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png?v=032' },
  MATIC: { name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=032' },
  DOT: { name: 'Polkadot', icon: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png?v=032' },
  LTC: { name: 'Litecoin', icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png?v=032' },
  AVAX: { name: 'Avalanche', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.png?v=032' },
  SHIB: { name: 'Shiba Inu', icon: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png?v=032' },
  ATOM: { name: 'Cosmos', icon: 'https://cryptologos.cc/logos/cosmos-atom-logo.png?v=032' },
};

const resolveTokenMeta = (symbol: string) => {
  const upper = symbol.toUpperCase();
  if (curatedTokenMeta[upper]) return curatedTokenMeta[upper];
  const cryptoIconsUrl = `https://cryptoicons.org/api/icon/${upper.toLowerCase()}/64`;
  return {
    name: upper,
    icon: cryptoIconsUrl,
  };
};

type QuoteFilter = 'ALL' | 'USDT' | 'BTC' | 'STABLE';
type ChangeFilter = 'ALL' | 'GAINERS' | 'LOSERS';

const quoteSuffixes = [
  'USDT',
  'USDC',
  'BUSD',
  'TUSD',
  'USDP',
  'DAI',
  'BTC',
  'ETH',
  'BNB',
  'BRL',
  'EUR',
  'USD',
  'TRY',
  'BIDR',
  'AUD',
  'GBP',
  'ARS',
];

const usdPeghQuotes = ['USDT', 'USDC', 'BUSD', 'TUSD', 'USDP', 'DAI'];
const fiatQuotes = ['BRL', 'EUR', 'USD'];
const stableQuotes = [...usdPeghQuotes, ...fiatQuotes];

const splitSymbol = (symbol: string) => {
  const upper = symbol.toUpperCase();
  const match = quoteSuffixes.find(suffix => upper.endsWith(suffix));
  if (!match) return { base: upper, quote: '' };
  return {
    base: upper.slice(0, -match.length) || upper,
    quote: match,
  };
};

const quoteOptions: { label: string; value: QuoteFilter }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'USDT', value: 'USDT' },
  { label: 'BTC', value: 'BTC' },
  { label: 'Stable', value: 'STABLE' },
];

const changeOptions: { label: string; value: ChangeFilter }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Alta', value: 'GAINERS' },
  { label: 'Baixa', value: 'LOSERS' },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [quoteFilter, setQuoteFilter] = useState<QuoteFilter>('ALL');
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>('ALL');

  const fetchCryptos = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await marketApi.getAllTickers();
      const data = (response?.data ?? response ?? []) as any[];
      const mapped = data
        .map(item => {
          const marketSymbol = (item.symbol || item.Symbol || '').toString().toUpperCase();
          if (!marketSymbol) return null;
          const { base, quote } = splitSymbol(marketSymbol);
          const price = Number(item.lastPrice ?? item.LastPrice ?? item.price ?? 0);
          const change = Number(item.priceChangePercent ?? item.PriceChangePercent ?? 0);
          const volume = Number(item.volume ?? item.Volume ?? 0);
          const quoteVolume = Number(item.quoteVolume ?? item.QuoteVolume ?? 0);
          const meta = resolveTokenMeta(base);
          return {
            id: marketSymbol,
            symbol: base,
            pair: quote ? `${base}/${quote}` : marketSymbol,
            quoteSymbol: quote,
            name: meta.name,
            price,
            change24h: change,
            marketCap: quoteVolume,
            volume24h: volume,
            image: meta.icon,
          } as Crypto;
        })
        .filter(Boolean) as Crypto[];

      const aggregated = mapped.reduce<Record<string, Crypto>>((acc, curr) => {
        const existing = acc[curr.symbol];
        const currIsStable = stableQuotes.includes(curr.quoteSymbol);
        const existingIsStable = existing ? stableQuotes.includes(existing.quoteSymbol) : false;

        if (!existing) {
          acc[curr.symbol] = curr;
          return acc;
        }

        if (currIsStable && !existingIsStable) {
          acc[curr.symbol] = curr;
          return acc;
        }

        if (currIsStable === existingIsStable) {
          const currScore = curr.marketCap ?? 0;
          const existingScore = existing.marketCap ?? 0;
          if (currScore > existingScore) acc[curr.symbol] = curr;
        }
        return acc;
      }, {});

      const stableOnly = Object.values(aggregated).filter(c => usdPeghQuotes.includes(c.quoteSymbol));
      stableOnly.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
      const limited = stableOnly.slice(0, 20);
      setCryptos(limited);
      setError(limited.length ? null : 'Nenhuma cotação em dólar encontrada agora.');
    } catch (err) {
      console.warn('Failed to load cryptos', err);
      setError('Não foi possível carregar as criptomoedas agora.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void fetchCryptos();
  }, [fetchCryptos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchCryptos().finally(() => setRefreshing(false));
  }, [fetchCryptos]);

  const filteredCryptos = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return cryptos.filter(c => {
      if (
        q &&
        !(
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.pair.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      if (quoteFilter === 'STABLE') {
        if (!stableQuotes.includes(c.quoteSymbol)) return false;
      } else if (quoteFilter !== 'ALL') {
        if (c.quoteSymbol !== quoteFilter) return false;
      }
      if (changeFilter === 'GAINERS' && c.change24h <= 0) return false;
      if (changeFilter === 'LOSERS' && c.change24h >= 0) return false;
      return true;
    });
  }, [cryptos, searchText, quoteFilter, changeFilter]);

  const showFilteredEmpty =
    !loadingList && !error && cryptos.length > 0 && filteredCryptos.length === 0;

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

          <PortfolioSummary />

          <View style={styles.filtersCard}>
            <Text style={styles.filterTitle}>Filtrar mercado</Text>
            <View style={styles.searchBox}>
              <TextInput
                placeholder="Buscar por nome ou símbolo"
                placeholderTextColor="#64748b"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.filterLabel}>Par</Text>
            <View style={styles.filterRow}>
              {quoteOptions.map(opt => {
                const active = quoteFilter === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setQuoteFilter(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.filterChipText, active && styles.filterChipTextActive]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterLabel}>Variação 24h</Text>
            <View style={styles.filterRow}>
              {changeOptions.map(opt => {
                const active = changeFilter === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setChangeFilter(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.filterChipText, active && styles.filterChipTextActive]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Principais Criptomoedas</Text>
              <Text style={styles.sectionSubtitle}>{filteredCryptos.length} ativos</Text>
            </View>
            {loadingList && !cryptos.length && (
              <View style={styles.listPlaceholder}>
                <ActivityIndicator color="#eab308" />
                <Text style={styles.placeholderText}>Carregando dados em tempo real...</Text>
              </View>
            )}
            {!loadingList && error && !cryptos.length && (
              <View style={styles.listPlaceholder}>
                <Text style={styles.placeholderText}>{error}</Text>
                <TouchableOpacity onPress={() => void fetchCryptos()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            )}
            {filteredCryptos.map((crypto, index) => (
              <CryptoCard
                key={crypto.id}
                crypto={crypto}
                index={index}
                onPress={() => {
                  try {
                    const path = `/coin/${encodeURIComponent(crypto.symbol)}`;
                    void router.push(path as any);
                  } catch (e) {
                    void router.push({ pathname: '/coin/[symbol]', params: { symbol: crypto.symbol } } as any);
                  }
                }}
              />
            ))}
            {showFilteredEmpty && (
              <View style={styles.listPlaceholder}>
                <Text style={styles.placeholderText}>
                  Nenhum ativo corresponde aos filtros escolhidos.
                </Text>
              </View>
            )}
          </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  listPlaceholder: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  retryText: {
    color: '#eab308',
    fontWeight: '600',
  },
  filtersCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    gap: 12,
  },
  filterTitle: {
    fontSize: 16,
    color: '#f1f5f9',
    fontWeight: '600',
  },
  searchBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    color: '#f8fafc',
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(234,179,8,0.15)',
    borderColor: '#eab308',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#eab308',
  },
  floatingShape: {
    position: 'absolute',
    backgroundColor: 'rgba(234, 179, 8, 0.06)',
  },
});
