// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { User } from '../types';
import { authApi } from '../api/authApi';
import { registerForPushNotificationsAsync } from '../hooks/usePushNotifications';
import { colors } from '../theme/colors';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    phone_number: string;
    password: string;
    role: string;
    region: string;
  }) => Promise<void>;
  updateProfile: (fullName: string, region: string) => Promise<void>;
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
  useEffect(() => {
    if (user) {
      if (user.role === 'FARMER') {
        colors.bg = '#EDF4ED';
        colors.bg2 = '#1E5631';
        colors.text = '#2C3E50';
        colors.muted = '#5D6D7E';
        colors.glass = '#FFFFFF';
        colors.glassStrong = '#F4F6F6';
        colors.border = '#D5D8DC';
        colors.borderStrong = '#BDC3C7';
        colors.accent = '#1E5631';
        colors.accent2 = '#2E7D32';
      } else if (user.role === 'STORAGE_OWNER') {
        colors.bg = '#EDF4F9';
        colors.bg2 = '#1565C0';
        colors.text = '#2C3E50';
        colors.muted = '#5D6D7E';
        colors.glass = '#FFFFFF';
        colors.glassStrong = '#F4F6F6';
        colors.border = '#D5D8DC';
        colors.borderStrong = '#BDC3C7';
        colors.accent = '#1565C0';
        colors.accent2 = '#1976D2';
      } else if (user.role === 'TRANSPORTER') {
        colors.bg = '#FAF0E6';
        colors.bg2 = '#E65100';
        colors.text = '#2C3E50';
        colors.muted = '#5D6D7E';
        colors.glass = '#FFFFFF';
        colors.glassStrong = '#F4F6F6';
        colors.border = '#D5D8DC';
        colors.borderStrong = '#BDC3C7';
        colors.accent = '#E65100';
        colors.accent2 = '#F57C00';
      } else {
        colors.bg = '#070A12';
        colors.bg2 = '#0B1020';
        colors.text = '#EAF0FF';
        colors.muted = 'rgba(234, 240, 255, 0.72)';
        colors.glass = 'rgba(255, 255, 255, 0.10)';
        colors.glassStrong = 'rgba(255, 255, 255, 0.16)';
        colors.border = 'rgba(255, 255, 255, 0.18)';
        colors.borderStrong = 'rgba(255, 255, 255, 0.26)';
        colors.accent = '#7CFFB2';
        colors.accent2 = '#5CC8FF';
      }
    } else {
      colors.bg = '#070A12';
      colors.bg2 = '#0B1020';
      colors.text = '#EAF0FF';
      colors.muted = 'rgba(234, 240, 255, 0.72)';
      colors.glass = 'rgba(255, 255, 255, 0.10)';
      colors.glassStrong = 'rgba(255, 255, 255, 0.16)';
      colors.border = 'rgba(255, 255, 255, 0.18)';
      colors.borderStrong = 'rgba(255, 255, 255, 0.26)';
      colors.accent = '#7CFFB2';
      colors.accent2 = '#5CC8FF';
    }
  }, [user]);

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

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await authApi.login(phoneNumber, password);
      
      await AsyncStorage.setItem('jwt_token', response.accessToken);
      setToken(response.accessToken);

      const userData = await authApi.getMe();
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Request location permission (non-blocking)
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          await Location.getCurrentPositionAsync({});
        }
      } catch {
        // ignore
      }

      // Register device for push notifications (non-blocking)
      registerForPushNotificationsAsync().catch(e =>
        console.warn('[Push] Registration error:', e)
      );
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
      await authApi.register({
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        password: data.password,
        role: data.role,
        region: data.region,
      });

      await login(data.phone_number, data.password);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (fullName: string, region: string) => {
    if (!user) return;
    const updatedUser = { ...user, fullName, region };
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
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
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
