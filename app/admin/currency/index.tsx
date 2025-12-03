import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Plus, 
  Coins, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  RefreshCcw,
  Download // Ícone para Importar
} from 'lucide-react-native';

// Importação dos Modais
import { AddCurrencyModal } from '@/components/admin/currency/AddCurrencyModal';
import { EditCurrencyModal } from '@/components/admin/currency/EditCurrencyModal';
import { DeleteCurrencyModal } from '@/components/admin/currency/DeleteCurrencyModal';
import { ImportCurrencyModal } from '@/components/admin/currency/ImportCurrencyModal';

// Mock Data
const MOCK_CURRENCIES = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', backing: 'Native', status: 'active' },
  { id: '2', symbol: 'ETH', name: 'Ethereum', backing: 'Native', status: 'active' },
  { id: '3', symbol: 'USDT', name: 'Tether', backing: 'USD', status: 'active' },
  { id: '4', symbol: 'BRL', name: 'Real Brasileiro', backing: 'Fiat', status: 'active' },
];

export default function CurrencyScreen() {
  const router = useRouter();
  const [currencies, setCurrencies] = useState(MOCK_CURRENCIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados dos Modais
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [formData, setFormData] = useState({ symbol: '', name: '', backing: '', status: 'active' });

  // --- Handlers ---

  const handleAddSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrencies([...currencies, { id: String(Date.now()), ...formData }]);
      setLoading(false);
      setAddOpen(false);
      setFormData({ symbol: '', name: '', backing: '', status: 'active' });
    }, 1000);
  };

  const handleEditSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrencies(currencies.map(c => c.id === selectedCurrency.id ? { ...c, ...formData } : c));
      setLoading(false);
      setEditOpen(false);
    }, 1000);
  };

  const handleDeleteSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrencies(currencies.filter(c => c.id !== selectedCurrency.id));
      setLoading(false);
      setDeleteOpen(false);
    }, 1000);
  };

  const handleImportSubmit = (importedCoin: any) => {
    setLoading(true);
    setTimeout(() => {
      setCurrencies([...currencies, { 
        id: String(Date.now()), 
        symbol: importedCoin.symbol, 
        name: importedCoin.name, 
        backing: importedCoin.backing, 
        status: 'active' 
      }]);
      setLoading(false);
      setImportOpen(false);
    }, 1000);
  };

  const openEdit = (currency: any) => {
    setSelectedCurrency(currency);
    setFormData(currency);
    setEditOpen(true);
  };

  const openDelete = (currency: any) => {
    setSelectedCurrency(currency);
    setDeleteOpen(true);
  };

  const filteredCurrencies = currencies.filter(c => 
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Text style={styles.title}>Gerenciar Moedas</Text>
          <div style={{flexDirection: 'row', gap: 8}}>
             <TouchableOpacity style={styles.iconBtn} onPress={() => setImportOpen(true)}>
               <Download size={20} color="#F7931A" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)}>
               <Plus size={20} color="#FFF" />
             </TouchableOpacity>
          </div>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar moeda (BTC, USD...)"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Lista */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredCurrencies.map((currency) => (
          <View key={currency.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.currencyInfo}>
                <View style={styles.iconPlaceholder}>
                  <Text style={styles.iconText}>{currency.symbol.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.symbol}>{currency.symbol}</Text>
                  <Text style={styles.name}>{currency.name}</Text>
                </View>
              </View>
              <View style={[styles.badge, currency.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, currency.status === 'active' ? styles.textActive : styles.textInactive]}>
                  {currency.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardDetails}>
              <Text style={styles.detailLabel}>Backing: <Text style={styles.detailValue}>{currency.backing}</Text></Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(currency)}>
                <Edit2 size={18} color="#6B7280" />
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              
              <View style={styles.verticalDivider} />
              
              <TouchableOpacity style={styles.actionBtn} onPress={() => openDelete(currency)}>
                <Trash2 size={18} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {filteredCurrencies.length === 0 && (
          <View style={styles.emptyState}>
            <Coins size={48} color="#E5E7EB" />
            <Text style={styles.emptyText}>Nenhuma moeda encontrada</Text>
          </View>
        )}
      </ScrollView>

      {/* Modais */}
      <AddCurrencyModal 
        isOpen={isAddOpen} 
        onClose={() => setAddOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        loading={loading}
      />

      <EditCurrencyModal 
        isOpen={isEditOpen} 
        onClose={() => setEditOpen(false)}
        currency={selectedCurrency}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        loading={loading}
      />

      <DeleteCurrencyModal 
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteSubmit}
        loading={loading}
        currency={selectedCurrency}
      />

      <ImportCurrencyModal 
        isOpen={isImportOpen}
        onClose={() => setImportOpen(false)}
        onConfirm={handleImportSubmit}
        loading={loading}
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  card: {
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
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7931A',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  name: {
    fontSize: 13,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeActive: { backgroundColor: '#DBEAFE' },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textActive: { color: '#2563EB' },
  textInactive: { color: '#DC2626' },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    color: '#111827',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 16,
  },
});