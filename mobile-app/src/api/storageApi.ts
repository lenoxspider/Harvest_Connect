// src/api/storageApi.ts
import axiosInstance from './axios';
import { StorageListing, StorageBooking } from '../types';

export const storageApi = {
  addStorage: async (data: Omit<StorageListing, 'id' | 'owner_id' | 'status'>) => {
    const response = await axiosInstance.post('/api/storage/facilities', data);
    return response.data;
  },

  getMyFacilities: async (): Promise<StorageListing[]> => {
    const response = await axiosInstance.get('/api/storage/facilities/my');
    return response.data;
  },

  getIncomingBookings: async (): Promise<StorageBooking[]> => {
    const response = await axiosInstance.get('/api/storage/bookings/incoming');
    return response.data;
  },

  bookStorage: async (data: {
    storage_id: string;
    quantity_kg: number;
    start_date: string;
    end_date: string;
  }): Promise<StorageBooking> => {
    const response = await axiosInstance.post('/api/storage/bookings', data);
    return response.data;
  },
};