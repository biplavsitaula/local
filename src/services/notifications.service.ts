import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

export interface Notification {
  _id?: string;
  id?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateNotificationData {
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const notificationsService = {
  /**
   * Get all notifications with filters
   */
  getAll: async (filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> => {
    return apiGet<Notification[]>('/notifications', filters);
  },

  /**
   * Get notification by ID
   */
  getById: async (id: string): Promise<ApiResponse<Notification>> => {
    return apiGet<Notification>(`/notifications/${id}`);
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiGet<{ count: number }>('/notifications/unread-count');
  },

  /**
   * Create a new notification (Admin only)
   */
  create: async (data: CreateNotificationData): Promise<ApiResponse<Notification>> => {
    return apiPost<Notification>('/notifications', data);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    return apiPut<Notification>(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    return apiPut<void>('/notifications/read-all', {});
  },

  /**
   * Delete a notification (Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/notifications/${id}`);
  },
};










