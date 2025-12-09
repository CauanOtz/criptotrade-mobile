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
  StatusBar
} from 'react-native';
import { CryptoIcon } from '@/components/common/CryptoIcon';
import { Search, Star } from 'lucide-react-native';
import { Crypto } from '@/types/crypto';
import { marketApi } from '@/lib/apiClient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const quoteSuffixes = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'BRL', 'USD'];
const stableQuotes = ['USDT', 'USDC', 'BUSD', 'USD'];

const quoteOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'USDT', value: 'USDT' },
  { label: 'BTC', value: 'BTC' },
  { label: 'Stable', value: 'STABLE' },
];

// Extract base symbol and quote from ticker symbol
const parseSymbol = (symbol: string) => {
  for (const quote of quoteSuffixes) {
    if (symbol.endsWith(quote)) {
      return {
        base: symbol.slice(0, -quote.length),
        quote: quote,
      };
    }
  }
  return { base: symbol, quote: '' };
};

export default function MarketScreen() {
  const [tickers, setTickers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [quoteFilter, setQuoteFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from storage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('market_favorites');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Fetch tickers from API
  const fetchMarket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marketApi.getAllTickers();
      setTickers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tickers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMarket();
    setRefreshing(false);
  }, [fetchMarket]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (symbol: string) => {
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(f => f !== symbol)
      : [...favorites, symbol];
    
    setFavorites(newFavorites);
    try {
      await AsyncStorage.setItem('market_favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites]);

  // Process and filter tickers
  const processedMarketData = useMemo(() => {
    return tickers.map((ticker: any) => {
      const { base, quote } = parseSymbol(ticker.symbol || '');
      return {
        id: base,
        name: base,
        symbol: ticker.symbol || '',
        quote: quote,
        price: parseFloat(ticker.lastPrice || '0'),
        change: parseFloat(ticker.priceChangePercent || '0'),
        volume: parseFloat(ticker.volume || '0'),
        marketCap: parseFloat(ticker.quoteVolume || '0'),
      };
    });
  }, [tickers]);

  // Filter by search, quote, and favorites
  const filteredData = useMemo(() => {
    let filtered = processedMarketData;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(coin => 
        coin.name.toLowerCase().includes(searchLower) ||
        coin.symbol.toLowerCase().includes(searchLower)
      );
    }

    // Quote filter
    if (quoteFilter !== 'ALL') {
      if (quoteFilter === 'STABLE') {
        filtered = filtered.filter(coin => stableQuotes.includes(coin.quote));
      } else {
        filtered = filtered.filter(coin => coin.quote === quoteFilter);
      }
    }

    // Sort by market cap desc
    return filtered.sort((a, b) => b.marketCap - a.marketCap);
  }, [processedMarketData, search, quoteFilter]);

  // Separate favorites and regular coins
  const favoritesData = useMemo(() => 
    filteredData.filter(coin => favorites.includes(coin.symbol))
  , [filteredData, favorites]);

  const regularData = useMemo(() => 
    filteredData.filter(coin => !favorites.includes(coin.symbol))
  , [filteredData, favorites]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F7931A"
            colors={['#F7931A']}
          />
        }
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

        {/* Card de Busca Claro */}
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Search color="#9CA3AF" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome, símbolo ou par"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="characters"
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {quoteOptions.map(option => {
              const active = quoteFilter === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setQuoteFilter(option.value)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator color="#F7931A" size="large" style={{marginTop: 40}} />
        ) : (
          <>
            {favoritesData.length > 0 && (
              <>
                <View style={styles.marketListHeader}>
                  <Text style={styles.sectionTitle}>⭐ Favoritos</Text>
                </View>
                <View style={{gap: 12, marginBottom: 24}}>
                  {favoritesData.map((coin) => (
                    <TouchableOpacity
                      key={coin.symbol}
                      style={styles.cryptoItem}
                      onPress={() => router.push(`/coin/${coin.symbol}`)}
                    >
                      <View style={styles.cryptoLeft}>
                        <CryptoIcon symbol={coin.id} size={40} />
                        <View>
                          <Text style={styles.cryptoSymbol}>{coin.symbol}</Text>
                          <Text style={styles.cryptoName}>Vol: ${(coin.volume / 1000000).toFixed(1)}M</Text>
                        </View>
                      </View>
                      <View style={styles.cryptoRight}>
                        <Text style={styles.cryptoPrice}>
                          ${coin.price < 1 
                            ? coin.price.toFixed(6) 
                            : coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          }
                        </Text>
                        <Text style={{color: coin.change >= 0 ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: '600'}}>
                          {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleFavorite(coin.symbol);
                        }}
                        style={styles.favoriteButton}
                      >
                        <Star 
                          size={20} 
                          color="#F7931A" 
                          fill={favorites.includes(coin.symbol) ? "#F7931A" : "transparent"}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.marketListHeader}>
              <Text style={styles.sectionTitle}>Lista completa ({regularData.length})</Text>
            </View>
            <View style={{gap: 12}}>
              {regularData.slice(0, 50).map((coin) => (
                <TouchableOpacity
                  key={coin.symbol}
                  style={styles.cryptoItem}
                  onPress={() => router.push(`/coin/${coin.symbol}`)}
                >
                  <View style={styles.cryptoLeft}>
                    <CryptoIcon symbol={coin.id} size={40} />
                    <View>
                      <Text style={styles.cryptoSymbol}>{coin.symbol}</Text>
                      <Text style={styles.cryptoName}>Vol: ${(coin.volume / 1000000).toFixed(1)}M</Text>
                    </View>
                  </View>
                  <View style={styles.cryptoRight}>
                    <Text style={styles.cryptoPrice}>
                      ${coin.price < 1 
                        ? coin.price.toFixed(6) 
                        : coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      }
                    </Text>
                    <Text style={{color: coin.change >= 0 ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: '600'}}>
                      {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(coin.symbol);
                    }}
                    style={styles.favoriteButton}
                  >
                    <Star 
                      size={20} 
                      color="#D1D5DB" 
                      fill="transparent"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 2,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  badgeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#111827',
    fontSize: 15,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F7931A',
  },
  filterChipText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#F7931A',
  },
  marketListHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cryptoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cryptoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cryptoName: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  cryptoRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  }
});