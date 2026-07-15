// src/api/authApi.ts
import axiosInstance from './axios';
import { User } from '../types';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  login: async (phoneNumber: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/api/auth/login', { phoneNumber, password });
    return response.data as AuthResponse;
  },

  register: async (data: {
    fullName: string;
    phoneNumber: string;
    password: string;
    role: string;
    region: string;
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/api/auth/register', data);
    return response.data as AuthResponse;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    // Uses axiosInstance with the refresh URL (skipAuth list excludes /api/auth/refresh
    // from attaching the old bearer token, so this is safe to call directly).
    const response = await axiosInstance.post('/api/auth/refresh', { refreshToken });
    return response.data as AuthResponse;
  },
};
