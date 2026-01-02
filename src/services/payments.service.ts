import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

export interface Payment {
  _id?: string;
  id?: string;
  orderId: string;
  billNumber: string;
  amount: number;
  method: 'qr' | 'cod' | 'card';
  status: string;
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentSummary {
  totalPayments: number;
  completed: number;
  pending: number;
}

export interface PaymentFilters {
  search?: string;
  method?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const paymentsService = {
  /**
   * Get all payments with filters
   */
  getAll: async (filters?: PaymentFilters): Promise<ApiResponse<Payment[]>> => {
    return apiGet<Payment[]>('/payments', filters);
  },

  /**
   * Get payment summary
   */
  getSummary: async (): Promise<ApiResponse<PaymentSummary>> => {
    return apiGet<PaymentSummary>('/payments/summary');
  },

  /**
   * Get a single payment by ID
   */
  getById: async (id: string): Promise<ApiResponse<Payment>> => {
    return apiGet<Payment>(`/payments/${id}`);
  },

  /**
   * Create a new payment
   */
  create: async (payment: Partial<Payment>): Promise<ApiResponse<Payment>> => {
    return apiPost<Payment>('/payments', payment);
  },

  /**
   * Update payment status
   */
  updateStatus: async (id: string, status: string): Promise<ApiResponse<Payment>> => {
    return apiPut<Payment>(`/payments/${id}`, { status });
  },

  /**
   * Delete a payment (Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/payments/${id}`);
  },
};










