import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  DollarSign,
  Sparkles,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Bom dia');
    else if (hour < 18) setTimeOfDay('Boa tarde');
    else setTimeOfDay('Boa noite');
  }, []);

  const menuItems = [
    {
      path: '/settings/profile',
      icon: User,
      label: 'Perfil',
      color: '#6366F1',
      description: 'Personalize suas informações pessoais e foto de perfil.',
    },
    {
      path: '/settings/usability',
      icon: SettingsIcon,
      label: 'Usabilidade',
      color: '#0EA5E9',
      description: 'Ajuste o tema e a experiência da interface.',
    },
    {
      path: '/settings/price-notifications',
      icon: Bell,
      label: 'Notificações de Preço',
      color: '#F59E0B',
      description: 'Configure alertas personalizados para mudanças de preço.',
    },
    {
      path: '/settings/security',
      icon: Shield,
      label: 'Segurança',
      color: '#10B981',
      description: 'Proteja sua conta com configurações avançadas de segurança.',
    },
    {
      path: '/settings/currency-preferences',
      icon: DollarSign,
      label: 'Preferências de Moeda',
      color: '#F43F5E',
      description: 'Escolha suas moedas favoritas e unidades de exibição.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Sparkles size={24} color="#F7931A" />
              <Text style={styles.greeting}>{timeOfDay}</Text>
            </View>
            <Text style={styles.userName}>
              {user?.email?.split('@')[0] || 'Usuário'}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>
          Gerencie suas preferências e configurações da conta
        </Text>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => router.push(item.path as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <item.icon size={28} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  menuContainer: {
    gap: 16,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
