import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CryptoCard } from '@/components/CryptoCard';
import { Search, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Crypto } from '@/types/crypto';
import { GlassContainer } from '@/components/GlassContainer';
import { marketApi } from '@/lib/apiClient';
import { useRouter } from 'expo-router';

const curatedTokenMeta: Record<string, { name: string; icon: string }> = {
  BTC: { name: 'Bitcoin', icon: marketApi.getCryptoIcon('BTC') },
  ETH: { name: 'Ethereum', icon: marketApi.getCryptoIcon('ETH') },
  SOL: { name: 'Solana', icon: marketApi.getCryptoIcon('SOL') },
  ADA: { name: 'Cardano', icon: marketApi.getCryptoIcon('ADA') },
  BNB: { name: 'BNB', icon: marketApi.getCryptoIcon('BNB') },
  XRP: { name: 'XRP', icon: marketApi.getCryptoIcon('XRP') },
  DOGE: { name: 'Dogecoin', icon: marketApi.getCryptoIcon('DOGE') },
  MATIC: { name: 'Polygon', icon: marketApi.getCryptoIcon('MATIC') },
  DOT: { name: 'Polkadot', icon: marketApi.getCryptoIcon('DOT') },
  AVAX: { name: 'Avalanche', icon: marketApi.getCryptoIcon('AVAX') },
  SHIB: { name: 'Shiba Inu', icon: marketApi.getCryptoIcon('SHIB') },
  ATOM: { name: 'Cosmos', icon: marketApi.getCryptoIcon('ATOM') },
  LTC: { name: 'Litecoin', icon: marketApi.getCryptoIcon('LTC') },
};

const resolveTokenMeta = (symbol: string) => {
  const upper = symbol.toUpperCase();
  if (curatedTokenMeta[upper]) return curatedTokenMeta[upper];
  return {
    name: upper,
    icon: marketApi.getCryptoIcon(upper),
  };
};

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

const usdPeggedQuotes = ['USDT', 'USDC', 'BUSD', 'TUSD', 'USDP', 'DAI'];
const stableQuotes = [...usdPeggedQuotes, 'USD'];

const splitSymbol = (symbol: string) => {
  const upper = symbol.toUpperCase();
  const match = quoteSuffixes.find(suffix => upper.endsWith(suffix));
  if (!match) return { base: upper, quote: '' };
  return {
    base: upper.slice(0, -match.length) || upper,
    quote: match,
  };
};

type QuoteFilter = 'ALL' | 'USDT' | 'BTC' | 'STABLE';
type ChangeFilter = 'ALL' | 'GAINERS' | 'LOSERS';

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

