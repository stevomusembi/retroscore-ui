import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  isGuest:boolean;
  timeLimit?:string;
}

export interface AuthResponse {
  token: string;
  message: string;
  success: boolean;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated:(value: boolean) => void;
  login: (googleToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginAsGuest:()=>Promise<boolean>;
  showLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(AUTH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_DATA_KEY)
      ]);

      if (storedToken && storedUser) {
        // Verify token is still valid (you might want to add token expiry check)
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      // Clear potentially corrupted data
      await logout();
    } finally {
      setIsLoading(false);
    }
  };



  const login = async (googleToken: string): Promise<boolean> => {
    // console.log("We got to the login api method to backend")
    try {
      setIsLoading(true);
      // console.log("endpoin is => ", process.env.EXPO_PUBLIC_API_BASE_URL);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/google/mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleToken: googleToken
        }),
      });

      const authResponse: AuthResponse = await response.json();

      if (authResponse.success && authResponse.token) {
        // Store auth data securely
        await Promise.all([
          SecureStore.setItemAsync(AUTH_TOKEN_KEY, authResponse.token),
          SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(authResponse.user))
        ]);

        setUser(authResponse.user);
        return true;
      } else {
        console.error('Login failed:', authResponse.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

   const loginAsGuest = async (): Promise<boolean> => {
    try {
      // Generate a unique guest ID(can refine this later)
      // const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const guestId = 1;
      
      const guestUser: User = {
        id: guestId,
        isGuest: true,
        email: 'guestuser',
        name: 'guestuser',
        timeLimit:"THIRTY_SECONDS"
      };

      setUser(guestUser);
      setIsAuthenticated(false);

      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      sessionStorage.setItem("user", JSON.stringify(guestUser));
      // Optionally, register this guest with your backend for tracking
      // await fetch('YOUR_BACKEND_URL/auth/guest', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ guestId }),
      // });

      return true;
    } catch (error) {
      console.error('Guest login error:', error);
      return false;
    }
  };


  const logout = async () => {
    try {
      setIsLoading(true);
      if(Platform.OS == 'web'){
        sessionStorage.clear();
      } else {

        await Promise.all([
          SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
          SecureStore.deleteItemAsync(USER_DATA_KEY),
        ]);
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showLoginModal = () => {
    // This will be implemented to show a modal prompting login
    console.log('Show login modal triggered');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated:!!user,
    setIsAuthenticated,
    login,
    logout,
    loginAsGuest,
    showLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

 export  const debugToken = async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      
      // console.log("=== DEBUG TOKEN INFO ===");
      // console.log("Token:", token);
      // console.log("User Data:", userData);
      // console.log("=== END DEBUG ===");
      
      
    } catch (error) {
      console.log("Error retrieving token:", error);
    }
  };


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};