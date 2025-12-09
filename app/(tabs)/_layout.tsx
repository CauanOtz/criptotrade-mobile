import { Tabs } from 'expo-router';
import { LayoutDashboard, Wallet, TrendingUp, Grid } from 'lucide-react-native';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';

export default function TabLayout() {
  const renderIcon = (Icon: any, label: string) => ({ focused }: { focused: boolean }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const scale = withSpring(focused ? 1 : 0.9, {
        damping: 15,
        stiffness: 150,
      });
      
      return {
        transform: [{ scale }],
      };
    });

    return (
      <Animated.View style={[styles.tabItem, focused && styles.tabItemActive, animatedStyle]}>
        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
          <Icon 
            size={focused ? 22 : 20} 
            color={focused ? '#FFFFFF' : '#6B7280'} 
            strokeWidth={focused ? 2.5 : 2}
          />
        </View>
        {focused && (
          <Text style={styles.tabLabel} numberOfLines={1}>
            {label}
          </Text>
        )}
      </Animated.View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarActiveTintColor: '#F7931A',
        tabBarInactiveTintColor: '#6B7280',
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
    bottom: Platform.OS === 'ios' ? 25 : 20,
    height: Platform.OS === 'ios' ? 72 : 68,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderTopWidth: 0,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  tabBarItemStyle: {
    paddingVertical: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 6,
    minWidth: 50,
  },
  tabItemActive: {
    backgroundColor: '#F7931A',
    ...Platform.select({
      ios: {
        shadowColor: '#F7931A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
  },
  tabLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});