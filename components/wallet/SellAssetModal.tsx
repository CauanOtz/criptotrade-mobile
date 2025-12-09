import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { X, TrendingDown, Wallet, CheckCircle, Circle, ArrowRight } from 'lucide-react-native';
import { CryptoIcon } from '@/components/common/CryptoIcon';

interface SellAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  amount: string;
  onChangeAmount: (value: string) => void;
  onConfirm: (amount: number, lotId?: string | null) => void;
  loading: boolean;
  error: string;
  formatCurrency: (value: number) => string;
  lots?: any;
}

export default function SellAssetModal({
  isOpen,
  onClose,
  asset,
  amount,
  onChangeAmount,
  onConfirm,
  loading,
  error,
  formatCurrency,
  lots,
}: SellAssetModalProps) {
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(lots?.lots) && lots.lots.length === 1) {
      setSelectedLotId(lots.lots[0].lotTransactionId);
      onChangeAmount(String(lots.lots[0].amountRemaining));
    } else {
      setSelectedLotId(null);
    }
  }, [lots, onChangeAmount]);

  const maxAmount = asset?.amount ?? 0;
  const currentPrice = asset?.currentPrice ?? asset?.price ?? 0;
  const parsedAmount = Number(amount ?? 0) || 0;
  const estimated = parsedAmount * currentPrice;

  const isBaseCurrency = ((asset?.symbol || asset?.asset || '') + '').toUpperCase() === 'USD';

  const getAvailableAmount = () => {
    if (!selectedLotId) {
      // Consolidated mode - use total asset amount
      return maxAmount;
    }
    // Specific lot mode - find lot and get remaining amount
    const lot = lots?.lots?.find((l: any) => 
      l.lotTransactionId === selectedLotId || 
      l.idWalletPositionLot === selectedLotId
    );
    return lot ? Number(lot.amountRemaining || 0) : maxAmount;
  };

  const quickFill = (percent: number) => {
    const available = getAvailableAmount();
    const value = (available * percent) / 100;
    onChangeAmount(value.toFixed(8));
  };

  const getActivePercentage = () => {
    const available = getAvailableAmount();
    if (!available || !parsedAmount) return null;
    const pct = (parsedAmount / available) * 100;
    if (Math.abs(pct - 25) < 0.5) return 25;
    if (Math.abs(pct - 50) < 0.5) return 50;
    if (Math.abs(pct - 75) < 0.5) return 75;
    if (Math.abs(pct - 100) < 0.5) return 100;
    return null;
  };

  const activePercentage = getActivePercentage();

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={18} color="#111827" />
              </TouchableOpacity>

              <View style={styles.headerContent}>
                <View style={styles.iconContainer}>
                  <CryptoIcon symbol={asset?.symbol} size={32} />
                  <View style={styles.iconBadge}>
                    <TrendingDown size={14} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>Vender {asset?.asset ?? asset?.symbol}</Text>
                  <View style={styles.headerSubtitle}>
                    <Text style={styles.headerSymbol}>{asset?.symbol}</Text>
                    <Text style={styles.headerDot}>•</Text>
                    <View style={styles.headerBalance}>
                      <Wallet size={12} color="#9CA3AF" />
                      <Text style={styles.headerBalanceText}>{Number(maxAmount).toFixed(8)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.content}>
              {/* Lot Selection */}
              {lots && Array.isArray(lots.lots) && lots.lots.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Selecionar Lote</Text>
                  <View style={styles.lotsContainer}>
                    <TouchableOpacity
                      style={[styles.lotCard, selectedLotId === null && styles.lotCardActive]}
                      onPress={() => {
                        setSelectedLotId(null);
                        onChangeAmount('');
                      }}
                    >
                      <View style={styles.lotLeft}>
                        {selectedLotId === null ? (
                          <CheckCircle size={20} color="#6B7280" />
                        ) : (
                          <Circle size={20} color="#9CA3AF" />
                        )}
                        <View style={styles.lotInfo}>
                          <Text style={styles.lotTitle}>Saldo Consolidado</Text>
                          <Text style={styles.lotSubtitle}>Todos os lotes combinados</Text>
                        </View>
                      </View>
                      <View style={styles.lotRight}>
                        <Text style={styles.lotAmount}>{Number(asset?.amount || 0).toFixed(8)}</Text>
                        <Text style={styles.lotSymbol}>{asset?.symbol}</Text>
                      </View>
                    </TouchableOpacity>

                    {lots.lots.map((lot: any, idx: number) => {
                      const lotId = lot.lotTransactionId ?? lot.idWalletPositionLot ?? lot.id;
                      const isSelected = selectedLotId === lotId;
                      const amountRemaining = Number(lot.amountRemaining ?? lot.remainingAmount ?? lot.amount ?? 0);
                      const unitPrice = Number(lot.unitPriceUsd ?? lot.avgPrice ?? lot.purchasePrice ?? 0);
                      const unrealizedGain = Number(lot.unrealizedGainUsd ?? lot.unrealizedGain ?? 0);
                      const gainPercent = unitPrice > 0 ? ((currentPrice - unitPrice) / unitPrice) * 100 : 0;
                      
                      // Parse date
                      let dateStr = 'N/A';
                      if (lot.acquiredAt) {
                        const ms = typeof lot.acquiredAt === 'number' ? lot.acquiredAt : Date.parse(lot.acquiredAt);
                        if (!isNaN(ms)) {
                          dateStr = new Date(ms).toLocaleDateString();
                        }
                      }
                      
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.lotCard, isSelected && styles.lotCardActive]}
                          onPress={() => {
                            setSelectedLotId(lotId);
                            onChangeAmount(String(amountRemaining || 0));
                          }}
                        >
                          <View style={styles.lotLeft}>
                            {isSelected ? (
                              <CheckCircle size={20} color="#F7931A" />
                            ) : (
                              <Circle size={20} color="#9CA3AF" />
                            )}
                            <View style={styles.lotInfo}>
                              <Text style={styles.lotTitle}>Lote {idx + 1}</Text>
                              <Text style={styles.lotSubtitle}>
                                {formatCurrency(unitPrice)} • {dateStr}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.lotRight}>
                            <Text style={styles.lotAmount}>{amountRemaining.toFixed(8)}</Text>
                            <Text style={[styles.lotGain, gainPercent >= 0 ? styles.lotGainPositive : styles.lotGainNegative]}>
                              {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Amount Input */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Quantidade</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00000000"
                    placeholderTextColor="#9CA3AF"
                    value={amount}
                    onChangeText={onChangeAmount}
                    keyboardType="decimal-pad"
                    editable={!isBaseCurrency}
                  />
                  <Text style={styles.inputSymbol}>{asset?.symbol}</Text>
                </View>

                <View style={styles.percentButtons}>
                  {[25, 50, 75, 100].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => quickFill(p)}
                      disabled={isBaseCurrency}
                      style={[
                        styles.percentButton,
                        activePercentage === p && styles.percentButtonActive,
                      ]}
                    >
                      <Text style={[styles.percentButtonText, activePercentage === p && styles.percentButtonTextActive]}>
                        {p}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Preço Atual</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(currentPrice)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Você Receberá</Text>
                  <View style={styles.summaryRight}>
                    <Text style={styles.summaryTotal}>{formatCurrency(estimated)}</Text>
                    <Text style={styles.summarySubtext}>
                      ≈ {parsedAmount.toFixed(8)} × {formatCurrency(currentPrice)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Base Currency Warning */}
              {isBaseCurrency && (
                <View style={styles.warningCard}>
                  <Text style={styles.warningText}>
                    USD é a moeda base do sistema e não pode ser vendida.
                  </Text>
                </View>
              )}

              {/* Error Message */}
              {error && (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, (loading || parsedAmount <= 0 || isBaseCurrency) && styles.confirmButtonDisabled]}
                  onPress={() => onConfirm(Math.min(parsedAmount, Number(maxAmount || 0)), selectedLotId)}
                  disabled={loading || parsedAmount <= 0 || isBaseCurrency}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.confirmButtonText}>
                        {isBaseCurrency ? 'Venda não permitida' : `Vender ${asset?.symbol}`}
                      </Text>
                      {!isBaseCurrency && <ArrowRight size={18} color="#FFFFFF" />}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    position: 'relative',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  headerSymbol: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  headerDot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  headerBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBalanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  lotsContainer: {
    gap: 12,
  },
  lotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lotCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F7931A',
  },
  lotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lotInfo: {
    flex: 1,
  },
  lotTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  lotSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  lotRight: {
    alignItems: 'flex-end',
  },
  lotAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  lotSymbol: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  lotGain: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  lotGainPositive: {
    color: '#10B981',
  },
  lotGainNegative: {
    color: '#EF4444',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    paddingRight: 80,
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  inputSymbol: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  percentButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  percentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  percentButtonActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F7931A',
  },
  percentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  percentButtonTextActive: {
    color: '#F7931A',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7931A',
  },
  summarySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  warningCard: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
