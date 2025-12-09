import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Bell, BellOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function UsabilitySettings() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Usabilidade</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tema</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                {theme === 'light' ? (
                  <Sun size={24} color="#F7931A" />
                ) : (
                  <Moon size={24} color="#F7931A" />
                )}
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Modo Escuro</Text>
                  <Text style={styles.settingDescription}>
                    {theme === 'light'
                      ? 'Ativar o tema escuro para reduzir o brilho'
                      : 'Desativar o tema escuro e usar o tema claro'}
                  </Text>
                </View>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: '#F7931A' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                {notificationsEnabled ? (
                  <Bell size={24} color="#10B981" />
                ) : (
                  <BellOff size={24} color="#6B7280" />
                )}
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Ativar Notificações</Text>
                  <Text style={styles.settingDescription}>
                    Receba alertas sobre mudanças de preço e atualizações
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Theme Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecionar Tema</Text>

          <View style={styles.themeContainer}>
            <TouchableOpacity
              style={[
                styles.themeCard,
                theme === 'light' && styles.themeCardActive,
              ]}
              onPress={() => theme === 'dark' && toggleTheme()}
            >
              <View style={[styles.themePreview, styles.lightTheme]}>
                <Sun size={32} color="#F7931A" />
              </View>
              <Text style={styles.themeLabel}>Claro</Text>
              {theme === 'light' && (
                <View style={styles.activeIndicator}>
                  <View style={styles.activeIndicatorDot} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeCard,
                theme === 'dark' && styles.themeCardActive,
              ]}
              onPress={() => theme === 'light' && toggleTheme()}
            >
              <View style={[styles.themePreview, styles.darkTheme]}>
                <Moon size={32} color="#F7931A" />
              </View>
              <Text style={styles.themeLabel}>Escuro</Text>
              {theme === 'dark' && (
                <View style={styles.activeIndicator}>
                  <View style={styles.activeIndicatorDot} />
                </View>
              )}
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  themeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardActive: {
    borderColor: '#F7931A',
  },
  themePreview: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lightTheme: {
    backgroundColor: '#F9FAFB',
  },
  darkTheme: {
    backgroundColor: '#1F2937',
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  activeIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F7931A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
