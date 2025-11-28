import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
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

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const isAdmin = true; // Forçar true para visualização

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#F7931A" />
            </View>
          </View>

          <Text style={styles.userName}>
            {user?.email?.split('@')[0] || 'Admin User'}
          </Text>
          <View style={styles.emailContainer}>
            <Mail size={16} color="#6B7280" />
            <Text style={styles.email}>{user?.email || 'admin@crypto.com'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>

          <MenuItem
            icon={<Settings size={22} color="#F7931A" />}
            title="Configurações Gerais"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Bell size={22} color="#F7931A" />}
            title="Notificações"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Shield size={22} color="#F7931A" />}
            title="Segurança"
            onPress={() => {}}
          />
        </View>

        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Área Administrativa</Text>
            <View style={styles.adminCard}>
              <View style={styles.adminInfoRow}>
                <View style={styles.adminIconWrap}>
                  <Coins size={24} color="#F7931A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminTitle}>Painel Admin</Text>
                  <Text style={styles.adminSubtitle}>
                    Gerencie usuários e ativos da plataforma.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => {}}
              >
                <Text style={styles.adminButtonText}>Acessar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSignOut}
        >
          <View style={styles.logoutContent}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, title, onPress }: any) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>{icon}</View>
          <Text style={styles.menuItemTitle}>{title}</Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F7931A',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  adminCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  adminInfoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  adminIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  adminSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },
  adminButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7931A',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});