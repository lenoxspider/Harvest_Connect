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
      const response = await axiosInstance.get('/api/notifications/my');
      const list = Array.isArray(response.data) ? response.data : [];
      return list.filter((n: any) => !(n.read || n.isRead || n.is_read)).length;
    } catch {
      return 0;
    }
  },

  getOrderStats: async (): Promise<BuyerStats> => {
    const res = await axiosInstance.get('/api/produce/orders/my');
    const orders = Array.isArray(res.data) ? res.data : [];
    
    const activeOrders = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
    const delivered = orders.filter((o: any) => o.status === 'DELIVERED').length;
    const totalSpent = orders
      .filter((o: any) => o.status !== 'CANCELLED')
      .reduce((sum: number, o: any) => sum + (o.totalPrice ?? o.total_price ?? 0), 0);

    return { activeOrders, delivered, totalSpent };
  },

  getCategories: async (): Promise<string[]> => {
    const res = await axiosInstance.get('/api/produce/categories');
    return Array.isArray(res.data) ? res.data : [];
  },

  getListings: async (params?: {
    featured?: boolean;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<BuyerListing[]> => {
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
      region: String(item.region ?? item.location ?? 'Ghana'),
      rating: Number(item.rating ?? 4.8),
      pricePerBag: Number(item.pricePerBag ?? item.price_per_kg ?? 0),
      imageUrl: item.imageUrl ?? item.image_url ?? undefined,
      category: String(item.category ?? ''),
    }));
  },

  getFarmers: async (params?: { limit?: number }): Promise<FarmerProfile[]> => {
    const res = await axiosInstance.get('/api/produce/listings');
    const list = Array.isArray(res.data) ? res.data : [];
    
    // Extract unique farmer IDs from listings dynamically
    const uniqueFarmersMap = new Map<string, FarmerProfile>();
    list.forEach((item: any) => {
      if (item.farmerId || item.farmer_id) {
        const fid = String(item.farmerId ?? item.farmer_id);
        if (!uniqueFarmersMap.has(fid)) {
          uniqueFarmersMap.set(fid, {
            id: fid,
            fullName: `Farmer #${fid.substring(0, 4)}`,
            region: String(item.location ?? item.region ?? 'Ghana'),
            rating: 4.8,
            avatarUrl: undefined,
          });
        }
      }
    });
    
    const farmersArray = Array.from(uniqueFarmersMap.values());
    return params?.limit ? farmersArray.slice(0, params.limit) : farmersArray;
  },

  getRecentOrders: async (params?: { limit?: number }): Promise<BuyerOrder[]> => {
    const res = await axiosInstance.get('/api/produce/orders/my');
    const list = Array.isArray(res.data) ? res.data : [];
    const mapped = list.map((item: any) => ({
      id: String(item.id ?? ''),
      produceName: String(item.produceName ?? item.title ?? 'Produce Order'),
      produceImage: item.produceImage ?? item.imageUrl ?? undefined,
      quantity: String(item.quantity ?? item.quantity_kg ? `${item.quantity_kg} kg` : '1 bag'),
      createdAt: String(item.createdAt ?? item.created_at ?? ''),
      status: (item.status ?? 'PENDING') as BuyerOrder['status'],
    }));
    return params?.limit ? mapped.slice(0, params.limit) : mapped;
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
