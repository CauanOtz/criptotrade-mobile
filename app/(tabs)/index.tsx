import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { WelcomeScreen } from '@/components/WelcomeScreen'; // Importe o componente
import { 
  Zap, 
  TrendingUp, 
  ArrowUpRight, 
  BarChart2, 
  Activity, 
  PieChart, 
  Clock 
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// ... (Mantenha as constantes TRENDING_COINS, MENU_TABS como estavam)
const TRENDING_COINS = [
  { symbol: 'CREAM', name: 'Cream', change: 65.4, price: 2.1 },
  { symbol: 'PNT', name: 'PNetwork', change: 45.2, price: 0.035 },
  { symbol: 'BANANA', name: 'Banana', change: 33.6, price: 10.97 },
];

const MENU_TABS = [
  { id: 'chart', icon: BarChart2, label: 'Gráfico' },
  { id: 'markets', icon: Activity, label: 'Mercados' },
  { id: 'transactions', icon: PieChart, label: 'Transações' },
  { id: 'news', icon: Clock, label: 'Notícias' },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chart');
  
  // Estado para controlar a visibilidade da tela de boas-vindas
  const [showWelcome, setShowWelcome] = useState(true);

  const userName = user?.name || user?.email?.split('@')[0] || 'Admin';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      {/* Tela de Boas-vindas (Modal) */}
      <WelcomeScreen 
        visible={showWelcome} 
        userName={userName}
        onComplete={() => setShowWelcome(false)}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ... (Todo o resto do seu código da Dashboard permanece igual) ... */}
        
        {/* 1. Header Fiel à Web */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingTitle}>
              Olá, <Text style={styles.userName}>{userName}</Text>!
            </Text>
            <Text style={styles.greetingSubtitle}>Seja Bem-vindo!</Text>
            <Text style={styles.greetingDesc}>Seu painel de negociações personalizado</Text>
          </View>
          
          <TouchableOpacity style={styles.fastTradeBtn}>
            <Zap size={16} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.fastTradeText}>Negociar</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Seção de Tendências e Dicas */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          {/* Card de Tendências */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(247, 147, 26, 0.1)' }]}>
                <TrendingUp size={20} color="#F7931A" />
              </View>
              <Text style={styles.cardTitle}>Moedas em tendência</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
              {TRENDING_COINS.map((coin) => (
                <View key={coin.symbol} style={styles.trendingItem}>
                  <View style={styles.trendingHeader}>
                    <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                    <View style={styles.changeBadge}>
                      <ArrowUpRight size={12} color="#10B981" />
                      <Text style={styles.changeText}>{coin.change}%</Text>
                    </View>
                  </View>
                  <Text style={styles.coinPrice}>R$ {coin.price.toFixed(3)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Card de Dicas */}
          <View style={[styles.card, { marginTop: 16 }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(247, 147, 26, 0.1)' }]}>
                <Zap size={20} color="#F7931A" />
              </View>
              <Text style={styles.cardTitle}>Dicas de trading</Text>
            </View>
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                "Nunca invista mais do que você pode perder. Diversifique sua carteira para reduzir riscos e mantenha uma estratégia sólida."
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 3. Navegação de Abas (Tabs Internas) */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MENU_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive
                  ]}
                >
                  <Icon 
                    size={18} 
                    color={isActive ? '#FFF' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.tabText,
                    isActive && styles.tabTextActive
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Conteúdo Dinâmico (Placeholder do Gráfico) */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.mainContent}
        >
          {activeTab === 'chart' && (
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Bitcoin (BTC)</Text>
                  <Text style={styles.chartPrice}>R$ 90.630,28</Text>
                </View>
                <View style={styles.timeFrame}>
                  <Text style={styles.timeFrameText}>24H</Text>
                </View>
              </View>
              
              <View style={styles.chartVisual}>
                <View style={styles.chartBars}>
                  {[40, 60, 45, 70, 65, 85, 80, 95, 120, 110, 90, 100].map((h, i) => (
                    <View 
                      key={i} 
                      style={{
                        width: 16, 
                        height: h, 
                        backgroundColor: '#F7931A', 
                        opacity: 0.2 + (i/20),
                        borderRadius: 4
                      }} 
                    />
                  ))}
                </View>
                <Text style={styles.chartLabel}>Gráfico em Tempo Real</Text>
              </View>
            </View>
          )}
          
          <View style={styles.marketList}>
            <Text style={styles.sectionTitle}>Market Pulse</Text>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.marketItem}>
                <View style={styles.marketItemLeft}>
                  <View style={styles.coinIconPlaceholder}>
                    <Text style={{fontWeight: 'bold', color: '#F7931A'}}>B</Text>
                  </View>
                  <View>
                    <Text style={styles.marketCoinName}>Bitcoin</Text>
                    <Text style={styles.marketCoinSymbol}>BTC</Text>
                  </View>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={styles.marketCoinPrice}>R$ 90.630,28</Text>
                  <View style={styles.badgeSuccess}>
                    <ArrowUpRight size={10} color="#10B981" />
                    <Text style={styles.badgeSuccessText}>+5.2%</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

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
  scrollContent: {
    padding: 20,
  },
  // ... (Todos os outros estilos permanecem os mesmos que enviei anteriormente)
  header: {
    marginBottom: 24,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingTitle: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '600',
  },
  userName: {
    color: '#F7931A',
    fontWeight: 'bold',
  },
  greetingSubtitle: {
    fontSize: 24,
    color: '#111827',
    fontWeight: 'bold',
  },
  greetingDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
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
    elevation: 4,
  },
  fastTradeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  trendingScroll: {
    marginHorizontal: -4,
  },
  trendingItem: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 140,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 2,
  },
  coinPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  tipBox: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F7931A',
  },
  tipText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  tabsContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  tabButtonActive: {
    backgroundColor: '#F7931A',
    shadowColor: '#F7931A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  mainContent: {
    gap: 20,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    height: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  chartPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  timeFrame: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeFrameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  chartVisual: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    gap: 8,
    marginBottom: 16,
  },
  chartLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  marketList: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  marketItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  marketCoinName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  marketCoinSymbol: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  marketCoinPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSuccessText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 2,
  },
});