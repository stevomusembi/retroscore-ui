import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountdownTimer from '../components/CountDownTimer';
import ResultSelector from '../components/ResultSelector';
import { ScoreWheel } from '../components/ScrollWheel';
import { ThemedText } from '../components/ThemedText';
import retroScoreApi from '../services/api';
import { getFullLogoUrl } from '../utils/logoUtils';



const homeColors ='#998f7aff'; 
const awayColors ='#546abaff';

const { width, height } = Dimensions.get('window');

const eplSeasons = [
  '15-16', '16-17', '17-18', '18-19', '19-20',
  '20-21', '21-22', '22-23', '23-24', '24-25'
];

const uclSeasons = [...eplSeasons];

const leagues = [
  { id: 'epl', name: 'Premier League ', seasons: eplSeasons, emoji:'🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  // { id: 'ucl', name: 'Champions League', seasons: uclSeasons, emoji:'⚽️' }
];

export default function HomeScreen() {

// reset and remount page when users click on home tab
useFocusEffect(
  useCallback(() => {
    setGamePhase('playing');
    setResult(null);
    setTimeIsUp(false);
    setIsSubmitting(false);
    setHomeScore(0);
    setAwayScore(0);
    setError(null);

    fetchRandomMatch();
    
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setTimeLimit(JSON.parse(storedUser).timeLimit);
      } catch (error) {
        console.error("Failed to parse user from session storage", error);
      }
    }
  }, [])
);

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
  const [timeLimit, setTimeLimit] = useState<any>();
  const [timeIsUp, setTimeIsUp] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetTrigger, setResetTrigger] = useState<any>();
  const [isEasyMode, setIsEasyMode] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const switchAnim = useRef(new Animated.Value(0)).current;
  const [showErrorModal,setShowErrorModal] = useState(false);

  const fetchRandomMatch = async () => {
    handleReset();
    setLoading(true);
    setError(null);
    setGamePhase('playing');
    setHomeScore(0);
    setAwayScore(0);
    setIsSubmitting(false);
    setTimeIsUp(false);
    


    try {
      const data = await retroScoreApi.getRandomMatch();
      setMatchData(data);
    } catch (err: any) {
      setError(err.message);
      console.log("Error", err);
    } finally {
      setLoading(false);
    }
  };


  const submitGuess = async () => {

    try {
      if (isSubmitting) return; 
      if(isEasyMode && matchResult == '' && !timeIsUp){
        Platform.OS === 'web' ? setShowErrorModal(true): Alert.alert('Error', "Please select a result, then submit");
        return;
      }
      if(!isEasyMode && matchResult == '' && timeIsUp){

      }
   
      setLoading(true);
      setIsSubmitting(true);
      const guessData = {
        matchId: matchData.matchId,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
        timeIsUp:timeIsUp,
        isEasyMode:isEasyMode,
        matchResult:matchResult
      }
      const response = await retroScoreApi.submitGuess(guessData);
      setResult(response);
      setGamePhase('result');
    } catch (err: any) {
      Alert.alert('Error', err.message);
      console.error("Error", err);
    } finally {
      setIsSubmitting(false);
      setLoading(false);

    }
  };

  const handeTimeIsUp = () => {
    console.log("callled");
    if( matchResult == ''){
      setMatchResult('draw');
    }
    console.log("matchResult hapa ni==>", matchResult);
    setTimeIsUp(true);
  }

  const handleReset = ()=> {
  setTimeIsUp(false);
  setMatchResult('');
  setResetTrigger(Date.now());
  }

  const handleResultSelect = (selected:any)=>{
    setMatchResult(selected);
  }
const toggleMode = () => {
  const newMode = !isEasyMode;
  setIsEasyMode(newMode);
  
  // Animate both the content fade AND the switch position
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: newMode ? 1 : 0, // Easy mode = visible (1), Score mode = hidden (0)
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.spring(switchAnim, {
      toValue: newMode ? 1 : 0, // Easy mode = right (1), Score mode = left (0)
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    })
  ]).start();
};

