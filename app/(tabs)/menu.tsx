import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Bell, 
  Briefcase, 
  BookOpen, 
  History, 
  ChevronRight,
  LayoutDashboard,
  Coins,
  FileText
} from 'lucide-react-native';

const { height } = Dimensions.get('window');

export default function MenuScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  // Animação de Slide Up
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 15, stiffness: 90 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const menuItems = [
    {
      title: 'Minha Conta',
      items: [
        { icon: User, label: 'Perfil', route: '/profile' }, // Vamos mover profile para rota interna se necessário ou manter link
        { icon: History, label: 'Histórico de Transações', route: '/transactions' },
        { icon: Briefcase, label: 'Indicações', route: '/referrals' },
      ]
    },
    {
      title: 'Plataforma',
      items: [
        { icon: BookOpen, label: 'Aprender', route: '/learn' },
        { icon: Settings, label: 'Configurações', route: '/settings' },
        { icon: Bell, label: 'Notificações', route: '/notifications' },
        { icon: Shield, label: 'Segurança', route: '/security' },
      ]
    },
  ];

  // Adiciona seção Admin se o usuário for admin
  if (user?.role === 'admin' || user?.isAdmin) {
    menuItems.push({
      title: 'Administrador',
      items: [
        { icon: LayoutDashboard, label: 'Painel Admin', route: '/admin/dashboard' },
        { icon: User, label: 'Gerenciar Usuários', route: '/admin/users' },
        { icon: Coins, label: 'Gerenciar Moedas', route: '/admin/currency' },
        { icon: FileText, label: 'Documentação API', route: '/admin/apidocs' },
      ]
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          
          {/* Card do Usuário Resumido */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* Listagem de Opções */}
          {menuItems.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuGroup}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={[
                      styles.menuItem,
                      idx === section.items.length - 1 && styles.menuItemLast
                    ]}
                    onPress={() => {
                        // Navegação simples. Se a rota não existir, o Expo Router lida com o 404
                        // Mas idealmente você cria essas rotas em app/
                        try {
                            router.push(item.route as any);
                        } catch (e) {
                            console.warn("Rota não implementada:", item.route);
                        }
                    }}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconBox}>
                        <item.icon size={20} color="#4B5563" />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Botão Sair */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  contentContainer: {
    // Container animado
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F7931A',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7931A',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});