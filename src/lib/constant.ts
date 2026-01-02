/**
 * Get the base API URL
 * @returns The base API URL
 */
export const getApiUrl = (): string => {
  // In development, use localhost:5000
  // In production, you can use environment variables
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  // Server-side
  return process.env.API_URL || 'http://localhost:5000';
};

/**
 * Get the full API URL for a specific endpoint
 * @param endpoint - The API endpoint (e.g., '/api/products')
 * @returns The full API URL
 */
export const getUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};























