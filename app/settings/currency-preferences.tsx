import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, Eye, Check } from 'lucide-react-native';

export default function CurrencyPreferencesSettings() {
  const router = useRouter();
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [displayCurrency, setDisplayCurrency] = useState('BTC');

  const fiatCurrencies = [
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'JPY', name: 'Iene Japonês', symbol: '¥' },
  ];

  const cryptoCurrencies = [
    { code: 'BTC', name: 'Bitcoin' },
    { code: 'ETH', name: 'Ethereum' },
    { code: 'ADA', name: 'Cardano' },
    { code: 'DOT', name: 'Polkadot' },
  ];

  const handleSave = () => {
    Alert.alert(
      'Preferências Salvas',
      `Moeda preferida: ${preferredCurrency}\nMoeda de exibição: ${displayCurrency}`
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
          <Text style={styles.headerTitle}>Preferências de Moeda</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Preferred Currency Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={24} color="#F7931A" />
            <Text style={styles.sectionTitle}>Moeda Preferida</Text>
          </View>

          <View style={styles.optionsContainer}>
            {fiatCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.optionCard,
                  preferredCurrency === currency.code && styles.optionCardActive,
                ]}
                onPress={() => setPreferredCurrency(currency.code)}
              >
                <View style={styles.optionContent}>
                  <View>
                    <Text style={styles.optionCode}>
                      {currency.symbol} {currency.code}
                    </Text>
                    <Text style={styles.optionName}>{currency.name}</Text>
                  </View>
                  {preferredCurrency === currency.code && (
                    <View style={styles.checkIcon}>
                      <Check size={20} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Display Currency Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Moeda de Exibição</Text>
          </View>

          <View style={styles.optionsContainer}>
            {cryptoCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.optionCard,
                  displayCurrency === currency.code && styles.optionCardActive,
                ]}
                onPress={() => setDisplayCurrency(currency.code)}
              >
                <View style={styles.optionContent}>
                  <View>
                    <Text style={styles.optionCode}>{currency.code}</Text>
                    <Text style={styles.optionName}>{currency.name}</Text>
                  </View>
                  {displayCurrency === currency.code && (
                    <View style={styles.checkIcon}>
                      <Check size={20} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <DollarSign size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Salvar Preferências</Text>
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
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: '#F7931A',
    backgroundColor: '#FFF7ED',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7931A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#F7931A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
