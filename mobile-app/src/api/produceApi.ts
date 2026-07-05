// src/api/produceApi.ts
import axiosInstance from './axios';
import { ProduceListing, ProduceOrder } from '../types';

const normalizeListing = (raw: any): ProduceListing => ({
  id: String(raw?.id ?? ''),
  farmer_id: String(raw?.farmer_id ?? raw?.farmerId ?? ''),
  title: String(raw?.title ?? ''),
  category: String(raw?.category ?? ''),
  quantity_kg: Number(raw?.quantity_kg ?? raw?.quantityKg ?? 0),
  price_per_kg: Number(raw?.price_per_kg ?? raw?.pricePerKg ?? 0),
  location: String(raw?.location ?? ''),
  description: String(raw?.description ?? ''),
  status: (raw?.status ?? 'AVAILABLE') as ProduceListing['status'],
  created_at: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
});

const normalizeOrder = (raw: any): ProduceOrder => ({
  id: String(raw?.id ?? ''),
  listing_id: String(raw?.listing_id ?? raw?.listingId ?? ''),
  buyer_id: String(raw?.buyer_id ?? raw?.buyerId ?? ''),
  quantity_kg: Number(raw?.quantity_kg ?? raw?.quantityKg ?? 0),
  total_price: Number(raw?.total_price ?? raw?.totalPrice ?? 0),
  status: (raw?.status ?? 'PENDING') as ProduceOrder['status'],
  created_at: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
});

export const produceApi = {
  createListing: async (data: Omit<ProduceListing, 'id' | 'farmer_id' | 'status' | 'created_at'>) => {
    const payload = {
      title: data.title,
      category: data.category,
      description: data.description,
      location: data.location,
      quantityKg: data.quantity_kg,
      pricePerKg: data.price_per_kg,
    };
    const response = await axiosInstance.post('/api/produce/listings', payload);
    return normalizeListing(response.data);
  },

  getListings: async (): Promise<ProduceListing[]> => {
    const response = await axiosInstance.get('/api/produce/listings');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeListing);
  },

  getMyListings: async (): Promise<ProduceListing[]> => {
    const response = await axiosInstance.get('/api/produce/listings/my');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeListing);
  },

  getListingById: async (id: string): Promise<ProduceListing> => {
    const response = await axiosInstance.get(`/api/produce/listings/${id}`);
    return normalizeListing(response.data);
  },

  placeOrder: async (data: {
    listing_id: string;
    quantity_kg: number;
  }): Promise<ProduceOrder> => {
    const response = await axiosInstance.post('/api/produce/orders', data);
    return normalizeOrder(response.data);
  },

  getMyOrders: async (): Promise<ProduceOrder[]> => {
    const response = await axiosInstance.get('/api/produce/orders/my');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeOrder);
  },

  acceptOrder: async (orderId: string): Promise<ProduceOrder> => {
    const response = await axiosInstance.put(`/api/produce/orders/${orderId}/accept`);
    return normalizeOrder(response.data);
  },

  declineOrder: async (orderId: string): Promise<ProduceOrder> => {
    const response = await axiosInstance.put(`/api/produce/orders/${orderId}/decline`);
    return normalizeOrder(response.data);
  },

  deleteListing: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/produce/listings/${id}`);
  },
};
