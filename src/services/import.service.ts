import { tokenManager } from '@/lib/api';
import { getApiUrl } from '@/lib/constant';
import { ApiResponse } from '@/lib/api';

const API_BASE_URL = getApiUrl();

export interface ImportResult {
  success: number;
  failed: number;
  errors?: Array<{
    row: number;
    product: string;
    error: string;
  }>;
  message: string;
}

export const importService = {
  /**
   * Download product import template (Admin and Super Admin)
   */
  downloadTemplate: async (): Promise<Blob> => {
    const url = `${API_BASE_URL}/import/template`;
    const token = tokenManager.getToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      tokenManager.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.statusText}`);
    }

    return response.blob();
  },

  /**
   * Import products from Excel file (Super Admin only)
   */
  importProducts: async (file: File): Promise<ApiResponse<ImportResult>> => {
    const url = `${API_BASE_URL}/import/products`;
    const token = tokenManager.getToken();
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type header - let browser set it with boundary for FormData
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      tokenManager.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Import failed' }));
      throw new Error(errorData?.message || `Import failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },
};
















