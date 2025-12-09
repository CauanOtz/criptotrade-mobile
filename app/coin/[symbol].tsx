import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { CryptoIcon } from '@/components/common/CryptoIcon';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';
import { marketApi, wallet2Api, transactionApi, currencyApi } from '@/lib/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Time periods for chart
const TIME_PERIODS = [
  { label: '1H', value: '1H', interval: '1m', limit: 60 },
  { label: '24H', value: '24H', interval: '15m', limit: 96 },
  { label: '1W', value: '1W', interval: '1h', limit: 168 },
  { label: '1M', value: '1M', interval: '4h', limit: 180 },
  { label: '1Y', value: '1Y', interval: '1d', limit: 365 },
];

export default function BuyCoinScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const [ticker, setTicker] = useState<any>(null);
  const [klines, setKlines] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24H');
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  
  // Buy form states
  const [buyMode, setBuyMode] = useState<'qty' | 'usd'>('qty');
  const [amount, setAmount] = useState('');
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [usdBalance, setUsdBalance] = useState(0);

  // Helper to parse user input safely (accepts comma or dot decimals)
  const parseAmount = (v: string) => {
    if (!v && v !== '0') return 0;
    try {
      const normalized = (v + '').trim().replace(',', '.');
      const n = parseFloat(normalized);
      return Number.isNaN(n) ? 0 : n;
    } catch (e) {
      return 0;
    }
  };

  const parsedAmountUI = useMemo(() => parseAmount(amount), [amount]);
  const baseSymbol = useMemo(
    () => (symbol || '').replace('USDT', '').replace('USDC', '').replace('BUSD', '').toUpperCase(),
    [symbol]
  );

  const currentPrice = ticker ? parseFloat(ticker.lastPrice || '0') : 0;
  const priceChange = ticker ? parseFloat(ticker.priceChangePercent || '0') : 0;
  const isUp = priceChange >= 0;

  // Fetch ticker data
  const fetchTicker = useCallback(async () => {
    if (!symbol) return;
    try {
      const response = await marketApi.getTickerBySymbol(symbol);
      setTicker(response.data);
    } catch (error) {
      console.error('Failed to fetch ticker:', error);
    }
  }, [symbol]);

  // Fetch klines for chart
  const fetchKlines = useCallback(async () => {
    if (!symbol) return;
    
    const period = TIME_PERIODS.find(p => p.value === timeRange);
    if (!period) return;

    try {
      setIsChartLoading(true);
      const response = await marketApi.getKlines(symbol, period.interval, period.limit);
      // Handle both array format from Binance API
      const rawData = response.data || [];
      const klinesArray = Array.isArray(rawData) ? rawData : [];
      setKlines(klinesArray);
      console.log('Klines loaded:', klinesArray.length, 'candles');
    } catch (error) {
      console.error('Failed to fetch klines:', error);
      setKlines([]);
    } finally {
      setIsChartLoading(false);
    }
  }, [symbol, timeRange]);

  // Load user's USD balance using wallet2Api like BuyCoin.jsx
  const loadBalance = useCallback(async () => {
    try {
      // Prefer fetching balances (same approach as wallet.tsx)
      const balancesRes = await wallet2Api.getBalances();
      const balances = Array.isArray(balancesRes?.data) ? balancesRes.data : [];

      const mapped = balances.map((b: any) => {
        const amountVal = Number(b.amount ?? b.Amount ?? 0) || 0;
        const currentPriceVal = Number(b.currentPrice ?? b.CurrentPrice ?? b.price ?? 0) || 0;
        const value = amountVal * currentPriceVal;
        return {
          symbol: (b.symbol ?? b.Symbol ?? 'UNKNOWN').toUpperCase(),
          value,
        };
      });

      const usdVal = mapped.reduce((acc: number, a: any) => {
        const sym = (a.symbol || '').toUpperCase();
        if (sym === 'USD') return acc + (Number(a.value ?? 0) || 0);
        return acc;
      }, 0);

      if (usdVal > 0) {
        setUsdBalance(usdVal);
        console.log('USD Balance loaded from balances api:', usdVal);
        return;
      }

      // Fallback to summary if balances didn't contain USD
      const summaryRes = await wallet2Api.getSummary();
      const summaryBalances = summaryRes.data?.balances || [];
      const usdBalanceData = summaryBalances.find((b: any) => (b.symbol || b.Symbol || '').toUpperCase() === 'USD');
      if (usdBalanceData) {
        const balance = parseFloat(usdBalanceData.balance || usdBalanceData.amount || '0');
        setUsdBalance(balance);
        console.log('USD Balance loaded from summary fallback:', balance);
      } else {
        console.log('No USD balance found in balances or summary');
        setUsdBalance(0);
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
      setUsdBalance(0);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTicker(), fetchKlines(), loadBalance()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTicker, fetchKlines, loadBalance]);

  useEffect(() => {
    fetchKlines();
  }, [fetchKlines]);

  // Calculate chart data for visualization
  const chartData = useMemo(() => {
    if (!klines.length) {
      console.log('No klines data available');
      return [];
    }
    
    try {
      // Binance klines format: [openTime, open, high, low, close, volume, closeTime, ...]
      const prices = klines.map((k: any) => {
        if (Array.isArray(k)) {
          return parseFloat(k[4] || '0'); // close price is index 4
        }
        return parseFloat(k.close || k.closePrice || '0');
      }).filter(p => p > 0);
      
      if (prices.length === 0) return [];
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const range = maxPrice - minPrice || 1;

      return klines.slice(-50).map((k: any) => {
        let price = 0;
        if (Array.isArray(k)) {
          price = parseFloat(k[4] || '0'); // close price
        } else {
          price = parseFloat(k.close || k.closePrice || '0');
        }
        return {
          price,
          height: ((price - minPrice) / range) * 100,
        };
      });
    } catch (error) {
      console.error('Error calculating chart data:', error);
      return [];
    }
  }, [klines]);

  const handleBuy = async () => {
    const parsedAmount = parseAmount(amount);
    console.log('handleBuy clicked', { amount, parsedAmount, buyMode, usdBalance, currentPrice });
    if (parsedAmount <= 0) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    try {
      setLoadingBuy(true);

      let fiatToSpend = 0;
      if (buyMode === 'qty') {
        if (!currentPrice || currentPrice <= 0) {
          Alert.alert('Erro', 'Preço inválido, tente novamente mais tarde.');
          return;
        }
        const qty = parsedAmount;
        fiatToSpend = qty * currentPrice;
      } else {
        fiatToSpend = parsedAmount;
      }

      // Check balance
      console.log('fiatToSpend, usdBalance', { fiatToSpend, usdBalance });
      if (fiatToSpend > usdBalance) {
        Alert.alert('Saldo Insuficiente', `Você precisa de $${fiatToSpend.toFixed(2)} mas tem apenas $${usdBalance.toFixed(2)}`);
        return;
      }

      const currenciesRes = await currencyApi.getAllCurrencies();
      const currencies = Array.isArray(currenciesRes.data) ? currenciesRes.data : [];
      const currency = currencies.find((c: any) => 
        (c.symbol || c.Symbol || '').toUpperCase() === baseSymbol.toUpperCase()
      );

      if (!currency) {
        Alert.alert('Erro', 'Moeda não encontrada no catálogo');
        return;
      }

      const currencyId = currency.idCurrency ?? currency.IdCurrency ?? currency.id ?? currency.Id;

      const payload = {
        IdCurrency: currencyId,
        FiatAmount: fiatToSpend,
        CreateNewLot: true
      };

      console.log('Calling transactionApi.buy with payload', payload);
      const response = await transactionApi.buy(payload);
      const cryptoQty = fiatToSpend / currentPrice;
      const usdSpent = response?.data?.usdSpent || fiatToSpend;
      const priceUsed = response?.data?.priceUsd || currentPrice;

      Alert.alert(
        'Compra Realizada!',
        `Você comprou ${cryptoQty.toFixed(8)} ${baseSymbol} por $${usdSpent.toFixed(2)} @ $${priceUsed.toFixed(2)}`,
        [
          { text: 'Ver Carteira', onPress: () => router.push('/(tabs)/wallet') },
          { text: 'OK', style: 'cancel' },
        ]
      );

      setAmount('');
      await loadBalance();
    } catch (error: any) {
      console.error('Buy error:', error);
      const respData = error?.response?.data;
      let msg = 'Falha ao processar compra';
      if (typeof respData === 'string') {
        msg = respData;
      } else if (respData?.message) {
        msg = respData.message;
      } else if (respData?.error) {
        msg = respData.error;
      }
      Alert.alert('Erro na Compra', msg);
    } finally {
      setLoadingBuy(false);
    }
  };

  const totalValue = useMemo(() => {
    const amountNum = parseAmount(amount) || 0;
    if (!amountNum || !currentPrice) return 0;
    if (buyMode === 'qty') return amountNum * currentPrice;
    return amountNum;
  }, [amount, currentPrice, buyMode]);

  const cryptoAmount = useMemo(() => {
    const amountNum = parseAmount(amount) || 0;
    if (!amountNum || !currentPrice) return 0;
    if (buyMode === 'usd') return amountNum / currentPrice;
    return amountNum;
  }, [amount, currentPrice, buyMode]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F7931A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comprar {baseSymbol}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Coin Info Card */}
        <View style={styles.coinInfoCard}>
          <View style={styles.coinHeader}>
            <CryptoIcon symbol={baseSymbol} size={48} />
            <View style={styles.coinDetails}>
              <Text style={styles.coinName}>{baseSymbol}/USDT</Text>
              <Text style={styles.coinPrice}>${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</Text>
            </View>
          </View>
          <View style={[styles.changeBadge, isUp ? styles.changeBadgeUp : styles.changeBadgeDown]}>
            {isUp ? <TrendingUp size={16} color="#10B981" /> : <TrendingDown size={16} color="#EF4444" />}
            <Text style={[styles.changeText, isUp ? styles.changeTextUp : styles.changeTextDown]}>
              {isUp ? '+' : ''}{priceChange.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangeScroll}>
            {TIME_PERIODS.map(period => {
              const active = timeRange === period.value;
              return (
                <TouchableOpacity
                  key={period.value}
                  style={[styles.timeRangeButton, active && styles.timeRangeButtonActive]}
                  onPress={() => setTimeRange(period.value)}
                >
                  <Text style={[styles.timeRangeText, active && styles.timeRangeTextActive]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          {isChartLoading ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="large" color="#F7931A" />
            </View>
          ) : (
            <View style={styles.chart}>
              <View style={styles.chartBars}>
                {chartData.map((point, index) => (
                  <View
                    key={index}
                    style={[
                      styles.chartBar,
                      {
                        height: `${point.height}%`,
                        backgroundColor: isUp ? '#10B981' : '#EF4444',
                        opacity: 0.3 + (index / chartData.length) * 0.7,
                      }
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Buy Form */}
        <View style={styles.buyCard}>
          <Text style={styles.buyTitle}>Realizar Compra</Text>
          
          {/* Balance Display */}
          <View style={styles.balanceDisplay}>
            <DollarSign size={20} color="#6B7280" />
            <Text style={styles.balanceText}>Saldo disponível: ${usdBalance.toFixed(2)}</Text>
          </View>

          {/* Buy Mode Toggle */}
          <View style={styles.buyModeToggle}>
            <TouchableOpacity
              style={[styles.buyModeButton, buyMode === 'qty' && styles.buyModeButtonActive]}
              onPress={() => setBuyMode('qty')}
            >
              <Text style={[styles.buyModeText, buyMode === 'qty' && styles.buyModeTextActive]}>
                Por Quantidade
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buyModeButton, buyMode === 'usd' && styles.buyModeButtonActive]}
              onPress={() => setBuyMode('usd')}
            >
              <Text style={[styles.buyModeText, buyMode === 'usd' && styles.buyModeTextActive]}>
                Por Valor (USD)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {buyMode === 'qty' ? `Quantidade de ${baseSymbol}` : 'Valor em USD'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={buyMode === 'qty' ? '0.00000000' : '0.00'}
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Summary */}
          {parsedAmountUI > 0 && (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantidade:</Text>
                <Text style={styles.summaryValue}>{cryptoAmount.toFixed(8)} {baseSymbol}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Preço unitário:</Text>
                <Text style={styles.summaryValue}>${currentPrice.toFixed(6)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total em USD:</Text>
                <Text style={styles.summaryTotalValue}>${totalValue.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* Buy Button */}
          <TouchableOpacity
            style={[styles.buyButton, loadingBuy && styles.buyButtonDisabled]}
            onPress={handleBuy}
            disabled={loadingBuy || parsedAmountUI <= 0}
          >
            {loadingBuy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buyButtonText}>Comprar {baseSymbol}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  coinInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  coinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coinDetails: {
    marginLeft: 16,
    flex: 1,
  },
  coinName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  coinPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F7931A',
    marginTop: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  changeBadgeUp: {
    backgroundColor: '#D1FAE5',
  },
  changeBadgeDown: {
    backgroundColor: '#FEE2E2',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeTextUp: {
    color: '#10B981',
  },
  changeTextDown: {
    color: '#EF4444',
  },
  timeRangeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  timeRangeScroll: {
    flexGrow: 0,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#F7931A',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#F7931A',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    height: 200,
  },
  chartLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    flex: 1,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  chartBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 2,
  },
  buyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  buyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  balanceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  buyModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  buyModeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  buyModeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buyModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  buyModeTextActive: {
    color: '#F7931A',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  summary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7931A',
  },
  buyButton: {
    backgroundColor: '#F7931A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
