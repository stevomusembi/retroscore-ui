import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../contexts/authContext';
import retroScoreApi from '../services/api';

interface League {
  id: string;
  name: string;
  flag: string;
  country: string;
}

interface UserSettings {
  preferredLeague?: string;
  gameDifficulty?: string;
  timeLimit?:string;
  notificationsEnabled?: boolean;
  hintEnabled?:boolean;
}

const LEAGUES: League[] = [
  { id: 'epl', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  { id: 'laliga', name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
  { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
  { id: 'seriea', name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
  { id: 'ligue1', name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
];

const DIFFICULTIES = [
  { id: 'EASY', name: 'Easy', description: 'Perfect for beginners', color: '#4CAF50' },
  { id: 'MEDIUM', name: 'Medium', description: 'Balanced challenge', color: '#FF9800' },
  { id: 'HARD', name: 'Hard', description: 'For experienced players', color: '#F44336' },
  { id: 'EXPERT', name: 'Expert', description: 'Ultimate challenge', color: '#9C27B0' },
];

const TIMELIMIT = [
  { id:  'TEN_SECONDS', name: '10 seconds', description: 'Ultimate challenge ', color: '#F44336' },
  { id: 'TWENTY_SECONDS', name: '20 seconds', description: 'For experienced players', color: '#FF9800' },
  { id: 'TWENTY_FIVE_SECONDS', name: '25 seconds', description: 'Balanced challenge', color: '#9C27B0' },
  { id: 'THIRTY_SECONDS', name: '30 seconds', description: 'Perfect for beginners', color: '#274eb0ff' },
   { id: 'FORTY_FIVE_SECONDS', name: '45 seconds', description: 'All the time', color: '#4CAF50' }
];


export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsData, setSettingsData] = useState<UserSettings>({});
  
  // Modal states
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [difficultyModalVisible, setDifficultyModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [timelimitModalVisible, setTimeLimitModalVisible] = useState(false);

  const {logout} = useAuth();

  const getUserSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data: UserSettings = await retroScoreApi.getUserSettings();
      setSettingsData(data);
      console.log("settings data => ", data);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

   const updateLeaguePreference = async (leagueId:string) => {
    try {
      setLoading(true);
      await retroScoreApi.updatLeaguePreferrence(leagueId);
      setSettingsData({ ...settingsData, preferredLeague: leagueId  });
      setLeagueModalVisible(false); // Auto-close modal
      Alert.alert('Success', `Preferred league updated!`);
    } catch (err: any) {
      setLeagueModalVisible(false); // Auto-close modal
      Alert.alert('Error', 'Failed to update preferd league')
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateDifficulty = async (difficulty: string) => {
    try {
      setLoading(true);
      await retroScoreApi.updateGameDifficulty(difficulty);
      setSettingsData({ ...settingsData, gameDifficulty: difficulty });
      setDifficultyModalVisible(false); // Auto-close modal
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update difficulty');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

   const updateTimeLimit = async (limit: string) => {
    try {
      setLoading(true);
      await retroScoreApi.updateGameTimeLimit(limit);
      setSettingsData({ ...settingsData, timeLimit: limit });
      setTimeLimitModalVisible(false); 
      
      // update session storage 
      const storedUser = sessionStorage.getItem("user");
      if(storedUser){
        try{
          let user = JSON.parse(storedUser);
          user.timeLimit = limit;
          sessionStorage.setItem("user",JSON.stringify(user));

        } catch(error){
          console.error("Failed to parse user form session storage",error);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update time limit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = async (enabled: boolean) => {
    try {
      setLoading(true);
      await retroScoreApi.updateNotification(enabled);
      setSettingsData({ ...settingsData, notificationsEnabled: enabled });
      Alert.alert('Success', `Notifications ${enabled ? 'enabled' : 'disabled'}!`);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

   const updateHint = async (enabled: boolean) => {
    try {
      setLoading(true);
      await retroScoreApi.updateHint(enabled);
      setSettingsData({ ...settingsData, hintEnabled: enabled });
      Alert.alert('Success', `Hint ${enabled ? 'enabled' : 'disabled'}!`);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update hint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    getUserSettings();
  }, []);

  const getSelectedLeague = () => {
    return LEAGUES.find(league => league.id === settingsData.preferredLeague);
  };

  const getSelectedDifficulty = () => {
    return DIFFICULTIES.find(diff => diff.id === settingsData.gameDifficulty);
  };

    const getSelectedTimeLimit = () => {
    return TIMELIMIT.find(limit => limit.id === settingsData.timeLimit);
  };

  const  handleLogout = async ()=> {
     await logout();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={[styles.container,{paddingTop:insets.top,height:'auto'}]}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Settings</ThemedText>
        
        {/* Notifications Toggle */}
        <ThemedView style={styles.notificationContainer}>
          <ThemedView style={styles.notificationRow}>
            <ThemedText style={styles.notificationLabel}>🔔 Notifications</ThemedText>
            <Switch
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={settingsData.notificationsEnabled ? '#fff' : '#f4f3f4'}
              onValueChange={updateNotifications}
              value={settingsData.notificationsEnabled || false}
              disabled={loading}
            />
          </ThemedView>
        </ThemedView>

             {/* hints Toggle */}
        <ThemedView style={styles.notificationContainer}>
          <ThemedView style={styles.notificationRow}>
            <ThemedText style={styles.notificationLabel}>💡 Show hint </ThemedText>
            <Switch
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={settingsData.hintEnabled ? '#fff' : '#f4f3f4'}
              onValueChange={updateHint}
              value={settingsData.hintEnabled || false}
              disabled={loading}
            />
          </ThemedView>
        </ThemedView>


        <ThemedView style={styles.settingsList}>
          {/* League Preferences */}
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => setLeagueModalVisible(true)}
            disabled={loading}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingText}>🏆 League Preferences</ThemedText>
                <ThemedText style={styles.currentValueDisplay}>
                  {getSelectedLeague() 
                    ? `${getSelectedLeague()?.name} ${getSelectedLeague()?.flag} `
                    : "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League"
                  }
                </ThemedText>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Game Difficulty */}
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => setDifficultyModalVisible(true)}
            disabled={loading}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingText}>📊 Game Difficulty</ThemedText>
                <ThemedText style={[
                  styles.currentValueDisplay,
                  getSelectedDifficulty() && { color: getSelectedDifficulty()?.color }
                ]}>
                  {getSelectedDifficulty()?.name || "Medium"}
                </ThemedText>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </TouchableOpacity>

             {/* Game Time Limit */}
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => setTimeLimitModalVisible(true)}
            disabled={loading}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingText}>⏳ Game Time Limit</ThemedText>
                <ThemedText style={[
                  styles.currentValueDisplay,
                  getSelectedTimeLimit() && { color: getSelectedTimeLimit()?.color }
                ]}>
                  {getSelectedTimeLimit()?.name || "Thirty Seconds"}
                </ThemedText>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </TouchableOpacity>

             {/*Logout */}
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => handleLogout()}
            disabled={loading}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingText}>Logout</ThemedText>
                <ThemedText style={styles.currentValueDisplay}>logout
                </ThemedText>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity 
            style={[styles.settingItem,{marginBottom:50}]} 
            onPress={() => setAboutModalVisible(true)}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingText}>ℹ️ About</ThemedText>
                <ThemedText style={styles.currentValueDisplay}>
                  App information & details
                </ThemedText>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* League Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={leagueModalVisible}
        onRequestClose={() => setLeagueModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select League</ThemedText>
            <ScrollView style={styles.optionsList}>
              {LEAGUES.map((league) => (
                <TouchableOpacity
                  key={league.id}
                  style={[
                    styles.optionItem,
                    settingsData.preferredLeague === league.id && styles.selectedOption
                  ]}
                  onPress={() => updateLeaguePreference(league.id)}
                  disabled={loading}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.flagEmoji}>{league.flag}</Text>
                    <View style={styles.optionTextContainer}>
                      <ThemedText style={styles.optionTitle}>{league.name}</ThemedText>
                      <ThemedText style={styles.optionSubtitle}>{league.country}</ThemedText>
                    </View>
                    {settingsData.preferredLeague === league.id && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Difficulty Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={difficultyModalVisible}
        onRequestClose={() => setDifficultyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select Difficulty</ThemedText>
            <ScrollView style={styles.optionsList}>
              {DIFFICULTIES.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty.id}
                  style={[
                    styles.optionItem,
                    settingsData.gameDifficulty === difficulty.id && styles.selectedOption
                  ]}
                  onPress={() => updateDifficulty(difficulty.id)}
                  disabled={loading}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.difficultyIndicator, { backgroundColor: difficulty.color }]} />
                    <View style={styles.optionTextContainer}>
                      <ThemedText style={styles.optionTitle}>{difficulty.name}</ThemedText>
                      <ThemedText style={styles.optionSubtitle}>{difficulty.description}</ThemedText>
                    </View>
                    {settingsData.gameDifficulty === difficulty.id && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    {/* time limit Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={timelimitModalVisible}
        onRequestClose={() => setTimeLimitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select time limit</ThemedText>
            <ScrollView style={styles.optionsList}>
              {TIMELIMIT.map((limit) => (
                <TouchableOpacity
                  key={limit.id}
                  style={[
                    styles.optionItem,
                    settingsData.timeLimit === limit.id && styles.selectedOption
                  ]}
                  onPress={() => updateTimeLimit(limit.id)}
                  disabled={loading}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.difficultyIndicator, { backgroundColor: limit.color }]} />
                    <View style={styles.optionTextContainer}>
                      <ThemedText style={styles.optionTitle}>{limit.name}</ThemedText>
                      <ThemedText style={styles.optionSubtitle}>{limit.description}</ThemedText>
                    </View>
                    {settingsData.timeLimit === limit.id && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* About Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>About RetroScore</ThemedText>
            <ScrollView style={styles.aboutContent}>
              <ThemedText style={styles.aboutText}>
                🏆 Welcome to RetroScore - the ultimate football quiz experience!
              </ThemedText>
              <ThemedText style={styles.aboutText}>
                Test your football knowledge with questions spanning across different leagues, 
                eras, and difficulty levels. From classic matches to modern-day football, 
                challenge yourself and climb the leaderboards!
              </ThemedText>
              <ThemedText style={styles.aboutSection}>Features:</ThemedText>
              <ThemedText style={styles.aboutBullet}>• Multiple league support</ThemedText>
              <ThemedText style={styles.aboutBullet}>• Adaptive difficulty levels</ThemedText>
              <ThemedText style={styles.aboutBullet}>• Historical football data</ThemedText>
              <ThemedText style={styles.aboutBullet}>• Customizable notifications</ThemedText>
              
              <ThemedText style={styles.aboutSection}>Version:</ThemedText>
              <ThemedText style={styles.aboutText}>1.0.0</ThemedText>
              
              <ThemedText style={styles.aboutSection}>Developer:</ThemedText>
              <ThemedText style={styles.aboutText}>RetroScore Team</ThemedText>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAboutModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
 
  },
   scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    padding: 20,
    
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  notificationContainer: {
    backgroundColor: '#2c2c2e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 20,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor:'#2c2c2e'
  },
  notificationLabel: {
    fontSize: 18,
    color: '#fff',
  },
  settingsList: {
    gap: 15,
  },
  settingItem: {
    backgroundColor: '#2c2c2e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  currentValueDisplay: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
    marginLeft:5,
  },
  chevronIcon: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2c2c2e',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    backgroundColor: '#3a3a3c',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF5015',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  flagEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  difficultyIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  checkMark: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aboutContent: {
    maxHeight: 400,
  },
  aboutText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    lineHeight: 24,
  },
  aboutSection: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  aboutBullet: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
    marginLeft: 10,
  },
});