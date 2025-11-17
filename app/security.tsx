import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '@/components/GlassContainer';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';

const SPACING = { page: 24, card: 16, row: 12, radius: 12 };

export default function SecurityScreen() {
  const router = useRouter();
  const { biometryAvailable, biometryEnabled, enableBiometry, tryBiometricUnlock } = useAuth();
  const [twoFactor, setTwoFactor] = useState(false);
  const { hasPin, setPin, verifyPin } = useAuth();

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  const savePin = async () => {
    if (pinValue.length < 4) {
      Alert.alert('PIN inválido', 'Use ao menos 4 dígitos.');
      return;
    }
    if (pinValue !== pinConfirm) {
      Alert.alert('Confirmação', 'Os PINs não coincidem.');
      return;
    }
    const ok = await setPin(pinValue);
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Salvo', 'PIN salvo com sucesso.');
      setPinModalVisible(false);
      setPinValue('');
      setPinConfirm('');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Não foi possível salvar o PIN.');
    }
  };

  const testPin = async () => {
    // open a verify-only modal
    setVerifyModalVisible(true);
  };

  const onToggleBiometry = async (val: boolean) => {
    if (!biometryAvailable) {
      Alert.alert('Biometria indisponível', 'Seu dispositivo não suporta autenticação biométrica.');
      return;
    }
    const ok = await enableBiometry(val);
    if (ok) {
      await Haptics.selectionAsync();
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Não foi possível ativar', 'A autenticação biométrica não foi confirmada.');
    }
  };

  const onTestBiometry = async () => {
    const ok = await tryBiometricUnlock();
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'Biometria validada. Sessão restaurada.');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Falha', 'Biometria não validada ou nenhum usuário salvo.');
    }
  };

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyPinValue, setVerifyPinValue] = useState('');

  const doVerifyPin = async () => {
    const ok = await verifyPin(verifyPinValue);
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'PIN validado. Sessão restaurada.');
      setVerifyModalVisible(false);
      setVerifyPinValue('');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Falha', 'PIN incorreto ou nenhum usuário salvo.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000000ff", "#222222ff", "#363636ff"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#eab308" />
          </TouchableOpacity>
          <Text style={styles.title}>Segurança</Text>
        </View>

        <View style={styles.content}>
          <GlassContainer style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.itemTitle}>Biometria</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Switch value={biometryEnabled} onValueChange={onToggleBiometry} thumbColor="#eab308" />
                <TouchableOpacity onPress={onTestBiometry} style={{ padding: 8 }}>
                  <Text style={{ color: '#eab308', fontWeight: '700' }}>Testar</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.itemTitle}>Autenticação em 2 fatores</Text>
              <Switch value={twoFactor} onValueChange={setTwoFactor} thumbColor="#eab308" />
            </View>
            <View style={[styles.row, { marginTop: 6 }]}> 
              <Text style={styles.itemTitle}>PIN de fallback</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setPinModalVisible(true)} style={{ padding: 8, marginRight: 8 }}>
                  <Text style={{ color: '#eab308', fontWeight: '700' }}>{hasPin ? 'Alterar PIN' : 'Definir PIN'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={testPin} style={{ padding: 8 }}>
                  <Text style={{ color: '#94a3b8' }}>Testar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassContainer>

          <Modal visible={pinModalVisible} animationType="slide" transparent>
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
              <View style={{ backgroundColor: '#071124', borderRadius: 12, padding: 16 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 8 }}>Definir PIN</Text>
                <TextInput
                  placeholder="PIN (mín. 4 dígitos)"
                  placeholderTextColor="#64748b"
                  value={pinValue}
                  onChangeText={setPinValue}
                  keyboardType="numeric"
                  secureTextEntry
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 }}
                />
                <TextInput
                  placeholder="Confirmar PIN"
                  placeholderTextColor="#64748b"
                  value={pinConfirm}
                  onChangeText={setPinConfirm}
                  keyboardType="numeric"
                  secureTextEntry
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => { setPinModalVisible(false); setPinValue(''); setPinConfirm(''); }} style={{ marginRight: 12 }}>
                    <Text style={{ color: '#94a3b8' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={savePin}>
                    <Text style={{ color: '#eab308', fontWeight: '700' }}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
          
          <Modal visible={verifyModalVisible} animationType="slide" transparent>
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
              <View style={{ backgroundColor: '#071124', borderRadius: 12, padding: 16 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 8 }}>Verificar PIN</Text>
                <TextInput
                  placeholder="Digite seu PIN"
                  placeholderTextColor="#64748b"
                  value={verifyPinValue}
                  onChangeText={setVerifyPinValue}
                  keyboardType="numeric"
                  secureTextEntry
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => { setVerifyModalVisible(false); setVerifyPinValue(''); }} style={{ marginRight: 12 }}>
                    <Text style={{ color: '#94a3b8' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={doVerifyPin}>
                    <Text style={{ color: '#eab308', fontWeight: '700' }}>Verificar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
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
