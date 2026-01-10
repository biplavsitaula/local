import { apiGet, apiPost, apiPut, ApiResponse } from '@/lib/api';

export interface Settings {
  notifications?: {
    lowStockAlerts?: boolean;
    outOfStockAlerts?: boolean;
    newReviewNotifications?: boolean;
  };
  stockThresholds?: {
    lowStock?: number;
    criticalStock?: number;
  };
  storeInfo?: {
    storeName?: string;
    contactEmail?: string;
  };
  [key: string]: any; // Allow additional settings
}

export const settingsService = {
  /**
   * Get current settings (Admin only)
   */
  get: async (): Promise<ApiResponse<Settings>> => {
    try {
      return await apiGet<Settings>('/settings');
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('Cannot GET')) {
        console.warn('Settings endpoint not available, returning default values');
        return {
          success: true,
          message: 'Using default settings',
          data: {
            notifications: {
              lowStockAlerts: true,
              outOfStockAlerts: true,
              newReviewNotifications: false,
            },
            stockThresholds: {
              lowStock: 10,
              criticalStock: 5,
            },
            storeInfo: {
              storeName: 'Flame Beverage',
              contactEmail: 'admin@flamebeverage.com',
            },
          },
        };
      }
      throw error;
    }
  },

  /**
   * Create new settings (Admin only)
   */
  create: async (settings: Settings): Promise<ApiResponse<Settings>> => {
    return apiPost<Settings>('/settings', settings);
  },

  /**
   * Update existing settings (Admin only)
   */
  update: async (settings: Partial<Settings>): Promise<ApiResponse<Settings>> => {
    return apiPut<Settings>('/settings', settings);
  },

  /**
   * Reset settings to defaults (Admin only)
   */
  reset: async (): Promise<ApiResponse<Settings>> => {
    return apiPost<Settings>('/settings/reset', {});
  },
};


















