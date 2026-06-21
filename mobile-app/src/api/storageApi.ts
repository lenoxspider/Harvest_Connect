// src/api/storageApi.ts
import axiosInstance from './axios';
import { StorageListing, StorageBooking } from '../types';

const normalizeListing = (raw: any): StorageListing => ({
  id: String(raw?.id ?? ''),
  owner_id: String(raw?.owner_id ?? raw?.ownerId ?? ''),
  facility_name: String(raw?.facility_name ?? raw?.facilityName ?? ''),
  location: String(raw?.location ?? ''),
  capacity_tons: Number(raw?.capacity_tons ?? raw?.capacityTons ?? 0),
  available_tons: Number(raw?.available_tons ?? raw?.availableTons ?? 0),
  price_per_ton_per_day: Number(raw?.price_per_ton_per_day ?? raw?.pricePerTonPerDay ?? 0),
  temperature_range: raw?.temperature_range ?? raw?.temperatureRange ?? null,
  is_available: Boolean(raw?.is_available ?? raw?.isAvailable ?? true),
});

export const storageApi = {
  addStorage: async (data: Omit<StorageListing, 'id' | 'owner_id'>): Promise<StorageListing> => {
    const response = await axiosInstance.post('/api/storage/listings', {
      facilityName: data.facility_name,
      location: data.location,
      capacityTons: data.capacity_tons,
      pricePerTonPerDay: data.price_per_ton_per_day,
      temperatureRange: data.temperature_range ?? undefined,
    });
    return normalizeListing(response.data);
  },

  getMyFacilities: async (): Promise<StorageListing[]> => {
    const response = await axiosInstance.get('/api/storage/listings/my');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeListing);
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
