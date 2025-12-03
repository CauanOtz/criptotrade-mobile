import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Trash2, 
  Edit, 
  Shield, 
  User, 
  ChevronLeft,
  MoreVertical,
  Eye
} from 'lucide-react-native';

// Importação dos Modais
import { AddUserModal } from '@/components/admin/users/AddUserModal';
import { EditUserModal } from '@/components/admin/users/EditUserModal';
import { DeleteUserModal } from '@/components/admin/users/DeleteUserModal';
import { PreviewUserModal } from '@/components/admin/users/PreviewUserModal';

// Mock Data
const MOCK_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@crypto.com', role: 'admin', status: 'active', phone: '11999999999' },
  { id: '2', name: 'João Silva', email: 'joao@email.com', role: 'user', status: 'active', phone: '11988888888' },
  { id: '3', name: 'Maria Souza', email: 'maria@email.com', role: 'user', status: 'inactive', phone: '11977777777' },
];

export default function UsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados dos Modais
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Estado do Formulário
  const [formData, setFormData] = useState<{ name: string; email: string; phone: string; address: string; role: 'admin' | 'user'; password: string }>({ name: '', email: '', phone: '', address: '', role: 'user', password: '' });

  // Funções de Abertura de Modal
  const openEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({ ...user, password: '' });
    setEditOpen(true);
  };

  const openDelete = (user: any) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const openPreview = (user: any) => {
    setSelectedUser(user);
    setPreviewOpen(true);
  };

  // Funções de Ação (Submit)
  const handleAddSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers([...users, { id: String(Date.now()), ...formData, status: 'active' }]);
      setLoading(false);
      setAddOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '', role: 'user', password: '' });
    }, 1000);
  };

  const handleEditSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
      setLoading(false);
      setEditOpen(false);
    }, 1000);
  };

  const handleDeleteSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setLoading(false);
      setDeleteOpen(false);
    }, 1000);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Gerenciar Usuários</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)}>
            <UserPlus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Lista */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredUsers.map((user) => (
          <TouchableOpacity 
            key={user.id} 
            style={styles.userCard}
            onPress={() => openPreview(user)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>
              
              <View style={[styles.badge, user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser]}>
                {user.role === 'admin' ? <Shield size={12} color="#7C3AED" /> : <User size={12} color="#2563EB" />}
                <Text style={[styles.badgeText, user.role === 'admin' ? styles.textAdmin : styles.textUser]}>
                  {user.role}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openPreview(user)}>
                <Eye size={18} color="#6B7280" />
                <Text style={styles.actionText}>Ver</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(user)}>
                <Edit size={18} color="#6B7280" />
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtn} onPress={() => openDelete(user)}>
                <Trash2 size={18} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modais */}
      <AddUserModal 
        isOpen={isAddOpen} 
        onClose={() => setAddOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        loading={loading}
      />

      <EditUserModal 
        isOpen={isEditOpen} 
        onClose={() => setEditOpen(false)}
        selectedUser={selectedUser}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        loading={loading}
      />

      <DeleteUserModal 
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteSubmit}
        loading={loading}
        userName={selectedUser?.name}
      />

      <PreviewUserModal 
        isOpen={isPreviewOpen}
        onClose={() => setPreviewOpen(false)}
        user={selectedUser}
        onEdit={() => { setPreviewOpen(false); openEdit(selectedUser); }}
        onDelete={() => { setPreviewOpen(false); openDelete(selectedUser); }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7931A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F7931A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7931A',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeAdmin: { backgroundColor: '#EDE9FE' },
  badgeUser: { backgroundColor: '#DBEAFE' },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textAdmin: { color: '#7C3AED' },
  textUser: { color: '#2563EB' },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
});