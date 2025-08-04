import { SafeAreaView, StyleSheet } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Profile</ThemedText>
        <ThemedText style={styles.subtitle}>Coming soon...</ThemedText>
        
        {/* You can add user stats, achievements, etc. here */}
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.statsTitle}>Your Stats</ThemedText>
          <ThemedText style={styles.statsText}>Games Played: 0</ThemedText>
          <ThemedText style={styles.statsText}>Correct Guesses: 0</ThemedText>
          <ThemedText style={styles.statsText}>Total Points: 0</ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  statsContainer: {
    backgroundColor: '#2c2c2e',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
});