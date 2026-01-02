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
   * Get all orders with filters
   */
  getAll: async (filters?: OrderFilters): Promise<ApiResponse<Order[]>> => {
    return apiGet<Order[]>('/orders', filters);
  },

  /**
   * Get a single order by ID
   */
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    return apiGet<Order>(`/orders/${id}`);
  },

  /**
   * Get order by bill number
   */
  getByBillNumber: async (billNumber: string): Promise<ApiResponse<Order>> => {
    return apiGet<Order>(`/orders/bill/${billNumber}`);
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










