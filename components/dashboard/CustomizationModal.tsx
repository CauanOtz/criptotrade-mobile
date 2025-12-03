import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView
} from 'react-native';
import { X, RotateCcw, Check } from 'lucide-react-native';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLayout: Record<string, string[]>;
  onToggleComponent: (sectionId: string, componentId: string) => void;
  onReset: () => void;
  onSave: () => void;
}

export function CustomizationModal({ isOpen, onClose, userLayout, onToggleComponent, onReset, onSave }: CustomizationModalProps) {
  const sections = [
    { 
      id: 'topSection', 
      title: 'Seção Superior', 
      components: [
        { id: 'welcome', title: 'Boas-vindas' },
        { id: 'trendingCoins', title: 'Moedas em Tendência' },
        { id: 'tradingTips', title: 'Dicas de Trading' }
      ]
    },
    { 
      id: 'middleSection', 
      title: 'Estatísticas', 
      components: [
        { id: 'portfolioValue', title: 'Valor do Portfólio' },
        { id: 'dailyProfit', title: 'Lucro Diário' },
        { id: '24hChange', title: 'Variação 24h' },
      ]
    },
    { 
      id: 'mainContent', 
      title: 'Conteúdo Principal', 
      components: [
        { id: 'chart', title: 'Gráfico de Preços' },
        { id: 'marketOverview', title: 'Visão Geral do Mercado' },
        { id: 'topGainers', title: 'Maiores Altas' },
        { id: 'topLosers', title: 'Maiores Baixas' }
      ]
    }
  ];

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Personalizar Painel</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {sections.map(section => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.components.map(comp => {
                const isEnabled = userLayout[section.id]?.includes(comp.id);
                return (
                  <View key={comp.id} style={styles.row}>
                    <Text style={styles.label}>{comp.title}</Text>
                    <Switch
                      value={isEnabled}
                      onValueChange={() => onToggleComponent(section.id, comp.id)}
                      trackColor={{ false: '#E5E7EB', true: '#F7931A' }}
                      thumbColor={'#FFF'}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
            <RotateCcw size={18} color="#6B7280" />
            <Text style={styles.resetText}>Padrão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <Check size={18} color="#FFF" />
            <Text style={styles.saveText}>Salvar</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 16,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  resetText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F7931A',
  },
  saveText: {
    color: '#FFF',
    fontWeight: '600',
  },
});