import { ApiProduct, ApiProductResponse } from '@/types/apiProduct';
import { Product } from '@/types';
import { getUrl } from '@/lib/constant';

/**
 * Fetch products from the API
 * @returns Promise<Product[]> - Array of products
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
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

    // Validate that we have an array before mapping
    if (!Array.isArray(apiProducts)) {
      throw new Error('Products data is not an array');
    }

    // Map API products to Product type
    return apiProducts.map((apiProduct) => {
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
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

