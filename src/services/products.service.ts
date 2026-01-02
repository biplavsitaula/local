import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  discountPercent?: number;
  stock: number;
  imageUrl?: string;
  image?: string;
  description?: string;
  rating?: number;
  sales?: number;
  tag?: string;
  recommended?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: string;
  view?: 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'most-reviewed' | 'recommended';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const productsService = {
  /**
   * Get all products with filters (Public endpoint)
   */
  getAll: async (filters?: ProductFilters): Promise<ApiResponse<Product[]>> => {
    return apiGet<Product[]>('/products', filters, false);
  },

  /**
   * Get a single product by ID (Public endpoint)
   */
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    return apiGet<Product>(`/products/${id}`, undefined, false);
  },

  /**
   * Create a new product
   */
  create: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    return apiPost<Product>('/products', product);
  },

  /**
   * Update a product
   */
  update: async (id: string, product: Partial<Product>): Promise<ApiResponse<Product>> => {
    return apiPut<Product>(`/products/${id}`, product);
  },

  /**
   * Delete a product
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/products/${id}`);
  },
};










