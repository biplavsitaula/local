"use client";

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { ApiProduct, ApiProductResponse } from '@/types/apiProduct';
import { getUrl } from '@/lib/constant';

interface UseProductListReturn {
  products: Product[];
  rawApiData: ApiProduct[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Map API product to internal Product type
 */
const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
  // Calculate original price if discount exists
  const originalPrice = apiProduct.discountPercentage
    ? Math.round(apiProduct.price / (1 - apiProduct.discountPercentage / 100))
    : undefined;

  // Map type to category (normalize to lowercase and handle variations)
  let category = apiProduct.type.toLowerCase();
  // Handle common variations
  if (category === 'whiskey' || category === 'whisky') {
    category = 'whisky';
  }

  // Use _id from API as the product id
  const id = apiProduct._id;

  return {
    id,
    name: apiProduct.name,
    category,
    price: apiProduct.price,
    originalPrice,
    image: apiProduct.image,
    description: `Premium ${apiProduct.type} - ${apiProduct.name}`,
    volume: '750ml',
    alcoholContent: '40%',
    alcohol: '40%',
    inStock: true,
    isNew: false,
  } as Product;
};

/**
 * Custom hook to fetch and manage product list
 * @returns {UseProductListReturn} Products, raw API data, loading state, error, and refetch function
 */
export const useProductList = (): UseProductListReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawApiData, setRawApiData] = useState<ApiProduct[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getUrl('/api/products'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const responseData: ApiProductResponse = await response.json();
      
      // Extract products from the response
      let apiProducts: ApiProduct[];
      if (responseData && Array.isArray(responseData.data)) {
        apiProducts = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Fallback: if response is directly an array
        apiProducts = responseData as unknown as ApiProduct[];
      } else {
        console.error('Unexpected API response structure:', responseData);
        throw new Error('API response does not contain a valid products array');
      }

      // Validate that we have an array
      if (!Array.isArray(apiProducts)) {
        throw new Error('Products data is not an array');
      }

      // Store raw API data
      setRawApiData(apiProducts);

      // Map API products to Product type
      const mappedProducts = apiProducts.map(mapApiProductToProduct);
      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
      setRawApiData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    rawApiData,
    loading,
    error,
    refetch: loadProducts,
  };
};




