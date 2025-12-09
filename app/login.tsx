import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  FadeInDown,
  FadeIn
} from 'react-native-reanimated';
import { Mail, Lock, ArrowRight, Bitcoin, DollarSign, Wallet, Chrome, Facebook, Github, Shield, CircleDollarSign } from 'lucide-react-native';
import MfaVerification from '@/components/MfaVerification';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaPending, setMfaPending] = useState<any>(null);
  const router = useRouter();
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (loginMethod === 'email') {
      if (!email || !password) {
        setError('Por favor preencha todos os campos');
        return;
      }

      setLoading(true);
      setError('');
      const { error, data } = await signIn(email, password);

      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (data?.mfaRequired) {
        // Se MFA for necessário, mostrar tela de verificação
        setMfaPending({
          tempToken: data.tempToken,
          userInfo: data.userInfo,
          isFirstLogin: data.isFirstLogin
        });
        setLoading(false);
      }
    } else {
      // Lógica simulada para carteira
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // router.replace('/(tabs)'); // Descomentar para testar navegação sem auth real
        setError('Conexão com carteira não configurada neste demo.');
      }, 1500);
    }
  };

  const handleMfaSuccess = (userInfo: any, isFirstLogin: boolean) => {
    setMfaPending(null);
    // Redirecionar após sucesso do MFA
    router.replace('/(tabs)');
  };

  const handleMfaCancel = () => {
    setMfaPending(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Se houver MFA pendente, mostrar tela de verificação
  if (mfaPending) {
    return (
      <MfaVerification
        mfaPending={mfaPending}
        onCancel={handleMfaCancel}
        onSuccess={handleMfaSuccess}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Fundo Decorativo com Ícones */}
      <BackgroundDecoration />

      {/* Header com Logo (Simulado) */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
             <Bitcoin size={20} color="#F7931A" />
          </View>
          <View>
            <Text style={styles.logoText}>CryptoTrade</Text>
            <Text style={styles.logoSubText}>Advanced Trading Platform</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.content}>
          
          {/* Ícone Flutuante no Topo do Card */}
          <View style={styles.floatingIconContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#F59E0B']}
              style={styles.floatingIconBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Bitcoin size={32} color="#FFF" />
            </LinearGradient>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Acessar Investimentos</Text>
            <Text style={styles.subtitle}>Acesse sua carteira digital de forma segura</Text>

            {/* Alternador de Método de Login */}
            <View style={styles.methodToggle}>
              <TouchableOpacity 
                style={[styles.methodBtn, loginMethod === 'email' && styles.methodBtnActive]}
                onPress={() => { setLoginMethod('email'); setError(''); }}
              >
                <Mail size={16} color={loginMethod === 'email' ? '#FFF' : '#6B7280'} style={{marginRight: 6}} />
                <Text style={[styles.methodText, loginMethod === 'email' && styles.methodTextActive]}>Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.methodBtn, loginMethod === 'wallet' && styles.methodBtnActive]}
                onPress={() => { setLoginMethod('wallet'); setError(''); }}
              >
                <Wallet size={16} color={loginMethod === 'wallet' ? '#FFF' : '#6B7280'} style={{marginRight: 6}} />
                <Text style={[styles.methodText, loginMethod === 'wallet' && styles.methodTextActive]}>Carteira Cripto</Text>
              </TouchableOpacity>
            </View>

            {/* Conteúdo Dinâmico Baseado na Aba */}
            {loginMethod === 'email' ? (
              <Animated.View entering={FadeIn.duration(300)}>
                {/* Inputs de Email */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Mail color="#F59E0B" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Lock color="#F59E0B" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Senha"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.forgotPass}>
                  <Text style={styles.forgotPassText}>Esqueceu a senha?</Text>
                </TouchableOpacity>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.loginButtonWrapper}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#D97706', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButton}
                  >
                    <Text style={styles.loginButtonText}>
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Text>
                    {!loading && <ArrowRight size={20} color="#FFF" style={{marginLeft: 8}} />}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Ou continue com</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#EA4335' }]}>
                    <Chrome size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}>
                    <Facebook size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#111827' }]}>
                    <Github size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>Novo na plataforma? </Text>
                  <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.createAccountText}>Criar conta</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn.duration(300)} style={styles.walletSection}>
                <View style={styles.walletHeader}>
                  <View style={styles.walletIconCircle}>
                    <Wallet size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.walletTitle}>Conectar Carteira</Text>
                  <Text style={styles.walletSubtitle}>Conecte sua carteira digital para acessar sua conta</Text>
                </View>

                <View style={styles.walletList}>
                  <TouchableOpacity style={styles.walletButton} onPress={() => { setError(''); setLoading(true); setTimeout(() => setLoading(false), 1000); }}>
                    <View style={[styles.walletIcon, { backgroundColor: '#FDE68A' }]}>
                      {/* Simulando ícone MetaMask (Raposa Laranja) */}
                      <Shield size={20} color="#D97706" />
                    </View>
                    <Text style={styles.walletText}>MetaMask</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.walletButton} onPress={() => { setError(''); setLoading(true); setTimeout(() => setLoading(false), 1000); }}>
                    <View style={[styles.walletIcon, { backgroundColor: '#DBEAFE' }]}>
                      {/* Simulando ícone Coinbase (Azul) */}
                      <CircleDollarSign size={20} color="#2563EB" />
                    </View>
                    <Text style={styles.walletText}>Coinbase</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.walletButton} onPress={() => { setError(''); setLoading(true); setTimeout(() => setLoading(false), 1000); }}>
                    <View style={[styles.walletIcon, { backgroundColor: '#DCFCE7' }]}>
                      {/* Simulando ícone Trust Wallet (Verde/Escudo) */}
                      <Shield size={20} color="#16A34A" />
                    </View>
                    <Text style={styles.walletText}>Trust Wallet</Text>
                  </TouchableOpacity>
                </View>
                
                {error ? <Text style={[styles.errorText, {marginTop: 10}]}>{error}</Text> : null}

                <View style={[styles.cardFooter, { marginTop: 24 }]}>
                  <Text style={styles.footerText}>Novo na plataforma? </Text>
                  <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.createAccountText}>Criar conta</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Ticker Inferior Fixo */}
      <View style={styles.tickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickerContent}>
          <TickerItem symbol="ETH" change="+1.8%" price="R$ 9.875" />
          <View style={styles.tickerDivider} />
          <TickerItem symbol="SOL" change="+5.2%" price="R$ 437" />
          <View style={styles.tickerDivider} />
          <TickerItem symbol="BNB" change="+3.1%" price="R$ 1.892" />
          <View style={styles.tickerDivider} />
          <TickerItem symbol="ADA" change="+0.6%" price="R$ 2,31" />
          <View style={styles.tickerDivider} />
          <TickerItem symbol="XRP" change="+4.3%" price="R$ 2,75" />
        </ScrollView>
      </View>
    </View>
  );
}