const formatResultText = (result: string): string => {
  return result.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

  useEffect(() => {
    if (timeIsUp) {
      submitGuess();
    }
  }, [timeIsUp]);



  useEffect(() => {
   const storedUser = sessionStorage.getItem("user");
    if(storedUser){
      try{
        setTimeLimit(JSON.parse(storedUser).timeLimit);

      } catch(error){
        console.error("Failed to parse user form session storage",error);
      }
    }

    fetchRandomMatch();

  }, []);

  //used to debug if logos are loading
  useEffect(() => {
    if (matchData) {
      // debugLogoLoading(matchData);
    }
  }, [matchData]);

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
      <SafeAreaView style={[styles.container, result.isCorrectResult ? styles.correctBg : styles.incorrectBg]}>
         <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <StatusBar barStyle="light-content" />
        
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <ThemedText style={styles.resultEmoji}>
            {result.isCorrectScore && result.isCorrectResult ? '🎯' : result.isCorrectResult ? '⚡' : '🎲'}
          </ThemedText>
          <ThemedText style={styles.resultSubtitle}>
            {result.resultMessage}
          </ThemedText>
        </View>

        {/* Score Comparison */}
        <View style={styles.scoreComparison}>
          {isEasyMode ?
            (timeIsUp ? (
              <View>
                <ThemedText style={styles.noGuessLabel}>
                  You didn’t submit a result in time...
                </ThemedText>
                <View style={styles.easyModeResult}>
                  <ThemedText>Correct result was</ThemedText>
                  <ThemedText style={styles.easyModeResultLabel}>{formatResultText(result.actualMatchResult)}</ThemedText>
                </View>
              </View>)
            :(
              <View>
                <View style={styles.easyModeResult}>
                  <ThemedText>Correct result </ThemedText>
                  <ThemedText style={styles.easyModeResultLabel}>  {formatResultText(result.actualMatchResult)}</ThemedText>
                </View>
                <View style={styles.easyModeResult}>
                  <ThemedText>Your Guess was </ThemedText>
                  <ThemedText style={[styles.easyModeResultLabel,{ backgroundColor: result.isCorrectResult ? '#34C759' : '#FF3B30' }]}> 
                    {formatResultText(matchResult)}</ThemedText>
                </View>
              </View>)
            )
            :(
              <View>
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
                  {timeIsUp ? (
                    <View>
                    <ThemedText style={styles.noGuessLabel}> You did not submit a score, your time ran out...</ThemedText>
                    </View>
                  ) : (
                  <View style={styles.scoreResultRow}>
                    <View style={[styles.guessScoreBox, { backgroundColor: '#FF3B30' }]}>
                      <ThemedText style={styles.guessScoreText}>{homeScore}</ThemedText>
                    </View>
                    <ThemedText style={styles.resultDash}>-</ThemedText>
                    <View style={[styles.guessScoreBox, { backgroundColor: '#FF3B30' }]}>
                      <ThemedText style={styles.guessScoreText}>{awayScore}</ThemedText>
                    </View>
                  </View> )}
              </View>
          )}

        </View>

        {/* Points */}
        <View style={styles.pointsContainer}>
          <ThemedText style={styles.pointsText}>
            +{ result.userGamePoints} Points 🏆
          </ThemedText>
        </View>

        {/* Next Match Button */}
        <TouchableOpacity style={styles.nextButton} onPress={fetchRandomMatch}>
          <ThemedText style={styles.nextButtonText}>Next Match</ThemedText>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
  

const formatMatchDate = (dateString:string) => {
  if (!dateString) return 'Date TBD';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  try {
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Date Error';
  }
};


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
                <ThemedText style={styles.leagueSectionTitle}>{league.emoji} {league.name}</ThemedText>
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

  const WebModal = () => (
    <Modal
      visible={showErrorModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowErrorModal(false)}
    >
      <View style={styles.errorModalOverlay}>
        <View style={styles.errorModal}>
          <ThemedText style={styles.errorModalTitle}>Error</ThemedText>
          <ThemedText style={styles.errorModalMessage}>Please select a result before submitting.</ThemedText>
          <Pressable style={styles.errorModalButton} onPress={() => setShowErrorModal(false)}>
            <ThemedText style={styles.errorModalButtonText}>OK</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container,{paddingTop: insets.top + 15}]}>
        
      <StatusBar barStyle="light-content" />
      <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.appTitle}>Do You Remember</ThemedText>
        <TouchableOpacity 
          style={styles.leagueContainer}
          onPress={() => setShowLeagueFilter(true)}
        >
          <ThemedText style={styles.league}>
           {selectedLeague.emoji} {selectedLeague.name} • {selectedSeason}
          </ThemedText>
          <ThemedText style={styles.dropdownIcon}>⌄</ThemedText>
        </TouchableOpacity>
      </View>

      <View>
        <CountdownTimer timerDuration={timeLimit} onTimeUp={handeTimeIsUp} resetTrigger={resetTrigger}></CountdownTimer>
      </View>

      {matchData && (
  <>
    {/* Teams Display */}
    <View style={styles.teamsContainer}>
      {/* Home Team */}
      <View style={styles.teamContainer}>
        <View style={[
          styles.teamLogo, 
          !matchData.homeTeam?.logoUrl && { backgroundColor: homeColors }
          ]}>
          {matchData.homeTeam?.logoUrl ? (
            <Image
              source={{ uri: getFullLogoUrl(matchData.homeTeam.logoUrl) }}
              style={styles.logoImage}
              resizeMode="contain" // This ensures consistent sizing!
              // onLoadStart={() => console.log('🟡 Home logo loading started')}
              // onLoad={() => console.log('✅ Home logo loaded successfully')}
              onError={(error) => {
              // console.log('❌ Home logo failed to load:', error.nativeEvent.error);
              // console.log('🔍 Attempted URL:', getFullLogoUrl(matchData.homeTeam.logoUrl));
             
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
          {/* Match Info  */}
          <View style={styles.matchInfoContainer}>
            <View style={styles.matchInfoItem}>
              <ThemedText style={styles.infoTextSmall}>
               {formatMatchDate(matchData.matchDate)}
              </ThemedText>
            </View>
            <View style={styles.matchInfoSeparator} />
            <View style={styles.matchInfoItem}>
              <ThemedText style={styles.infoTextSmall} numberOfLines={1}>
                {matchData.stadiumName}
              </ThemedText>
            </View>
          </View>

      </View>

      {/* Away Team */}
      <View style={styles.teamContainer}>
        <View style={[
           styles.teamLogo, 
           !matchData.homeTeam?.logoUrl && { backgroundColor: homeColors }
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
          {matchData.awayTeam?.name  || 'Away Team'}
        </ThemedText>
      </View>
    </View>

  <View style={styles.modeToggleContainer}>
    <ThemedText style={styles.modePromptText}>Hard Mode?</ThemedText>
    <TouchableOpacity style={styles.toggleSwitch} onPress={toggleMode}>
      <View style={styles.toggleTrack}>
        <Animated.View 
          style={[
            styles.toggleThumb,
            {
              transform: [{
                translateX: switchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, 42],
                })
              }]
            }
          ]} 
        />
        {/* Dynamic styling in JSX */}
        <ThemedText style={[
          styles.toggleText, 
          styles.offText,
          { color: !isEasyMode ? '#FFFFFF' : '#666' }
        ]}>
          OFF
        </ThemedText>
        <ThemedText style={[
          styles.toggleText, 
          styles.onText,
          { color: isEasyMode ? '#FFFFFF' : '#666' }
        ]}>
          ON
        </ThemedText>
      </View>
    </TouchableOpacity>
  </View>

     {isEasyMode ? (
      <Animated.View style={{ opacity: fadeAnim }}>
        <ResultSelector
          homeTeamName={matchData?.homeTeam?.name } 
          awayTeamName={matchData?.awayTeam?.name }
          onSelectionChange={(optionId: string, optionLabel: string) => {
            handleResultSelect(optionId);
          }} 
          initialSelection={''}
        />
      </Animated.View>) : (
      <Animated.View style={{ opacity: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
      }) }}>
        <View style={styles.scoreSelectionContainer}>
          <ThemedText style={styles.scoreSelectionTitle}>Select Final Score</ThemedText>
          
          <View style={styles.scoreWheelsContainer}>
            <ScoreWheel 
              value={homeScore} 
              onValueChange={setHomeScore}
              teamColor={homeColors}
            />
            
            <View style={styles.dashContainer}>
              <ThemedText style={styles.scoreDash}>-</ThemedText>
            </View>
            
            <ScoreWheel 
              value={awayScore} 
              onValueChange={setAwayScore}
              teamColor={awayColors}
            />
          </View>
        </View>
      </Animated.View>)}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.submitButton, (loading || timeIsUp || isSubmitting) && styles.submitButtonDisabled]} 
              onPress={submitGuess}
              disabled={loading || timeIsUp || isSubmitting}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.newMatchButton} onPress={()=>{
              fetchRandomMatch();
              handleReset();
            }}>
              <ThemedText style={styles.newMatchButtonText}>🔄 New Match</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}

      <LeagueFilterModal />
      <WebModal />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
  },
    scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    minHeight: height * 1.2,
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
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  leagueContainer: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  league: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 24,
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
  infoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  matchInfoContainer: {
    marginTop:10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  matchInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchInfoSeparator: {
    width: 11,
    height: 2,
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
    width: 80,
    height: 80,
    borderRadius: 40, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#101010ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden', 
  },
  logoImage: {
    width: 80,  
    height: 80,     
  },
  teamLogoText: {
    fontSize: 24, 
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 90,
  },
  vsContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop:20,
  },
  vsText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#cbcbcbff',
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
    modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  modePromptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 15,
    padding:4
  },
  toggleSwitch: {
    padding: 4,
  },
  toggleTrack: {
    width: 80,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    borderWidth: 2,
    borderColor: '#3A3A3C',
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    position: 'absolute',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: 'bold',
    zIndex: 1,
  },
  offText: {
    left: 8,
  },
  onText: {
    right: 8,
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
    backgroundColor: '#A9A9A9',
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
    marginBottom:20,
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
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  errorModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color:'#171717'
  },
  errorModalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color:'#171717'
  },
  errorModalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  errorModalButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  // Result Screen Styles
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  resultEmoji: {
    fontSize: 44,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop:8,
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
  easyModeResult:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:10,
  },
  easyModeResultLabel:{
    paddingHorizontal:10,
    paddingVertical:6,
    backgroundColor:'#34C759',
    color:'#FFFFFF',
    fontWeight:400,
    borderRadius:8
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
  noGuessLabel:{
    fontSize:14,
    color:'#8E8E93'

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
