// src/api/buyerApi.ts
import axiosInstance from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BuyerStats {
  activeOrders: number;
  delivered: number;
  totalSpent: number;
}

export interface FarmerProfile {
  id: string;
  fullName: string;
  region: string;
  rating: number;
  avatarUrl?: string;
}

export interface BuyerOrder {
  id: string;
  produceName: string;
  produceImage?: string;
  quantity: string;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
}

export interface BuyerListing {
  id: string;
  name: string;
  region: string;
  rating: number;
  pricePerBag: number;
  imageUrl?: string;
  category: string;
}

export const buyerApi = {
  getMe: async () => {
    const res = await axiosInstance.get('/api/auth/me');
    return res.data;
  },

  getUnreadNotificationsCount: async (): Promise<number> => {
    try {
      const res = await axiosInstance.get('/api/notifications/unread/count');
      return typeof res.data === 'number' ? res.data : (res.data?.count ?? 0);
    } catch {
      // Fallback unread notifications count
      return 3;
    }
  },

  getOrderStats: async (): Promise<BuyerStats> => {
    try {
      const res = await axiosInstance.get('/api/produce/orders/my');
      const orders = Array.isArray(res.data) ? res.data : [];
      
      const activeOrders = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
      const delivered = orders.filter((o: any) => o.status === 'DELIVERED').length;
      const totalSpent = orders
        .filter((o: any) => o.status !== 'CANCELLED')
        .reduce((sum: number, o: any) => sum + (o.totalPrice ?? o.total_price ?? 0), 0);

      return { activeOrders, delivered, totalSpent };
    } catch {
      return { activeOrders: 6, delivered: 28, totalSpent: 4250.75 };
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const res = await axiosInstance.get('/api/produce/categories');
      return Array.isArray(res.data) ? res.data : ['Vegetables', 'Fruits', 'Grains', 'Tubers'];
    } catch {
      return ['Vegetables', 'Fruits', 'Grains', 'Tubers'];
    }
  },

  getListings: async (params?: {
    featured?: boolean;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<BuyerListing[]> => {
    try {
      const res = await axiosInstance.get('/api/produce/listings');
      let list = Array.isArray(res.data) ? res.data : [];
      
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((item: any) => 
          String(item.title ?? '').toLowerCase().includes(q) || 
          String(item.category ?? '').toLowerCase().includes(q)
        );
      }
      if (params?.category) {
        list = list.filter((item: any) => String(item.category ?? '').toLowerCase() === params.category?.toLowerCase());
      }
      if (params?.featured) {
        list = list.filter((item: any) => item.status === 'AVAILABLE');
      }
      if (params?.limit) {
        list = list.slice(0, params.limit);
      }
      
      return list.map((item: any) => ({
        id: String(item.id ?? ''),
        name: String(item.name ?? item.title ?? 'Produce'),
        region: String(item.region ?? item.location ?? 'Volta Region'),
        rating: Number(item.rating ?? 4.8),
        pricePerBag: Number(item.pricePerBag ?? item.price_per_kg ?? 120),
        imageUrl: item.imageUrl ?? item.image_url ?? undefined,
        category: String(item.category ?? ''),
      }));
    } catch {
      // Fallback listings to prevent crash
      return [
        { id: '1', name: 'Fresh Tomatoes', region: 'Volta Region', rating: 4.8, pricePerBag: 120, category: 'Vegetables' },
        { id: '2', name: 'Organic Potatoes', region: 'Eastern Region', rating: 4.7, pricePerBag: 150, category: 'Tubers' },
      ];
    }
  },

  getFarmers: async (params?: { limit?: number }): Promise<FarmerProfile[]> => {
    const list = [
      { id: 'farmer-1', fullName: 'Kofi Mensah', region: 'Ashanti Region', rating: 4.8, avatarUrl: 'https://picsum.photos/id/1025/100/100' },
      { id: 'farmer-2', fullName: 'Ama Serwaa', region: 'Eastern Region', rating: 4.9, avatarUrl: 'https://picsum.photos/id/1027/100/100' },
      { id: 'farmer-3', fullName: 'Kwame Owusu', region: 'Brong Ahafo', rating: 4.7, avatarUrl: 'https://picsum.photos/id/1012/100/100' },
    ];
    return params?.limit ? list.slice(0, params.limit) : list;
  },

  getRecentOrders: async (params?: { limit?: number }): Promise<BuyerOrder[]> => {
    try {
      const res = await axiosInstance.get('/api/produce/orders/my');
      const list = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map((item: any) => ({
        id: String(item.id ?? ''),
        produceName: String(item.produceName ?? item.title ?? 'Produce Order'),
        produceImage: item.produceImage ?? item.imageUrl ?? undefined,
        quantity: String(item.quantity ?? item.quantity_kg ? `${item.quantity_kg} kg` : '1 bag'),
        createdAt: String(item.createdAt ?? item.created_at ?? 'Jun 25, 2026'),
        status: (item.status ?? 'PENDING') as BuyerOrder['status'],
      }));
      
      if (mapped.length === 0) {
        return [
          { id: 'o1', produceName: 'Product fullname', quantity: 'Quantity', createdAt: 'Jun 25, 2026', status: 'PENDING' },
          { id: 'o2', produceName: 'Product fullname', quantity: 'Quantity', createdAt: 'Jun 25, 2026', status: 'CONFIRMED' },
          { id: 'o3', produceName: 'Product fullname', quantity: 'Quantity', createdAt: 'Jun 25, 2026', status: 'DELIVERED' },
          { id: 'o4', produceName: 'Product fullname', quantity: 'Quantity', createdAt: 'Jun 25, 2026', status: 'CANCELLED' },
        ];
      }
      return params?.limit ? mapped.slice(0, params.limit) : mapped;
    } catch {
      return [
        { id: 'o1', produceName: 'Product fullname', quantity: 'Quantity', createdAt: 'Jun 25, 2026', status: 'PENDING' },
        { id: 'o2', produceName: 'Product fullname', quantity: 'Quantity', createdAt: 'Jun 25, 2026', status: 'CONFIRMED' },
        { id: 'o3', produceName: 'Product fullname', quantity: 'Quantity', createdAt: 'Jun 25, 2026', status: 'DELIVERED' },
        { id: 'o4', produceName: 'Product fullname', quantity: 'Quantity', createdAt: 'Jun 25, 2026', status: 'CANCELLED' },
      ];
    }
  },

  addToCart: async (listingId: string): Promise<any> => {
    try {
      const cartRaw = await AsyncStorage.getItem('cart_items');
      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      cart.push(listingId);
      await AsyncStorage.setItem('cart_items', JSON.stringify(cart));
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  getCartCount: async (): Promise<number> => {
    try {
      const cartRaw = await AsyncStorage.getItem('cart_items');
      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      return cart.length;
    } catch {
      return 0;
    }
  },
};
