// src/api/paymentApi.ts
import axiosInstance from './axios';
import { Transaction } from '../types';

export const paymentApi = {
  initiatePayment: async (data: {
    order_id: string;
    amount: number;
  }): Promise<Transaction> => {
    const response = await axiosInstance.post('/api/payments/initiate', data);
    return response.data;
  },

  getMyTransactions: async (): Promise<Transaction[]> => {
    const response = await axiosInstance.get('/api/payments/transactions/my');
    return response.data;
  },
};