function TickerItem({ symbol, change, price }: { symbol: string, change: string, price: string }) {
  return (
    <View style={styles.tickerItem}>
      <Text style={styles.tickerSymbol}>{symbol}</Text>
      <Text style={styles.tickerPrice}>{price}</Text>
      <Text style={styles.tickerChange}>{change}</Text>
    </View>
  );
}

// Decoração de fundo com ícones flutuantes
function BackgroundDecoration() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <FloatingSymbol Icon={Bitcoin} size={32} top="15%" left="10%" rotation={-15} delay={0} />
      <FloatingSymbol Icon={DollarSign} size={40} top="25%" right="15%" rotation={20} delay={500} />
      <FloatingSymbol Icon={Bitcoin} size={24} bottom="30%" left="20%" rotation={45} delay={1000} />
      <FloatingSymbol Icon={DollarSign} size={28} bottom="40%" right="10%" rotation={-30} delay={1500} />
      <FloatingSymbol Icon={Bitcoin} size={20} top="10%" right="30%" rotation={10} delay={2000} />
    </View>
  );
}

function FloatingSymbol({ Icon, size, top, left, right, bottom, rotation, delay }: any) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 2000 + (Math.random() * 1000) }),
        withTiming(0, { duration: 2000 + (Math.random() * 1000) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotation}deg` }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', top, left, right, bottom, opacity: 0.3 }, animatedStyle]}>
      <Icon size={size} color="#9CA3AF" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fundo claro
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  logoSubText: {
    fontSize: 10,
    color: '#6B7280',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  floatingIconContainer: {
    zIndex: 30,
    marginBottom: -24, // Para sobrepor o card
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    paddingTop: 40, // Espaço para o ícone flutuante
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  methodBtnActive: {
    backgroundColor: '#EAB308',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    gap: 16,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPassText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
  loginButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#9CA3AF',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 13,
  },
  createAccountText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 13,
  },
  // Wallet Section Styles
  walletSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  walletHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  walletIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  walletSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  walletList: {
    width: '100%',
    gap: 12,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  walletIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  walletText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  tickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
  },
  tickerContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  tickerSymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6', // Azul para os símbolos
    marginRight: 6,
  },
  tickerPrice: {
    fontSize: 12,
    color: '#374151',
    marginRight: 6,
  },
  tickerChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  tickerDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 20,
  },
});