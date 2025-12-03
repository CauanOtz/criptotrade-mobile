import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface Stat {
  title: string;
  value: string;
  subValue: string;
  icon: LucideIcon;
}

export function StatsCards({ stats }: { stats: Stat[] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.iconContainer}>
            <stat.icon size={20} color="#F7931A" />
          </View>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.title}>{stat.title}</Text>
          <Text style={styles.subValue}>{stat.subValue}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%', // 2 colunas
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  subValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981', // Verde para positivo
  },
});