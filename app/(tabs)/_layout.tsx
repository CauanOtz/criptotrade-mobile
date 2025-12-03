import { Tabs } from 'expo-router';
import { LayoutDashboard, Wallet, TrendingUp, Grid } from 'lucide-react-native';
import { StyleSheet, View, Text, Platform } from 'react-native';

export default function TabLayout() {
  const renderIcon = (Icon: any, label: string) => ({ focused }: { focused: boolean }) => (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Icon size={24} color={focused ? '#FFF' : '#9CA3AF'} />
      {focused && <Text style={styles.tabLabel}>{label}</Text>}
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        // Removido background complexo para evitar bugs de transparência
      }}
    >
      {/* 1. Início */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: renderIcon(LayoutDashboard, 'Início'),
        }}
      />
      
      {/* 2. Mercados */}
      <Tabs.Screen
        name="market"
        options={{
          title: 'Mercado',
          tabBarIcon: renderIcon(TrendingUp, 'Mercado'),
        }}
      />

      {/* 3. Carteira (Novo) */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Carteira',
          tabBarIcon: renderIcon(Wallet, 'Carteira'),
        }}
      />

      {/* 4. Menu / Todos (Substitui o Profile direto na barra) */}
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Todos',
          tabBarIcon: renderIcon(Grid, 'Todos'),
        }}
      />

      {/* Ocultar a rota antiga de profile da barra, mas manter acessível se necessário */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Isso esconde o botão da barra
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    bottom: 20,
    height: 64,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
  },
  tabItemActive: {
    backgroundColor: '#F7931A',
  },
  tabLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
});