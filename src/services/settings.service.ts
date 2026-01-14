import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

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

  /**
   * Category object with name and icon
   */
  // Category type is defined inline for simplicity
  
  /**
   * Get all categories (Admin only)
   * Returns normalized format: array of objects with name and icon
   */
  getCategories: async (): Promise<ApiResponse<{ name: string; icon: string }[]>> => {
    const response = await apiGet<string[] | { name: string; icon: string }[]>('/settings/categories', undefined, false);
    
    // Normalize response: convert string[] to {name, icon}[]
    if (response.success && response.data) {
      const normalized = response.data.map((item) => {
        if (typeof item === 'string') {
          return { name: item, icon: '' };
        }
        return item;
      });
      return {
        ...response,
        data: normalized,
      };
    }
    
    return response as ApiResponse<{ name: string; icon: string }[]>;
  },

  /**
   * Add a new category (Super Admin only)
   * @param category - Category name
   * @param icon - Optional icon (lucide icon name or image URL)
   */
  addCategory: async (category: string, icon?: string): Promise<ApiResponse<{ name: string; icon: string }[]>> => {
    const response = await apiPost<string[] | { name: string; icon: string }[]>('/settings/categories', { category, icon });
    
    // Normalize response: convert string[] to {name, icon}[]
    if (response.success && response.data) {
      const normalized = response.data.map((item) => {
        if (typeof item === 'string') {
          return { name: item, icon: icon || '' };
        }
        return item;
      });
      return {
        ...response,
        data: normalized,
      };
    }
    
    return response as ApiResponse<{ name: string; icon: string }[]>;
  },

  /**
   * Delete a category (Super Admin only)
   */
  deleteCategory: async (category: string): Promise<ApiResponse<{ message: string }>> => {
    return apiDelete<{ message: string }>(`/settings/categories/${encodeURIComponent(category)}`);
  },
};




















