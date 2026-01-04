import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';


export interface Notification {
 _id?: string;
 id?: string;
 type: string;
 title: string;
 message: string;
 isRead: boolean;
 priority?: 'low' | 'medium' | 'high';
 relatedId?: any;
 relatedModel?: 'Order' | 'Product' | 'Payment';
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


export interface NotificationsResponse {
 notifications: Notification[];
 unreadCount?: number;
}


export interface NotificationsApiResponse {
 success: boolean;
 message: string;
 data: Notification[];
 pagination?: {
   page: number;
   limit: number;
   total: number;
   pages: number;
 };
 unreadCount?: number;
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
  * Get all notifications with filters (Admin only)
  * API returns: { success, message, data: [...notifications], pagination, unreadCount }
  */
 getAll: async (filters?: NotificationFilters): Promise<NotificationsApiResponse> => {
   const response = await apiGet<Notification[]>('/notifications', filters);
   // The API returns data as array directly with unreadCount at root level
   return response as unknown as NotificationsApiResponse;
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























