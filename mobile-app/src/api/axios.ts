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
    // Don't attach JWT for login/register/refresh only.
    // `/api/auth/me` MUST include the JWT.
    const skipAuth =
      url === '/api/auth/login' ||
      url === '/api/auth/register' ||
      url === '/api/auth/refresh';

    if (skipAuth) {
      // eslint-disable-next-line no-console
      console.log('[HTTP]', (config.method ?? 'GET').toUpperCase(), (config.baseURL ?? '') + url, '(no auth header)');
      return config;
    }
    const token = await AsyncStorage.getItem('jwt_token');
    const rawUser = await AsyncStorage.getItem('user');
    const storedUser = rawUser ? JSON.parse(rawUser) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (storedUser?.id) {
      config.headers['X-User-Id'] = String(storedUser.id);
    }
    if (storedUser?.role) {
      config.headers['X-User-Role'] = String(storedUser.role);
    }
    // eslint-disable-next-line no-console
    console.log('[HTTP]', (config.method ?? 'GET').toUpperCase(), (config.baseURL ?? '') + url, token ? '(auth)' : '(no token)');
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
    // eslint-disable-next-line no-console
    console.log(
      '[HTTP ERROR]',
      error?.config?.method?.toUpperCase?.() ?? 'UNKNOWN',
      (error?.config?.baseURL ?? '') + (error?.config?.url ?? ''),
      'status=',
      error?.response?.status,
      'data=',
      error?.response?.data
    );
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user');
      // You'll need to implement navigation reset in AuthContext
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
