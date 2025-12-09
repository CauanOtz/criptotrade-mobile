import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface ModalUpdatePhotoProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (file: any) => void;
  currentPhoto?: string;
}

export function ModalUpdatePhoto({ visible, onClose, onUpdate, currentPhoto }: ModalUpdatePhotoProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setSelectedFile(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      await onUpdate(selectedFile);
      onClose();
      setSelectedImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating photo:', error);
      Alert.alert('Erro', 'Falha ao atualizar foto de perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Atualizar Foto de Perfil</Text>
          <Text style={styles.subtitle}>
            Escolha uma nova foto de perfil. Tamanho recomendado: 400x400px
          </Text>

          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: selectedImage || currentPhoto || 'https://via.placeholder.com/150' }}
                style={styles.image}
              />
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Upload size={20} color="#F7931A" />
              <Text style={styles.uploadText}>Enviar nova foto</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
              Formatos suportados: JPG, PNG (máx. 2MB)
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, (!selectedFile || isLoading) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.saveButtonText}>Atualizando...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>Atualizar Foto</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageWrapper: {
    width: 128,
    height: 128,
    borderRadius: 64,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#F7931A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7931A',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#F7931A',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
