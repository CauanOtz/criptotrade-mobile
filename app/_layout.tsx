import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = Array.isArray(segments) && (segments as any).includes('(tabs)');

    const allowedTopRoutes = ['settings', 'notifications', 'security'];
    const firstSegment = Array.isArray(segments) && segments.length > 0 ? (segments as any)[0] : null;

    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && !inAuthGroup && !allowedTopRoutes.includes(firstSegment)) {
      router.replace('/(tabs)');
    }
  }, [user, segments, loading, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
