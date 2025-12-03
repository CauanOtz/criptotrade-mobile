import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Wallet as WalletIcon, PieChart, ArrowUpRight, TrendingUp } from 'lucide-react-native';
import { PortfolioSummary } from '@/components/PortfolioSummary'; // Reutilizando seu componente existente

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Sua Carteira</Text>
          <View style={styles.subtitleRow}>
            <WalletIcon size={16} color="#6B7280" />
            <Text style={styles.subtitle}>Visão geral dos ativos</Text>
          </View>
        </View>

        {/* Componente de Resumo que você já tem */}
        <PortfolioSummary />

        {/* Lista de Ativos Simulada */}
        <View style={styles.assetsSection}>
          <Text style={styles.sectionTitle}>Seus Ativos</Text>
          
          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <View style={styles.assetInfo}>
                <View style={[styles.coinIcon, { backgroundColor: '#F7931A' }]}>
                  <Text style={styles.coinIconText}>B</Text>
                </View>
                <View>
                  <Text style={styles.assetSymbol}>Bitcoin</Text>
                  <Text style={styles.assetAmount}>0.45 BTC</Text>
                </View>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.assetValue}>R$ 142.350,00</Text>
                <Text style={styles.assetChange}>+5.2%</Text>
              </View>
            </View>
          </View>

          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <View style={styles.assetInfo}>
                <View style={[styles.coinIcon, { backgroundColor: '#627EEA' }]}>
                  <Text style={styles.coinIconText}>E</Text>
                </View>
                <View>
                  <Text style={styles.assetSymbol}>Ethereum</Text>
                  <Text style={styles.assetAmount}>2.1 ETH</Text>
                </View>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.assetValue}>R$ 32.100,00</Text>
                <Text style={styles.assetChange}>+1.8%</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  assetsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  assetCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIconText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  assetAmount: {
    fontSize: 13,
    color: '#6B7280',
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  assetChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});