import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { GlassContainer } from '@/components/GlassContainer';
import {
  User,
  Mail,
  LogOut,
  Settings,
  Bell,
  Shield,
  ChevronRight,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Perfil</Text>

          <Animated.View style={animatedStyle}>
            <GlassContainer style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <User size={40} color="#3b82f6" />
                </View>
              </View>

              <Text style={styles.userName}>
                {user?.email?.split('@')[0] || 'Usuário'}
              </Text>
              <View style={styles.emailContainer}>
                <Mail size={16} color="#64748b" />
                <Text style={styles.email}>{user?.email}</Text>
              </View>
            </GlassContainer>
          </Animated.View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configurações</Text>

            <MenuItem
              icon={<Settings size={22} color="#3b82f6" />}
              title="Configurações Gerais"
              delay={100}
            />
            <MenuItem
              icon={<Bell size={22} color="#3b82f6" />}
              title="Notificações"
              delay={200}
            />
            <MenuItem
              icon={<Shield size={22} color="#3b82f6" />}
              title="Segurança"
              delay={300}
            />
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <GlassContainer style={styles.logoutContent}>
              <LogOut size={22} color="#ef4444" />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </GlassContainer>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  delay?: number;
}

function MenuItem({ icon, title, delay = 0 }: MenuItemProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateX.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    translateX.value = withSpring(-5, { damping: 10 }, () => {
      translateX.value = withSpring(0, { damping: 10 });
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <GlassContainer style={styles.menuItemContent}>
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>{icon}</View>
            <Text style={styles.menuItemTitle}>{title}</Text>
          </View>
          <ChevronRight size={20} color="#64748b" />
        </GlassContainer>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 40,
    marginBottom: 32,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  email: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuItem: {
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
