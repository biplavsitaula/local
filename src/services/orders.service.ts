import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id?: string;
  id?: string;
  billNumber: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    pan?: string;
  };
  customerName?: string;
  location?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'qr' | 'cod' | 'card';
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const ordersService = {
  /**
   * Get all orders with filters (Public endpoint)
   */
  getAll: async (filters?: OrderFilters): Promise<ApiResponse<Order[]>> => {
    try {
      return await apiGet<Order[]>('/orders', filters, false);
    } catch (error: any) {
      // Handle 404 or other errors gracefully
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Cannot GET')) {
        console.warn('Orders endpoint not available, returning empty array');
        return {
          success: true,
          message: 'Orders not available',
          data: [],
          pagination: {
            page: 1,
            limit: filters?.limit || 10,
            total: 0,
            pages: 0,
          },
        };
      }
      throw error;
    }
  },

  /**
   * Get a single order by ID (Public endpoint)
   */
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    return apiGet<Order>(`/orders/${id}`, undefined, false);
  },

  /**
   * Get order by bill number (Public endpoint)
   */
  getByBillNumber: async (billNumber: string): Promise<ApiResponse<Order>> => {
    return apiGet<Order>(`/orders/bill/${billNumber}`, undefined, false);
  },

  /**
   * Create a new order
   */
  create: async (order: {
    customer: Order['customer'];
    items: OrderItem[];
    paymentMethod: Order['paymentMethod'];
  }): Promise<ApiResponse<Order>> => {
    return apiPost<Order>('/orders', order);
  },

  /**
   * Update order status
   */
  updateStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    return apiPut<Order>(`/orders/${id}`, { status });
  },

  /**
   * Delete an order (Admin only)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/orders/${id}`);
  },
};










