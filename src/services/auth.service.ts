import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

export interface User {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  mobile?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role?: 'user' | 'admin' | 'superadmin';
  mobile?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
  mobile?: string;
  password?: string;
}

export interface UserFilters {
  role?: 'user' | 'admin' | 'superadmin';
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const authService = {
  /**
   * Register a new user (Public endpoint)
   */
  register: async (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    try {
      return await apiPost<LoginResponse>('/auth/register', data, false);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('Cannot POST')) {
        console.error('Registration endpoint not available:', error?.message);
        throw new Error('Registration service is currently unavailable. Please try again later.');
      }
      throw error;
    }
  },

  /**
   * Login user (Public endpoint)
   */
  login: async (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    return apiPost<LoginResponse>('/auth/login', data, false);
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiGet<User>('/auth/profile');
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<ApiResponse<User>> => {
    return apiPut<User>('/auth/profile', data);
  },

  /**
   * Get all users (Admin only)
   */
  getAllUsers: async (filters?: UserFilters): Promise<ApiResponse<User[]>> => {
    return apiGet<User[]>('/auth/users', filters);
  },

  /**
   * Get user by ID (Admin only)
   */
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    return apiGet<User>(`/auth/users/${id}`);
  },

  /**
   * Update user (Admin only)
   */
  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiPut<User>(`/auth/users/${id}`, data);
  },

  /**
   * Delete user (Super Admin only)
   */
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/auth/users/${id}`);
  },

  /**
   * Logout user (requires authentication)
   */
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiPost<{ message: string }>('/auth/logout', {}, true);
  },
};

