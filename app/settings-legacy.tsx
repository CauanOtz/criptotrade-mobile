import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GlassContainer } from '@/components/GlassContainer';
import { ChevronLeft, Settings, User } from 'lucide-react-native';

const SPACING = {
  page: 24,
  card: 16,
  row: 12,
  radius: 12,
};

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000000ff", "#222222ff", "#363636ff"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#eab308" />
          </TouchableOpacity>
          <Text style={styles.title}>Configurações</Text>
        </View>

        <View style={styles.content}>
          <GlassContainer style={styles.card}>
            <View style={styles.topicRow}>
              <View style={styles.topicIconWrap}>
                <Settings size={20} color="#eab308" />
              </View>
              <View style={styles.topicText}>
                <Text style={styles.itemTitle}>Preferências</Text>
                <Text style={styles.itemText}>Ajuste as preferências gerais do aplicativo.</Text>
              </View>
            </View>
          </GlassContainer>

          <GlassContainer style={styles.card}>
            <View style={styles.topicRow}>
              <View style={styles.topicIconWrap}>
                <User size={20} color="#eab308" />
              </View>
              <View style={styles.topicText}>
                <Text style={styles.itemTitle}>Conta</Text>
                <Text style={styles.itemText}>Gerencie informações da sua conta.</Text>
              </View>
            </View>
          </GlassContainer>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: SPACING.page, paddingTop: SPACING.page / 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.card },
  backButton: { marginRight: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  content: { paddingBottom: SPACING.page },
  card: { marginBottom: SPACING.card, padding: SPACING.card, borderRadius: SPACING.radius, marginHorizontal: 4 },
  topicRow: { flexDirection: 'row', alignItems: 'center' },
  topicIconWrap: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(234,179,8,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  topicText: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  itemText: { color: '#94a3b8', lineHeight: 20 },
});
