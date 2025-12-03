import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Plus, X, Type, DollarSign, Activity } from 'lucide-react-native';

export interface CurrencyFormData {
  symbol: string;
  name: string;
  backing: string;
  status: string;
}

// 2. Definir as Props que o componente aceita
interface AddCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: CurrencyFormData;
  setFormData: React.Dispatch<React.SetStateAction<CurrencyFormData>>;
  onSubmit: () => void;
  loading: boolean;
}

export function AddCurrencyModal({ isOpen, onClose, formData, setFormData, onSubmit, loading }: AddCurrencyModalProps) {
  if (!isOpen) return null;
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Plus size={24} color="#F7931A" />
              <Text style={styles.title}>Nova Moeda</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Símbolo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Símbolo (Ex: BTC)</Text>
              <View style={styles.inputContainer}>
                <Type size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="BTC"
                  autoCapitalize="characters"
                  value={formData.symbol}
                  onChangeText={(t) => setFormData({...formData, symbol: t.toUpperCase()})}
                />
              </View>
            </View>

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputContainer}>
                <Type size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Bitcoin"
                  value={formData.name}
                  onChangeText={(t) => setFormData({...formData, name: t})}
                />
              </View>
            </View>

            {/* Backing */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lastro (Backing)</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Native, USD, Gold..."
                  value={formData.backing}
                  onChangeText={(t) => setFormData({...formData, backing: t})}
                />
              </View>
            </View>

            {/* Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, formData.status === 'active' && styles.roleActive]}
                  onPress={() => setFormData({...formData, status: 'active'})}
                >
                  <Activity size={16} color={formData.status === 'active' ? '#10B981' : '#6B7280'} style={{marginRight:6}}/>
                  <Text style={[styles.roleText, formData.status === 'active' && styles.roleTextActive]}>Ativo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, formData.status === 'inactive' && styles.roleActive]}
                  onPress={() => setFormData({...formData, status: 'inactive'})}
                >
                  <Activity size={16} color={formData.status === 'inactive' ? '#EF4444' : '#6B7280'} style={{marginRight:6}}/>
                  <Text style={[styles.roleText, formData.status === 'inactive' && styles.roleTextInactive]}>Inativo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Salvando...' : 'Criar Moeda'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '80%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  formScroll: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleActive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  roleText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  roleTextActive: { color: '#10B981' },
  roleTextInactive: { color: '#EF4444' },
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
  submitText: {
    color: '#FFF',
    fontWeight: '600',
  },
});