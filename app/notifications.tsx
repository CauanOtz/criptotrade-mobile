import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '@/components/GlassContainer';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

const SPACING = { page: 24, card: 16, row: 12, radius: 12 };

export default function NotificationsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000000ff", "#222222ff", "#363636ff"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#eab308" />
          </TouchableOpacity>
          <Text style={styles.title}>Notificações</Text>
        </View>

        <View style={styles.content}>
          <GlassContainer style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.itemTitle}>Push Notifications</Text>
              <Switch value={pushEnabled} onValueChange={setPushEnabled} thumbColor="#eab308" />
            </View>
            <View style={styles.row}>
              <Text style={styles.itemTitle}>Email</Text>
              <Switch value={emailEnabled} onValueChange={setEmailEnabled} thumbColor="#eab308" />
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
  card: { padding: SPACING.card, borderRadius: SPACING.radius, marginBottom: SPACING.card, marginHorizontal: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.row },
  itemTitle: { color: '#ffffff', fontSize: 16 },
});
