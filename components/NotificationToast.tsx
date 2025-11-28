import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';

interface Props {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export function NotificationToast({ message, type, onClose }: Props) {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={20} color="#10B981" />;
      case 'error': return <AlertCircle size={20} color="#EF4444" />;
      case 'warning': return <AlertCircle size={20} color="#F59E0B" />;
      default: return <Info size={20} color="#3B82F6" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success': return { bg: '#ECFDF5', border: '#10B981' };
      case 'error': return { bg: '#FEF2F2', border: '#EF4444' };
      case 'warning': return { bg: '#FFFBEB', border: '#F59E0B' };
      default: return { bg: '#EFF6FF', border: '#3B82F6' };
    }
  };

  const style = getStyles();

  return (
    <Animated.View 
      entering={FadeInUp} 
      exiting={FadeOutUp} 
      style={[styles.container, { backgroundColor: style.bg, borderColor: style.border }]}
    >
      <View style={styles.content}>
        {getIcon()}
        <Text style={styles.text}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <X size={18} color="#6B7280" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
});