import { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, SafeAreaView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import retroScoreApi from '../services/api';

// Helper function to generate avatar placeholder or use actual profile pic
const getProfileImage = (username: string, profilePic?: string) => {
  if (profilePic) {
    return { uri: profilePic };
  }
  // Generate a consistent color based on username
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const colorIndex = username.length % colors.length;
  return { backgroundColor: colors[colorIndex] };
};

const getInitials = (username: string) => {
  return username.slice(0, 2).toUpperCase();
};

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
        retroScoreApi.getUserStats() 
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

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(0)}K`;
    }
    return points.toString();
  };

  const renderLeaderboardItem = ({ item, index }: {item:any, index:number}) => {
    const profileImageStyle = item.profilePic 
      ? styles.profileImage 
      : [styles.profileImage, styles.profilePlaceholder, getProfileImage(item.username)];

    return (
      <ThemedView style={styles.leaderboardItem}>
        {/* Rank */}
        <View style={styles.rankContainer}>
          <ThemedText style={[
            styles.rankText,
            index < 3 && styles.topThreeRank
          ]}>
            {index + 1}
          </ThemedText>
        </View>
        
        {/* Profile Picture */}
        <View style={styles.profileContainer}>
          {item.profilePic ? (
            <Image source={{ uri: item.profilePic }} style={profileImageStyle} />
          ) : (
            <View style={profileImageStyle}>
              <ThemedText style={styles.initialsText}>
                {getInitials(item.username)}
              </ThemedText>
            </View>
          )}
        </View>
        
        {/* Player Info */}
        <View style={styles.playerInfo}>
          <ThemedText style={styles.usernameText}>{item.username}</ThemedText>
          <ThemedText style={styles.statsText}>
            {item.gamesPlayed} games
          </ThemedText>
        </View>
        
        {/* Points with styling similar to reference */}
        <View style={styles.pointsContainer}>
          <ThemedText style={styles.pointsText}>
            +{formatPoints(item.totalPoints)}
          </ThemedText>
          <View style={styles.coinIcon}>
            <ThemedText style={styles.coinText}>💰</ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  };

  const renderCurrentUserCard = () => {
    if (!userRank) return null;

    const profileImageStyle = userRank.profilePic 
      ? styles.profileImageSmall 
      : [styles.profileImageSmall, styles.profilePlaceholder, getProfileImage(userRank.username)];

    return (
      <ThemedView style={styles.currentUserCard}>
        <ThemedText style={styles.cardTitle}>Your Position</ThemedText>
        <View style={styles.userRankRow}>
          <View style={styles.userRankLeft}>
            <ThemedText style={styles.userRankNumber}>#{userRank.currentRank}</ThemedText>
            
            <View style={styles.userProfileContainer}>
              {userRank.profilePic ? (
                <Image source={{ uri: userRank.profilePic }} style={profileImageStyle} />
              ) : (
                <View style={profileImageStyle}>
                  <ThemedText style={styles.initialsTextSmall}>
                    {getInitials(userRank.username)}
                  </ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.userInfoContainer}>
              <ThemedText style={styles.userNameText}>{userRank.username}</ThemedText>
              <ThemedText style={styles.userStatsText}>
                {userRank.gamesPlayed} games • {userRank.winPercentage?.toFixed(1)}% win rate
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.userPointsContainer}>
            <ThemedText style={styles.userPointsText}>
              +{formatPoints(userRank.totalPoints)}
            </ThemedText>
            <View style={styles.coinIcon}>
              <ThemedText style={styles.coinText}>💰</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>The best players</ThemedText>
          <ThemedText style={styles.subtitle}>of the last 7 days</ThemedText>
        </View>
        
        {/* World Section */}
        <View style={styles.worldSection}>
          <View style={styles.worldHeader}>
            <View style={styles.worldIcon}>
              <ThemedText style={styles.worldEmoji}>🌍</ThemedText>
            </View>
            <ThemedText style={styles.worldText}>World</ThemedText>
          </View>
          
          {/* Current User Card */}
          {renderCurrentUserCard()}

          {/* Top Players List */}
          <FlatList
            data={leaderboardData?.entries || []}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.userId.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.leaderboardList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  worldSection: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  worldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  worldEmoji: {
    fontSize: 18,
  },
  worldText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentUserCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
  },
  userRankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userRankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 12,
    minWidth: 24,
  },
  userProfileContainer: {
    marginRight: 12,
  },
  profileImageSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userInfoContainer: {
    flex: 1,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userStatsText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  userPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
    marginRight: 4,
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  rankContainer: {
    minWidth: 32,
    alignItems: 'flex-start',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E8E93',
  },
  topThreeRank: {
    color: '#FFD60A',
  },
  profileContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  initialsTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerInfo: {
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statsText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
    marginRight: 4,
  },
  coinIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    fontSize: 12,
  },
});