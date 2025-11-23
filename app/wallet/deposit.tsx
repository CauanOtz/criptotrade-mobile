import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '@/components/GlassContainer';
import { useRouter } from 'expo-router';
import { wallet2Api } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

export default function DepositScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDT');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!value || value <= 0) {
      Alert.alert('Valor inválido', 'Insira um valor maior que zero');
      return;
    }
    setLoading(true);
    try {
      await wallet2Api.adjustBalance(asset, value);
      Alert.alert('Sucesso', 'Depósito registrado com sucesso');
      router.back();
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Não foi possível completar o depósito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#000000ff', '#222222ff', '#363636ff']} style={StyleSheet.absoluteFill}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.screen}>
        <View style={styles.headerArea}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>Depositar</Text>
            <Text style={styles.pageSubtitle}>Adicionar saldo à sua carteira</Text>
          </View>
        </View>

        <GlassContainer style={styles.formCard}>
          <Text style={styles.label}>Selecionar ativo</Text>
          <View style={styles.assetRow}>
            <TouchableOpacity style={[styles.assetButton, asset === 'BRL' && styles.assetButtonActive]} onPress={() => setAsset('BRL')}>
              <Text style={[styles.assetText, asset === 'BRL' && styles.assetTextActive]}>BRL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.assetButton, asset === 'USDT' && styles.assetButtonActive]} onPress={() => setAsset('USDT')}>
              <Text style={[styles.assetText, asset === 'USDT' && styles.assetTextActive]}>USDT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.assetButton, asset === 'USD' && styles.assetButtonActive]} onPress={() => setAsset('USD')}>
              <Text style={[styles.assetText, asset === 'USD' && styles.assetTextActive]}>USD</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Valor</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#64748b"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />

          <Text style={styles.help}>O depósito será registrado e refletido no seu saldo disponível.</Text>

          <TouchableOpacity style={styles.submit} onPress={submit} disabled={loading}>
            <LinearGradient colors={["#f59e0b", "#eab308"]} style={styles.submitGradient}>
              <Text style={styles.submitText}>{loading ? 'Processando...' : `Depositar ${asset}`}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassContainer>

        <View style={{ height: 20 }} />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  headerArea: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  pageSubtitle: {
    color: '#94a3b8',
    marginTop: 6,
  },
  formCard: {
    padding: 18,
    marginTop: 12,
  },
  label: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  assetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  assetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  assetButtonActive: {
    backgroundColor: '#eab308',
  },
  assetText: {
    color: '#d1d5db',
    fontWeight: '600',
  },
  assetTextActive: {
    color: '#071124',
  },
  input: {
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
  },
  help: {
    color: '#64748b',
    marginBottom: 16,
  },
  submit: {
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#071124',
    fontWeight: '700',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  bottomTabs: {
    display: 'none',
  },
  tabButton: {
    display: 'none',
  },
  tabButtonActive: {
    display: 'none',
  },
  tabLabel: {
    display: 'none',
  },
  tabLabelActive: {
    display: 'none',
  },
});