export default function MarketScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 400;
  const statCardStyle = useMemo(
    () => (isCompact ? StyleSheet.flatten([styles.statCard, styles.statCardCompact]) : styles.statCard),
    [isCompact]
  );

  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [search, setSearch] = useState('');
  const [quoteFilter, setQuoteFilter] = useState<QuoteFilter>('ALL');
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarket = useCallback(async () => {
    setLoading(true);
    try {
      const response = await marketApi.getAllTickers();
      const data = (response?.data ?? response ?? []) as any[];
      const mapped = data
        .map(item => {
          const symbol = (item.symbol || item.Symbol || '').toString().toUpperCase();
          if (!symbol) return null;
          const { base, quote } = splitSymbol(symbol);
          const meta = resolveTokenMeta(base);
          const price = Number(item.lastPrice ?? item.LastPrice ?? item.price ?? 0);
          const change = Number(item.priceChangePercent ?? item.PriceChangePercent ?? 0);
          const volume = Number(item.volume ?? item.Volume ?? 0);
          const quoteVolume = Number(item.quoteVolume ?? item.QuoteVolume ?? 0);
          return {
            id: symbol,
            symbol: base,
            pair: quote ? `${base}/${quote}` : symbol,
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

        const currScore = curr.marketCap ?? 0;
        const existingScore = existing.marketCap ?? 0;
        if (currIsStable === existingIsStable && currScore > existingScore) {
          acc[curr.symbol] = curr;
        }
        return acc;
      }, {});

      const sorted = Object.values(aggregated).sort(
        (a, b) => (b.marketCap || 0) - (a.marketCap || 0)
      );

      setCryptos(sorted.slice(0, 50));
      setError(sorted.length ? null : 'Nenhum ativo disponível.');
    } catch (err) {
      console.warn('Failed to load market', err);
      setError('Não foi possível carregar o mercado agora.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMarket();
  }, [fetchMarket]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchMarket().finally(() => setRefreshing(false));
  }, [fetchMarket]);

  const filteredCryptos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cryptos.filter(crypto => {
      if (
        q &&
        !(
          crypto.symbol.toLowerCase().includes(q) ||
          crypto.name.toLowerCase().includes(q) ||
          crypto.pair.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      if (quoteFilter === 'STABLE') {
        if (!stableQuotes.includes(crypto.quoteSymbol)) return false;
      } else if (quoteFilter !== 'ALL') {
        if (crypto.quoteSymbol !== quoteFilter) return false;
      }
      if (changeFilter === 'GAINERS' && crypto.change24h <= 0) return false;
      if (changeFilter === 'LOSERS' && crypto.change24h >= 0) return false;
      return true;
    });
  }, [cryptos, search, quoteFilter, changeFilter]);

  const topMovers = useMemo(() => {
    const gainers = [...cryptos]
      .filter(c => c.change24h > 0)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 3);
    const losers = [...cryptos]
      .filter(c => c.change24h < 0)
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 3);
    return { gainers, losers };
  }, [cryptos]);

  const marketStats = useMemo(() => {
    if (!cryptos.length) return null;
    const totalCap = cryptos.reduce((sum, c) => sum + (c.marketCap || 0), 0);
    const volume = cryptos.reduce((sum, c) => sum + (c.volume24h || 0), 0);
    const avgChange = cryptos.reduce((sum, c) => sum + (c.change24h || 0), 0) / cryptos.length;
    return {
      totalCap,
      volume,
      avgChange,
    };
  }, [cryptos]);

  const renderStat = (label: string, value: string, extra?: string) => (
    <GlassContainer style={statCardStyle}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {extra && <Text style={styles.statExtra}>{extra}</Text>}
    </GlassContainer>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000ff', '#222222ff', '#363636ff']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#eab308" />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Mercado</Text>
              <Text style={styles.subtitle}>Monitoramento em tempo real</Text>
            </View>
            <View style={styles.badgeLive}>
              <View style={styles.liveDot} />
              <Text style={styles.badgeText}>AO VIVO</Text>
            </View>
          </View>

          <GlassContainer style={styles.searchCard}>
            <View style={styles.searchRow}>
              <Search color="#94a3b8" size={18} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome, símbolo ou par"
                placeholderTextColor="#64748b"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.filterRow}>
              {quoteOptions.map(option => {
                const active = quoteFilter === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setQuoteFilter(option.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.filterChipText, active && styles.filterChipTextActive]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.filterRow}>
              {changeOptions.map(option => {
                const active = changeFilter === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setChangeFilter(option.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.filterChipText, active && styles.filterChipTextActive]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassContainer>

          {marketStats && (
            <View style={StyleSheet.compose(styles.statsGrid, isCompact ? styles.statsGridCompact : null)}>
              {renderStat(
                'Cap. Total',
                `$${(marketStats.totalCap / 1e9).toFixed(1)}B`,
                'Somatório das top 50'
              )}
              {renderStat('Volume 24h', `$${(marketStats.volume / 1e9).toFixed(1)}B`)}
              {renderStat(
                'Média 24h',
                `${marketStats.avgChange >= 0 ? '+' : ''}${marketStats.avgChange.toFixed(2)}%`
              )}
            </View>
          )}

          {!!topMovers.gainers.length && (
            <View style={styles.moversCard}>
              <Text style={styles.sectionTitle}>Destaques do dia</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[...topMovers.gainers, ...topMovers.losers].map(mover => {
                  const positive = mover.change24h >= 0;
                  return (
                    <TouchableOpacity
                      key={mover.id}
                      style={styles.moverChip}
                      onPress={() => router.push(`/coin/${mover.symbol}` as any)}
                    >
                      <View style={styles.moverHeader}>
                        {positive ? (
                          <TrendingUp size={16} color="#22c55e" />
                        ) : (
                          <TrendingDown size={16} color="#ef4444" />
                        )}
                        <Text style={styles.moverSymbol}>{mover.pair}</Text>
                      </View>
                      <Text
                        style={[styles.moverChange, positive ? styles.positive : styles.negative]}
                      >
                        {positive ? '+' : ''}
                        {mover.change24h.toFixed(2)}%
                      </Text>
                      <Text style={styles.moverPrice}>
                        ${mover.price.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.marketListHeader}>
            <Text style={styles.sectionTitle}>Lista completa</Text>
            <Text style={styles.sectionSubtitle}>{filteredCryptos.length} ativos</Text>
          </View>

          {loading && !cryptos.length && (
            <View style={styles.placeholder}>
              <ActivityIndicator color="#eab308" />
              <Text style={styles.placeholderText}>Sincronizando com a corretora...</Text>
            </View>
          )}

          {!loading && error && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void fetchMarket()}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && filteredCryptos.length === 0 && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Nenhum ativo corresponde à busca ou filtros.
              </Text>
            </View>
          )}

          {filteredCryptos.map((crypto, index) => (
            <CryptoCard
              key={`${crypto.id}-${crypto.quoteSymbol}`}
              crypto={crypto}
              index={index}
              onPress={() => router.push(`/coin/${crypto.symbol}` as any)}
            />
          ))}

          <View style={{ height: 120 }} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 0,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248,113,113,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f87171',
    marginRight: 6,
  },
  badgeText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
  },
  searchCard: {
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
    paddingBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
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
    backgroundColor: 'rgba(234,179,8,0.12)',
    borderColor: '#eab308',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#facc15',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsGridCompact: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
  },
  statCardCompact: {
    width: '100%',
    minWidth: '100%',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  statExtra: {
    color: '#cbd5f5',
    fontSize: 12,
    marginTop: 4,
  },
  moversCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'transparent',
    gap: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  moverChip: {
    width: 160,
    marginRight: 12,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.08)',
  },
  moverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moverSymbol: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  moverChange: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  moverPrice: {
    color: '#94a3b8',
    marginTop: 6,
  },
  positive: {
    color: '#22c55e',
  },
  negative: {
    color: '#ef4444',
  },
  marketListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
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
    borderColor: 'rgba(234,179,8,0.4)',
  },
  retryText: {
    color: '#eab308',
    fontWeight: '600',
  },
});
