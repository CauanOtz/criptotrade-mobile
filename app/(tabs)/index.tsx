import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Activity,
  ArrowUpRight,
  BarChart2,
  ChevronDown,
  Clock,
  Layout,
  PieChart,
  TrendingUp,
  Zap
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { marketApi } from '@/lib/apiClient';
import { CryptoIcon } from '@/components/common/CryptoIcon';

// Componentes
import { CryptoChart } from '@/components/dashboard/CryptoChart';
import { CustomizationModal } from '@/components/dashboard/CustomizationModal';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TopMovers } from '@/components/dashboard/TopMovers';

const MENU_TABS = [
  { id: 'chart', icon: BarChart2, label: 'Gráfico' },
  { id: 'markets', icon: Activity, label: 'Mercados' },
  { id: 'transactions', icon: PieChart, label: 'Transações' },
  { id: 'news', icon: Clock, label: 'Notícias' },
];

const TIME_PERIODS = [
  { value: '1H', label: '1H', interval: '1m', limit: 60 },
  { value: '24H', label: '24H', interval: '15m', limit: 96 },
  { value: '1W', label: '1S', interval: '1h', limit: 168 },
  { value: '1M', label: '1M', interval: '4h', limit: 180 },
  { value: '1Y', label: '1A', interval: '1d', limit: 365 },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const userName = user?.name || 'Usuário';
  const [activeTab, setActiveTab] = useState('chart');
  const [refreshing, setRefreshing] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  // Layout padrão
  const defaultLayout = {
    topSection: ['welcome', 'trendingCoins', 'tradingTips'],
    middleSection: ['portfolioValue', 'dailyProfit', '24hChange'],
    mainContent: ['chart', 'marketOverview', 'topGainers', 'topLosers']
  };

  const [userLayout, setUserLayout] = useState(defaultLayout);
  
  // Market data states
  const [tickers, setTickers] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState({
    id: 'BTCUSDT',
    name: 'BTC',
    color: '#F7931A',
    data: []
  });
  const [timeRange, setTimeRange] = useState('24H');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [isCoinSelectorOpen, setIsCoinSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tickersLoaded, setTickersLoaded] = useState(false);
  const chartCacheRef = useRef<Record<string, any>>({});

  // Fetch tickers data
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await marketApi.getAllTickers();
        setTickers(response.data);
        setTickersLoaded(true);
      } catch (error) {
        console.error('Erro ao buscar tickers:', error);
        setTickersLoaded(true);
      }
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Process crypto data
  const processedCryptoData = useMemo(() => {
    if (!tickers?.length) return [];

    return tickers
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .map(ticker => ({
        symbol: ticker.symbol,
        name: ticker.symbol.replace('USDT', ''),
        currentPrice: Number(ticker.lastPrice),
        priceChange: Number(ticker.priceChangePercent),
        volume: ticker.volume,
        highPrice: Number(ticker.highPrice),
        lowPrice: Number(ticker.lowPrice)
      }));
  }, [tickers]);

  // Get top movers (gainers and losers)
  const topMovers = useMemo(() => {
    if (!tickers?.length) return { gainers: [], losers: [] };

    const processed = tickers
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .map(ticker => ({
        symbol: ticker.symbol,
        coin: ticker.symbol.replace('USDT', ''),
        price: parseFloat(ticker.lastPrice),
        change: parseFloat(ticker.priceChangePercent),
        volume: ticker.volume
      }))
      .filter(t => !isNaN(t.change) && !isNaN(t.price) && t.price > 0);

    return {
      gainers: processed
        .filter(t => t.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, 5),
      losers: processed
        .filter(t => t.change < 0)
        .sort((a, b) => a.change - b.change)
        .slice(0, 5)
    };
  }, [tickers]);

  // Fetch chart data for selected coin
  const fetchCoinData = useCallback(async (symbol: string, showLoading = true) => {
    try {
      if (showLoading) setIsChartLoading(true);

      const period = TIME_PERIODS.find(p => p.value === timeRange) || TIME_PERIODS[1];
      const cacheKey = `${symbol}_${period.interval}_${period.limit}`;

      // Check cache first
      if (chartCacheRef.current[cacheKey]) {
        setChartData(chartCacheRef.current[cacheKey]);
        setIsChartLoading(false);
        return;
      }

      const klinesData = await marketApi.getKlines(symbol, period.interval, period.limit);
      
      const formattedData = klinesData.data.map((kline: any[]) => ({
        time: new Date(kline[0]).toLocaleString('pt-BR', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        price: Number(kline[4]), // close price
        volume: Number(kline[5]),
        high: Number(kline[2]),
        low: Number(kline[3]),
        open: Number(kline[1]),
        fullDate: new Date(kline[0]).toLocaleString('pt-BR')
      }));

      chartCacheRef.current[cacheKey] = formattedData;
      setChartData(formattedData);
    } catch (error) {
      console.error('Erro ao buscar dados da moeda:', error);
    } finally {
      setIsChartLoading(false);
    }
  }, [timeRange]);

  // Initialize with first coin
  useEffect(() => {
    if (processedCryptoData.length > 0 && !chartData.length) {
      const firstCoin = processedCryptoData[0];
      setSelectedCoin({
        id: firstCoin.symbol,
        name: firstCoin.name,
        color: '#F7931A',
        data: []
      });
      fetchCoinData(firstCoin.symbol);
    }
  }, [processedCryptoData, fetchCoinData, chartData.length]);

  // Update chart when time range changes
  useEffect(() => {
    if (selectedCoin?.id) {
      fetchCoinData(selectedCoin.id, false);
    }
  }, [timeRange, selectedCoin?.id, fetchCoinData]);

  // Carregar layout salvo
  useEffect(() => {
    loadLayout();
  }, []);

  const loadLayout = async () => {
    try {
      const saved = await AsyncStorage.getItem('userDashboardLayout');
      if (saved) {
        setUserLayout(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Erro ao carregar layout', e);
    }
  };

  const saveLayout = async () => {
    try {
      await AsyncStorage.setItem('userDashboardLayout', JSON.stringify(userLayout));
      setIsCustomizationOpen(false);
    } catch (e) {
      console.log('Erro ao salvar layout', e);
    }
  };

  const toggleComponent = (section: string, component: string) => {
    setUserLayout(prev => {
      const currentSection = prev[section as keyof typeof prev] || [];
      const newSection = currentSection.includes(component)
        ? currentSection.filter(c => c !== component)
        : [...currentSection, component];
      
      return { ...prev, [section]: newSection };
    });
  };

  const resetLayout = async () => {
    setUserLayout(defaultLayout);
    await AsyncStorage.removeItem('userDashboardLayout');
  };

  const isVisible = (section: string, component: string) => {
    return userLayout[section as keyof typeof userLayout]?.includes(component);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh tickers
      const response = await marketApi.getAllTickers();
      setTickers(response.data);
      
      // Refresh current coin data
      if (selectedCoin?.id) {
        await fetchCoinData(selectedCoin.id, false);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCoin?.id, fetchCoinData]);

  const handleCoinSelection = useCallback((coin: any) => {
    setSelectedCoin({
      id: coin.symbol,
      name: coin.name,
      color: coin.name === 'BTC' ? '#F7931A' : coin.name === 'ETH' ? '#627EEA' : '#F7931A',
      data: []
    });
    setIsCoinSelectorOpen(false);
    fetchCoinData(coin.symbol);
  }, [fetchCoinData]);

  const filteredCoins = useMemo(() => {
    if (!searchTerm) return processedCryptoData.slice(0, 20);
    return processedCryptoData.filter(coin =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20);
  }, [processedCryptoData, searchTerm]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const selectedTicker = tickers.find(t => t.symbol === selectedCoin.id);
    
    return [
      { 
        title: 'Preço Atual', 
        value: selectedTicker ? `R$ ${Number(selectedTicker.lastPrice).toLocaleString('pt-BR')}` : 'R$ 0,00',
        subValue: selectedTicker ? `${Number(selectedTicker.priceChangePercent).toFixed(2)}%` : '0%',
        icon: PieChart 
      },
      { 
        title: 'Volume 24h', 
        value: selectedTicker ? `R$ ${(Number(selectedTicker.volume) / 1000000).toFixed(2)}M` : 'R$ 0',
        subValue: 'Volume', 
        icon: Activity 
      },
      { 
        title: 'Variação 24h', 
        value: selectedTicker ? `${Number(selectedTicker.priceChangePercent) > 0 ? '+' : ''}${Number(selectedTicker.priceChangePercent).toFixed(2)}%` : '0%',
        subValue: selectedTicker ? `R$ ${Number(selectedTicker.priceChange).toLocaleString('pt-BR')}` : 'R$ 0',
        icon: TrendingUp 
      },
    ];
  }, [tickers, selectedCoin.id]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F7931A" />
        }
      >
        {/* 1. HEADER */}
        {isVisible('topSection', 'welcome') && (
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingTitle}>
                Olá, <Text style={styles.userName}>{userName}</Text>!
              </Text>
              <Text style={styles.greetingSubtitle}>Seja Bem-vindo!</Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={() => setIsCustomizationOpen(true)}
              >
                <Layout size={20} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.fastTradeBtn}>
                <Zap size={16} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.fastTradeText}>Negociar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 2. STATS CARDS */}
        <View style={styles.section}>
          <StatsCards stats={stats} />
        </View>

        {/* 4. TENDÊNCIAS & DICAS */}
        {(isVisible('topSection', 'trendingCoins') || isVisible('topSection', 'tradingTips')) && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.trendsContainer}
          >
            {/* Moedas em Tendência */}
            {isVisible('topSection', 'trendingCoins') && (
              <View style={styles.trendCard}>
                <View style={styles.cardHeader}>
                  <TrendingUp size={20} color="#F7931A" style={styles.icon} />
                  <Text style={styles.cardTitle}>Tendências</Text>
                </View>
                {tickersLoaded ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {topMovers.gainers.slice(0, 5).map(coin => (
                      <View key={coin.symbol} style={styles.trendItem}>
                        <View style={{ alignItems: 'center', marginBottom: 8 }}>
                          <CryptoIcon symbol={coin.coin} size={28} />
                        </View>
                        <Text style={styles.trendSymbol}>{coin.coin}</Text>
                        <View style={styles.trendChangeRow}>
                          <ArrowUpRight size={12} color="#10B981" />
                          <Text style={[styles.trendChange, { color: '#10B981' }]}>
                            {coin.change.toFixed(2)}%
                          </Text>
                        </View>
                        <Text style={styles.trendPrice}>
                          R$ {coin.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <ActivityIndicator size="small" color="#F7931A" style={{ marginVertical: 20 }} />
                )}
              </View>
            )}

            {/* Dicas */}
            {isVisible('topSection', 'tradingTips') && (
              <View style={[styles.trendCard, { marginTop: 12 }]}>
                 <View style={styles.cardHeader}>
                  <Zap size={20} color="#F7931A" style={styles.icon} />
                  <Text style={styles.cardTitle}>Dica do dia</Text>
                </View>
                <Text style={styles.tipText}>
                  "Diversifique sua carteira para reduzir riscos."
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* 5. NAVEGAÇÃO INTERNA */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MENU_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                >
                  <Icon size={18} color={isActive ? '#FFF' : '#6B7280'} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 6. CONTEÚDO PRINCIPAL */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          {activeTab === 'chart' && isVisible('mainContent', 'chart') && (
            <>
              {/* Coin Selector */}
              <TouchableOpacity 
                style={styles.coinSelectorCard}
                onPress={() => setIsCoinSelectorOpen(true)}
                activeOpacity={0.7}
              >
                <View style={styles.coinSelectorLeft}>
                  <CryptoIcon symbol={selectedCoin.name} size={40} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.coinSelectorName}>{selectedCoin.name}</Text>
                    <Text style={styles.coinSelectorSymbol}>{selectedCoin.id.replace('USDT', '')}/USDT</Text>
                  </View>
                </View>
                <View style={styles.coinSelectorRight}>
                  <Text style={styles.coinSelectorPrice}>
                    R$ {(tickers.find(t => t.symbol === selectedCoin.id)?.lastPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={[styles.coinSelectorChange, { color: (Number(tickers.find(t => t.symbol === selectedCoin.id)?.priceChangePercent) || 0) >= 0 ? '#10B981' : '#EF4444' }]}>
                    {(Number(tickers.find(t => t.symbol === selectedCoin.id)?.priceChangePercent) || 0) >= 0 ? '+' : ''}{(Number(tickers.find(t => t.symbol === selectedCoin.id)?.priceChangePercent) || 0).toFixed(2)}%
                  </Text>
                </View>
                <ChevronDown size={20} color="#6B7280" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              {/* Time Range Selector */}
              <View style={styles.timeRangeContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TIME_PERIODS.map(period => (
                    <TouchableOpacity
                      key={period.value}
                      style={[
                        styles.timeButton,
                        timeRange === period.value && styles.timeButtonActive
                      ]}
                      onPress={() => setTimeRange(period.value)}
                    >
                      <Text style={[
                        styles.timeButtonText,
                        timeRange === period.value && styles.timeButtonTextActive
                      ]}>
                        {period.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Chart */}
              <View style={styles.chartContainer}>
                <CryptoChart 
                  data={chartData}
                  isLoading={isChartLoading}
                  color={selectedCoin.color}
                  height={250}
                />
              </View>
            </>
          )}
          
          {activeTab === 'markets' && (
            <View style={styles.marketContainer}>
              <Text style={styles.marketTitle}>Visão Geral do Mercado</Text>
              {processedCryptoData.slice(0, 10).map((coin) => (
                <TouchableOpacity
                  key={coin.symbol}
                  style={styles.marketItem}
                  onPress={() => handleCoinSelection(coin)}
                >
                  <View style={styles.marketItemLeft}>
                    <CryptoIcon symbol={coin.name} size={36} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.marketCoinName}>{coin.name}</Text>
                      <Text style={styles.marketCoinPrice}>
                        R$ {coin.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.marketCoinChange,
                    { color: coin.priceChange >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {coin.priceChange >= 0 ? '+' : ''}{coin.priceChange.toFixed(2)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'chart' && isVisible('mainContent', 'topGainers') && tickersLoaded && (
            <View style={{ marginTop: 16 }}>
              <TopMovers data={topMovers.gainers} type="gainers" />
            </View>
          )}

          {activeTab === 'chart' && isVisible('mainContent', 'topLosers') && tickersLoaded && (
            <View style={{ marginTop: 16 }}>
              <TopMovers data={topMovers.losers} type="losers" />
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de Personalização */}
      <CustomizationModal 
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        userLayout={userLayout}
        onToggleComponent={toggleComponent}
        onReset={resetLayout}
        onSave={saveLayout}
      />

      {/* Coin Selector Modal */}
      <Modal
        visible={isCoinSelectorOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCoinSelectorOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Moeda</Text>
              <TouchableOpacity onPress={() => setIsCoinSelectorOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar moeda..."
              placeholderTextColor="#9CA3AF"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            <ScrollView style={styles.coinList}>
              {filteredCoins.map((coin) => (
                <TouchableOpacity
                  key={coin.symbol}
                  style={styles.coinItem}
                  onPress={() => handleCoinSelection(coin)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <CryptoIcon symbol={coin.name} size={36} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.coinItemName}>{coin.name}</Text>
                      <Text style={styles.coinItemSymbol}>{coin.symbol}</Text>
                    </View>
                  </View>
                  <View style={styles.coinItemRight}>
                    <Text style={styles.coinItemPrice}>
                      R$ {coin.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[
                      styles.coinItemChange,
                      { color: coin.priceChange >= 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {coin.priceChange >= 0 ? '+' : ''}{coin.priceChange.toFixed(2)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greetingTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },
  userName: {
    color: '#F7931A',
    fontWeight: 'bold',
  },
  greetingSubtitle: {
    fontSize: 22,
    color: '#111827',
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fastTradeBtn: {
    backgroundColor: '#F7931A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#F7931A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fastTradeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  trendsContainer: {
    marginBottom: 24,
  },
  trendCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  trendItem: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 100,
  },
  trendSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  trendChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  trendChange: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  trendPrice: {
    fontSize: 11,
    color: '#6B7280',
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  coinSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  coinSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coinSelectorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  coinSelectorSymbol: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  coinSelectorRight: {
    alignItems: 'flex-end',
  },
  coinSelectorPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  coinSelectorChange: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  timeRangeContainer: {
    marginBottom: 12,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  timeButtonActive: {
    backgroundColor: '#F7931A',
  },
  timeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeButtonTextActive: {
    color: '#FFFFFF',
  },
  marketContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  marketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  marketItemLeft: {
    flex: 1,
  },
  marketCoinName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  marketCoinPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  marketCoinChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coinList: {
    maxHeight: 400,
  },
  coinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  coinItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  coinItemSymbol: {
    fontSize: 12,
    color: '#6B7280',
  },
  coinItemRight: {
    alignItems: 'flex-end',
  },
  coinItemPrice: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  coinItemChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E5E7EB',
  },
  tabButtonActive: {
    backgroundColor: '#F7931A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    height: 300,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
});