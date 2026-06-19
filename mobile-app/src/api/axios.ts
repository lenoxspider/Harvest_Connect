// src/api/axios.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Helps debug device networking issues (LAN vs tunnel).
// Check Metro logs for this line when the app boots.
// eslint-disable-next-line no-console
console.log('[HarvestConnect] API_BASE_URL =', API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  async (config) => {
    const url = config.url ?? '';
    // Never attach JWT for auth endpoints (avoids stale token breaking register/login).
    if (url.startsWith('/api/auth/')) {
      return config;
    }
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user');
      // You'll need to implement navigation reset in AuthContext
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
