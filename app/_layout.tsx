import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Verifica se estamos em um grupo protegido (tabs)
    const inAuthGroup = segments[0] === '(tabs)';
    
    // Rotas que não exigem verificação imediata ou são públicas
    const isPublicRoute = segments[0] === 'login' || segments[0] === 'register';

    if (!user && inAuthGroup) {
      // Se não tem usuário e tenta acessar abas, manda pro login
      router.replace('/login');
    } else if (user && isPublicRoute) {
      // Se tem usuário e está no login, manda pras abas
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}