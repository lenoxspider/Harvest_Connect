// src/api/authApi.ts
import axiosInstance from './axios';
import { User } from '../types';

export const authApi = {
  login: async (phone_number: string, password: string) => {
    const response = await axiosInstance.post('/api/auth/login', {
      phone_number,
      password,
    });
    return response.data;
  },

  register: async (data: {
    full_name: string;
    phone_number: string;
    password: string;
    role: string;
    region: string;
  }) => {
    const response = await axiosInstance.post('/api/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },
};