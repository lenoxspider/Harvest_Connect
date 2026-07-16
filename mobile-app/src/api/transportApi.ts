// src/api/transportApi.ts
import axiosInstance from './axios';
import { TruckListing, TransportBooking } from '../types';

const normalizeTruck = (raw: any): TruckListing => ({
  id: String(raw?.id ?? ''),
  transporter_id: String(raw?.transporter_id ?? raw?.transporterId ?? ''),
  truck_type: String(raw?.truck_type ?? raw?.truckType ?? ''),
  capacity_kg: Number(raw?.capacity_kg ?? raw?.capacityKg ?? 0),
  price_per_km: Number(raw?.price_per_km ?? raw?.pricePerKm ?? 0),
  available_from: String(raw?.available_from ?? raw?.availableFrom ?? new Date().toISOString()),
  location: String(raw?.location ?? ''),
  status: ((raw?.status ?? 'AVAILABLE') as TruckListing['status']),
});

const normalizeBooking = (raw: any): TransportBooking => ({
  id: String(raw?.id ?? ''),
  truck_id: String(raw?.truck_id ?? raw?.truckId ?? ''),
  farmer_id: String(raw?.farmer_id ?? raw?.farmerId ?? ''),
  pickup_location: String(raw?.pickup_location ?? raw?.pickupLocation ?? ''),
  delivery_location: String(raw?.delivery_location ?? raw?.deliveryLocation ?? ''),
  scheduled_date: String(raw?.scheduled_date ?? raw?.scheduledDate ?? ''),
  total_cost: Number(raw?.total_cost ?? raw?.totalCost ?? 0),
  status: ((raw?.status ?? 'PENDING') as TransportBooking['status']),
});

export const transportApi = {
  getTrucks: async (): Promise<TruckListing[]> => {
    const response = await axiosInstance.get('/api/transport/trucks');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeTruck);
  },

  addTruck: async (data: Omit<TruckListing, 'id' | 'transporter_id' | 'status'>) => {
    const response = await axiosInstance.post('/api/transport/trucks', {
      truckType: data.truck_type,
      capacityKg: data.capacity_kg,
      pricePerKm: data.price_per_km,
      availableFrom: data.available_from ? new Date(data.available_from).toISOString() : new Date().toISOString(),
      location: data.location,
      imageUrl: data.imageUrl,
    });
    return normalizeTruck(response.data);
  },

  getMyTrucks: async (): Promise<TruckListing[]> => {
    const response = await axiosInstance.get('/api/transport/trucks/my');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeTruck);
  },

  getIncomingBookings: async (): Promise<TransportBooking[]> => {
    const response = await axiosInstance.get('/api/transport/bookings/incoming');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeBooking);
  },

  getMyBookings: async (): Promise<TransportBooking[]> => {
    const response = await axiosInstance.get('/api/transport/bookings/my');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeBooking);
  },

  getBookingById: async (bookingId: string): Promise<TransportBooking> => {
    const response = await axiosInstance.get(`/api/transport/bookings/${bookingId}`);
    return normalizeBooking(response.data);
  },

  bookTransport: async (data: {
    truck_id: string;
    pickup_location: string;
    delivery_location: string;
    scheduled_date: string;
  }): Promise<TransportBooking> => {
    const response = await axiosInstance.post('/api/transport/bookings', {
      truckId: Number(data.truck_id),
      pickupLocation: data.pickup_location,
      deliveryLocation: data.delivery_location,
      scheduledDate: new Date(data.scheduled_date).toISOString(),
    });
    return normalizeBooking(response.data);
  },

  acceptBooking: async (bookingId: string): Promise<TransportBooking> => {
    const response = await axiosInstance.put(`/api/transport/bookings/${bookingId}/accept`);
    return normalizeBooking(response.data);
  },

  updateStatus: async (bookingId: string, status: TransportBooking['status']): Promise<TransportBooking> => {
    const response = await axiosInstance.put(`/api/transport/bookings/${bookingId}/status`, { status });
    return normalizeBooking(response.data);
  },
};
