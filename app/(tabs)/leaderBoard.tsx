import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import retroScoreApi from '../services/api';

export default function LeaderboardScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);

  const getLeaderboardData = async () => {
    setLoading(true);
    try {
      const [leaderboard, userStats] = await Promise.all([
        retroScoreApi.getLeaderBoard(0, 20),
        retroScoreApi.getUserStats(2) // Replace with actual user ID
      ]);
      
      setLeaderboardData(leaderboard);
      setUserRank(userStats);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getLeaderboardData();
  };

  useEffect(() => {
    getLeaderboardData();
  }, []);

  const renderLeaderboardItem = ({ item, index }: {item:any, index:number}) => (
    <ThemedView style={styles.leaderboardItem}>
      <ThemedView style={styles.rankContainer}>
        <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.playerInfo}>
        <ThemedText style={styles.usernameText}>{item.username}</ThemedText>
        <ThemedText style={styles.statsText}>
          {item.gamesPlayed} games • {item.winPercentage?.toFixed(1)}% win rate
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.pointsContainer}>
        <ThemedText style={styles.pointsText}>{item.totalPoints}</ThemedText>
        <ThemedText style={styles.pointsLabel}>pts</ThemedText>
      </ThemedView>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Leaderboard</ThemedText>
        
        {/* User's Current Rank */}
        {userRank && (
          <ThemedView style={styles.currentUserCard}>
            <ThemedText style={styles.cardTitle}>Your Ranking</ThemedText>
            <ThemedView style={styles.userRankRow}>
              <ThemedText style={styles.rankText}>#{userRank.currentRank}</ThemedText>
              <ThemedText style={styles.usernameText}>{userRank.username}</ThemedText>
              <ThemedText style={styles.pointsText}>{userRank.totalPoints} pts</ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Top Players List */}
        <FlatList
          data={leaderboardData?.entries || []}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.userId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.leaderboardList}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop:40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  currentUserCard: {
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  userRankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding:10
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
    padding:10
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statsText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
    padding:10
  },
  pointsLabel: {
    fontSize: 12,
    color: '#888',
  },
});