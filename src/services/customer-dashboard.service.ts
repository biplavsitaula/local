import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api';

// ==================== Interfaces ====================

export interface CustomerAddress {
    _id?: string;
    label: string;
    address: string;
    city: string;
    isDefault: boolean;
}

export interface CustomerPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderUpdates: boolean;
    promotionalOffers: boolean;
}

export interface FavoriteProduct {
    _id: string;
    name: string;
    imageUrl: string;
    price: number;
    finalPrice: number;
    category: string;
    rating: number;
    reviewCount: number;
    brand: string;
}

export interface DashboardOrderItem {
    productId: {
        _id: string;
        name: string;
        imageUrl: string;
        category?: string;
        price: number;
        finalPrice: number;
    };
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface DashboardOrder {
    _id: string;
    billNumber: string;
    customer: {
        fullName: string;
        email?: string;
        mobile: string;
        location: string;
    };
    items: DashboardOrderItem[];
    subtotal?: number;
    deliveryFee?: number;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentGateway?: string;
    paymentStatus: string;
    createdAt: string;
    updatedAt?: string;
}

export interface DashboardStats {
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    membershipTier: string;
    tierProgress: number;
}

export interface CustomerDashboard {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        mobile: string;
        role: string;
        createdAt: string;
    };
    loyaltyPoints: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    membershipTier: string;
    tierProgress: number;
    totalOrders: number;
    totalSpent: number;
    favoriteProducts: FavoriteProduct[];
    addresses: CustomerAddress[];
    dateOfBirth?: string;
    preferences: CustomerPreferences;
    recentOrders: DashboardOrder[];
    stats: DashboardStats;
}

export interface DashboardSummary {
    user: {
        fullName: string;
        email: string;
        mobile: string;
        memberSince: string;
    };
    loyalty: {
        currentPoints: number;
        totalEarned: number;
        totalRedeemed: number;
        membershipTier: string;
        tierProgress: number;
    };
    orders: {
        total: number;
        completed: number;
        pending: number;
        totalSpent: number;
    };
    favorites: number;
    addresses: number;
}

export interface UpdateDashboardData {
    dateOfBirth?: string;
    preferences?: Partial<CustomerPreferences>;
    addresses?: CustomerAddress[];
}

export interface LoyaltyPointsResponse {
    _id: string;
    userId: { _id: string; fullName: string; email: string };
    loyaltyPoints: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    membershipTier: string;
    tierProgress: number;
}

// ==================== Service ====================

export const customerDashboardService = {
    /**
     * 1. Get full dashboard data
     * GET /customer/dashboard
     */
    getDashboard: async (): Promise<ApiResponse<CustomerDashboard>> => {
        return apiGet<CustomerDashboard>('/customer/dashboard');
    },

    /**
     * 2. Get dashboard summary (aggregated stats)
     * GET /customer/dashboard/summary
     */
    getDashboardSummary: async (): Promise<ApiResponse<DashboardSummary>> => {
        return apiGet<DashboardSummary>('/customer/dashboard/summary');
    },

    /**
     * 3. Update profile / preferences / addresses
     * PUT /customer/dashboard
     */
    updateDashboard: async (data: UpdateDashboardData): Promise<ApiResponse<CustomerDashboard>> => {
        return apiPut<CustomerDashboard>('/customer/dashboard', data);
    },

    /**
     * 4. Add product to favorites
     * POST /customer/favorites/:productId
     */
    addFavorite: async (productId: string): Promise<ApiResponse<{ _id: string; favoriteProducts: FavoriteProduct[] }>> => {
        return apiPost<{ _id: string; favoriteProducts: FavoriteProduct[] }>(`/customer/favorites/${productId}`);
    },

    /**
     * 5. Remove product from favorites
     * DELETE /customer/favorites/:productId
     */
    removeFavorite: async (productId: string): Promise<ApiResponse<{ _id: string; favoriteProducts: FavoriteProduct[] }>> => {
        return apiDelete<{ _id: string; favoriteProducts: FavoriteProduct[] }>(`/customer/favorites/${productId}`);
    },

    /**
     * 6. Add loyalty points
     * POST /customer/loyalty/add
     */
    addLoyaltyPoints: async (points: number, reason?: string): Promise<ApiResponse<LoyaltyPointsResponse>> => {
        return apiPost<LoyaltyPointsResponse>('/customer/loyalty/add', { points, reason });
    },

    /**
     * 7. Redeem loyalty points
     * POST /customer/loyalty/redeem
     */
    redeemLoyaltyPoints: async (points: number): Promise<ApiResponse<LoyaltyPointsResponse>> => {
        return apiPost<LoyaltyPointsResponse>('/customer/loyalty/redeem', { points });
    },

    /**
     * 8. Get recent orders
     * GET /customer/orders?limit=N
     */
    getRecentOrders: async (limit: number = 10): Promise<ApiResponse<DashboardOrder[]>> => {
        return apiGet<DashboardOrder[]>('/customer/orders', { limit });
    },
};
