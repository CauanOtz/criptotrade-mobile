import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard'; // Lembre-se de instalar: npx expo install expo-clipboard
import { 
  ChevronLeft, 
  Server, 
  RefreshCcw, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Code, 
  ChevronDown, 
  ChevronUp, 
  Copy 
} from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

// Configuração das APIs (Mesma estrutura da Web)
const API_CONFIG = {
  userApi: {
    title: 'User API',
    description: 'Gerenciamento de usuários, autenticação e perfis.',
    swagger: 'http://localhost:5294/index.html',
    endpoints: [
      { name: 'Login', method: 'POST', path: '/api/auth/login' },
      { name: 'Register', method: 'POST', path: '/api/auth/register' },
      { name: 'Get Profile', method: 'GET', path: '/api/user/{id}' },
      { name: 'Update User', method: 'PUT', path: '/api/user/{id}' }
    ]
  },
  cryptoApi: {
    title: 'Crypto API',
    description: 'Dados de mercado, preços históricos e tickers.',
    swagger: 'http://localhost:5101/index.html',
    endpoints: [
      { name: 'Get All Prices', method: 'GET', path: '/api/crypto/prices' },
      { name: 'Get Price', method: 'GET', path: '/api/crypto/price/{symbol}' },
      { name: '24h Ticker', method: 'GET', path: '/api/crypto/ticker/{symbol}' },
      { name: 'History', method: 'GET', path: '/api/crypto/history/{symbol}' }
    ]
  },
  walletApi: {
    title: 'Wallet API',
    description: 'Gestão de carteiras, saldos e movimentações.',
    swagger: 'http://localhost:5048/index.html',
    endpoints: [
      { name: 'Get Wallets', method: 'GET', path: '/api/wallet' },
      { name: 'Create Wallet', method: 'POST', path: '/api/wallet' },
      { name: 'Get Balance', method: 'GET', path: '/api/wallet/{id}/balances' }
    ]
  },
  currencyApi: {
    title: 'Currency API',
    description: 'Gestão de moedas listadas e pares de negociação.',
    swagger: 'http://localhost:5169/index.html',
    endpoints: [
      { name: 'Get Currencies', method: 'GET', path: '/api/currency' },
      { name: 'Create Currency', method: 'POST', path: '/api/currency' },
      { name: 'Update Currency', method: 'PUT', path: '/api/currency/{id}' }
    ]
  }
};

export default function ApiDocsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({
    userApi: 'checking',
    cryptoApi: 'checking',
    walletApi: 'checking',
    currencyApi: 'checking'
  });
  
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAllStatus();
  }, []);

  const checkAllStatus = async () => {
    setLoading(true);
    // Reset visual
    const newStatus = { ...apiStatus };
    for (const key of Object.keys(API_CONFIG)) {
      newStatus[key] = 'checking';
    }
    setApiStatus(newStatus);

    // Simulação de verificação de rede
    setTimeout(() => {
      setApiStatus({
        userApi: 'online',
        cryptoApi: 'online',
        walletApi: 'online',
        currencyApi: 'offline' // Simulando um serviço offline para exemplo
      });
      setLoading(false);
    }, 1500);
  };

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Sucesso', 'Rota copiada para a área de transferência.');
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => Alert.alert("Erro", "Não foi possível abrir o link: " + err));
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#3B82F6'; // Azul
      case 'POST': return '#10B981'; // Verde
      case 'PUT': return '#F59E0B'; // Laranja
      case 'DELETE': return '#EF4444'; // Vermelho
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Documentação da API</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshBtn} 
          onPress={checkAllStatus}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#F7931A" />
          ) : (
            <RefreshCcw size={20} color="#F7931A" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Monitore o status e explore os endpoints dos microsserviços da plataforma.
        </Text>

        <View style={styles.cardsContainer}>
          {Object.entries(API_CONFIG).map(([key, api], index) => (
            <ApiCard 
              key={key}
              apiKey={key}
              data={api}
              status={apiStatus[key] || 'checking'}
              index={index}
              expandedState={expandedEndpoints}
              onToggle={toggleEndpoint}
              onCopy={copyToClipboard}
              onOpenLink={openLink}
              getMethodColor={getMethodColor}
            />
          ))}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente do Card de API (Modularizado para limpeza)
const ApiCard = ({ apiKey, data, status, index, expandedState, onToggle, onCopy, onOpenLink, getMethodColor }: any) => {
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
      style={styles.card}
    >
      {/* Cabeçalho do Card */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={[
            styles.iconBg, 
            { backgroundColor: status === 'online' ? '#ECFDF5' : status === 'offline' ? '#FEF2F2' : '#EFF6FF' }
          ]}>
            <Server size={20} color={status === 'online' ? '#10B981' : status === 'offline' ? '#EF4444' : '#3B82F6'} />
          </View>
          <View>
            <Text style={styles.cardTitle}>{data.title}</Text>
            <View style={styles.statusRow}>
              {status === 'online' && <CheckCircle size={12} color="#10B981" />}
              {status === 'offline' && <XCircle size={12} color="#EF4444" />}
              {status === 'checking' && <RefreshCcw size={12} color="#F59E0B" />}
              <Text style={[
                styles.statusText, 
                { color: status === 'online' ? '#10B981' : status === 'offline' ? '#EF4444' : '#F59E0B' }
              ]}>
                {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Verificando...'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.swaggerBtn}
          onPress={() => onOpenLink(data.swagger)}
        >
          <Text style={styles.swaggerText}>Swagger</Text>
          <ExternalLink size={12} color="#F7931A" />
        </TouchableOpacity>
      </View>

      <Text style={styles.cardDesc}>{data.description}</Text>

      {/* Lista de Endpoints */}
      <View style={styles.endpointsList}>
        {data.endpoints.map((endpoint: any, idx: number) => {
          const uniqueId = `${apiKey}-${idx}`;
          const isExpanded = expandedState[uniqueId];
          const methodColor = getMethodColor(endpoint.method);

          return (
            <View key={uniqueId} style={styles.endpointItem}>
              <TouchableOpacity 
                style={styles.endpointHeader} 
                onPress={() => onToggle(uniqueId)}
                activeOpacity={0.7}
              >
                <View style={styles.endpointInfo}>
                  <View style={[styles.methodBadge, { backgroundColor: `${methodColor}15`, borderColor: `${methodColor}30` }]}>
                    <Text style={[styles.methodText, { color: methodColor }]}>{endpoint.method}</Text>
                  </View>
                  <Text style={styles.endpointName}>{endpoint.name}</Text>
                </View>
                {isExpanded ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
              </TouchableOpacity>

              {/* Detalhes Expansíveis */}
              {isExpanded && (
                <Animated.View 
                  entering={FadeInDown.duration(200)} 
                  style={styles.endpointDetail}
                  layout={Layout} // Animação suave de redimensionamento
                >
                  <View style={styles.pathContainer}>
                    <Code size={14} color="#6B7280" />
                    <Text style={styles.pathText} numberOfLines={1} ellipsizeMode="middle">
                      {endpoint.path}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.copyBtn}
                    onPress={() => onCopy(endpoint.path)}
                  >
                    <Copy size={14} color="#F7931A" />
                    <Text style={styles.copyText}>Copiar</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  swaggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  swaggerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F7931A',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  endpointsList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  endpointItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  endpointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
  },
  endpointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  methodText: {
    fontSize: 10,
    fontWeight: '800',
  },
  endpointName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  endpointDetail: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  pathText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  copyText: {
    fontSize: 11,
    color: '#F7931A',
    fontWeight: '600',
  },
});