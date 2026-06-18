// src/api/produceApi.ts
import axiosInstance from './axios';
import { ProduceListing, ProduceOrder } from '../types';

export const produceApi = {
  createListing: async (data: Omit<ProduceListing, 'id' | 'farmer_id' | 'status' | 'created_at'>) => {
    const response = await axiosInstance.post('/api/produce/listings', data);
    return response.data;
  },

  getListings: async (): Promise<ProduceListing[]> => {
    const response = await axiosInstance.get('/api/produce/listings');
    return response.data;
  },

  getMyListings: async (): Promise<ProduceListing[]> => {
    const response = await axiosInstance.get('/api/produce/listings/my');
    return response.data;
  },

  getListingById: async (id: string): Promise<ProduceListing> => {
    const response = await axiosInstance.get(`/api/produce/listings/${id}`);
    return response.data;
  },

  placeOrder: async (data: {
    listing_id: string;
    quantity_kg: number;
  }): Promise<ProduceOrder> => {
    const response = await axiosInstance.post('/api/produce/orders', data);
    return response.data;
  },

  getMyOrders: async (): Promise<ProduceOrder[]> => {
    const response = await axiosInstance.get('/api/produce/orders/my');
    return response.data;
  },
};