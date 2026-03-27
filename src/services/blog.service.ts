import { apiGet, apiPost, apiPut, apiDelete, apiPatch, ApiResponse } from '@/lib/api';

export interface Blog {
    _id?: string;
    title: string;
    ingredients: string[];
    instructions: string;
    image?: string;
    authorId: {
        _id: string;
        fullName: string;
        email: string;
    } | string;
    authorName?: string;
    category: string;
    tags: string[];
    isApproved: boolean;
    timeTaken?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    totalCalories?: number;
    servings?: number;
    mixologistTips?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BlogFilters {
    search?: string;
    category?: string;
    isApproved?: boolean | string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export const blogService = {
    /**
     * Get all blogs with filters (Public endpoint)
     */
    getAll: async (filters?: BlogFilters): Promise<ApiResponse<Blog[]>> => {
        return apiGet<Blog[]>('/blogs', filters, false);
    },

    /**
     * Get a single blog by ID (Public endpoint)
     */
    getById: async (id: string): Promise<ApiResponse<Blog>> => {
        return apiGet<Blog>(`/blogs/${id}`, undefined, false);
    },

    /**
     * Create a new blog
     */
    create: async (blog: Partial<Blog>): Promise<ApiResponse<Blog>> => {
        return apiPost<Blog>('/blogs', blog);
    },

    /**
     * Update a blog
     */
    update: async (id: string, blog: Partial<Blog>): Promise<ApiResponse<Blog>> => {
        return apiPut<Blog>(`/blogs/${id}`, blog);
    },

    /**
     * Delete a blog
     */
    delete: async (id: string): Promise<ApiResponse<void>> => {
        return apiDelete<void>(`/blogs/${id}`);
    },

    /**
     * Approve/Reject a blog (Admin only)
     */
    approve: async (id: string, isApprovedStatus: boolean): Promise<ApiResponse<Blog>> => {
        return apiPatch<Blog>(`/blogs/${id}/approve`, { isApproved: isApprovedStatus });
    },

    /**
     * Get related recipes by category (Public endpoint)
     */
    getRelated: async (category: string, excludeId: string, limit: number = 8): Promise<ApiResponse<Blog[]>> => {
        return apiGet<Blog[]>('/blogs', {
            category,
            isApproved: true,
            limit,
            page: 1,
        }, false);
    },
};
