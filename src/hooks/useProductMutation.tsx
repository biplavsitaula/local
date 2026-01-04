"use client";

import { useState, useCallback } from 'react';
import {
  CreateProductRequest,
  UpdateProductRequest,
  CreateProductResponse,
  UpdateProductResponse,
  DeleteProductResponse,
} from '@/types/productRequest';
import { productsService } from '@/services/products.service';

interface UseProductMutationReturn {
  createProductMutation: (
    productData: CreateProductRequest
  ) => Promise<CreateProductResponse>;
  updateProductMutation: (
    productId: string,
    productData: UpdateProductRequest
  ) => Promise<UpdateProductResponse>;
  deleteProductMutation: (
    productId: string
  ) => Promise<DeleteProductResponse>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for product mutations (create and update)
 * @returns {UseProductMutationReturn} Mutation functions, loading state, and error
 */
export const useProductMutation = (): UseProductMutationReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createProductMutation = useCallback(
    async (productData: CreateProductRequest): Promise<CreateProductResponse> => {
      try {
        setLoading(true);
        setError(null);
        // Map CreateProductRequest to service format
        const serviceData = {
          name: productData.name,
          category: productData.type, // Map type to category
          price: productData.price,
          imageUrl: productData.image,
          image: productData.image,
          discountPercent: productData.discountPercentage,
          stock: productData.stock || 0,
          rating: productData.rating,
          recommended: productData.isRecommended,
        };
        const response = await productsService.create(serviceData);
        // Transform response to match CreateProductResponse
        return {
          message: response.message || 'Product created successfully',
          data: {
            _id: response.data?._id || response.data?.id || '',
            name: response.data?.name || '',
            image: response.data?.image || response.data?.imageUrl || '',
            price: response.data?.price || 0,
            type: response.data?.category || response.data?.type || '',
            discountPercentage: response.data?.discountPercent || response.data?.discountPercentage,
            createdAt: response.data?.createdAt,
            updatedAt: response.data?.updatedAt,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create product';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProductMutation = useCallback(
    async (
      productId: string,
      productData: UpdateProductRequest
    ): Promise<UpdateProductResponse> => {
      try {
        setLoading(true);
        setError(null);
        // Map UpdateProductRequest to service format
        const serviceData: any = {};
        if (productData.name !== undefined) serviceData.name = productData.name;
        if (productData.type !== undefined) serviceData.category = productData.type; // Map type to category
        if (productData.price !== undefined) serviceData.price = productData.price;
        if (productData.image !== undefined) {
          serviceData.imageUrl = productData.image;
          serviceData.image = productData.image;
        }
        if (productData.discountPercentage !== undefined) serviceData.discountPercent = productData.discountPercentage;
        if (productData.stock !== undefined) serviceData.stock = productData.stock;
        if (productData.rating !== undefined) serviceData.rating = productData.rating;
        if (productData.isRecommended !== undefined) serviceData.recommended = productData.isRecommended;
        
        const response = await productsService.update(productId, serviceData);
        // Transform response to match UpdateProductResponse
        return {
          message: response.message || 'Product updated successfully',
          data: {
            _id: response.data?._id || response.data?.id || productId,
            name: response.data?.name || '',
            image: response.data?.image || response.data?.imageUrl || '',
            price: response.data?.price || 0,
            type: response.data?.category || response.data?.type || '',
            discountPercentage: response.data?.discountPercent || response.data?.discountPercentage,
            createdAt: response.data?.createdAt,
            updatedAt: response.data?.updatedAt,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update product';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProductMutation = useCallback(
    async (productId: string): Promise<DeleteProductResponse> => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsService.delete(productId);
        // Transform response to match DeleteProductResponse
        return {
          message: response.message || 'Product deleted successfully',
          data: {
            _id: productId,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete product';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    loading,
    error,
  };
};




