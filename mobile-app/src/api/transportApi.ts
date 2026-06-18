// src/api/transportApi.ts
import axiosInstance from './axios';
import { TruckListing, TransportBooking } from '../types';

export const transportApi = {
  addTruck: async (data: Omit<TruckListing, 'id' | 'transporter_id' | 'status'>) => {
    const response = await axiosInstance.post('/api/transport/trucks', data);
    return response.data;
  },

  getMyTrucks: async (): Promise<TruckListing[]> => {
    const response = await axiosInstance.get('/api/transport/trucks/my');
    return response.data;
  },

  getIncomingBookings: async (): Promise<TransportBooking[]> => {
    const response = await axiosInstance.get('/api/transport/bookings/incoming');
    return response.data;
  },

  bookTransport: async (data: {
    truck_id: string;
    pickup_location: string;
    delivery_location: string;
    scheduled_date: string;
  }): Promise<TransportBooking> => {
    const response = await axiosInstance.post('/api/transport/bookings', data);
    return response.data;
  },
};