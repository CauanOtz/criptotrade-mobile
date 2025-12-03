import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Activity,
  BarChart2,
  Clock,
  Layout,
  PieChart,
  TrendingUp,
  Zap
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Componentes (Vamos criar os arquivos na pasta components/dashboard)
import { CryptoChart } from '@/components/dashboard/CryptoChart';
import { CustomizationModal } from '@/components/dashboard/CustomizationModal';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TopMovers } from '@/components/dashboard/TopMovers';


// Mock Data (Simulando a API por enquanto)
const MOCK_STATS = [
  { title: 'Valor do Portfólio', value: 'R$ 124.500,00', subValue: '+2.5%', icon: PieChart },
  { title: 'Lucro Diário', value: 'R$ 1.240,00', subValue: '+1.1%', icon: Activity },
  { title: 'Variação 24h', value: '+R$ 3.200,00', subValue: '+5.4%', icon: TrendingUp },
];

const MENU_TABS = [
  { id: 'chart', icon: BarChart2, label: 'Gráfico' },
  { id: 'markets', icon: Activity, label: 'Mercados' },
  { id: 'transactions', icon: PieChart, label: 'Transações' },
  { id: 'news', icon: Clock, label: 'Notícias' },
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

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
          <StatsCards 
            stats={MOCK_STATS.filter((_, idx) => {
              // Lógica simples para filtrar stats baseado no layout (adaptar conforme nomes reais)
              const keys = ['portfolioValue', 'dailyProfit', '24hChange'];
              return isVisible('middleSection', keys[idx]);
            })} 
          />
        </View>

        {/* 3. TENDÊNCIAS & DICAS */}
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
                {/* Simulação de lista horizontal */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {['BTC', 'ETH', 'SOL'].map(coin => (
                    <View key={coin} style={styles.trendItem}>
                      <Text style={styles.trendSymbol}>{coin}</Text>
                      <Text style={styles.trendChange}>+5.2%</Text>
                    </View>
                  ))}
                </ScrollView>
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

        {/* 4. NAVEGAÇÃO INTERNA */}
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

        {/* 5. CONTEÚDO PRINCIPAL */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          {activeTab === 'chart' && isVisible('mainContent', 'chart') && (
            <View style={styles.chartContainer}>
              <CryptoChart />
            </View>
          )}
          
          {activeTab === 'chart' && isVisible('mainContent', 'topGainers') && (
            <View style={{ marginTop: 16 }}>
              <TopMovers />
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
  },
  trendChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
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