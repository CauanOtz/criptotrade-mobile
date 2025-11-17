import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { GlassContainer } from './GlassContainer';
import { Search } from 'lucide-react-native';

type Coin = {
  id: string;
  name: string;
  symbol: string;
  price: number;
};

export default function CoinPicker({
  visible,
  onClose,
  coins,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  coins: Coin[];
  onSelect: (coin: Coin) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
  }, [coins, query]);

  const renderItem = ({ item }: { item: Coin }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <GlassContainer style={styles.rowCard}>
        <View style={styles.rowLeft}>
          <View style={styles.avatar}><Text style={{color: '#eab308', fontWeight: '700'}}>{item.symbol.slice(0, 3)}</Text></View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.coinSymbol}>{item.symbol}</Text>
            <Text style={styles.coinName}>{item.name}</Text>
          </View>
        </View>
        <Text style={styles.coinPrice}>${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
      </GlassContainer>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.searchBox}>
              <Search size={18} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar moeda ou símbolo"
                placeholderTextColor="#64748b"
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, backgroundColor: '#000000ff' },
  headerRow: { padding: 16, paddingTop: 24 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 10 },
  searchInput: { marginLeft: 8, color: '#fff', flex: 1, height: 36 },
  list: { padding: 16, paddingBottom: 120 },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, marginBottom: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(234,179,8,0.06)', justifyContent: 'center', alignItems: 'center' },
  coinSymbol: { color: '#ffffff', fontWeight: '700' },
  coinName: { color: '#94a3b8', fontSize: 12 },
  coinPrice: { color: '#ffffff', fontWeight: '700' },
  closeButton: { position: 'absolute', bottom: 28, left: 24, right: 24, padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center' },
  closeText: { color: '#eab308', fontWeight: '700' },
});
