import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import retroScoreApi from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [matchData, setMatchData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [gamePhase, setGamePhase] = useState('playing'); // 'playing', 'result'
  const [result, setResult] = useState<any>(null);

  const fetchRandomMatch = async () => {
    setLoading(true);
    setError(null);
    setGamePhase('playing');
    setHomeScore('');
    setAwayScore('');
    setResult(null);

    try {
      const data = await retroScoreApi.getRandomMatch(1);
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
    console.log("here then",matchData)
    if (!homeScore || !awayScore) {
      Alert.alert('Please enter both scores');
      return;
    }

    try {
      setLoading(true);
      // Replace with your actual submit API call

      const guessData = {
        matchId: matchData.matchId,
        predictedHomeScore: parseInt(homeScore),
        predictedAwayScore: parseInt(awayScore)
      }
      console.log("payload is =>",guessData)
      
        const response = await retroScoreApi.submitGuess(1,guessData);
        setResult(response);
        setGamePhase('result');
        console.log("response is =>",response);
     
      // Mock result for now - replace with actual API call
      // const mockResult = {
      //   correct: Math.random() > 0.5,
      //   actualHomeScore: Math.floor(Math.random() * 4),
      //   actualAwayScore: Math.floor(Math.random() * 4),
      //   points: Math.random() > 0.5 ? 50 : 0
      // };
     
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
      <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4757" />
          <ThemedText style={styles.loadingText}>Loading match...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (gamePhase === 'result' && result) {
    return (
      <SafeAreaView style={[styles.container, result.correct ? styles.correctBg : styles.incorrectBg, { paddingBottom: insets.bottom + 100 }]}>
        <StatusBar barStyle="light-content" />
        
        {/* Result Header */}
        <ThemedView style={styles.resultHeader}>
          <ThemedText style={styles.resultEmoji}>
            {result.correct ? '🏆' : '😅'}
          </ThemedText>
          <ThemedText style={styles.resultTitle}>
            {result.correct ? 'CORRECT WINNER!' : 'NOT QUITE!'}
          </ThemedText>
          <ThemedText style={styles.resultSubtitle}>
            {result.correct 
              ? `Good job! You picked the right score!`
              : `Better luck next time! Football is unpredictable!`
            }
          </ThemedText>
        </ThemedView>

        {/* Score Comparison */}
        <ThemedView style={styles.scoreComparison}>
          <ThemedText style={styles.comparisonTitle}>📊 Score Comparison</ThemedText>
          
          <ThemedView style={styles.matchRow}>
            <ThemedText style={styles.teamName}>
              {matchData?.homeTeam?.name || 'Home'}
            </ThemedText>
            <ThemedText style={styles.vsText}>vs</ThemedText>
            <ThemedText style={styles.teamName}>
              {matchData?.awayTeam?.name || 'Away'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.scoreRow}>
            <ThemedText style={styles.scoreLabel}>ACTUAL SCORE</ThemedText>
            <ThemedView style={styles.scoreDisplay}>
              <ThemedView style={[styles.scoreBox, styles.correctScore]}>
                <ThemedText style={styles.scoreText}>{result.actualHomeScore}</ThemedText>
              </ThemedView>
              <ThemedText style={styles.scoreDash}>-</ThemedText>
              <ThemedView style={[styles.scoreBox, styles.correctScore]}>
                <ThemedText style={styles.scoreText}>{result.actualAwayScore}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.scoreRow}>
            <ThemedText style={styles.scoreLabel}>YOUR GUESS</ThemedText>
            <ThemedView style={styles.scoreDisplay}>
              <ThemedView style={[styles.scoreBox, styles.guessScore]}>
                <ThemedText style={styles.scoreText}>{homeScore}</ThemedText>
              </ThemedView>
              <ThemedText style={styles.scoreDash}>-</ThemedText>
              <ThemedView style={[styles.scoreBox, styles.guessScore]}>
                <ThemedText style={styles.scoreText}>{awayScore}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Points */}
        <ThemedView style={styles.pointsContainer}>
          <ThemedText style={styles.pointsText}>
            🏆 {result.correct ? '+50' : '+0'} Points
          </ThemedText>
        </ThemedView>

        {/* Next Match Button */}
        <TouchableOpacity style={styles.nextButton} onPress={fetchRandomMatch}>
          <ThemedText style={styles.nextButtonText}>
            🔄 {result.correct ? 'Nice! Next Match' : 'Try Again!'} →
          </ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.appTitle}>Memory Match</ThemedText>
        <ThemedText style={styles.league}>
          {matchData?.league || 'Premier League'} • {matchData?.season || '2019-2020'}
        </ThemedText>
      </ThemedView>

      {/* Challenge Section */}
      <ThemedView style={styles.challengeSection}>
        <ThemedText style={styles.challengeTitle}>🏆 Remember Who Won? 🏆</ThemedText>
        <ThemedText style={styles.challengeSubtitle}>
          What do you think the final score was?
        </ThemedText>
      </ThemedView>

      {matchData && (
        <>
          {/* Teams Display */}
          <ThemedView style={styles.teamsContainer}>
            {/* Home Team */}
            <ThemedView style={styles.teamContainer}>
              <ThemedView style={styles.teamLogo}>
                <ThemedText style={styles.teamLogoText}>
                  {matchData.homeTeam?.name?.substring(0, 3).toUpperCase() || 'HOM'}
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.teamName}>
                {matchData.homeTeam?.name || 'Home Team'}
              </ThemedText>
            </ThemedView>

            {/* VS */}
            <ThemedView style={styles.vsContainer}>
              <ThemedText style={styles.vsText}>VS</ThemedText>
              <ThemedText style={styles.matchDate}>
                ⚽
              </ThemedText>
            </ThemedView>

            {/* Away Team */}
            <ThemedView style={styles.teamContainer}>
              <ThemedView style={styles.teamLogo}>
                <ThemedText style={styles.teamLogoText}>
                  {matchData.awayTeam?.name?.substring(0, 3).toUpperCase() || 'AWY'}
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.teamName}>
                {matchData.awayTeam?.name || 'Away Team'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Flip Scoreboard Input */}
          <ThemedView style={styles.scoreInputContainer}>
            <ThemedView style={styles.flipScoreboardContainer}>
              {/* Home Score Flip Board */}
              <ThemedView style={styles.flipBoardWrapper}>
                <ThemedView style={styles.flipBoard}>
                  <ThemedView style={styles.flipBoardTop}>
                    <ThemedText style={styles.flipBoardNumber}>
                      {homeScore || '0'}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.flipBoardDivider} />
                  <ThemedView style={styles.flipBoardBottom}>
                    <ThemedText style={styles.flipBoardNumber}>
                      {homeScore || '0'}
                    </ThemedText>
                  </ThemedView>
                  <TextInput
                    style={styles.hiddenInput}
                    value={homeScore}
                    onChangeText={setHomeScore}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                </ThemedView>
                <ThemedView style={styles.flipBoardRings}>
                  <ThemedView style={styles.ring} />
                  <ThemedView style={styles.ring} />
                  <ThemedView style={styles.ring} />
                  <ThemedView style={styles.ring} />
                </ThemedView>
              </ThemedView>

              {/* VS Dash */}
              <ThemedText style={styles.scoreDash}>-</ThemedText>

              {/* Away Score Flip Board */}
              <ThemedView style={styles.flipBoardWrapper}>
                <ThemedView style={styles.flipBoard}>
                  <ThemedView style={styles.flipBoardTop}>
                    <ThemedText style={styles.flipBoardNumber}>
                      {awayScore || '0'}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.flipBoardDivider} />
                  <ThemedView style={styles.flipBoardBottom}>
                    <ThemedText style={styles.flipBoardNumber}>
                      {awayScore || '0'}
                    </ThemedText>
                  </ThemedView>
                  <TextInput
                    style={styles.hiddenInput}
                    value={awayScore}
                    onChangeText={setAwayScore}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                </ThemedView>
                <ThemedView style={styles.flipBoardRings}>
                  <ThemedView style={styles.ring} />
                  <ThemedView style={styles.ring} />
                  <ThemedView style={styles.ring} />
                  <ThemedView style={styles.ring} />
                </ThemedView>
              </ThemedView>
            </ThemedView>
            
            <ThemedText style={styles.flipBoardHint}>
              Tap the scoreboards to enter your guess
            </ThemedText>
          </ThemedView>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={submitGuess}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Submit Guess</ThemedText>
            )}
          </TouchableOpacity>

          {/* New Match Button */}
          <TouchableOpacity style={styles.newMatchButton} onPress={fetchRandomMatch}>
            <ThemedText style={styles.newMatchButtonText}>Get New Match</ThemedText>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  correctBg: {
    backgroundColor: '#2d5a27',
  },
  incorrectBg: {
    backgroundColor: '#5a2727',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  league: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  challengeSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 30,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#2c5530',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#3d6b42',
  },
  teamLogoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  matchDate: {
    fontSize: 24,
  },
  scoreInputContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  flipScoreboardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipBoardWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  flipBoard: {
    width: 120,
    height: 160,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#333',
  },
  flipBoardTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5,
    overflow: 'hidden',
  },
  flipBoardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#e8e8e8',
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 5,
    overflow: 'hidden',
  },
  flipBoardDivider: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#333',
    marginTop: -1,
    zIndex: 10,
  },
  flipBoardNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  flipBoardRings: {
    position: 'absolute',
    top: -8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    zIndex: 15,
  },
  ring: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#666',
    borderWidth: 2,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    fontSize: 48,
    textAlign: 'center',
    color: 'transparent',
  },
  flipBoardHint: {
    fontSize: 14,
    color: '#888',
    marginTop: 15,
    textAlign: 'center',
  },
  scoreDash: {
    fontSize: 32,
    color: '#fff',
    marginHorizontal: 30,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#ff4757',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newMatchButton: {
    backgroundColor: '#2c2c2e',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  newMatchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  // Result Screen Styles
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  resultEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scoreComparison: {
    backgroundColor: '#2c2c2e',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreRow: {
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctScore: {
    backgroundColor: '#27ae60',
  },
  guessScore: {
    backgroundColor: '#e74c3c',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f39c12',
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  nextButton: {
    backgroundColor: '#ff4757',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});