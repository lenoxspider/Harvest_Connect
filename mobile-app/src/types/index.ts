// src/types/index.ts

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: 'FARMER' | 'BUYER' | 'TRANSPORTER' | 'STORAGE_OWNER';
  region: string;
}

export interface ProduceListing {
  id: string;
  farmer_id: string;
  title: string;
  category: string;
  quantity_kg: number;
  price_per_kg: number;
  location: string;
  description: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  created_at: string;
  images?: string[];
}

export interface ProduceOrder {
  id: string;
  listing_id: string;
  buyer_id: string;
  quantity_kg: number;
  total_price: number;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
}

export interface TruckListing {
  id: string;
  transporter_id: string;
  truck_type: string;
  capacity_kg: number;
  price_per_km: number;
  available_from: string;
  location: string;
  status: 'AVAILABLE' | 'BOOKED';
  imageUrl?: string;
}

export interface TransportBooking {
  id: string;
  truck_id: string;
  farmer_id: string;
  pickup_location: string;
  delivery_location: string;
  scheduled_date: string;
  total_cost: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
}

export interface StorageListing {
  id: string;
  owner_id: string;
  facility_name: string;
  capacity_tons: number;
  available_tons: number;
  price_per_ton_per_day: number;
  location: string;
  temperature_range?: string | null;
  is_available: boolean;
  imageUrl?: string;
}

export interface StorageBooking {
  id: string;
  storage_id: string;
  farmer_id: string;
  quantity_tons: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Transaction {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  type: 'PAYMENT' | 'REFUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}
