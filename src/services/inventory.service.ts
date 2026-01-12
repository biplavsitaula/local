import { apiGet, apiPost, ApiResponse } from '@/lib/api';

export interface InventoryTransaction {
  _id: string;
  productId: string | {
    _id: string;
    name: string;
    type?: string;
    price?: number;
    image?: string;
    stock?: number;
    currentStock?: number;
  };
  productName: string;
  type: 'add' | 'remove';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  notes?: string;
  performedBy?: string | {
    _id: string;
    fullName?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt?: string;
  currentStock?: number;
}

export interface AddStockRequest {
  productId: string;
  quantity: number;
  reason?: string;
  notes?: string;
}

export interface RemoveStockRequest {
  productId: string;
  quantity: number;
  reason?: string;
  notes?: string;
}

export interface AddStockResponse {
  transaction: InventoryTransaction;
  product: {
    _id: string;
    name: string;
    previousStock: number;
    addedQuantity: number;
    newStock: number;
  };
}

export interface RemoveStockResponse {
  transaction: InventoryTransaction;
  product: {
    _id: string;
    name: string;
    previousStock: number;
    removedQuantity: number;
    newStock: number;
  };
}

export interface InventoryFilters {
  productId?: string;
  type?: 'add' | 'remove';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const inventoryService = {
  /**
   * Get all inventory transactions
   */
  getAll: async (filters?: InventoryFilters): Promise<ApiResponse<InventoryTransaction[]>> => {
    return apiGet<InventoryTransaction[]>('/inventory', filters);
  },

  /**
   * Get a single inventory transaction by ID
   */
  getById: async (id: string): Promise<ApiResponse<InventoryTransaction>> => {
    return apiGet<InventoryTransaction>(`/inventory/${id}`);
  },

  /**
   * Get stock history for a specific product
   */
  getByProduct: async (productId: string): Promise<ApiResponse<InventoryTransaction[]>> => {
    return apiGet<InventoryTransaction[]>(`/inventory/product/${productId}`);
  },

  /**
   * Add stock to a product (bulk add)
   */
  addStock: async (data: AddStockRequest): Promise<ApiResponse<AddStockResponse>> => {
    return apiPost<AddStockResponse>('/inventory/add', data);
  },

  /**
   * Remove stock from a product (bulk remove)
   */
  removeStock: async (data: RemoveStockRequest): Promise<ApiResponse<RemoveStockResponse>> => {
    return apiPost<RemoveStockResponse>('/inventory/remove', data);
  },
};



