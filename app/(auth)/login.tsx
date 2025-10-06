// app/auth/login.tsx
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
  const { login, loginAsGuest, setIsAuthenticated } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });

    // Staggered fade-in animation
    Animated.sequence([
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleWebGoogleLogin = () => {
    setIsLoading(true);
    
    const popup = window.open(
      "http://localhost:8080/oauth2/authorization/google?popup=true",
      "login",
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== 'http://localhost:8080') {
        return;
      }
      
      if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        try {
          const { accessToken, email, username, id, time_limit } = event.data.data;
          sessionStorage.setItem("token", accessToken);
          const user = { 
            id: id,
            name: username,
            email: email,
            timeLimit: time_limit
          };
          sessionStorage.setItem("user", JSON.stringify(user));
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
    };
    
    window.addEventListener('message', messageListener);
    
    const checkClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkClosed);
        setIsLoading(false);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
    
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
    }, 300000);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
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

  return (
    <LinearGradient
      colors={[ '#35353544', '#000000', '#39013d7d', '#35353544']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.2, 0.4, 0.8, 1]}
      style={styles.container}
    >
      <View style={styles.contentWrapper}>
        {/* Logo Placeholder */}
        <Animated.View 
          style={[
            styles.logoContainer,
            { opacity: titleFadeAnim }
          ]}
        >
          {/* <Image
            source={{ uri: '' }} // Add your logo URL here
            style={styles.logo}
            resizeMode="contain"
          /> */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
        </Animated.View>

        {/* Header Section */}
        <Animated.View 
          style={[
            styles.headerSection,
            { opacity: titleFadeAnim }
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>
              Retro Sc<Text style={styles.emojiText}>⚽</Text>re
            </Text>
          </View>
          <Text style={styles.subtitle}>Do you remember the score ?</Text>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Animated.View 
            style={[
              styles.welcomeSection,
              { opacity: contentFadeAnim }
            ]}
          >
            <Text style={styles.welcomeTitle}>Welcome !</Text>
            <Text style={styles.welcomeText}>
              Test your ball memory 🎯 one match at a time and climb the leaderboard 🏆
            </Text>
          </Animated.View>

          {/* Social Proof */}
          <Animated.View 
            style={[
              styles.socialProofContainer,
              { opacity: contentFadeAnim }
            ]}
          >
            <Text style={styles.socialProofText}>
              Join 100+ testing their memory
            </Text>
          </Animated.View>

          {/* Login Options */}
          <Animated.View 
            style={[
              styles.loginSection,
              { opacity: buttonFadeAnim }
            ]}
          >
            {Platform.OS !== 'web' ? (
              <GoogleSigninButton
                style={styles.googleSigninButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              />
            ) : (
              <View style={styles.buttonGlowContainer}>
                <View style={styles.buttonGlow} />
                <TouchableOpacity
                  style={[styles.loginButton, styles.googleButton]}
                  onPress={handleWebGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#333333" size="small" />
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
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Footer Text */}
          <Animated.View 
            style={[
              styles.footerSection,
              { opacity: buttonFadeAnim }
            ]}
          >
            <Text style={styles.footerText}>
              Sign in to save your progress and compete on leaderboards
            </Text>
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: height * 0.06,
  },
  titleContainer: {
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'Roboto',
      web: 'Righteous, cursive',
    }),
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  emojiText: {
    fontSize: 48,
  },
  subtitle: {
    fontSize: 17,
    color: '#b8b8b8',
    fontStyle: 'italic',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 70,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'Roboto',
      web: 'Righteous, cursive',
    }),
  },
  welcomeText: {
    fontSize: 17,
    color: '#d4d4d4',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  socialProofContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  socialProofText: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loginSection: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonGlowContainer: {
    position: 'relative',
    width: '100%',
  },
  buttonGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
      },
      default: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
    }),
  },
  googleSigninButton: {
    width: '100%',
    height: 56,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 12,
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    gap: 14,
  },
  googleLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
  },
  footerSection: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

