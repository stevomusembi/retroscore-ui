// app/auth/login.tsx
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
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
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../contexts/authContext';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsGuest, setIsAuthenticated } = useAuth();
  const localImage = require('../../assets/images/logo.png');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
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
    <ThemedView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={localImage} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Remember the score at the final whistle?</Text>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.mainMessage}>Test your memory. Climb the leaderboard.</Text>
          
          {/* Login Button */}
          <View style={styles.loginSection}>
            {Platform.OS !== 'web' ? (
              <GoogleSigninButton
                style={styles.googleSigninButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              />
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleWebGoogleLogin}
                  disabled={isLoading}
                  activeOpacity={0.85}
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
          </View>

          <Text style={styles.footerNote}>Join 100+ players testing their memory</Text>
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: isSmallScreen ? height * 0.06 : height * 0.1,
    paddingBottom: isSmallScreen ? 40 : 60,
  },
  logoSection: {
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: isSmallScreen ? 280 : 320,
    height: isSmallScreen ? 280 : 320,
  },
  subtitle: {
    fontSize: isSmallScreen ? 15 : 16,
    color: '#a0a0a0',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  ctaSection: {
    alignItems: 'center',
    gap: 32,
  },
  mainMessage: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 32 : 38,
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'Roboto',
      web: 'Righteous, cursive',
    }),
  },
  loginSection: {
    width: '100%',
  },
  buttonContainer: {
    position: 'relative',
    width: '100%',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    gap: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
      },
      default: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  googleSigninButton: {
    width: '100%',
    height: 56,
  },
  googleLogo: {
    width: 22,
    height: 22,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.3,
  },
  footerNote: {
    fontSize: 13,
    color: '#707070',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});