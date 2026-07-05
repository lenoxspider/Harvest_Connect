// src/api/reviewApi.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Review {
  id: string;
  targetId: string;
  targetType: 'FARMER' | 'STORAGE' | 'TRANSPORTER';
  rating: number;
  comment: string;
  createdAt: string;
}

export const reviewApi = {
  submitReview: async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = await AsyncStorage.getItem('user_reviews');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newReview);
      await AsyncStorage.setItem('user_reviews', JSON.stringify(list));
    } catch (e) {
      console.error('Error submitting review locally:', e);
    }

    return newReview;
  },

  getReviews: async (): Promise<Review[]> => {
    try {
      const existing = await AsyncStorage.getItem('user_reviews');
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};
