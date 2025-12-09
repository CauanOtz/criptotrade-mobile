import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Phone,
  Globe,
  User,
  Mail,
  Save,
  Shield,
  AlertTriangle,
} from 'lucide-react-native';
import { ModalDeactivate } from '@/components/settings/ModalDeactivate';
import { ModalDeleteAccount } from '@/components/settings/ModalDeleteAccount';
import { ModalUpdatePhoto } from '@/components/settings/ModalUpdatePhoto';
import { userApi } from '@/lib/apiClient';
import axios from 'axios';

export default function ProfileSettings() {
  const { user } = useAuth();
  const router = useRouter();

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    website: user?.website || '',
    bio: user?.bio || '',
    photo: user?.photo || '',
  });

  const [address, setAddress] = useState({
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getProfile(user.id);
      const userData = response.data;

      setFormData({
        fullName: userData.name || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        website: userData.website || '',
        bio: userData.bio || '',
        photo: userData.photo || '',
      });

      if (userData.address) {
        const addressParts = userData.address.split(',').map((part: string) => part.trim());
        setAddress({
          street: addressParts[0] || '',
          neighborhood: addressParts[1] || '',
          city: addressParts[2] || '',
          state: addressParts[3] || '',
          cep: addressParts[4]?.replace('CEP: ', '') || '',
        });
      }

      calculateProfileProgress(userData);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfileProgress = (userData: any) => {
    const fields = [
      userData.name,
      userData.username,
      userData.email,
      userData.phone,
      userData.address,
      userData.website,
      userData.bio,
      userData.photo,
    ];

    const completedFields = fields.filter((field) => field && field.trim() !== '').length;
    const percentage = Math.round((completedFields / fields.length) * 100);
    setProgress(percentage);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCEPChange = async (cep: string) => {
    setAddress((prev) => ({ ...prev, cep }));

    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = response.data;

        if (!data.erro) {
          setAddress((prev) => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
      }
    }
  };

  const handleAddressChange = (name: string, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const fullAddress = [
        address.street,
        address.neighborhood,
        address.city,
        address.state,
        address.cep,
      ]
        .filter(Boolean)
        .join(', ');

      const updatedUserData = {
        id: user.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        photo: formData.photo,
        website: formData.website,
        bio: formData.bio,
        username: formData.username,
        role: user.role,
      };

      await userApi.updateProfile(user.id, updatedUserData);
      Alert.alert('Sucesso', 'Seu perfil foi atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Falha ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhoto = async (file: any) => {
    try {
      await userApi.updatePhoto(user.id, file);
      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      await fetchUserProfile();
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      Alert.alert('Erro', 'Falha ao atualizar foto de perfil.');
    }
  };

  const handleDeactivate = (days: number) => {
    console.log(`Conta será desativada por ${days} dias.`);
    Alert.alert('Conta Desativada', `Sua conta será desativada por ${days} dias.`);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await userApi.deleteAccount(user.id);
      Alert.alert('Conta Excluída', 'Sua conta foi excluída com sucesso.');
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      Alert.alert('Erro', 'Falha ao excluir conta. Tente novamente.');
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F7931A" />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Configurações de Perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Completude do Perfil</Text>
            <Text style={styles.progressPercentage}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            Complete seu perfil para ter uma experiência melhor
          </Text>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={() => setIsPhotoModalOpen(true)}
          >
            <Image
              source={{
                uri: formData.photo || 'https://via.placeholder.com/150',
              }}
              style={styles.photo}
            />
            <View style={styles.cameraIcon}>
              <Camera size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Toque para alterar sua foto</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome completo"
                placeholderTextColor="#9CA3AF"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome de Usuário</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="@usuario"
                placeholderTextColor="#9CA3AF"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefone</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Website</Text>
            <View style={styles.inputContainer}>
              <Globe size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="https://seusite.com"
                placeholderTextColor="#9CA3AF"
                value={formData.website}
                onChangeText={(value) => handleInputChange('website', value)}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Conte um pouco sobre você..."
              placeholderTextColor="#9CA3AF"
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CEP</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="00000-000"
                placeholderTextColor="#9CA3AF"
                value={address.cep}
                onChangeText={handleCEPChange}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rua</Text>
            <TextInput
              style={[styles.input, styles.fullWidthInput]}
              placeholder="Nome da rua"
              placeholderTextColor="#9CA3AF"
              value={address.street}
              onChangeText={(value) => handleAddressChange('street', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bairro</Text>
            <TextInput
              style={[styles.input, styles.fullWidthInput]}
              placeholder="Bairro"
              placeholderTextColor="#9CA3AF"
              value={address.neighborhood}
              onChangeText={(value) => handleAddressChange('neighborhood', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.inputLabel}>Cidade</Text>
              <TextInput
                style={[styles.input, styles.fullWidthInput]}
                placeholder="Cidade"
                placeholderTextColor="#9CA3AF"
                value={address.city}
                onChangeText={(value) => handleAddressChange('city', value)}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex05]}>
              <Text style={styles.inputLabel}>Estado</Text>
              <TextInput
                style={[styles.input, styles.fullWidthInput]}
                placeholder="UF"
                placeholderTextColor="#9CA3AF"
                value={address.state}
                onChangeText={(value) => handleAddressChange('state', value)}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Zona de Perigo</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => setIsDeactivateModalOpen(true)}
          >
            <Shield size={20} color="#F59E0B" />
            <Text style={styles.dangerButtonText}>Desativar Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerButton, styles.deleteButton]}
            onPress={() => setIsDeleteModalOpen(true)}
          >
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={[styles.dangerButtonText, styles.deleteButtonText]}>
              Excluir Conta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <ModalDeactivate
        visible={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onDeactivate={handleDeactivate}
      />
      <ModalDeleteAccount
        visible={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
      <ModalUpdatePhoto
        visible={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUpdate={handleUpdatePhoto}
        currentPhoto={formData.photo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7931A',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F7931A',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#F7931A',
    marginBottom: 12,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F7931A',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  fullWidthInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  flex05: {
    flex: 0.5,
  },
  saveButton: {
    backgroundColor: '#F7931A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerZone: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
});
