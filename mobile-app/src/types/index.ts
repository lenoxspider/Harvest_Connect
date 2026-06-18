// src/types/index.ts

export interface User {
  id: string;
  full_name: string;
  phone_number: string;
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
  capacity_kg: number;
  price_per_kg_per_day: number;
  location: string;
  has_cooling: boolean;
  status: 'AVAILABLE' | 'FULL';
}

export interface StorageBooking {
  id: string;
  storage_id: string;
  farmer_id: string;
  quantity_kg: number;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED';
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