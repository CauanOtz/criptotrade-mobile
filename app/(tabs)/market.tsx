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
// Remove LinearGradient do dark mode
import { CryptoCard } from '@/components/CryptoCard'; // Certifique-se de que CryptoCard também suporte light mode ou crie uma versão local
import { Search } from 'lucide-react-native';
import { Crypto } from '@/types/crypto';
import { marketApi } from '@/lib/apiClient';

// ... (Manter constantes quoteSuffixes, usdPeggedQuotes, etc.) ...
const quoteSuffixes = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'BRL', 'USD'];
const stableQuotes = ['USDT', 'USDC', 'BUSD', 'USD'];

const quoteOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'USDT', value: 'USDT' },
  { label: 'BTC', value: 'BTC' },
  { label: 'Stable', value: 'STABLE' },
];

export default function MarketScreen() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [search, setSearch] = useState('');
  const [quoteFilter, setQuoteFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ... (Manter lógica de fetchMarket, onRefresh, filteredCryptos) ...
  // Simplificando a lógica para focar no layout:
  
  useEffect(() => {
    // Simulação de carga
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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

        <View style={styles.marketListHeader}>
          <Text style={styles.sectionTitle}>Lista completa</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#F7931A" size="large" style={{marginTop: 40}} />
        ) : (
          <View style={{gap: 12}}>
             {/* Exemplo de card de item de lista manual se CryptoCard for dark */}
             {[1,2,3,4,5].map(i => (
                <View key={i} style={styles.cryptoItem}>
                   <View style={styles.cryptoLeft}>
                      <View style={styles.cryptoIcon} />
                      <View>
                         <Text style={styles.cryptoSymbol}>BTC/USDT</Text>
                         <Text style={styles.cryptoName}>Bitcoin</Text>
                      </View>
                   </View>
                   <View style={styles.cryptoRight}>
                      <Text style={styles.cryptoPrice}>$92,430.00</Text>
                      <Text style={{color: '#10B981', fontSize: 12}}>+2.4%</Text>
                   </View>
                </View>
             ))}
          </View>
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
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cryptoName: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  cryptoRight: {
    alignItems: 'flex-end',
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  }
});