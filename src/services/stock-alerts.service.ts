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

export const stockAlertsService = {
  /**
   * Get out of stock products
   */
  getOutOfStock: async (): Promise<ApiResponse<StockAlert[]>> => {
    return apiGet<StockAlert[]>('/stock-alerts/out-of-stock');
  },

  /**
   * Get low stock products
   */
  getLowStock: async (threshold?: number): Promise<ApiResponse<StockAlert[]>> => {
    return apiGet<StockAlert[]>('/stock-alerts/low-stock', threshold ? { threshold } : undefined);
  },

  /**
   * Get all stock alerts
   */
  getAll: async (threshold?: number): Promise<ApiResponse<StockAlert[]>> => {
    return apiGet<StockAlert[]>('/stock-alerts/all', threshold ? { threshold } : undefined);
  },

  /**
   * Get reorder report
   */
  getReorderReport: async (): Promise<ApiResponse<ReorderReport>> => {
    return apiGet<ReorderReport>('/stock-alerts/reorder-report');
  },

  /**
   * Reorder a product
   */
  reorder: async (id: string, quantity: number): Promise<ApiResponse<Product>> => {
    return apiPut<Product>(`/stock-alerts/reorder/${id}`, { quantity });
  },
};















