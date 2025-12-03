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
  ScrollView,
  Image
} from 'react-native';
import { UserCog, X, Mail, Phone, MapPin, Lock, Camera } from 'lucide-react-native';

export function EditUserModal({ isOpen, onClose, selectedUser, formData, setFormData, onSubmit, loading }: {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  if (!isOpen || !selectedUser) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <UserCog size={24} color="#F7931A" />
              <Text style={styles.title}>Editar Usuário</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Foto de Perfil (Simulada) */}
            <View style={styles.photoSection}>
              <View style={styles.avatarContainer}>
                {selectedUser.photo ? (
                  <Image source={{ uri: selectedUser.photo }} style={styles.avatar} />
                ) : (
                  <Text style={styles.avatarText}>{selectedUser.name?.charAt(0).toUpperCase()}</Text>
                )}
                <TouchableOpacity style={styles.cameraBtn}>
                  <Camera size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Mesmos campos do Add, mas preenchidos */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(t) => setFormData({...formData, name: t})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(t) => setFormData({...formData, email: t})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(t) => setFormData({...formData, phone: t})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Endereço</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(t) => setFormData({...formData, address: t})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nova Senha (opcional)</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Deixe em branco para manter"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(t) => setFormData({...formData, password: t})}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Reutilizar styles do AddUserModal, adicionando apenas os específicos de foto
const styles = StyleSheet.create({
  // ... (Copie os estilos do AddUserModal aqui)
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F7931A',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 32,
    color: '#F7931A',
    fontWeight: 'bold',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F7931A',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});