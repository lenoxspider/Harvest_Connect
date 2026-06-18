// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { User } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone_number: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    phone_number: string;
    password: string;
    role: string;
    region: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt_token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        // Verify token is still valid
        try {
          const userData = await authApi.getMe();
          setToken(storedToken);
          setUser(userData);
        } catch (error) {
          // Token invalid, clear storage
          await AsyncStorage.multiRemove(['jwt_token', 'user']);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone_number: string, password: string) => {
    try {
      const response = await authApi.login(phone_number, password);
      
      // Get location for region if not set
      let userRegion = response.user.region;
      if (!userRegion) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            // You could reverse geocode here, but for now use stored region
          }
        } catch (error) {
          console.log('Location permission not granted');
        }
      }

      await AsyncStorage.setItem('jwt_token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    full_name: string;
    phone_number: string;
    password: string;
    role: string;
    region: string;
  }) => {
    try {
      const response = await authApi.register(data);
      
      // Auto-login after registration
      await login(data.phone_number, data.password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['jwt_token', 'user']);
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};