import axiosInstance from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

const normalizeTransaction = (raw: any): Transaction => ({
  id: String(raw?.id ?? ''),
  user_id: String(raw?.payerPhone ?? ''),
  order_id: String(raw?.referenceId ?? ''),
  amount: Number(raw?.amount ?? 0),
  type: (raw?.transactionType ?? 'PRODUCE') as any,
  status: (raw?.status ?? 'PENDING') as any,
  created_at: String(raw?.createdAt ?? raw?.created_at ?? new Date().toISOString()),
});

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
    return normalizeTransaction(response.data);
  },

  getMyTransactions: async (): Promise<Transaction[]> => {
    const response = await axiosInstance.get('/api/payments/history/my');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeTransaction);
  },

  releaseEscrow: async (transactionId: string): Promise<any> => {
    const response = await axiosInstance.post(`/api/payments/release/${transactionId}`);
    return response.data;
  },
};