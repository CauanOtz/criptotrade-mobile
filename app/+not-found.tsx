import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#334155']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.text}>Esta tela não existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar para o início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  link: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});
