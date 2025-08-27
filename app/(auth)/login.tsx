// app/auth/login.tsx
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/authContext';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Replace with your actual Google client ID
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with your actual client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID', // Replace if you have a separate iOS client ID
    webClientId: 'YOUR_WEB_CLIENT_ID', // Replace if you have a web client ID
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleResponse = async (accessToken: string | undefined) => {
    if (!accessToken) {
      Alert.alert('Authentication Error', 'Failed to get Google access token');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(accessToken);
      if (success) {
        router.replace('/(tabs)/home'); // Navigate to main app (adjust path as needed)
      } else {
        Alert.alert('Login Failed', 'Unable to authenticate with our servers');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate Google login');
      console.error('Google login error:', error);
    }
  };

  const handleGuestContinue = () => {
    router.replace('/(tabs)/home'); // Navigate to main app as guest
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.appTitle}>RetroScore</Text>
        <Text style={styles.subtitle}>Remember the classics</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeText}>
            Test your football knowledge with historic matches and climb the leaderboards
          </Text>
        </View>

        {/* Login Options */}
        <View style={styles.loginSection}>
          {/* Google Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={!request || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.loginButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Guest Option */}
          <TouchableOpacity
            style={[styles.loginButton, styles.guestButton]}
            onPress={handleGuestContinue}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>Continue without login</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Sign in to save your progress and compete on leaderboards
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: height * 0.15,
    marginBottom: height * 0.08,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loginSection: {
    gap: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: '#4285f4',
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#ffffff',
    // color: '#4285f4',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#cccccc',
  },
  footerSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
});