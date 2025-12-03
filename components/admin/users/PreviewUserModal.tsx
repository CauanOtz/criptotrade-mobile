import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { X, User, Mail, Phone, MapPin, Shield, Edit, Trash2 } from 'lucide-react-native';

interface PreviewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; phone?: string; address?: string; role: 'admin' | 'user'; status: 'active' | 'inactive' } | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function PreviewUserModal({ isOpen, onClose, user, onEdit, onDelete }: PreviewUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Detalhes do Usuário</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <View style={[styles.badge, user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser]}>
              <Text style={[styles.badgeText, user.role === 'admin' ? styles.textAdmin : styles.textUser]}>
                {user.role}
              </Text>
            </View>
          </View>

          {/* Info Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações de Contato</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.iconBg}><Mail size={20} color="#6B7280" /></View>
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBg}><Phone size={20} color="#6B7280" /></View>
              <View>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{user.phone || 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBg}><MapPin size={20} color="#6B7280" /></View>
              <View>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>{user.address || 'Não informado'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.infoRow}>
              <View style={styles.iconBg}><Shield size={20} color="#6B7280" /></View>
              <View>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, { color: user.status === 'active' ? '#10B981' : '#EF4444' }]}>
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.deleteBtnText}>Excluir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
            <Edit size={20} color="#FFF" />
            <Text style={styles.editBtnText}>Editar Usuário</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F7931A',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeAdmin: { backgroundColor: '#EDE9FE' },
  badgeUser: { backgroundColor: '#DBEAFE' },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textAdmin: { color: '#7C3AED' },
  textUser: { color: '#2563EB' },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  editBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F7931A',
  },
  editBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});