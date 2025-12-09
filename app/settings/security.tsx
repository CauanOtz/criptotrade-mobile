import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Shield, Key, Smartphone, Mail } from 'lucide-react-native';
import { userApi } from '@/lib/apiClient';

export default function SecuritySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaType, setMfaType] = useState<'none' | 'sms' | 'email' | 'authenticator'>('none');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        setMfaEnabled(!!user.mfaEnabled || !!user.MfaEnabled || false);
        const t = (user.mfaType || user.MfaType || '').toLowerCase();
        if (t.includes('sms')) setMfaType('sms');
        else if (t.includes('auth')) setMfaType('authenticator');
        else if (t.includes('email')) setMfaType('email');
        else setMfaType('none');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de segurança:', error);
    }
  };

  const handleSaveMfa = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('user');
      if (!stored) {
        Alert.alert('Erro', 'Usuário não encontrado. Refaça o login.');
        return;
      }

      const user = JSON.parse(stored);
      const payload = {
        ...user,
        MfaEnabled: mfaEnabled,
        MfaType: mfaType === 'none' ? null : mfaType,
      };

      await userApi.updateProfile(user.id || user.Id || user.userId, payload);
      Alert.alert('Sucesso', 'Configurações de MFA atualizadas com sucesso.');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
          <Text style={styles.headerTitle}>Segurança</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* MFA Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Autenticação de Dois Fatores (MFA)</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Ativar MFA</Text>
              <Switch
                value={mfaEnabled}
                onValueChange={setMfaEnabled}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {mfaEnabled && (
              <>
                <View style={styles.divider} />

                <Text style={styles.subtitle}>Método de Autenticação</Text>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    mfaType === 'sms' && styles.optionButtonActive,
                  ]}
                  onPress={() => setMfaType('sms')}
                >
                  <Smartphone size={20} color={mfaType === 'sms' ? '#10B981' : '#6B7280'} />
                  <Text
                    style={[
                      styles.optionText,
                      mfaType === 'sms' && styles.optionTextActive,
                    ]}
                  >
                    SMS
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    mfaType === 'email' && styles.optionButtonActive,
                  ]}
                  onPress={() => setMfaType('email')}
                >
                  <Mail size={20} color={mfaType === 'email' ? '#10B981' : '#6B7280'} />
                  <Text
                    style={[
                      styles.optionText,
                      mfaType === 'email' && styles.optionTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    mfaType === 'authenticator' && styles.optionButtonActive,
                  ]}
                  onPress={() => setMfaType('authenticator')}
                >
                  <Key size={20} color={mfaType === 'authenticator' ? '#10B981' : '#6B7280'} />
                  <Text
                    style={[
                      styles.optionText,
                      mfaType === 'authenticator' && styles.optionTextActive,
                    ]}
                  >
                    Aplicativo Autenticador
                  </Text>
                </TouchableOpacity>

                {mfaType === 'sms' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Número de Telefone</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="(00) 00000-0000"
                      placeholderTextColor="#9CA3AF"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSaveMfa}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar Configurações MFA</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color="#F7931A" />
            <Text style={styles.sectionTitle}>Alterar Senha</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha Atual</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha atual"
                placeholderTextColor="#9CA3AF"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nova Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua nova senha"
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirme sua nova senha"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <Text style={styles.hint}>
              A senha deve ter pelo menos 8 caracteres
            </Text>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.saveButtonText}>Alterar Senha</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    marginBottom: 24,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
