import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Eye, EyeOff, RefreshCw, TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react-native';
import { CryptoIcon } from '@/components/common/CryptoIcon';
import { wallet2Api, transactionApi } from '@/lib/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SellAssetModal from '@/components/wallet/SellAssetModal';

export default function WalletScreen() {
  const [hideBalances, setHideBalances] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    bestPerformer: { asset: '-', change: 0 },
    totalGain: 0,
    totalGainPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usdBalance, setUsdBalance] = useState(0);
  
  // Sell modal states
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState('');
  const [sellAsset, setSellAsset] = useState<any>(null);
  const [sellAmount, setSellAmount] = useState('');
  const [sellLots, setSellLots] = useState<any>(null);

  const normalizeLotsData = (d: any, asset: any) => {
    if (!d) return null;
    const rawLots = Array.isArray(d.lots) ? d.lots : (Array.isArray(d.Lots) ? d.Lots : []);

    const parseDateToMs = (v: any) => {
      if (v === null || v === undefined || v === '') return null;
      if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
      const s = (v + '').trim();
      const m = s.match(/\/(?:Date)?\((\d+)(?:[+-]\d+)?\)\//i);
      if (m) {
        const n = Number(m[1]);
        return n < 1e12 ? n * 1000 : n;
      }
      if (/^\d+$/.test(s)) {
        const n = Number(s);
        return n < 1e12 ? n * 1000 : n;
      }
      const parsed = Date.parse(s);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const lots = rawLots.map((l: any) => {
      const amountBought = Number(l.amountBought ?? l.amount ?? l.originalAmount ?? l.Amount ?? 0) || 0;
      const amountRemaining = Number(l.amountRemaining ?? l.remainingAmount ?? l.remaining ?? l.RemainingAmount ?? amountBought) || 0;
      const unitPriceUsd = Number(l.unitPriceUsd ?? l.unit_price_usd ?? l.avgPrice ?? l.avgPriceUsd ?? l.unitPrice ?? 0) || 0;
      const totalCostUsd = Number(l.totalCostUsd ?? l.totalCost ?? unitPriceUsd * amountBought) || 0;
      const unrealizedGainUsd = Number(l.unrealizedGainUsd ?? l.unrealizedGain ?? l.unrealized ?? 0) || 0;
      const realizedGainUsd = Number(l.realizedGainUsd ?? l.realizedGain ?? l.realized ?? 0) || 0;
      const rawDate = l.acquiredAt ?? l.createdAt ?? l.CreatedAt ?? l.date ?? l.AcquiredAt ?? null;
      const acquiredAtMs = parseDateToMs(rawDate);

      return {
        lotTransactionId: l.lotTransactionId ?? l.lotId ?? l.id ?? l.idWalletPositionLot ?? null,
        acquiredAt: acquiredAtMs,
        amountBought,
        amountRemaining,
        unitPriceUsd,
        totalCostUsd,
        unrealizedGainUsd,
        realizedGainUsd
      };
    });
    const filteredLots = lots.filter((l: any) => (Number(l.amountRemaining) || 0) > 0);

    const totalAmount = Number(d.totalAmount ?? d.total ?? d.total_amount ?? filteredLots.reduce((s: number, L: any) => s + (L.amountRemaining || 0), 0)) || 0;
    const currentValueUsd = Number(d.currentValueUsd ?? d.currentValue ?? d.current_value_usd ?? 0) || 0;
    const totalUnrealizedGainUsd = Number(d.totalUnrealizedGainUsd ?? d.totalUnrealized ?? d.total_unrealized_gain_usd ?? filteredLots.reduce((s: number, L: any) => s + (L.unrealizedGainUsd || 0), 0)) || 0;
    const totalRealizedGainUsd = Number(d.totalRealizedGainUsd ?? d.totalRealized ?? d.total_realized_gain_usd ?? filteredLots.reduce((s: number, L: any) => s + (L.realizedGainUsd || 0), 0)) || 0;

    return {
      asset: d.asset ?? d.assetName ?? asset.name ?? asset.asset ?? asset.symbol ?? '',
      assetSymbol: (d.assetSymbol ?? d.asset_symbol ?? d.symbol ?? asset.symbol ?? '').toUpperCase(),
      lots: filteredLots,
      totalAmount,
      total: totalAmount,
      currentValueUsd,
      currentValue: currentValueUsd,
      totalUnrealizedGainUsd,
      totalRealizedGainUsd
    };
  };

  const fetchWallets = useCallback(async () => {
    try {
      const [summaryRes, balancesRes] = await Promise.all([
        wallet2Api.getSummary(),
        wallet2Api.getBalances()
      ]);

      const summary = summaryRes?.data ?? {};
      const balances = Array.isArray(balancesRes?.data) ? balancesRes.data : [];

      // Filter only crypto assets (not USD)
      const onlyUsd = balances.filter((b: any) => {
        const sym = ((b.symbol ?? b.Symbol ?? '') + '').toUpperCase();
        const amt = Number(b.amount ?? b.Amount ?? 0) || 0;
        return sym !== 'USD' && amt > 0;
      }).length === 0;

      // Process best performer
      let bestPerf = { asset: '-', change: 0 };
      const bp = summary.bestPerformer;
      if (bp) {
        if (typeof bp === 'string') {
          if ((bp + '').toUpperCase() !== 'USD') bestPerf = { asset: bp, change: 0 };
        } else if (bp.symbol) {
          if (((bp.symbol + '').toUpperCase()) !== 'USD') {
            bestPerf = { asset: bp.symbol, change: bp.value ?? bp.change ?? 0 };
          }
        }
      }

      // Calculate total cost and gain
      const totalValue = summary.totalValue ?? 0;
      const totalCost = summary.totalCost ?? 0;
      const totalGain = totalValue - totalCost;
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

      setPortfolioStats({
        totalValue,
        dayChange: summary.dayChange ?? 0,
        dayChangePercent: summary.dayChangePercent ?? 0,
        bestPerformer: bestPerf,
        totalGain,
        totalGainPercent,
      });

      // Map balances to portfolio data
      const mapped = balances.map((b: any, idx: number) => {
        const amount = Number(b.amount ?? b.Amount ?? 0);
        const currentPrice = Number(b.currentPrice ?? b.CurrentPrice ?? b.price ?? 0) || 0;
        const purchasePrice = Number(b.avgPrice ?? b.avgPurchasePrice ?? b.purchasePrice ?? 0) || 0;
        const value = amount * currentPrice;
        const totalCost = amount * purchasePrice;
        const gainLoss = value - totalCost;
        const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
        const change = Number(b.change ?? b.priceChangePercent ?? 0) || 0;
        
        return {
          id: b.currencyId ?? b.idCurrency ?? idx,
          symbol: (b.symbol ?? b.Symbol ?? 'UNKNOWN').toUpperCase(),
          name: b.name ?? b.Name ?? (b.symbol ?? b.Symbol ?? 'UNKNOWN'),
          asset: b.name ?? (b.symbol ?? b.Symbol ?? 'UNKNOWN'),
          amount,
          price: currentPrice,
          currentPrice,
          avgCost: purchasePrice,
          totalCost,
          value,
          gainLoss,
          gainLossPercent,
          change,
        };
      });

      setPortfolioData(mapped);

      // Calculate USD balance
      try {
        const usdVal = mapped.reduce((acc: number, a: any) => {
          const sym = (a.symbol || '').toUpperCase();
          if (sym === 'USD') {
            return acc + (Number(a.value ?? 0) || 0);
          }
          return acc;
        }, 0);
        setUsdBalance(usdVal);
      } catch (e) {
        setUsdBalance(0);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWallets();
    setRefreshing(false);
  }, [fetchWallets]);

  // Filter assets (exclude USD for display)
  const assets = useMemo(() => {
    return portfolioData
      .filter(a => a.symbol !== 'USD' && a.amount > 0)
      .sort((a, b) => b.value - a.value);
  }, [portfolioData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const openSellModal = (asset: any) => {
    setSellAsset(asset);
    setSellAmount('');
    setSellError('');
    setSellLots(null);
    setSellModalOpen(true);

    // Fetch lots for the asset
    (async () => {
      try {
        const sym = (asset?.symbol || asset?.asset || '') + '';
        const res = await wallet2Api.getAssetLots(sym);
        const d = res?.data ?? null;
        if (!d) return;
        const normalized = normalizeLotsData(d, asset);
        setSellLots(normalized);
      } catch (err) {
        console.error('Failed to load lots:', err);
      }
    })();
  };

  const closeSellModal = () => {
    setSellModalOpen(false);
    setSellAsset(null);
    setSellAmount('');
    setSellError('');
    setSellLots(null);
  };

  const handleConfirmSell = async (amountToSell: number, lotId?: string | null) => {
    if (!sellAsset || amountToSell <= 0) {
      setSellError('Quantidade inválida');
      return;
    }

    if (amountToSell > (sellAsset.amount ?? 0)) {
      setSellError('Quantidade maior que o disponível');
      return;
    }

    try {
      setSellLoading(true);
      setSellError('');

      const payload: any = {
        IdCurrency: sellAsset.id || sellAsset.Id || sellAsset.currencyId,
        CriptoAmount: amountToSell,
        Fee: 0,
      };

      // If selling from specific lot
      if (lotId) {
        payload.IdWalletPositionLot = lotId;
        payload.LotAmount = amountToSell;
      }

      const res = await transactionApi.sell(payload);

      if (res && (res.status === 200 || res.status === 204)) {
        const sellValue = amountToSell * sellAsset.currentPrice;
        
        Alert.alert(
          'Venda Realizada!',
          `Você vendeu ${amountToSell.toFixed(8)} ${sellAsset.symbol} por ${formatCurrency(sellValue)}`,
          [{ text: 'OK' }]
        );

        // Reload lots for the asset after sell
        const sym = (sellAsset?.symbol || sellAsset?.asset || '').toUpperCase();
        try {
          const lotsRes = await wallet2Api.getAssetLots(sellAsset.symbol);
          const normalized = normalizeLotsData(lotsRes?.data ?? null, sellAsset);
          if (normalized) {
            setSellLots(normalized);
          }
        } catch (err) {
          console.error('Failed to reload lots after sell', err);
        }

        closeSellModal();
        await fetchWallets();
      } else {
        const msg = res?.data?.message || 'Falha ao realizar venda';
        setSellError(msg);
      }
    } catch (error: any) {
      console.error('Sell error:', error);
      const msg = error.response?.data?.message || 'Erro ao vender. Tente novamente.';
      setSellError(msg);
    } finally {
      setSellLoading(false);
    }
  };

  if (loading) {
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
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F7931A"
            colors={['#F7931A']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Portfolio</Text>
            <Text style={styles.subtitle}>Visão geral dos seus investimentos</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setHideBalances(!hideBalances)}
              style={styles.iconButton}
            >
              {hideBalances ? <EyeOff size={18} color="#111827" /> : <Eye size={18} color="#111827" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
              <RefreshCw size={18} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards Grid */}
        <View style={styles.statsGrid}>
          {/* Total Value Card */}
          <View style={[styles.statCard, styles.statCardLarge]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(247, 147, 26, 0.1)' }]}>
                <DollarSign size={24} color="#F7931A" />
              </View>
              <Text style={styles.statTitle}>Valor Total</Text>
            </View>
            <Text style={[styles.statValue, hideBalances && styles.balanceBlur]}>
              {hideBalances ? '••••••' : formatCurrency(portfolioStats.totalValue + usdBalance)}
            </Text>
            <View style={styles.statFooter}>
              {portfolioStats.dayChangePercent >= 0 ? (
                <TrendingUp size={16} color="#10B981" />
              ) : (
                <TrendingDown size={16} color="#EF4444" />
              )}
              <Text style={[styles.statChange, portfolioStats.dayChangePercent >= 0 ? styles.changePositive : styles.changeNegative]}>
                {portfolioStats.dayChangePercent >= 0 ? '+' : ''}{portfolioStats.dayChangePercent.toFixed(2)}%
              </Text>
              <Text style={styles.statPeriod}>24h</Text>
            </View>
          </View>

          {/* Day Change Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <TrendingUp size={20} color="#10B981" />
              </View>
              <Text style={styles.statTitle}>Mudança 24h</Text>
            </View>
            <Text style={[styles.statValue, styles.statValueSmall, hideBalances && styles.balanceBlur]}>
              {hideBalances ? '••••••' : formatCurrency(portfolioStats.dayChange)}
            </Text>
            <View style={styles.statFooter}>
              <Text style={styles.statPeriod}>24h</Text>
            </View>
          </View>

          {/* Best Performer Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Award size={20} color="#6366F1" />
              </View>
              <Text style={styles.statTitle}>Melhor Ativo</Text>
            </View>
            <Text style={[styles.statValue, styles.statValueSmall]}>
              {portfolioStats.bestPerformer.asset}
            </Text>
            <View style={styles.statFooter}>
              <Text style={[styles.statChange, styles.changePositive]}>
                +{portfolioStats.bestPerformer.change.toFixed(2)}%
              </Text>
            </View>
          </View>

          {/* Total Gain Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: portfolioStats.totalGainPercent >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                {portfolioStats.totalGainPercent >= 0 ? (
                  <TrendingUp size={20} color="#10B981" />
                ) : (
                  <TrendingDown size={20} color="#EF4444" />
                )}
              </View>
              <Text style={styles.statTitle}>Ganho Total</Text>
            </View>
            <Text style={[styles.statValue, styles.statValueSmall, hideBalances && styles.balanceBlur]}>
              {hideBalances ? '••••••' : `${portfolioStats.totalGainPercent >= 0 ? '+' : ''}${portfolioStats.totalGainPercent.toFixed(2)}%`}
            </Text>
            <View style={styles.statFooter}>
              <Text style={styles.statPeriod}>All time</Text>
            </View>
          </View>
        </View>

        {/* Assets List */}
        <View style={styles.assetsSection}>
          <Text style={styles.assetsSectionTitle}>Seus Ativos</Text>

          {assets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum ativo ainda</Text>
              <Text style={styles.emptySubtext}>Comece comprando criptomoedas para ver seu portfolio</Text>
            </View>
          ) : (
            <View style={styles.assetsGrid}>
              {assets.map((asset, index) => (
                <View key={index} style={styles.portfolioAssetCard}>
                  <View style={styles.portfolioAssetHeader}>
                    <CryptoIcon symbol={asset.symbol} size={48} />
                    <View style={styles.portfolioAssetInfo}>
                      <Text style={styles.portfolioAssetName}>{asset.name}</Text>
                      <Text style={styles.portfolioAssetSymbol}>{asset.symbol}</Text>
                    </View>
                  </View>

                  <View style={styles.portfolioAssetDetails}>
                    <View style={styles.portfolioAssetRow}>
                      <Text style={styles.portfolioAssetLabel}>Quantidade</Text>
                      <Text style={[styles.portfolioAssetValue, hideBalances && styles.balanceBlur]}>
                        {hideBalances ? '••••••' : asset.amount.toFixed(8)}
                      </Text>
                    </View>

                    <View style={styles.portfolioAssetRow}>
                      <Text style={styles.portfolioAssetLabel}>Valor Atual</Text>
                      <Text style={[styles.portfolioAssetValue, hideBalances && styles.balanceBlur]}>
                        {hideBalances ? '••••••' : formatCurrency(asset.value)}
                      </Text>
                    </View>

                    <View style={styles.portfolioAssetRow}>
                      <Text style={styles.portfolioAssetLabel}>Ganho/Perda</Text>
                      <Text style={[
                        styles.portfolioAssetValue,
                        asset.gainLossPercent >= 0 ? styles.changePositive : styles.changeNegative,
                        hideBalances && styles.balanceBlur
                      ]}>
                        {hideBalances ? '••••••' : `${asset.gainLossPercent >= 0 ? '+' : ''}${asset.gainLossPercent.toFixed(2)}%`}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.portfolioAssetButton}
                    onPress={() => openSellModal(asset)}
                  >
                    <TrendingDown size={16} color="#FFFFFF" />
                    <Text style={styles.portfolioAssetButtonText}>Vender</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sell Modal */}
      <SellAssetModal
        isOpen={sellModalOpen}
        onClose={closeSellModal}
        asset={sellAsset}
        amount={sellAmount}
        onChangeAmount={setSellAmount}
        onConfirm={handleConfirmSell}
        loading={sellLoading}
        error={sellError}
        formatCurrency={formatCurrency}
        lots={sellLots}
      />
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
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  balanceBlur: {
    opacity: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statCardLarge: {
    width: '100%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  statValueSmall: {
    fontSize: 20,
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  statPeriod: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
  assetsSection: {
    marginBottom: 24,
  },
  assetsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  assetsGrid: {
    gap: 16,
  },
  portfolioAssetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  portfolioAssetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  portfolioAssetInfo: {
    flex: 1,
  },
  portfolioAssetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  portfolioAssetSymbol: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  portfolioAssetDetails: {
    gap: 12,
    marginBottom: 16,
  },
  portfolioAssetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioAssetLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  portfolioAssetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  portfolioAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  portfolioAssetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  changePositive: {
    color: '#10B981',
  },
  changeNegative: {
    color: '#EF4444',
  },
});