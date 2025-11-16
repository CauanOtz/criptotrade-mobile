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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { GlassContainer } from '@/components/GlassContainer';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Lock, Mail } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, session } = useAuth();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 20 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={StyleSheet.absoluteFill}
      />

      <FloatingCircles />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.content, containerStyle]}>
          <Text style={styles.title}>Bem-vindo</Text>
          <Text style={styles.subtitle}>Entre para acessar seu dashboard</Text>

          <GlassContainer style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassContainer>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

function FloatingCircles() {
  const circles = [1, 2, 3, 4];

  return (
    <>
      {circles.map((_, index) => (
        <FloatingCircle key={index} index={index} />
      ))}
    </>
  );
}

function FloatingCircle({ index }: { index: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const delay = index * 300;
    translateY.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 2000 + index * 500 }),
        withTiming(-20, { duration: 2000 + index * 500 })
      ),
      -1,
      true
    );
    translateX.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 2500 + index * 300 }),
        withTiming(-15, { duration: 2500 + index * 300 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  const positions = [
    { top: height * 0.1, left: width * 0.1 },
    { top: height * 0.3, right: width * 0.1 },
    { bottom: height * 0.2, left: width * 0.2 },
    { bottom: height * 0.1, right: width * 0.15 },
  ];

  const sizes = [120, 80, 100, 90];

  return (
    <Animated.View
      style={[
        styles.floatingCircle,
        {
          width: sizes[index],
          height: sizes[index],
          borderRadius: sizes[index] / 2,
          ...positions[index],
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    opacity: 0.6,
  },
});
