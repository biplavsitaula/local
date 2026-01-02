import { tokenManager } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const exportService = {
  /**
   * Export monthly data (Admin only)
   */
  exportMonthly: async (year: number, month: number, type: 'excel' | 'pdf'): Promise<Blob> => {
    const url = `${API_BASE_URL}/export/monthly?year=${year}&month=${month}&type=${type}`;
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
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  },
};










