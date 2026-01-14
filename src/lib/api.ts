/**
* API Base Configuration
*/


import { getApiUrl } from '@/lib/constant';


const API_BASE_URL = getApiUrl();


export interface ApiResponse<T> {
 success: boolean;
 message: string;
 data: T;
 pagination?: {
   page: number;
   limit: number;
   total: number;
   pages: number;
 };
}


export interface ApiError {
 success: false;
 message: string;
 error?: any;
}


/**
* Token management utilities
*/
const TOKEN_KEY = 'auth_token';


export const tokenManager = {
 getToken: (): string | null => {
   if (typeof window === 'undefined') return null;
   return localStorage.getItem(TOKEN_KEY);
 },
  setToken: (token: string): void => {
   if (typeof window === 'undefined') return;
   localStorage.setItem(TOKEN_KEY, token);
   // Set cookie for middleware access (7 days expiry)
   document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
 },
  removeToken: (): void => {
   if (typeof window === 'undefined') return;
   localStorage.removeItem(TOKEN_KEY);
   // Remove cookie
   document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
 },
  hasToken: (): boolean => {
   return tokenManager.getToken() !== null;
 },
};


/**
* Handle 401 errors by redirecting to login
*/
const handleUnauthorized = () => {
 if (typeof window !== 'undefined') {
   tokenManager.removeToken();
   // Only redirect if not already on login/register page
   const currentPath = window.location.pathname;
   if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
     window.location.href = '/login';
   }
 }
};


/**
* Generic API fetch function with authentication
*/
async function apiFetch<T>(
 endpoint: string,
 options?: RequestInit & { requireAuth?: boolean; skipRedirectOn401?: boolean }
): Promise<ApiResponse<T>> {
 const url = `${API_BASE_URL}${endpoint}`;
 const requireAuth = options?.requireAuth !== false; // Default to true
 const skipRedirectOn401 = options?.skipRedirectOn401 === true; // Default to false
  // Get token if authentication is required
 const token = requireAuth ? tokenManager.getToken() : null;
  const headers: Record<string, string> = {
   'Content-Type': 'application/json',
   ...(options?.headers as Record<string, string>),
 };
  // Add Authorization header if token exists
 if (token) {
   headers['Authorization'] = `Bearer ${token}`;
 }
  const response = await fetch(url, {
   ...options,
   headers,
 });


 // Handle 401 Unauthorized
 if (response.status === 401) {
   // Only redirect if not explicitly skipped (e.g., during token validation)
   if (!skipRedirectOn401) {
     handleUnauthorized();
   }
   const errorData = await response.json().catch(() => ({ message: 'Unauthorized' }));
   throw new Error(errorData?.message || 'Unauthorized. Please login again.');
 }


 if (!response.ok) {
   const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
   const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
   // Include status code in error message for better error handling
   const error = new Error(errorMessage);
   (error as any).status = response.status;
   throw error;
 }


 const data = await response.json();
  // Handle API responses that may not have 'success' field
 // If response has 'data' field, wrap it in ApiResponse format
 if (data && 'data' in data && !('success' in data)) {
   return {
     success: true,
     message: data?.message || 'Success',
     data: data?.data,
     pagination: data?.pagination,
   } as ApiResponse<T>;
 }
  return data;
}


/**
* GET request
*/
export async function apiGet<T>(
 endpoint: string,
 params?: Record<string, any>,
 requireAuth: boolean = true,
 skipRedirectOn401: boolean = false
): Promise<ApiResponse<T>> {
 const queryString = params
   ? '?' + new URLSearchParams(
       Object.entries(params).reduce((acc, [key, value]) => {
         if (value !== undefined && value !== null && value !== '') {
           acc[key] = String(value);
         }
         return acc;
       }, {} as Record<string, string>)
     ).toString()
   : '';
  return apiFetch<T>(`${endpoint}${queryString}`, {
   method: 'GET',
   requireAuth,
   skipRedirectOn401,
 });
}


/**
* POST request
*/
export async function apiPost<T>(
 endpoint: string,
 data?: any,
 requireAuth: boolean = true
): Promise<ApiResponse<T>> {
 return apiFetch<T>(endpoint, {
   method: 'POST',
   body: data ? JSON.stringify(data) : undefined,
   requireAuth,
 });
}


/**
* PUT request
*/
export async function apiPut<T>(
 endpoint: string,
 data?: any,
 requireAuth: boolean = true
): Promise<ApiResponse<T>> {
 return apiFetch<T>(endpoint, {
   method: 'PUT',
   body: data ? JSON.stringify(data) : undefined,
   requireAuth,
 });
}


/**
* DELETE request
*/
export async function apiDelete<T>(
 endpoint: string,
 requireAuth: boolean = true
): Promise<ApiResponse<T>> {
 return apiFetch<T>(endpoint, {
   method: 'DELETE',
   requireAuth,
 });
}

/**
* PATCH request
*/
export async function apiPatch<T>(
 endpoint: string,
 data?: any,
 requireAuth: boolean = true
): Promise<ApiResponse<T>> {
 return apiFetch<T>(endpoint, {
   method: 'PATCH',
   body: data ? JSON.stringify(data) : undefined,
   requireAuth,
 });
}























