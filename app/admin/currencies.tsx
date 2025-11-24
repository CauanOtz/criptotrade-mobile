import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { GlassContainer } from '@/components/GlassContainer';
import { currencyApi, marketApi } from '@/lib/apiClient';
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Download,
  X,
  Search,
} from 'lucide-react-native';

interface CurrencyRecord {
  id?: string;
  symbol: string;
  name: string;
  backing: string;
  status: string;
}

interface ImportableCoin {
  symbol: string;
  name: string;
  backing?: string;
  status?: string;
}

const initialForm: CurrencyRecord = {
  id: undefined,
  symbol: '',
  name: '',
  backing: 'CRYPTO',
  status: 'ACTIVE',
};

type CurrencyAdminScreenProps = {
  screenTitle?: string;
};

export default function CurrencyAdminScreen({ screenTitle = 'Moedas — Admin' }: CurrencyAdminScreenProps = {}) {
  const router = useRouter();
  const [currencies, setCurrencies] = useState<CurrencyRecord[]>([]);
  const [form, setForm] = useState<CurrencyRecord>(initialForm);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [importVisible, setImportVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importCoins, setImportCoins] = useState<ImportableCoin[]>([]);
  const [importSearch, setImportSearch] = useState('');
  const [importingSymbol, setImportingSymbol] = useState<string | null>(null);

  const fetchCurrencies = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await currencyApi.getAllCurrencies();
      const data = (response?.data ?? response ?? []) as any[];
      const mapped = data.map(item => ({
        id: item.id || item.Id,
        symbol: (item.symbol || item.Symbol || '').toString().toUpperCase(),
        name: item.name || item.Name || '',
        backing: item.backing || item.Backing || 'CRYPTO',
        status: item.status || item.Status || 'ACTIVE',
      })) as CurrencyRecord[];
      setCurrencies(mapped);
    } catch (error) {
      console.warn('Failed to load currencies', error);
      Alert.alert('Erro', 'Não foi possível carregar as moedas cadastradas.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCurrencies();
    }, [fetchCurrencies])
  );

  const handleFormChange = (key: keyof CurrencyRecord, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleSubmit = async () => {
    if (!form.symbol.trim() || !form.name.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe ao menos o símbolo e o nome.');
      return;
    }

    const payload = {
      symbol: form.symbol.trim().toUpperCase(),
      name: form.name.trim(),
      backing: form.backing.trim() || 'CRYPTO',
      status: form.status.trim() || 'ACTIVE',
    };

    setSubmitting(true);
    try {
      if (form.id) {
        await currencyApi.updateCurrency(form.id as string, payload);
      } else {
        await currencyApi.createCurrency(payload);
      }
      await fetchCurrencies();
      resetForm();
    } catch (error) {
      console.warn('Failed to persist currency', error);
      Alert.alert('Erro', 'Não foi possível salvar a moeda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record: CurrencyRecord) => {
    setForm(record);
  };

  const handleDelete = (record: CurrencyRecord) => {
    if (!record.id) return;
    Alert.alert(
      'Remover moeda',
      `Deseja remover ${record.symbol}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await currencyApi.deleteCurrency(record.id as string);
              await fetchCurrencies();
              if (form.id === record.id) resetForm();
            } catch (error) {
              console.warn('Failed to delete currency', error);
              Alert.alert('Erro', 'Não foi possível remover esta moeda.');
            }
          },
        },
      ]
    );
  };

  const openImportModal = () => {
    setImportVisible(true);
    if (!importCoins.length) {
      loadImportableCoins();
    }
  };

  const closeImportModal = () => {
    setImportVisible(false);
    setImportSearch('');
    setImportingSymbol(null);
  };

  const loadImportableCoins = async () => {
    setImportLoading(true);
    try {
      const response = await marketApi.getAllCryptos();
      const data = (response?.data ?? response ?? []) as any[];
      const parsed = data
        .map(item => {
          const symbol = (item.symbol || item.Symbol || '').toString().toUpperCase();
          const name = item.name || item.Name || symbol;
          if (!symbol) return null;
          return {
            symbol,
            name,
            backing: item.backing || item.chain || item.network || 'CRYPTO',
            status: 'ACTIVE',
          } as ImportableCoin;
        })
        .filter(Boolean) as ImportableCoin[];
      setImportCoins(parsed);
    } catch (error) {
      console.warn('Import list failed', error);
      Alert.alert('Erro', 'Não foi possível carregar as moedas da Crypto API.');
    } finally {
      setImportLoading(false);
    }
  };

  const existingSymbols = useMemo(
    () => new Set(currencies.map(item => item.symbol.toUpperCase())),
    [currencies]
  );

  const handleImportCoin = async (coin: ImportableCoin) => {
    if (existingSymbols.has(coin.symbol)) {
      Alert.alert('Moeda já cadastrada', `${coin.symbol} já existe na lista.`);
      return;
    }
    setImportingSymbol(coin.symbol);
    try {
      await currencyApi.createCurrency({
        symbol: coin.symbol,
        name: coin.name,
        backing: coin.backing || 'CRYPTO',
        status: coin.status || 'ACTIVE',
      });
      await fetchCurrencies();
      setImportingSymbol(null);
      setImportVisible(false);
      setImportSearch('');
    } catch (error) {
      console.warn('Failed to import coin', error);
      Alert.alert('Erro', `Não foi possível importar ${coin.symbol}.`);
      setImportingSymbol(null);
    }
  };

  const filteredCurrencies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return currencies;
    return currencies.filter(item =>
      item.symbol.toLowerCase().includes(term) ||
      item.name.toLowerCase().includes(term)
    );
  }, [currencies, search]);

  const filteredImportCoins = useMemo(() => {
    const term = importSearch.trim().toLowerCase();
    if (!term) return importCoins;
    return importCoins.filter(item =>
      item.symbol.toLowerCase().includes(term) ||
      item.name.toLowerCase().includes(term)
    );
  }, [importCoins, importSearch]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000ff', '#222222ff', '#363636ff']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#eab308" />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchCurrencies}>
              {loadingList ? (
                <ActivityIndicator color="#eab308" />
              ) : (
                <RefreshCw size={18} color="#eab308" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{screenTitle}</Text>

          <GlassContainer style={styles.formCard}>
            <Text style={styles.formTitle}>{form.id ? 'Editar Moeda' : 'Cadastrar nova moeda'}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Símbolo*</Text>
              <TextInput
                placeholder="EX: BRL"
                placeholderTextColor="#64748b"
                style={styles.input}
                autoCapitalize="characters"
                value={form.symbol}
                onChangeText={text => handleFormChange('symbol', text)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome*</Text>
              <TextInput
                placeholder="Nome completo"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={form.name}
                onChangeText={text => handleFormChange('name', text)}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.half]}>
                <Text style={styles.label}>Backing</Text>
                <TextInput
                  placeholder="CRYPTO / FIAT"
                  placeholderTextColor="#64748b"
                  style={styles.input}
                  value={form.backing}
                  onChangeText={text => handleFormChange('backing', text)}
                />
              </View>
              <View style={[styles.inputGroup, styles.half]}>
                <Text style={styles.label}>Status</Text>
                <TextInput
                  placeholder="ACTIVE / INACTIVE"
                  placeholderTextColor="#64748b"
                  style={styles.input}
                  value={form.status}
                  onChangeText={text => handleFormChange('status', text)}
                />
              </View>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={resetForm}
                disabled={submitting}
              >
                <X size={16} color="#f8fafc" />
                <Text style={styles.actionText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#071124" />
                ) : form.id ? (
                  <Save size={16} color="#071124" />
                ) : (
                  <Plus size={16} color="#071124" />
                )}
                <Text style={[styles.actionText, styles.primaryText]}>
                  {form.id ? 'Salvar alterações' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassContainer>

          <GlassContainer style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Moedas cadastradas</Text>
              <TouchableOpacity style={styles.importButton} onPress={openImportModal}>
                <Download size={16} color="#071124" />
                <Text style={styles.importText}>Importar da Crypto API</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Search size={16} color="#64748b" />
              <TextInput
                placeholder="Buscar por símbolo ou nome"
                placeholderTextColor="#64748b"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {loadingList && !currencies.length ? (
              <View style={styles.placeholder}>
                <ActivityIndicator color="#eab308" />
                <Text style={styles.placeholderText}>Carregando...</Text>
              </View>
            ) : filteredCurrencies.length === 0 ? (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Nenhuma moeda encontrada.</Text>
              </View>
            ) : (
              filteredCurrencies.map(item => (
                <View key={item.id || item.symbol} style={styles.currencyRow}>
                  <View>
                    <Text style={styles.currencySymbol}>{item.symbol}</Text>
                    <Text style={styles.currencyName}>{item.name}</Text>
                    <Text style={styles.currencyMeta}>{item.backing} • {item.status}</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                      <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </GlassContainer>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={importVisible}
        animationType="slide"
        transparent
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={closeImportModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Importar moedas</Text>
                <Text style={styles.modalSubtitle}>Escolha um ativo vindo direto da Crypto API</Text>
              </View>
              <TouchableOpacity onPress={closeImportModal}>
                <X size={20} color="#f8fafc" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Search size={16} color="#64748b" />
              <TextInput
                placeholder="Buscar na Crypto API"
                placeholderTextColor="#64748b"
                style={styles.searchInput}
                value={importSearch}
                onChangeText={setImportSearch}
              />
            </View>
            {importLoading ? (
              <View style={[styles.placeholder, styles.fullHeightPlaceholder]}>
                <ActivityIndicator color="#eab308" />
                <Text style={styles.placeholderText}>Sincronizando com a Crypto API...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredImportCoins}
                keyExtractor={item => item.symbol}
                style={styles.importList}
                contentContainerStyle={filteredImportCoins.length ? undefined : styles.fullHeightPlaceholder}
                renderItem={({ item }) => {
                  const disabled = existingSymbols.has(item.symbol);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.importItem,
                        disabled && styles.importItemDisabled,
                      ]}
                      disabled={disabled || importingSymbol === item.symbol}
                      onPress={() => handleImportCoin(item)}
                    >
                      <View>
                        <Text style={styles.currencySymbol}>{item.symbol}</Text>
                        <Text style={styles.currencyName}>{item.name}</Text>
                        <Text style={styles.currencyMeta}>{item.backing || 'CRYPTO'}</Text>
                      </View>
                      {disabled ? (
                        <Text style={styles.alreadyText}>Já importada</Text>
                      ) : importingSymbol === item.symbol ? (
                        <ActivityIndicator color="#eab308" />
                      ) : (
                        <Text style={styles.importCTA}>Importar</Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  formCard: {
    gap: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  primaryButton: {
    backgroundColor: '#facc15',
  },
  primaryText: {
    color: '#071124',
  },
  actionText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  listCard: {
    paddingBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  importButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#facc15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  importText: {
    fontWeight: '600',
    color: '#071124',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#000000',
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  placeholderText: {
    color: '#94a3b8',
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  currencyName: {
    color: '#94a3b8',
  },
  currencyMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.4)',
  },
  editText: {
    color: '#facc15',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 3, 8, 0.9)',
    justifyContent: 'flex-end',
    paddingTop: 48,
  },
  modalCard: {
    backgroundColor: 'rgba(10,15,25,0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 32,
    height: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  modalSubtitle: {
    color: '#94a3b8',
    marginTop: 4,
  },
  importItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importItemDisabled: {
    opacity: 0.4,
  },
  importList: {
    marginTop: 16,
    flex: 1,
  },
  fullHeightPlaceholder: {
    flex: 1,
    justifyContent: 'center',
  },
  alreadyText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  importCTA: {
    color: '#facc15',
    fontWeight: '600',
  },
});
