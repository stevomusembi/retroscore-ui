import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import retroScoreApi from '../services/api';

export default function SettingsScreen() {

   const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [settingsData, setSettingsData] = useState<any>();
  
    const getUserSettings = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const data: any = await retroScoreApi.getUserSettings(1);
        setSettingsData(data);
        console.log("settings data => ", data);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      getUserSettings();
    }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Settings</ThemedText>
        
        <ThemedView style={styles.settingsList}>
          <TouchableOpacity style={styles.settingItem}>
            <ThemedText style={styles.settingText}>🏆 League Preferences</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <ThemedText style={styles.settingText}>📊 Game Difficulty</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <ThemedText style={styles.settingText}>🔔 Notifications</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <ThemedText style={styles.settingText}>ℹ️ About</ThemedText>
          </TouchableOpacity>
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
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
  settingText: {
    fontSize: 18,
    color: '#fff',
  },
});