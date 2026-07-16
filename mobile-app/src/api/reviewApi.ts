// src/api/reviewApi.ts
import axiosInstance from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_KEY = 'user_reviews_v2';

export interface Review {
  id: string;
  listingId: string;
  reviewerId?: string;
  targetType: 'FARMER' | 'STORAGE' | 'TRANSPORTER'; // kept for UI display context
  rating: number;
  comment: string;
  createdAt: string;
}

const normalizeReview = (raw: any, targetType: Review['targetType'] = 'FARMER'): Review => ({
  id: String(raw?.id ?? Math.random().toString(36).substring(7)),
  listingId: String(raw?.listingId ?? raw?.listing_id ?? ''),
  reviewerId: raw?.reviewerId ? String(raw.reviewerId) : undefined,
  targetType,
  rating: Number(raw?.rating ?? 5),
  comment: String(raw?.comment ?? ''),
  createdAt: raw?.createdAt ? String(raw.createdAt) : new Date().toISOString(),
});

export const reviewApi = {
  /**
   * Submit a review.
   * Sends to POST /api/produce/listings/{listingId}/reviews.
   * On network failure, saves locally so the review is not lost.
   */
  submitReview: async (review: {
    targetId: string;      // listing ID
    targetType: Review['targetType'];
    rating: number;
    comment: string;
  }): Promise<Review> => {
    try {
      const res = await axiosInstance.post(
        `/api/produce/listings/${review.targetId}/reviews`,
        { rating: review.rating, comment: review.comment }
      );
      const saved = normalizeReview(res.data, review.targetType);

      // Mirror to local cache so getReviews() works offline too
      await _appendToLocal(saved);
      return saved;
    } catch (e: any) {
      // If the server returned 409 (already reviewed), surface that clearly
      if (e?.response?.status === 409) {
        throw new Error('You have already submitted a review for this listing.');
      }
      // Otherwise fall back to local-only storage so the review isn't lost
      console.warn('[ReviewAPI] Backend unavailable — saving review locally:', e?.message);
      const local: Review = {
        ...normalizeReview({}, review.targetType),
        listingId: review.targetId,
        rating: review.rating,
        comment: review.comment,
      };
      await _appendToLocal(local);
      return local;
    }
  },

  /**
   * Fetch reviews for a listing from the backend.
   * Falls back to locally cached reviews for that listing on failure.
   */
  getReviewsForListing: async (
    listingId: string,
    targetType: Review['targetType'] = 'FARMER'
  ): Promise<Review[]> => {
    try {
      const res = await axiosInstance.get(`/api/produce/listings/${listingId}/reviews`);
      return (Array.isArray(res.data) ? res.data : []).map((r: any) =>
        normalizeReview(r, targetType)
      );
    } catch {
      // Fall back to local cache filtered by listingId
      return (await _getLocal()).filter(r => r.listingId === listingId);
    }
  },

  /**
   * Returns all reviews stored locally (submitted while offline or from any listing).
   */
  getReviews: async (): Promise<Review[]> => _getLocal(),
};

// ─── Local cache helpers ─────────────────────────────────────────────────────

async function _getLocal(): Promise<Review[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function _appendToLocal(review: Review): Promise<void> {
  try {
    const list = await _getLocal();
    // Avoid duplicates if the same review was already cached
    if (!list.some(r => r.id === review.id)) {
      list.push(review);
      await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error('[ReviewAPI] Failed to cache review locally:', e);
  }
}
