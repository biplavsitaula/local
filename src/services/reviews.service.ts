import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

export interface Review {
  _id?: string;
  id?: string;
  productId: string;
  productName?: string;
  customerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    stars: number;
    count: number;
  }[];
}

export interface ReviewFilters {
  search?: string;
  productId?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const reviewsService = {
  /**
   * Get all reviews with filters (Public endpoint)
   */
  getAll: async (filters?: ReviewFilters): Promise<ApiResponse<Review[]>> => {
    return apiGet<Review[]>('/reviews', filters, false);
  },

  /**
   * Get review summary (Public endpoint)
   */
  getSummary: async (): Promise<ApiResponse<ReviewSummary>> => {
    try {
      return await apiGet<ReviewSummary>('/reviews/summary', undefined, false);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('Review summary endpoint not available, returning default values');
        return {
          success: true,
          message: 'Review summary not available',
          data: {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: [],
          },
        };
      }
      throw error;
    }
  },

  /**
   * Get most reviewed products (Public endpoint)
   */
  getMostReviewed: async (limit?: number): Promise<ApiResponse<any[]>> => {
    try {
      return await apiGet<any[]>('/reviews/most-reviewed', limit ? { limit } : undefined, false);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('Most reviewed products endpoint not available, returning empty array');
        return {
          success: true,
          message: 'Most reviewed products not available',
          data: [],
        };
      }
      throw error;
    }
  },

  /**
   * Create a new review (Public endpoint)
   */
  create: async (review: {
    productId: string;
    customerName: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<Review>> => {
    return apiPost<Review>('/reviews', review, false);
  },

  /**
   * Update a review (Admin only)
   */
  update: async (id: string, review: Partial<Review>): Promise<ApiResponse<Review>> => {
    return apiPut<Review>(`/reviews/${id}`, review);
  },

  /**
   * Delete a review (Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/reviews/${id}`);
  },
};










