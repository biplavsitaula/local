import { apiGet, apiPut, ApiResponse } from '@/lib/api';
import { Product } from './products.service';

export interface StockAlert {
  product: Product;
  currentStock: number;
  threshold?: number;
  needsReorder: boolean;
}

export interface ReorderReport {
  products: StockAlert[];
  totalProducts: number;
  urgentCount: number;
  lowStockCount: number;
}

export interface StockAlertFilters {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LowStockFilters {
  threshold?: number;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const stockAlertsService = {
  /**
   * Get out of stock products (Admin only)
   */
  getOutOfStock: async (filters?: StockAlertFilters): Promise<ApiResponse<StockAlert[]>> => {
    try {
      return await apiGet<StockAlert[]>('/stock-alerts/out-of-stock', filters);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('Out of stock endpoint not available, returning empty array');
        return {
          success: true,
          message: 'Out of stock alerts not available',
          data: [],
        };
      }
      throw error;
    }
  },

  /**
   * Get low stock products (Admin only)
   */
  getLowStock: async (filters?: LowStockFilters): Promise<ApiResponse<StockAlert[]>> => {
    try {
      return await apiGet<StockAlert[]>('/stock-alerts/low-stock', filters);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('Low stock endpoint not available, returning empty array');
        return {
          success: true,
          message: 'Low stock alerts not available',
          data: [],
        };
      }
      throw error;
    }
  },

  /**
   * Get all stock alerts (Admin only)
   * Returns: { outOfStock, goingToBeOutOfStock, lowStock }
   */
  getAll: async (threshold?: number): Promise<ApiResponse<{
    outOfStock: StockAlert[];
    goingToBeOutOfStock: StockAlert[];
    lowStock: StockAlert[];
  }>> => {
    try {
      return await apiGet<{
        outOfStock: StockAlert[];
        goingToBeOutOfStock: StockAlert[];
        lowStock: StockAlert[];
      }>('/stock-alerts/all', threshold ? { threshold } : undefined);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('All stock alerts endpoint not available, returning empty data');
        return {
          success: true,
          message: 'Stock alerts not available',
          data: {
            outOfStock: [],
            goingToBeOutOfStock: [],
            lowStock: [],
          },
        };
      }
      throw error;
    }
  },

  /**
   * Get reorder report (Admin only)
   */
  getReorderReport: async (threshold?: number): Promise<ApiResponse<ReorderReport>> => {
    return apiGet<ReorderReport>('/stock-alerts/reorder-report', threshold ? { threshold } : undefined);
  },

  /**
   * Reorder a product
   */
  reorder: async (id: string, quantity: number): Promise<ApiResponse<Product>> => {
    return apiPut<Product>(`/stock-alerts/reorder/${id}`, { quantity });
  },
};



















