import React, { useState, useRef, useEffect } from 'react';
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
import Animated, { 
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Shield, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

interface MfaVerificationProps {
  mfaPending: {
    tempToken: string;
    userInfo: any;
    isFirstLogin?: boolean;
  };
  onCancel: () => void;
  onSuccess: (userInfo: any, isFirstLogin: boolean) => void;
}

// Componente de escudos flutuantes (decoração de fundo)
function FloatingShields() {
  const shields = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 24 + Math.random() * 32,
    delay: i * 0.5
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {shields.map((shield) => (
        <FloatingShield
          key={shield.id}
          size={shield.size}
          top={`${shield.y}%`}
          left={`${shield.x}%`}
          delay={shield.delay}
        />
      ))}
    </View>
  );
}

function FloatingShield({ size, top, left, delay }: any) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 4000 }),
        withTiming(0, { duration: 4000 })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 4000 }),
        withTiming(0.1, { duration: 4000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ position: 'absolute', top, left }, animatedStyle]}>
      <Shield size={size} color="#F59E0B" />
    </Animated.View>
  );
}

export default function MfaVerification({ mfaPending, onCancel, onSuccess }: MfaVerificationProps) {
  const { verifyMfa } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [fallbackEmail, setFallbackEmail] = useState<string | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Focar no primeiro input ao montar
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);

    // Derivar email exibido a partir do payload de MFA ou do SecureStore
    (async () => {
      try {
        const ui = mfaPending?.userInfo;
        let email = ui?.email || ui?.user?.email || ui?.profile?.email || ui?.emailAddress || null;
        if (!email) {
          const raw = await SecureStore.getItemAsync('user');
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              email = parsed?.email || parsed?.user?.email || null;
            } catch (e) {
              // ignore parse errors
            }
          }
        }
        setFallbackEmail(email);
      } catch (e) {
        setFallbackEmail(null);
      }
    })();
  }, []);

  useEffect(() => {
    // Timer para reenvio
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    // Permitir apenas números
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Mover para o próximo input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quando completar todos os dígitos
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    // Voltar para o input anterior ao pressionar backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (codeString = code.join('')) => {
    if (codeString.length !== 6) {
      setError('Por favor, insira o código completo de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const identifier = mfaPending?.tempToken ?? mfaPending?.userInfo?.id ?? mfaPending?.userId ?? null;
      const email = mfaPending?.userInfo?.email ?? mfaPending?.email ?? null;
      const { error: mfaError, user } = await verifyMfa(codeString, identifier, email);

      if (mfaError) {
        // erro retornado pela camada de auth
        throw mfaError;
      }

      // Verificação bem-sucedida
      onSuccess(user || mfaPending.userInfo, mfaPending.isFirstLogin || false);
    } catch (err: any) {
      // mostrar mensagem retornada (se houver) e resetar input
      const msg = (err && (err.message || err?.data?.message)) || 'Código inválido. Tente novamente.';
      console.warn('MFA verify error:', err);
      setError(msg);
      setIsVerifying(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    
    setResendTimer(60);
    setError('');
    // Aqui você faria a chamada para reenviar o código
    console.log('Reenviando código MFA...');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Fundo Decorativo com Escudos */}
      <FloatingShields />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.content}>
            
            {/* Botão Voltar */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onCancel}
              disabled={isVerifying}
            >
              <ArrowLeft size={24} color="#6B7280" />
            </TouchableOpacity>

            {/* Ícone Flutuante no Topo do Card */}
            <View style={styles.floatingIconContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#F59E0B']}
                style={styles.floatingIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Shield size={32} color="#FFF" />
              </LinearGradient>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Verificação de Segurança</Text>
              <Text style={styles.subtitle}>
                Digite o código de 6 dígitos enviado para seu email
              </Text>
              <Text style={styles.email}>{fallbackEmail ?? mfaPending.userInfo?.email ?? 'seu-email@exemplo.com'}</Text>

              {/* Grid de Inputs de Código */}
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <View key={index} style={styles.inputWrapper}>
                    <TextInput
                      ref={(ref) => { inputRefs.current[index] = ref; }}
                      style={[
                        styles.codeInput,
                        digit && styles.codeInputFilled,
                        error && styles.codeInputError
                      ]}
                      value={digit}
                      onChangeText={(value) => handleChange(index, value)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      editable={!isVerifying}
                    />
                  </View>
                ))}
              </View>

              {/* Mensagem de Erro */}
              {error && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
                  <AlertCircle size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Botão de Verificar */}
              <TouchableOpacity
                style={styles.verifyButtonWrapper}
                onPress={() => handleSubmit()}
                disabled={isVerifying || code.join('').length !== 6}
              >
                <LinearGradient
                  colors={isVerifying || code.join('').length !== 6 ? ['#9CA3AF', '#6B7280'] : ['#D97706', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.verifyButton}
                >
                  {isVerifying ? (
                    <>
                      <View style={styles.spinner} />
                      <Text style={styles.verifyButtonText}>Verificando...</Text>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.verifyButtonText}>Verificar Código</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Timer e Reenvio */}
              <View style={styles.resendContainer}>
                {resendTimer > 0 ? (
                  <View style={styles.timerContainer}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.timerText}>
                      Reenviar código em {resendTimer}s
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendText}>Não recebeu o código? Reenviar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Info de Segurança */}
              <View style={styles.securityInfo}>
                <Shield size={16} color="#6B7280" />
                <Text style={styles.securityText}>
                  Suas informações estão protegidas com criptografia de ponta
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: -40,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingIconContainer: {
    zIndex: 30,
    marginBottom: -24,
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
    paddingTop: 40,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  codeInput: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
  },
  codeInputFilled: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFF7ED',
  },
  codeInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  verifyButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    marginRight: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  resendText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
});
