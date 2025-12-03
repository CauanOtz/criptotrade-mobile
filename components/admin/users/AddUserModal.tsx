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
import { UserPlus, X, Mail, Phone, MapPin, Lock, User } from 'lucide-react-native';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    role: 'user' | 'admin';
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function AddUserModal({ isOpen, onClose, formData, setFormData, onSubmit, loading }: AddUserModalProps) {
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
              <UserPlus size={24} color="#F7931A" />
              <Text style={styles.title}>Novo Usuário</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  value={formData.name}
                  onChangeText={(t) => setFormData({...formData, name: t})}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="email@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(t) => setFormData({...formData, email: t})}
                />
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(t) => setFormData({...formData, phone: t})}
                />
              </View>
            </View>

            {/* Endereço */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Endereço</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Endereço completo"
                  value={formData.address}
                  onChangeText={(t) => setFormData({...formData, address: t})}
                />
              </View>
            </View>

            {/* Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(t) => setFormData({...formData, password: t})}
                />
              </View>
            </View>

            {/* Role Selection (Simples) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Função</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, formData.role === 'user' && styles.roleActive]}
                  onPress={() => setFormData({...formData, role: 'user'})}
                >
                  <Text style={[styles.roleText, formData.role === 'user' && styles.roleTextActive]}>Usuário</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, formData.role === 'admin' && styles.roleActive]}
                  onPress={() => setFormData({...formData, role: 'admin'})}
                >
                  <Text style={[styles.roleText, formData.role === 'admin' && styles.roleTextActive]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Criando...' : 'Criar Usuário'}</Text>
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
    height: '85%',
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
    flex: 1,
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  roleActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F7931A',
  },
  roleText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#F7931A',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: 20,
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