import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
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
  Coins,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const isAdmin = Boolean(
    (user?.role && typeof user.role === 'string' && user.role.toLowerCase() === 'admin') ||
    user?.isAdmin === true
  );

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 400 });
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
        colors={['#000000ff', '#222222ff', '#363636ff']}
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
                  {user?.photo ? (
                    <Image source={{ uri: user.photo }} style={styles.avatarImage} />
                  ) : (
                    <User size={40} color="#eab308" />
                  )}
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
              icon={<Settings size={22} color="#eab308" />}
              title="Configurações Gerais"
              delay={100}
              onPress={() => router.push('/settings')}
            />
            <MenuItem
              icon={<Bell size={22} color="#eab308" />}
              title="Notificações"
              delay={200}
              onPress={() => router.push('/notifications')}
            />
            <MenuItem
              icon={<Shield size={22} color="#eab308" />}
              title="Segurança"
              delay={300}
              onPress={() => router.push('/security')}
            />
          </View>

          {isAdmin && (
            <View style={styles.adminSection}>
              <Text style={styles.sectionTitle}>Área Administrativa</Text>
              <GlassContainer style={styles.adminCard}>
                <View style={styles.adminInfoRow}>
                  <View style={styles.adminIconWrap}>
                    <Coins size={24} color="#facc15" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminTitle}>Configurações (Admin)</Text>
                    <Text style={styles.adminSubtitle}>
                      Acesse o CRUD de moedas para criar, editar e remover ativos.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.adminButton}
                  onPress={() => router.push('/admin/settings' as never)}
                >
                  <Text style={styles.adminButtonText}>Abrir painel</Text>
                </TouchableOpacity>
              </GlassContainer>
            </View>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <GlassContainer>
              <View style={styles.logoutContent}>
                <LogOut size={22} color="#ef4444" />
                <Text style={styles.logoutText}>Sair da Conta</Text>
              </View>
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
  onPress?: () => void;
}

function MenuItem({ icon, title, delay = 0, onPress }: MenuItemProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateX.value = withTiming(0, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    translateX.value = withTiming(-5, { duration: 120 }, () => {
      translateX.value = withTiming(0, { duration: 160 });
    });
    if (onPress) onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <GlassContainer>
          <View style={styles.menuItemContent}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>{icon}</View>
              <Text style={styles.menuItemTitle}>{title}</Text>
            </View>
            <ChevronRight size={20} color="#64748b" />
          </View>
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
    backgroundColor: 'rgba(234, 179, 8, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(234, 179, 8, 0.22)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 4,
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
  adminSection: {
    marginBottom: 24,
  },
  adminCard: {
    padding: 20,
    gap: 16,
  },
  adminInfoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  adminIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  adminSubtitle: {
    color: '#94a3b8',
    lineHeight: 20,
  },
  adminButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#facc15',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  adminButtonText: {
    color: '#071124',
    fontWeight: '600',
  },
});
