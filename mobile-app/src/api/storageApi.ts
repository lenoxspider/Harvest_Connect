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

const normalizeBooking = (raw: any): StorageBooking => ({
  id: String(raw?.id ?? ''),
  storage_id: String(raw?.storage_id ?? raw?.storageListingId ?? raw?.listing?.id ?? raw?.listingId ?? ''),
  farmer_id: String(raw?.farmer_id ?? raw?.farmerId ?? ''),
  quantity_tons: Number(raw?.quantity_tons ?? raw?.quantityTons ?? 0),
  start_date: String(raw?.start_date ?? raw?.startDate ?? ''),
  end_date: String(raw?.end_date ?? raw?.endDate ?? ''),
  total_price: Number(raw?.total_price ?? raw?.totalPrice ?? 0),
  status: (raw?.status ?? 'PENDING') as StorageBooking['status'],
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
    return (Array.isArray(response.data) ? response.data : []).map(normalizeBooking);
  },

  bookStorage: async (data: {
    storage_id: string;
    quantity_tons: number;
    start_date: string;
    end_date: string;
  }): Promise<StorageBooking> => {
    const response = await axiosInstance.post('/api/storage/bookings', {
      storageListingId: data.storage_id,
      quantityTons: data.quantity_tons,
      startDate: data.start_date,
      endDate: data.end_date,
    });
    return normalizeBooking(response.data);
  },

  getMyBookings: async (): Promise<StorageBooking[]> => {
    const response = await axiosInstance.get('/api/storage/bookings/my');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeBooking);
  },

  confirmBooking: async (bookingId: string): Promise<StorageBooking> => {
    const response = await axiosInstance.put(`/api/storage/bookings/${bookingId}/confirm`);
    return normalizeBooking(response.data);
  },

  getBookingById: async (bookingId: string): Promise<StorageBooking> => {
    const response = await axiosInstance.get(`/api/storage/bookings/${bookingId}`);
    return normalizeBooking(response.data);
  },

  cancelBooking: async (bookingId: string): Promise<StorageBooking> => {
    const response = await axiosInstance.put(`/api/storage/bookings/${bookingId}/cancel`);
    return normalizeBooking(response.data);
  },

  getListings: async (filters?: {
    location?: string;
    available_tons?: number;
    min_price?: number;
    max_price?: number;
  }): Promise<StorageListing[]> => {
    const response = await axiosInstance.get('/api/storage/listings', {
      params: filters
        ? {
            location: filters.location,
            availableTons: filters.available_tons,
            minPrice: filters.min_price,
            maxPrice: filters.max_price,
          }
        : undefined,
    });
    return (Array.isArray(response.data) ? response.data : []).map(normalizeListing);
  },
};
