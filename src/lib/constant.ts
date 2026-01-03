/**
 * Get the base API URL (includes /api path)
 * @returns The base API URL with /api path
 */
export const getApiUrl = (): string => {
  // Use production URL by default, can be overridden with environment variables
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_API_URL || 'https://flame-node.onrender.com/api';
  }
  // Server-side
  return process.env.API_URL || 'https://flame-node.onrender.com/api';
};

/**
 * Get the full API URL for a specific endpoint
 * @param endpoint - The API endpoint (e.g., '/products' or '/api/products')
 * @returns The full API URL
 */
export const getUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if present
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // If endpoint starts with '/api/', remove it since baseUrl already includes '/api'
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4); // Remove '/api'
  }
  return `${baseUrl}${cleanEndpoint}`;
};




























