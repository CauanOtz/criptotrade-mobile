import { Tabs } from 'expo-router';
import { LayoutDashboard, User, TrendingUp } from 'lucide-react-native';
import { StyleSheet, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const renderIcon = (Icon: any, label: string) => ({ focused }: { focused: boolean }) => (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Icon size={24} color={focused ? '#071124' : '#cbd5e1'} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarBackground: () => (
          <View style={styles.tabBackgroundWrapper}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          </View>
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
    bottom: 18,
    height: 64,
    left: '4%',
    right: '4%',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
  tabBackgroundWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(27, 27, 27, 0.6)',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    top: 8,
  },
  tabItemActive: {
    backgroundColor: '#eab308',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  tabLabel: {
    color: '#cbd5e1',
    fontSize: 10,
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#071124',
    fontWeight: '700',
  },
});
