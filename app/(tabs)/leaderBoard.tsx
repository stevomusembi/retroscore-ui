import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';  
    case 3: return '🥉';
    default: return null;
  }
};

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const { width, height } = Dimensions.get('window');

   // Generate fake leaderboard entries for visualization
  const generateFakeEntries = (startRank: number, count: number) => {
    const fakeUsernames = [
      'GameMaster2024', 'PredictionKing', 'ScoreNinja', 'FootballGuru',
      'MatchWizard', 'GoalPredictor', 'ChampionPlayer', 'VictorySeeker',
      'TacticalGenius', 'FieldExpert', 'ProPredictor', 'LeagueHero',
      'StadiumStar', 'FantasyPro', 'MatchMaker', 'ScoreLegend',
      'GameChanger', 'WinStreaker', 'TopScorer', 'ElitePlayer'
    ];
    
    const entries = [];
    for (let i = 0; i < count; i++) {
      const rank = startRank + i;
      const basePoints = Math.max(10, 200 - (rank * 8) + Math.floor(Math.random() * 20));
      entries.push({
        userId: 1000 + rank,
        username: fakeUsernames[i % fakeUsernames.length] || `Player${rank}`,
        totalPoints: basePoints,
        gamesPlayed: Math.floor(Math.random() * 50) + 20,
        winPercentage: Math.floor(Math.random() * 40) + 10,
        rank: rank,
        profilePictureURL: Math.random() > 0.6 ? null : `https://i.pravatar.cc/150?u=${1000 + rank}`
      });
    }
    return entries;
  }
  
  const getLeaderboardData = async () => {
    setLoading(true);
    try {
      const [leaderboard, userStats] = await Promise.all([
        retroScoreApi.getLeaderBoard(0, 20),
        retroScoreApi.getUserStats() 
      ]);
      let enhancedLeaderboard = { ...leaderboard };
      
      // Add fake entries if we have fewer than 5 real entries
      if (leaderboard?.entries && leaderboard.entries.length < 5) {
        const realEntries = leaderboard.entries;
        const nextRank = realEntries.length + 1;
        const fakeEntriesNeeded = 20 - realEntries.length;
        const fakeEntries = generateFakeEntries(nextRank, fakeEntriesNeeded);
        
        enhancedLeaderboard = {
          ...leaderboard,
          entries: [...realEntries, ...fakeEntries],
          totalUsers: 20
        };
      }
      
      setLeaderboardData(enhancedLeaderboard);
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
    const isTopThree = index < 3;
    const rankIcon = getRankIcon(index + 1);
    const profileImageStyle = item.profilePictureURL 
      ? styles.leaderboardProfileImage 
      : [styles.leaderboardProfileImage, styles.leaderboardProfilePlaceholder, getProfileImage(item.username)];

    return (
      <ThemedView style={[
        styles.leaderboardItemCard,
        isTopThree && styles.topThreeCard
      ]}>
        <View style={styles.leaderboardItemLeft}>
          {/* Rank with special styling for top 3 */}
          <View style={styles.leaderboardRankContainer}>
            {rankIcon ? (
              <ThemedText style={styles.rankIcon}>{rankIcon}</ThemedText>
            ) : (
              <ThemedText style={styles.leaderboardRankText}>
                {index + 1}
              </ThemedText>
            )}
          </View>
          
          {/* Profile Picture */}
          <View style={styles.leaderboardProfileContainer}>
            {item.profilePictureURL ? (
              <Image source={{ uri: item.profilePictureURL }} style={profileImageStyle} />
            ) : (
              <View style={profileImageStyle}>
                <ThemedText style={styles.leaderboardInitialsText}>
                  {getInitials(item.username)}
                </ThemedText>
              </View>
            )}
          </View>
          
          {/* Player Info */}
          <View style={styles.leaderboardPlayerInfo}>
            <ThemedText style={[
              styles.leaderboardUsernameText,]}>
              {item.username}
            </ThemedText>
            <ThemedText style={styles.leaderboardStatsText}>
              {item.gamesPlayed} games played
            </ThemedText>
          </View>
        </View>
        
        {/* Points */}
        <View style={styles.leaderboardPointsContainer}>
          <ThemedText style={[
            styles.leaderboardPointsText,
            isTopThree && styles.topThreePoints
          ]}>
            {formatPoints(item.totalPoints)}
          </ThemedText>
          <ThemedText style={styles.leaderboardPointsLabel}>points</ThemedText>
        </View>
      </ThemedView>
    );
  };

  const renderUserStatsCard = () => {
    if (!userRank) return null;

    const profileImageStyle = userRank.profilePictureURL 
      ? styles.userStatsProfileImage 
      : [styles.userStatsProfileImage, styles.userStatsProfilePlaceholder, getProfileImage(userRank.username)];

    return (
      <ThemedView style={styles.userStatsCard}>
        <View style={styles.userStatsMainRow}>
          {/* Left side: Profile, Name, Rank */}
          <View style={styles.userStatsLeftSection}>
            <View style={styles.userStatsProfileContainer}>
              {userRank.profilePictureURL ? (
                <Image source={{ uri: userRank.profilePictureURL }} style={profileImageStyle} />
              ) : (
                <View style={profileImageStyle}>
                  <ThemedText style={styles.userStatsInitialsText}>
                    {getInitials(userRank.username)}
                  </ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.userStatsBasicInfo}>
              <ThemedText style={styles.userStatsUsernameText}>
                {userRank.username}
              </ThemedText>
              <View style={styles.userStatsRankRow}>
                <ThemedText style={styles.userStatsRankText}>
                  Rank #{userRank.currentRank}
                </ThemedText>
                <View style={styles.userStatsDivider} />
                <ThemedText style={styles.userStatsPointsText}>
                  {formatPoints(userRank.totalPoints)} pts
                </ThemedText>
              </View>
            </View>
          </View>
          
          {/* Right side: Detailed stats */}
          <View style={styles.userStatsRightSection}>
            <View style={styles.userStatsDetailRow}>
              <ThemedText style={styles.userStatsDetailValue}>
                {userRank.gamesPlayed}
              </ThemedText>
              <ThemedText style={styles.userStatsDetailLabel}>games</ThemedText>
            </View>
            
            <View style={styles.userStatsDetailRow}>
              <ThemedText style={styles.userStatsDetailValue}>
                {userRank.correctResultPredictions}
              </ThemedText>
              <ThemedText style={styles.userStatsDetailLabel}>correct</ThemedText>
            </View>
            
            <View style={styles.userStatsDetailRow}>
              <ThemedText style={styles.userStatsDetailValue}>
                {userRank.winPercentage?.toFixed(0)}%
              </ThemedText>
              <ThemedText style={styles.userStatsDetailLabel}>win rate</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, {height: height * 1.2}]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <ThemedText style={styles.headerTitle}>Leaderboard</ThemedText>
          </View>
          
          {/* User Stats Section */}
          <View style={styles.userStatsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Your Performance</ThemedText>
            </View>
            {renderUserStatsCard()}
          </View>

          {/* Global Leaderboard Section */}
          <View style={[styles.globalLeaderboardSection,{marginBottom:50}]}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Global Rankings</ThemedText>
            </View>
            
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  
  // Header section styles
  headerSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  
  // Section styles
  sectionHeader: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  
  // User stats section styles
  userStatsSection: {
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  userStatsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  userStatsMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userStatsLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userStatsProfileContainer: {
    marginRight: 16,
  },
  userStatsProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },
  userStatsProfilePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userStatsInitialsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userStatsBasicInfo: {
    flex: 1,
  },
  userStatsUsernameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  userStatsRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatsRankText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFD60A',
  },
  userStatsDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 12,
  },
  userStatsPointsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34C759',
  },
  userStatsRightSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  userStatsDetailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  userStatsDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userStatsDetailLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
  },
  
  // Global leaderboard section styles
  globalLeaderboardSection: {
    flex: 1,
    backgroundColor: '#111111',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  leaderboardList: {
    flex: 1,
  },
  
  // Leaderboard item styles
  leaderboardItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  topThreeCard: {
    backgroundColor: '#1A1A1C',
    borderColor: '#FFD60A',
    borderWidth: 1,
  },
  leaderboardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaderboardRankContainer: {
    minWidth: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  leaderboardRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  rankIcon: {
    fontSize: 24,
  },
  leaderboardProfileContainer: {
    marginRight: 16,
  },
  leaderboardProfileImage: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  leaderboardProfilePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardInitialsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderboardPlayerInfo: {
    flex: 1,
  },
  leaderboardUsernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  leaderboardStatsText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  leaderboardPointsContainer: {
    alignItems: 'flex-end',
  },
  leaderboardPointsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  topThreePoints: {
    color: '#FFD60A',
  },
  leaderboardPointsLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '400',
    marginTop: 1,
  },
});