import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export interface FeatureImage {
  _id?: string;
  id?: string;
  imageUrl: string;
  name: string;
  description?: string;
  tag?: string;
  ctaLink?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureImagesResponse {
  success: boolean;
  data: FeatureImage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FeatureImageResponse {
  success: boolean;
  data: FeatureImage;
}

export const featureImagesService = {
  // Get all feature images (public route - no auth required)
  getAll: async (): Promise<FeatureImagesResponse> => {
    return apiGet<FeatureImage[]>("/feature-images", undefined, false) as unknown as FeatureImagesResponse;
  },

  // Get feature image by ID (public route - no auth required)
  getById: async (id: string): Promise<FeatureImageResponse> => {
    return apiGet<FeatureImage>(`/feature-images/${id}`, undefined, false) as unknown as FeatureImageResponse;
  },

  // Create feature image (super_admin only)
  create: async (data: Omit<FeatureImage, "_id" | "id" | "createdAt" | "updatedAt">): Promise<FeatureImageResponse> => {
    return apiPost<FeatureImage>("/feature-images", data) as unknown as FeatureImageResponse;
  },

  // Update feature image (super_admin only)
  update: async (id: string, data: Partial<FeatureImage>): Promise<FeatureImageResponse> => {
    return apiPut<FeatureImage>(`/feature-images/${id}`, data) as unknown as FeatureImageResponse;
  },

  // Delete feature image (super_admin only)
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiDelete<{ success: boolean; message: string }>(`/feature-images/${id}`);
  },
};

