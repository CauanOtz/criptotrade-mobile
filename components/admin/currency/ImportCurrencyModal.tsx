import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Download, X, CheckCircle } from 'lucide-react-native';

interface ImportCoinData {
  symbol: string;
  name: string;
  backing: string;
}

interface ImportCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coin: ImportCoinData) => void;
  loading: boolean;
  coin?: ImportCoinData | null; // Opcional, mantido para compatibilidade
}

const IMPORTABLE_COINS: ImportCoinData[] = [
  { symbol: 'ADA', name: 'Cardano', backing: 'Native' },
  { symbol: 'SOL', name: 'Solana', backing: 'Native' },
  { symbol: 'DOGE', name: 'Dogecoin', backing: 'Native' },
  { symbol: 'XRP', name: 'Ripple', backing: 'Native' },
];

export function ImportCurrencyModal({ isOpen, onClose, onConfirm, loading }: ImportCurrencyModalProps) {
  const [selectedCoin, setSelectedCoin] = useState<ImportCoinData | null>(null);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Download size={24} color="#F7931A" />
              <Text style={styles.title}>Importar Moeda</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Selecione uma moeda disponível para importar:</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {IMPORTABLE_COINS.map((coin) => (
              <TouchableOpacity
                key={coin.symbol}
                style={[
                  styles.coinItem,
                  selectedCoin?.symbol === coin.symbol && styles.coinItemSelected
                ]}
                onPress={() => setSelectedCoin(coin)}
              >
                <View>
                  <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                  <Text style={styles.coinName}>{coin.name}</Text>
                </View>
                {selectedCoin?.symbol === coin.symbol && (
                  <CheckCircle size={20} color="#F7931A" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitBtn, !selectedCoin && styles.btnDisabled]} 
              onPress={() => selectedCoin && onConfirm(selectedCoin)} 
              disabled={loading || !selectedCoin}
            >
              <Text style={styles.submitText}>
                {loading ? 'Importando...' : 'Importar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '60%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  list: {
    marginBottom: 20,
  },
  coinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  coinItemSelected: {
    borderColor: '#F7931A',
    backgroundColor: '#FFF7ED',
  },
  coinSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  coinName: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F7931A',
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#FED7AA',
  },
  submitText: {
    color: '#FFF',
    fontWeight: '600',
  },
});