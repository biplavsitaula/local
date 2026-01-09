import { apiGet, ApiResponse } from '@/lib/api';


export interface AnalyticsMetric {
  value: number;
  growth: number;
  previousValue: number;
}

export interface AnalyticsSummary {
  totalRevenue: AnalyticsMetric;
  totalSales: AnalyticsMetric;
  avgOrderValue: AnalyticsMetric;
  productsSold: AnalyticsMetric;
}


export interface ChartDataPoint {
 name: string;
 value: number;
 [key: string]: any;
}


export interface SalesTrendData {
 month: string;
 revenue: number;
 count: number;
 sales?: number;
}


export const analyticsService = {
 /**
  * Get analytics summary
  */
 getSummary: async (): Promise<ApiResponse<AnalyticsSummary>> => {
   try {
     return await apiGet<AnalyticsSummary>('/analytics/summary');
   } catch (error: any) {
     // Handle 404 or other errors gracefully
     if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
       console.warn('Analytics summary endpoint not available, returning default values');
       return {
         success: true,
         message: 'Analytics summary not available',
         data: {
           totalRevenue: { value: 0, growth: 0, previousValue: 0 },
           totalSales: { value: 0, growth: 0, previousValue: 0 },
           avgOrderValue: { value: 0, growth: 0, previousValue: 0 },
           productsSold: { value: 0, growth: 0, previousValue: 0 },
         },
       };
     }
     throw error;
   }
 },


 /**
  * Get sales trend data (monthly)
  */
 getSalesTrend: async (): Promise<ApiResponse<SalesTrendData[]>> => {
   try {
     return await apiGet<SalesTrendData[]>('/analytics/sales-trend');
   } catch (error: any) {
     if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
       console.warn('Sales trend endpoint not available, returning empty array');
       return {
         success: true,
         message: 'Sales trend not available',
         data: [],
       };
     }
     throw error;
   }
 },


 /**
  * Get stock by category chart data
  */
 getStockByCategory: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
   try {
     return await apiGet<ChartDataPoint[]>('/analytics/stock-by-category');
   } catch (error: any) {
     if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
       console.warn('Stock by category endpoint not available, returning empty array');
       return {
         success: true,
         message: 'Stock by category not available',
         data: [],
       };
     }
     throw error;
   }
 },


 /**
  * Get products by category chart data
  */
 getProductsByCategory: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
   try {
     return await apiGet<ChartDataPoint[]>('/analytics/products-by-category');
   } catch (error: any) {
     if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
       console.warn('Products by category endpoint not available, returning empty array');
       return {
         success: true,
         message: 'Products by category not available',
         data: [],
       };
     }
     throw error;
   }
 },


 /**
  * Get revenue by category chart data
  */
 getRevenueByCategory: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
   try {
     return await apiGet<ChartDataPoint[]>('/analytics/revenue-by-category');
   } catch (error: any) {
     if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
       console.warn('Revenue by category endpoint not available, returning empty array');
       return {
         success: true,
         message: 'Revenue by category not available',
         data: [],
       };
     }
     throw error;
   }
 },
};







































