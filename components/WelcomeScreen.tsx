import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeOut,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ArrowRight, Sparkles, Globe, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  visible: boolean;
  userName: string;
  onComplete: () => void;
}

export function WelcomeScreen({ visible, userName, onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  const steps = [
    {
      title: `Olá, ${userName}!`,
      subtitle: "Bem-vindo(a) ao CryptoTrade+",
      description: "Estamos felizes em ter você conosco. Vamos começar nossa jornada juntos no mundo das criptomoedas.",
      icon: Sparkles,
      colors: ['#F59E0B', 'rgba(245, 158, 11, 0.6)'] as const, // Laranja
    },
    {
      title: "Acompanhe o Mercado",
      subtitle: "Em tempo real",
      description: "Monitore preços, tendências e movimentações do mercado com dados atualizados a cada minuto.",
      icon: Globe,
      colors: ['#10B981', '#14B8A6'] as const, // Verde/Teal
    },
    {
      title: "Pronto para Começar",
      subtitle: "Sua dashboard está preparada",
      description: "Personalize sua experiência e explore todas as funcionalidades que preparamos para você.",
      icon: Zap,
      colors: ['#F59E0B', '#F97316'] as const, // Amber/Orange
    }
  ];

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setShowSkip(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!visible) return null;

  const currentData = steps[currentStep];
  const Icon = currentData.icon;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="rgba(255,255,255,0.95)" />
        
        {/* Background Animado (Blobs) */}
        <BackgroundBlobs />

        <View style={styles.contentContainer}>
          {/* Usamos key={currentStep} para forçar a re-renderização e animação a cada passo */}
          <Animated.View 
            key={currentStep}
            entering={FadeInDown.duration(600).springify()}
            exiting={FadeOut.duration(300)}
            style={styles.stepContent}
          >
            {/* Ícone com Gradiente */}
            <Animated.View entering={ZoomIn.delay(100).duration(500)} style={styles.iconWrapper}>
              <LinearGradient
                colors={currentData.colors}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon size={40} color="#FFF" />
              </LinearGradient>
            </Animated.View>

            {/* Textos */}
            <Text style={styles.title}>{currentData.title}</Text>
            <Text style={[styles.subtitle, { color: currentData.colors[0] }]}>
              {currentData.subtitle}
            </Text>
            <Text style={styles.description}>{currentData.description}</Text>

            {/* Indicadores e Botões */}
            <View style={styles.footer}>
              <View style={styles.pagination}>
                {steps.map((_, idx) => (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === currentStep ? 
                        { backgroundColor: currentData.colors[0], width: 24 } : 
                        { backgroundColor: '#E5E7EB', width: 8 }
                    ]}
                    layout={Layout.springify()} // Anima a mudança de tamanho
                  />
                ))}
              </View>

              <View style={styles.actions}>
                {showSkip && currentStep < steps.length - 1 && (
                  <TouchableOpacity onPress={onComplete} style={styles.skipBtn}>
                    <Text style={styles.skipText}>Pular</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
                  <LinearGradient
                    colors={currentData.colors}
                    style={styles.nextBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.nextText}>
                      {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
                    </Text>
                    <ArrowRight size={18} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

// Componente para o fundo animado
function BackgroundBlobs() {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);

  useEffect(() => {
    scale1.value = withRepeat(
      withSequence(withTiming(1.2, { duration: 4000 }), withTiming(1, { duration: 4000 })),
      -1,
      true
    );
    scale2.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 3000 }), withTiming(1, { duration: 3000 })),
      -1,
      true
    );
  }, []);

  const styleBlob1 = useAnimatedStyle(() => ({ transform: [{ scale: scale1.value }] }));
  const styleBlob2 = useAnimatedStyle(() => ({ transform: [{ scale: scale2.value }] }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.blob, styles.blob1]}>
        <Animated.View style={[StyleSheet.absoluteFill, styleBlob1]}>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.1)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={[styles.blob, styles.blob2]}>
        <Animated.View style={[StyleSheet.absoluteFill, styleBlob2]}>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.08)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

// Necessário importar o Layout do reanimated para a animação dos dots
import { Layout } from 'react-native-reanimated';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: width,
    paddingHorizontal: 32,
    alignItems: 'center',
    zIndex: 10,
  },
  stepContent: {
    width: '100%',
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 32,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  nextText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 300,
    height: 300,
    top: -50,
    right: -50,
  },
  blob2: {
    width: 250,
    height: 250,
    bottom: -50,
    left: -50,
  },
});