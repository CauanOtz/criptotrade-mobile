import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Bitcoin, DollarSign, TrendingUp } from 'lucide-react-native';

export default function PriceNotificationsSettings() {
  const router = useRouter();
  const [btcPrice, setBtcPrice] = useState('');
  const [ethPrice, setEthPrice] = useState('');
  const [adaPrice, setAdaPrice] = useState('');

  const handleSave = () => {
    if (!btcPrice && !ethPrice && !adaPrice) {
      Alert.alert('Atenção', 'Configure pelo menos um alerta de preço.');
      return;
    }

    Alert.alert(
      'Alertas Salvos',
      'Seus alertas de preço foram configurados com sucesso!'
    );
  };

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
          <Text style={styles.headerTitle}>Notificações de Preço</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.description}>
          Configure alertas para ser notificado quando o preço atingir o valor desejado
        </Text>

        {/* Bitcoin Alert */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Bitcoin size={24} color="#F7931A" />
            <Text style={styles.label}>Alerta de Preço do Bitcoin</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o preço"
              placeholderTextColor="#9CA3AF"
              value={btcPrice}
              onChangeText={setBtcPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Ethereum Alert */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <DollarSign size={24} color="#627EEA" />
            <Text style={styles.label}>Alerta de Preço do Ethereum</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o preço"
              placeholderTextColor="#9CA3AF"
              value={ethPrice}
              onChangeText={setEthPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Cardano Alert */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <TrendingUp size={24} color="#0033AD" />
            <Text style={styles.label}>Alerta de Preço do Cardano</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o preço"
              placeholderTextColor="#9CA3AF"
              value={adaPrice}
              onChangeText={setAdaPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Bell size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Salvar Alertas</Text>
        </TouchableOpacity>

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
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  saveButton: {
    backgroundColor: '#F7931A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
