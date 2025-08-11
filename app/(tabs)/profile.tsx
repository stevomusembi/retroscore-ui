import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import retroScoreApi from '../services/api';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState<any>();

  const getUserStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data: any = await retroScoreApi.getUserStats(1);
      setStatsData(data);
      console.log("stats data => ", data);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Profile</ThemedText>
        <ThemedText style={styles.subtitle}>Coming soon...</ThemedText>

        {/* You can add user stats, achievements, etc. here */}
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.statsTitle}>Your Stats</ThemedText>
          <ThemedText style={styles.statsText}>Games Played: {statsData?.matchesPlayed ?? 'Loading...'}</ThemedText>
          <ThemedText style={styles.statsText}>Correct Guesses: {statsData?.matchesPredictedCorrectScore ?? 'Loading...'}</ThemedText>
          <ThemedText style={styles.statsText}>Total Points: {statsData?.totalPoints ?? 'Loading...'}</ThemedText>
          <ThemedText style={styles.statsText}>Win Percentage: {statsData?.winPercentage ?? 'Loading...'}%</ThemedText>
         
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