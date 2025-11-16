import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
}

export function GlassContainer({
  children,
  intensity = 20,
  style,
}: GlassContainerProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="dark">
        <View style={styles.overlay} />
      </BlurView>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    padding: 20,
  },
});
