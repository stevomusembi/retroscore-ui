import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../components/ThemedText';
import retroScoreApi from '../services/api';
import { getFullLogoUrl } from '../utils/logoUtils';


// Helper function to generate team colors
const generateTeamColors = (teamName: string, index: number) => {
  const colorPairs = [
    { primary: '#FF6B6B', secondary: '#4ECDC4' },
    { primary: '#45B7D1', secondary: '#96CEB4' },
    { primary: '#bdae7aaf', secondary: '#DDA0DD' },
    { primary: '#98D8C8', secondary: '#F7DC6F' },
    { primary: '#A8E6CF', secondary: '#FFB7B2' },
    { primary: '#B4A7D6', secondary: '#D4A5A5' },
    { primary: '#87CEEB', secondary: '#DDA0DD' },
    { primary: '#bab58cff', secondary: '#98FB98' }
  ];
  
  const colorIndex = (teamName?.length || 0 + index) % colorPairs.length;
  return colorPairs[colorIndex];
};

const ScoreWheel = ({ value, onValueChange, teamColor }: { value: number, onValueChange: (val: number) => void, teamColor: string }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 60;
  const scores = Array.from({ length: 10 }, (_, i) => i);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const selectedIndex = Math.round(y / itemHeight);
    if (selectedIndex !== value && selectedIndex >= 0 && selectedIndex < 10) {
      onValueChange(selectedIndex);
    }
  };

  const scrollToValue = (val: number) => {
    scrollViewRef.current?.scrollTo({ y: val * itemHeight, animated: true });
  };

  useEffect(() => {
    scrollToValue(value);
  }, []);

  return (
    <View style={[styles.scoreWheelContainer, { borderColor: teamColor }]}>
      <View style={[styles.scoreWheelIndicator, { backgroundColor: teamColor }]} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scoreWheel}
        contentContainerStyle={{
          paddingTop: itemHeight * 2,
          paddingBottom: itemHeight * 2,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
      >
        {scores.map((score) => (
          <TouchableOpacity
            key={score}
            style={[
              styles.scoreItem,
              { height: itemHeight },
              value === score && { backgroundColor: `${teamColor}20` }
            ]}
            onPress={() => {
              onValueChange(score);
              scrollToValue(score);
            }}
          >
            <ThemedText style={[
              styles.scoreText,
              value === score && { color: teamColor, fontWeight: '700' }
            ]}>
              {score}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// League and season data
const leagues = [
  { id: 'epl', name: 'Premier League', seasons: generateEPLSeasons() },
  { id: 'laliga', name: 'La Liga', seasons: ['2023-24', '2022-23', '2021-22', '2020-21'] },
  { id: 'ucl', name: 'Champions League', seasons: ['2023-24', '2022-23', '2021-22', '2020-21'] }
];

function generateEPLSeasons() {
  const seasons = [];
  for (let year = 1999; year <= 2024; year++) {
    const nextYear = year + 1;
    seasons.push(`${year.toString().slice(-2)}-${nextYear.toString().slice(-2)}`);
  }
  return seasons.reverse(); // Most recent first
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [matchData, setMatchData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [gamePhase, setGamePhase] = useState('playing');
  const [result, setResult] = useState<any>(null);
  const [showLeagueFilter, setShowLeagueFilter] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(leagues[0]);
  const [selectedSeason, setSelectedSeason] = useState('21-22');

  const fetchRandomMatch = async () => {
    setLoading(true);
    setError(null);
    setGamePhase('playing');
    setHomeScore(0);
    setAwayScore(0);
    setResult(null);

    try {
      const data = await retroScoreApi.getRandomMatch(2);
      setMatchData(data);
      console.log("matchData=> ", data);
    } catch (err: any) {
      setError(err.message);
      console.log("Error", err);
    } finally {
      setLoading(false);
    }
  };

  const submitGuess = async () => {
    try {
      setLoading(true);
      const guessData = {
        matchId: matchData.matchId,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore
      }
      console.log("payload is =>", guessData);
      
      const response = await retroScoreApi.submitGuess(2, guessData);
      setResult(response);
      setGamePhase('result');
      console.log("response is =>", response);
    } catch (err: any) {
      Alert.alert('Error', err.message);
      console.log("Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomMatch();
  }, []);

  if (loading && !matchData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading match...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (gamePhase === 'result' && result) {
    return (
      <SafeAreaView style={[styles.container, result.correct ? styles.correctBg : styles.incorrectBg]}>
        <StatusBar barStyle="light-content" />
        
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <ThemedText style={styles.resultEmoji}>
            {result.isCorrectScore && result.isCorrectResult ? '🎯' : result.isCorrectResult ? '⚡' : '🎲'}
          </ThemedText>
          <ThemedText style={styles.resultTitle}>
            {result.isCorrectScore && result.isCorrectResult ? 'Perfect Score!' : result.isCorrectResult ? 'Close Call!' : 'Try Again!'}
          </ThemedText>
          <ThemedText style={styles.resultSubtitle}>
            {result.resultMessage}
          </ThemedText>
        </View>

        {/* Score Comparison */}
        <View style={styles.scoreComparison}>
          <View style={styles.matchHeader}>
            <ThemedText style={styles.comparisonTitle}>Final Score</ThemedText>
          </View>
          
          <View style={styles.teamsResultRow}>
            <ThemedText style={styles.teamNameResult}>{matchData?.homeTeam?.name}</ThemedText>
            <ThemedText style={styles.teamNameResult}>{matchData?.awayTeam?.name}</ThemedText>
          </View>

          <View style={styles.scoreResultRow}>
            <View style={[styles.actualScoreBox, { backgroundColor: '#34C759' }]}>
              <ThemedText style={styles.actualScoreText}>{result.actualHomeScore}</ThemedText>
            </View>
            <ThemedText style={styles.resultDash}>-</ThemedText>
            <View style={[styles.actualScoreBox, { backgroundColor: '#34C759' }]}>
              <ThemedText style={styles.actualScoreText}>{result.actualAwayScore}</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.yourGuessLabel}>Your Guess</ThemedText>
          <View style={styles.scoreResultRow}>
            <View style={[styles.guessScoreBox, { backgroundColor: '#FF3B30' }]}>
              <ThemedText style={styles.guessScoreText}>{homeScore}</ThemedText>
            </View>
            <ThemedText style={styles.resultDash}>-</ThemedText>
            <View style={[styles.guessScoreBox, { backgroundColor: '#FF3B30' }]}>
              <ThemedText style={styles.guessScoreText}>{awayScore}</ThemedText>
            </View>
          </View>
        </View>

        {/* Points */}
        <View style={styles.pointsContainer}>
          <ThemedText style={styles.pointsText}>
            +{result.userGamePoints} Points 🏆
          </ThemedText>
        </View>

        {/* Next Match Button */}
        <TouchableOpacity style={styles.nextButton} onPress={fetchRandomMatch}>
          <ThemedText style={styles.nextButtonText}>Next Match</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const homeColors = generateTeamColors(matchData?.homeTeam?.name, 0);
  const awayColors = generateTeamColors(matchData?.awayTeam?.name, 1);

  const LeagueFilterModal = () => (
    <Modal
      visible={showLeagueFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowLeagueFilter(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Select League & Season</ThemedText>
            <TouchableOpacity onPress={() => setShowLeagueFilter(false)}>
              <ThemedText style={styles.modalClose}>✕</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {leagues.map((league) => (
              <View key={league.id} style={styles.leagueSection}>
                <ThemedText style={styles.leagueSectionTitle}>{league.name}</ThemedText>
                <View style={styles.seasonsContainer}>
                  {league.seasons.map((season) => (
                    <TouchableOpacity
                      key={season}
                      style={[
                        styles.seasonButton,
                        selectedLeague.id === league.id && selectedSeason === season && styles.seasonButtonSelected
                      ]}
                      onPress={() => {
                        setSelectedLeague(league);
                        setSelectedSeason(season);
                        setShowLeagueFilter(false);
                      }}
                    >
                      <ThemedText style={[
                        styles.seasonButtonText,
                        selectedLeague.id === league.id && selectedSeason === season && styles.seasonButtonTextSelected
                      ]}>
                        {season}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.appTitle}>Predict the Score</ThemedText>
        <TouchableOpacity 
          style={styles.leagueContainer}
          onPress={() => setShowLeagueFilter(true)}
        >
          <ThemedText style={styles.league}>
            {selectedLeague.name} • {selectedSeason}
          </ThemedText>
          <ThemedText style={styles.dropdownIcon}>⌄</ThemedText>
        </TouchableOpacity>
      </View>

      {matchData && (
  <>
    {/* Teams Display */}
    <View style={styles.teamsContainer}>
      {/* Home Team */}
      <View style={styles.teamContainer}>
        <View style={[
          styles.teamLogo, 
          !matchData.homeTeam?.logoUrl && { backgroundColor: homeColors.primary }
          ]}>
          {matchData.homeTeam?.logoUrl ? (
            <Image
              source={{ uri: getFullLogoUrl(matchData.homeTeam.logoUrl) }}
              style={styles.logoImage}
              resizeMode="contain" // This ensures consistent sizing!
              onError={(error) => {
                console.log('Home team logo failed to load:', error.nativeEvent.error);
              }}
            />
          ) : (
            <ThemedText style={styles.teamLogoText}>
              {matchData.homeTeam?.name?.substring(0, 2).toUpperCase() || 'HO'}
            </ThemedText>
          )}
        </View>
        <ThemedText style={styles.teamName} numberOfLines={2}>
          {matchData.homeTeam?.name || 'Home Team'}
        </ThemedText>
      </View>

      {/* VS */}
      <View style={styles.vsContainer}>
        <ThemedText style={styles.vsText}>VS</ThemedText>
      </View>

      {/* Away Team */}
      <View style={styles.teamContainer}>
        <View style={[
           styles.teamLogo, 
           !matchData.homeTeam?.logoUrl && { backgroundColor: homeColors.primary }
           ]}>
          {matchData.awayTeam?.logoUrl ? (
            <Image
              source={{ uri: getFullLogoUrl(matchData.awayTeam.logoUrl) }}
              style={styles.logoImage}
              resizeMode="contain" // This ensures consistent sizing!
              onError={(error) => {
                console.log('Away team logo failed to load:', error.nativeEvent.error);
              }}
            />
          ) : (
            <ThemedText style={styles.teamLogoText}>
              {matchData.awayTeam?.name?.substring(0, 2).toUpperCase() || 'AW'}
            </ThemedText>
          )}
        </View>
        <ThemedText style={styles.teamName} numberOfLines={2}>
          {matchData.awayTeam?.name || 'Away Team'}
        </ThemedText>
      </View>
    </View>

          {/* Match Info - Moved below teams */}
          <View style={styles.matchInfoContainer}>
            <View style={styles.matchInfoItem}>
              <ThemedText style={styles.infoIcon}>📅</ThemedText>
              <ThemedText style={styles.infoTextSmall}>
                {format(new Date(matchData.matchDate), 'dd MMM yyyy')}
              </ThemedText>
            </View>
            <View style={styles.matchInfoSeparator} />
            <View style={styles.matchInfoItem}>
              <ThemedText style={styles.infoIcon}>🏟️</ThemedText>
              <ThemedText style={styles.infoTextSmall} numberOfLines={1}>
                {matchData.stadiumName}
              </ThemedText>
            </View>
          </View>

          {/* Score Selection */}
          <View style={styles.scoreSelectionContainer}>
            <ThemedText style={styles.scoreSelectionTitle}>Select Final Score</ThemedText>
            
            <View style={styles.scoreWheelsContainer}>
              <ScoreWheel 
                value={homeScore} 
                onValueChange={setHomeScore}
                teamColor={homeColors.primary}
              />
              
              <View style={styles.dashContainer}>
                <ThemedText style={styles.scoreDash}>-</ThemedText>
              </View>
              
              <ScoreWheel 
                value={awayScore} 
                onValueChange={setAwayScore}
                teamColor={awayColors.primary}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={submitGuess}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Submit Prediction</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.newMatchButton} onPress={fetchRandomMatch}>
              <ThemedText style={styles.newMatchButtonText}>🔄 New Match</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}

      <LeagueFilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
    paddingTop:60

  },
  correctBg: {
    backgroundColor: '#1B5E20',
  },
  incorrectBg: {
    backgroundColor: '#B71C1C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  leagueContainer: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  league: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#8E8E93',
  },
  matchInfoCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  matchInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  matchInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  matchInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchInfoSeparator: {
    width: 1,
    height: 12,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 16,
  },
  infoTextSmall: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 120,
  }, teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 120,
    height: 120,
    borderRadius: 60, // Make it perfectly circular (width/2)
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    // shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden', // Ensures content stays within circle
  },
  logoImage: {
    width: 100,  // Slightly smaller than container
    height: 100, // Make it square for consistent aspect ratio
    // Remove borderRadius - the parent container handles the circular crop
  },
  teamLogoText: {
    fontSize: 24, // Slightly larger for better visibility
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 90,
  },
  vsContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8E8E93',
  },
  scoreSelectionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreSelectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  scoreWheelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreWheelContainer: {
    width: 100,
    height: 200,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  scoreWheelIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 48,
    marginTop: -24,
    opacity: 0.2,
    zIndex: 1,
  },
  scoreWheel: {
    flex: 1,
  },
  scoreItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
  },
  dashContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreDash: {
    fontSize: 28,
    color: '#8E8E93',
    fontWeight: '700',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  newMatchButton: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  newMatchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '500',
  },
  modalScroll: {
    maxHeight: 400,
  },
  leagueSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  leagueSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  seasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seasonButton: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  seasonButtonSelected: {
    backgroundColor: '#007AFF',
  },
  seasonButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  seasonButtonTextSelected: {
    color: '#FFFFFF',
  },
  // Result Screen Styles
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#E5E5E7',
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreComparison: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  teamsResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamNameResult: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scoreResultRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actualScoreBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guessScoreBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actualScoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guessScoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultDash: {
    fontSize: 24,
    color: '#8E8E93',
    marginHorizontal: 20,
    fontWeight: '700',
  },
  yourGuessLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD60A',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});