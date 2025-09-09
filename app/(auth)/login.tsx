// app/auth/login.tsx
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../contexts/authContext';

const { width, height } = Dimensions.get('window');


export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsGuest,setIsAuthenticated } = useAuth();

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // From Google Cloud Console
      // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      offlineAccess: true,
      hostedDomain: '', // Optional
      forceCodeForRefreshToken: true,
    });

  console.log("GoogleSignin configured with webClientId:", process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
  console.log("=== END CONFIG DEBUG ===");
  }, []);

 const handleWebGoogleLogin = () => {
  setIsLoading(true);
  
  // Open popup with popup parameter
  const popup = window.open(
    "http://localhost:8080/oauth2/authorization/google?popup=true",
    "login",
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );
  
  // Listen for messages from popup
  const messageListener = async (event: MessageEvent) => {
    // Verify origin for security will change in production
    if (event.origin !== 'http://localhost:8080') {
      return;
    }
    
    if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
      try {
        const { accessToken, email, username, id, time_limit } = event.data.data;
        console.log("user data from backend is => ",event.data.data);
        sessionStorage.setItem("token", accessToken);
        const user = { id:id,
                     name: username,
                     email:email,
                     timeLimit:time_limit
                     };
        sessionStorage.setItem("user", JSON.stringify(user));
        console.log("stored user", user);
        setIsAuthenticated(true);

        router.replace('/(tabs)/home');
       
      } catch (error) {
        console.error('Error processing login:', error);
        Alert.alert('Error', 'Failed to process login');
      } finally {
        setIsLoading(false);
        window.removeEventListener('message', messageListener);
        if (popup && !popup.closed) {
          popup.close();
        }
      }
    } else if (event.data.type === 'GOOGLE_LOGIN_ERROR') {
      const errorMessage = event.data.message || 'Login failed';
      const errorCode = event.data.code || 'unknown_error';
      
      console.error('Login error:', { code: errorCode, message: errorMessage });
      Alert.alert('Login Error', errorMessage);
      
      setIsLoading(false);
      window.removeEventListener('message', messageListener);
      if (popup && !popup.closed) {
        popup.close();
      }
    }
  }
  
  // Add message listener
  window.addEventListener('message', messageListener);
  
  // Handle popup closed manually (user cancelled)
  const checkClosed = setInterval(() => {
    if (popup && popup.closed) {
      clearInterval(checkClosed);
      setIsLoading(false);
      window.removeEventListener('message', messageListener);
    }
  }, 1000);
  
  // Cleanup after 5 minutes (timeout)
  setTimeout(() => {
    clearInterval(checkClosed);
    window.removeEventListener('message', messageListener);
    if (popup && !popup.closed) {
      popup.close();
    }
    if (isLoading) {
      setIsLoading(false);
      Alert.alert('Timeout', 'Login process timed out');
    }
  }, 300000); // 5 minutes
};

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get user info
      const userInfo = await GoogleSignin.signIn();
      
      console.log('User info:', userInfo);
      
      // Get access token if needed
      const tokens = await GoogleSignin.getTokens();
      console.log('Access token:', tokens.accessToken);
      
      // Use your existing login function with the access token
      const success = await login(tokens.accessToken);
      if (success) {
        router.replace('/(tabs)/home'); 
      } else {
        Alert.alert('Login Failed', 'Unable to authenticate with our servers');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Sign-In Cancelled', 'Google sign-in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign-In in Progress', 'Google sign-in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services Error', 'Google Play Services not available');
      } else {
        Alert.alert('Sign-In Error', error.message || 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    setIsLoading(true);
    try {
      const success = await loginAsGuest();
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', 'Failed to continue as guest');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Guest login error:', error);
    } finally {
      setIsLoading(false);
    }
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
          {/* Google Login Button - Using the library's button for native app and custom button for web */}
        {Platform.OS !== 'web' ? (
          <GoogleSigninButton
            style={styles.googleSigninButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          />) :(
        <TouchableOpacity
          style={[styles.loginButton, styles.googleButton]}
          onPress={handleWebGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Image
                source={require('../../assets/images/google-logo.png')}
                style={styles.googleLogo}
                resizeMode="contain"
              />
              <Text style={styles.loginButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>)}

          {/* Guest Option */}
          {/* <TouchableOpacity
            style={[styles.loginButton, styles.guestButton]}
            onPress={handleGuestContinue}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>Continue without login</Text>
          </TouchableOpacity> */}
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
  googleSigninButton: {
    width: '100%',
    height: 56,
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
  googleLogo: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#ffffff',
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