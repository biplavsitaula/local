import { apiGet, ApiResponse } from '@/lib/api';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalSales: number;
  avgOrderValue: number;
  productsSold: number;
  totalRevenueGrowth?: number;
  totalSalesGrowth?: number;
  avgOrderValueGrowth?: number;
  productsSoldGrowth?: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface SalesTrendData {
  month: string;
  revenue: number;
  sales: number;
}

export const analyticsService = {
  /**
   * Get analytics summary
   */
  getSummary: async (): Promise<ApiResponse<AnalyticsSummary>> => {
    return apiGet<AnalyticsSummary>('/analytics/summary');
  },

  /**
   * Get sales trend data (monthly)
   */
  getSalesTrend: async (): Promise<ApiResponse<SalesTrendData[]>> => {
    return apiGet<SalesTrendData[]>('/analytics/sales-trend');
  },

  /**
   * Get stock by category chart data
   */
  getStockByCategory: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
    return apiGet<ChartDataPoint[]>('/analytics/stock-by-category');
  },

  /**
   * Get products by category chart data
   */
  getProductsByCategory: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
    return apiGet<ChartDataPoint[]>('/analytics/products-by-category');
  },

  /**
   * Get revenue by category chart data
   */
  getRevenueByCategory: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
    return apiGet<ChartDataPoint[]>('/analytics/revenue-by-category');
  },
};















