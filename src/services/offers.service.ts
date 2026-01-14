import { apiGet, apiPost, apiPut, apiDelete, apiPatch, ApiResponse } from '@/lib/api';

export interface Offer {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  imageUrl?: string;
  image?: string;
  productIds?: string[];
  category?: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  color?: string;
  icon?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferFilters {
  search?: string;
  isActive?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}

export const offersService = {
  /**
   * Get all offers (Public endpoint)
   */
  getAll: async (filters?: OfferFilters): Promise<ApiResponse<Offer[]>> => {
    return apiGet<Offer[]>('/offers', filters, false);
  },

  /**
   * Get offer by ID (Public endpoint)
   */
  getById: async (id: string): Promise<ApiResponse<Offer>> => {
    return apiGet<Offer>(`/offers/${id}`, undefined, false);
  },

  /**
   * Get all offers for admin (Admin/Super Admin only)
   */
  getAllAdmin: async (filters?: OfferFilters): Promise<ApiResponse<Offer[]>> => {
    return apiGet<Offer[]>('/offers/admin/all', filters);
  },

  /**
   * Create a new offer (Super Admin only)
   */
  create: async (offer: Partial<Offer>): Promise<ApiResponse<Offer>> => {
    return apiPost<Offer>('/offers', offer);
  },

  /**
   * Update an offer (Super Admin only)
   */
  update: async (id: string, offer: Partial<Offer>): Promise<ApiResponse<Offer>> => {
    return apiPut<Offer>(`/offers/${id}`, offer);
  },

  /**
   * Delete an offer (Super Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/offers/${id}`);
  },

  /**
   * Toggle offer active status (Super Admin only)
   */
  toggleActive: async (id: string): Promise<ApiResponse<Offer>> => {
    return apiPatch<Offer>(`/offers/${id}/toggle`, {});
  },
};

