import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

export interface PaymentCustomer {
  fullName: string;
  mobile: string;
  location?: string;
}

export interface PaymentOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  _id: string;
}

export interface PaymentOrder {
  _id: string;
  billNumber: string;
  customer: PaymentCustomer;
  items: PaymentOrderItem[];
  totalAmount: number;
}

export interface Payment {
  _id?: string;
  id?: string;
  orderId: PaymentOrder | string;
  billNumber: string;
  customer: PaymentCustomer;
  amount: number;
  method: 'COD' | 'Online' | 'qr' | 'cod' | 'card';
  gateway: 'esewa' | 'khalti' | null;
  status: string;
  notes?: string;
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
   * Get all payments with filters (Public endpoint)
   */
  getAll: async (filters?: PaymentFilters): Promise<ApiResponse<Payment[]>> => {
    return apiGet<Payment[]>('/payments', filters, false);
  },

  /**
   * Get payment summary (Public endpoint)
   */
  getSummary: async (): Promise<ApiResponse<PaymentSummary>> => {
    try {
      return await apiGet<PaymentSummary>('/payments/summary', undefined, false);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('Cannot GET')) {
        console.warn('Payment summary endpoint not available, returning default values');
        return {
          success: true,
          message: 'Payment summary not available',
          data: {
            totalPayments: 0,
            completed: 0,
            pending: 0,
          },
        };
      }
      throw error;
    }
  },

  /**
   * Get a single payment by ID (Public endpoint)
   */
  getById: async (id: string): Promise<ApiResponse<Payment>> => {
    return apiGet<Payment>(`/payments/${id}`, undefined, false);
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










