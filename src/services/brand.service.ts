import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

export interface Brand {
  _id?: string;
  id?: string;
  name: string;
  logo?: string;
  description?: string;
  productCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const brandService = {
  /**
   * Get all brands (Public endpoint)
   */
  getAll: async (): Promise<ApiResponse<Brand[]>> => {
    const response = await apiGet<Brand[]>('/products/brands', undefined, false);
    return response;
  },

  /**
   * Get a single brand by ID (Public endpoint)
   */
  getById: async (id: string): Promise<ApiResponse<Brand>> => {
    const response = await apiGet<Brand>(`/products/brands/${id}`, undefined, false);
    return response;
  },

  /**
   * Create a new brand (Protected - super_admin only)
   */
  create: async (brand: Partial<Brand>): Promise<ApiResponse<Brand>> => {
    const response = await apiPost<Brand>('/products/brands', brand, true);
    return response;
  },

  /**
   * Update a brand (Protected - super_admin only)
   */
  update: async (id: string, brand: Partial<Brand>): Promise<ApiResponse<Brand>> => {
    const response = await apiPut<Brand>(`/products/brands/${id}`, brand, true);
    return response;
  },

  /**
   * Delete a brand (Protected - super_admin only)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiDelete<void>(`/products/brands/${id}`, true);
    return response;
  },
};




