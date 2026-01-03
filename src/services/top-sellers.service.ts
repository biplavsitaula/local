import { apiGet, ApiResponse } from '@/lib/api';
import { Product } from './products.service';

export interface TopSellersInsights {
  trendingCategory: string;
  bestCategory: string;
  peakSalesDay: string;
}

export const topSellersService = {
  /**
   * Get top selling products
   */
  getProducts: async (): Promise<ApiResponse<Product[]>> => {
    return apiGet<Product[]>('/top-sellers/products');
  },

  /**
   * Get top sellers insights
   */
  getInsights: async (): Promise<ApiResponse<TopSellersInsights>> => {
    return apiGet<TopSellersInsights>('/top-sellers/insights');
  },
};















