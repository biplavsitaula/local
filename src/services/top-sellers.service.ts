import { apiGet, ApiResponse } from '@/lib/api';
import { Product } from './products.service';

export interface TopSellersInsights {
  trendingCategory: string;
  bestCategory: string;
  peakSalesDay: string;
}

export interface TopSellersFilters {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TopSellerProduct extends Product {
  rank?: number;
  status?: string;
}

export const topSellersService = {
  /**
   * Get top selling products (Admin only)
   * Returns products with rank and status
   */
  getProducts: async (filters?: TopSellersFilters): Promise<ApiResponse<TopSellerProduct[]>> => {
    try {
      return await apiGet<TopSellerProduct[]>('/top-sellers/products', filters);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('Top sellers products endpoint not available, returning empty array');
        return {
          success: true,
          message: 'Top sellers not available',
          data: [],
        };
      }
      throw error;
    }
  },

  /**
   * Get top sellers insights
   */
  getInsights: async (): Promise<ApiResponse<TopSellersInsights>> => {
    try {
      return await apiGet<TopSellersInsights>('/top-sellers/insights');
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('Top sellers insights endpoint not available, returning default values');
        return {
          success: true,
          message: 'Top sellers insights not available',
          data: {
            trendingCategory: 'N/A',
            bestCategory: 'N/A',
            peakSalesDay: 'N/A',
          },
        };
      }
      throw error;
    }
  },
};



















