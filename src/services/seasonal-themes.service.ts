import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';
import { SeasonalTheme, SeasonalThemeData } from '@/types/seasonal';

export interface SeasonalThemeApiResponse {
  keyname: SeasonalTheme;
  title?: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  ctaText?: string;
  category?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  gradient?: string;
  emoji?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const seasonalThemesService = {
  /**
   * Get current seasonal theme (Public endpoint)
   */
  getCurrent: async (): Promise<ApiResponse<SeasonalThemeApiResponse>> => {
    try {
      return await apiGet<SeasonalThemeApiResponse>('/seasonal-themes/current', undefined, false);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('Current seasonal theme endpoint not available, returning default');
        return {
          success: true,
          message: 'Using default theme',
          data: {
            keyname: 'default',
          },
        };
      }
      throw error;
    }
  },

  /**
   * Get all seasonal themes (Public endpoint)
   */
  getAll: async (): Promise<ApiResponse<SeasonalThemeApiResponse[]>> => {
    try {
      return await apiGet<SeasonalThemeApiResponse[]>('/seasonal-themes', undefined, false);
    } catch (error: any) {
      if (error.status === 404 || error.message?.includes('404')) {
        console.warn('Seasonal themes endpoint not available');
        return {
          success: true,
          message: 'No themes available',
          data: [],
        };
      }
      throw error;
    }
  },

  /**
   * Get specific theme by keyname (Public endpoint)
   */
  getByKeyname: async (keyname: string): Promise<ApiResponse<SeasonalThemeApiResponse>> => {
    try {
      return await apiGet<SeasonalThemeApiResponse>(`/seasonal-themes/${keyname}`, undefined, false);
    } catch (error: any) {
      if (error.status === 404 || error.message?.includes('404')) {
        console.warn(`Seasonal theme ${keyname} not found`);
        return {
          success: true,
          message: 'Theme not found',
          data: {
            keyname: 'default' as SeasonalTheme,
          },
        };
      }
      throw error;
    }
  },

  /**
   * Create a new seasonal theme (Admin only)
   */
  create: async (theme: Partial<SeasonalThemeApiResponse>): Promise<ApiResponse<SeasonalThemeApiResponse>> => {
    return apiPost<SeasonalThemeApiResponse>('/seasonal-themes', theme);
  },

  /**
   * Update existing seasonal theme (Admin only)
   */
  update: async (keyname: string, theme: Partial<SeasonalThemeApiResponse>): Promise<ApiResponse<SeasonalThemeApiResponse>> => {
    return apiPut<SeasonalThemeApiResponse>(`/seasonal-themes/${keyname}`, theme);
  },

  /**
   * Delete seasonal theme by keyname (Admin only)
   */
  delete: async (keyname: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/seasonal-themes/${keyname}`);
  },
};

