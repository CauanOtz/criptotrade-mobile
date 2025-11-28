import { Tabs } from 'expo-router';
import { LayoutDashboard, User, TrendingUp } from 'lucide-react-native';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

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
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
          )
        ),
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: renderIcon(LayoutDashboard, 'Início'),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Mercado',
          tabBarIcon: renderIcon(TrendingUp, 'Mercado'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: renderIcon(User, 'Perfil'),
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
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  tabItemActive: {
    backgroundColor: '#F7931A',
  },
  tabLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});