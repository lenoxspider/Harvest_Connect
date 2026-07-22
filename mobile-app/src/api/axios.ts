// src/api/axios.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// Toggle between Render cloud deployment and local Docker backup
const USE_RENDER_CLOUD = true; 
const RENDER_GATEWAY_URL = 'https://harvestconnect-api-gateway.onrender.com/'; // <-- REPLACE with your actual Render API Gateway URL

const getBaseUrl = () => {
  if (USE_RENDER_CLOUD) {
    // Strip trailing slash if the user accidentally included it
    return RENDER_GATEWAY_URL.trim().replace(/\/$/, '');
  }

  // 1. Check if env variable is explicitly defined
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // 2. Extract from Metro's hostUri (looks like "192.168.1.100:8081" or similar)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:8080`;
    }
  }
  
  // 3. Fallback to localhost
  return 'http://localhost:8080';
};

export const API_BASE_URL = getBaseUrl();

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
    const xUserId = config.headers['X-User-Id'] ?? (storedUser?.id ? String(storedUser.id) : undefined);
    if (xUserId) {
      const idStr = String(xUserId);
      if (idStr.includes('-')) {
        config.headers['X-User-Id'] = idStr;
      } else {
        const paddedId = idStr.padStart(12, '0');
        config.headers['X-User-Id'] = `00000000-0000-0000-0000-${paddedId}`;
      }
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

// ─── Token refresh state ────────────────────────────────────────────────────
// isRefreshing prevents multiple simultaneous refresh calls.
// failedQueue holds requests that arrived while a refresh was in-flight.
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

// Response interceptor — handles 401 with silent token refresh
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

    const originalRequest = error.config;

    // Only attempt refresh on 401s that are not already a retry or a refresh call itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/refresh'
    ) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
        if (!storedRefreshToken) throw new Error('No refresh token stored');

        // POST /api/auth/refresh — skipAuth list ensures no stale Bearer is sent
        const refreshRes = await axiosInstance.post('/api/auth/refresh', {
          refreshToken: storedRefreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = refreshRes.data;

        // Persist new tokens
        await AsyncStorage.setItem('jwt_token', accessToken);
        await AsyncStorage.setItem('refresh_token', newRefreshToken);

        // Update default header for future requests
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — wipe tokens so AuthContext redirects to login
        await AsyncStorage.multiRemove(['jwt_token', 'refresh_token', 'user']);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
