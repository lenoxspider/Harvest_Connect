import axiosInstance from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

export const paymentApi = {
  initiatePayment: async (data: {
    order_id: string;
    amount: number;
    transaction_type?: 'PRODUCE' | 'TRANSPORT' | 'STORAGE';
  }): Promise<Transaction> => {
    const rawUser = await AsyncStorage.getItem('user');
    const storedUser = rawUser ? JSON.parse(rawUser) : null;
    const phone = storedUser?.phoneNumber || storedUser?.phone || '+233200000000';

    const payload = {
      payerPhone: phone,
      amount: data.amount,
      transactionType: data.transaction_type || 'PRODUCE',
      referenceId: data.order_id,
    };

    const response = await axiosInstance.post('/api/payments/initiate', payload);
    return response.data;
  },

  getMyTransactions: async (): Promise<Transaction[]> => {
    const response = await axiosInstance.get('/api/payments/history/my');
    return response.data;
  },

  releaseEscrow: async (transactionId: string): Promise<any> => {
    const response = await axiosInstance.post(`/api/payments/release/${transactionId}`);
    return response.data;
  },
};