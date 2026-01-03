import { getUrl } from '@/lib/constant';
import {
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  DeleteProductResponse,
} from '@/types/productRequest';

import { tokenManager } from '@/lib/api';

/**
 * Create a new product
 * @param productData - Product data to create
 * @returns Promise<CreateProductResponse> - Created product response
 */
export const createProduct = async (
  productData: CreateProductRequest
): Promise<CreateProductResponse> => {
  try {
    const token = tokenManager.getToken();

    if (!token) {
      throw new Error("No auth token found");
    }
    const response = await fetch(getUrl('/api/products'), {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ THIS WAS MISSING
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create product: ${response.statusText}`
      );
    }

    const responseData: CreateProductResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 * @param productId - Product ID to update
 * @param productData - Product data to update
 * @returns Promise<UpdateProductResponse> - Updated product response
 */
// export const updateProduct = async (
//   productId: string,
//   productData: UpdateProductRequest
// ): Promise<UpdateProductResponse> => {
//   try {
//     const token = tokenManager.getToken();
//     console.log(token, '==================token')
  
    
//     const response = await fetch(getUrl(`/api/products/${productId}`), {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(productData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         errorData.message || `Failed to update product: ${response.statusText}`
//       );
//     }

//     const responseData: UpdateProductResponse = await response.json();
//     return responseData;
//   } catch (error) {
//     console.error('Error updating product:', error);
//     throw error;
//   }
// };

export const updateProduct = async (
  productId: string,
  productData: UpdateProductRequest
): Promise<UpdateProductResponse> => {
  try {
    const token = tokenManager.getToken();

    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await fetch(getUrl(`/api/products/${productId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ THIS WAS MISSING
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update product: ${response.statusText}`
      );
    }

    const responseData: UpdateProductResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};


/**
 * Delete a product
 * @param productId - Product ID to delete
 * @returns Promise<DeleteProductResponse> - Delete product response
 */
export const deleteProduct = async (
  productId: string
): Promise<DeleteProductResponse> => {
  try {
    const token = tokenManager.getToken();

    if (!token) {
      throw new Error("No auth token found");
    }
    const response = await fetch(getUrl(`/api/products/${productId}`), {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ THIS WAS MISSING
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete product: ${response.statusText}`
      );
    }

    const responseData: DeleteProductResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};




