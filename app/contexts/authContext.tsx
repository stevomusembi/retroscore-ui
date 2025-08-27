import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
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
  login: (googleToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:8080/auth/google/mobile', {
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

  const logout = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_DATA_KEY)
      ]);
      setUser(null);
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
    isAuthenticated: !!user,
    login,
    logout,
    showLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};