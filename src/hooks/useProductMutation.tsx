"use client";

import { useState, useCallback } from 'react';
import {
  CreateProductRequest,
  UpdateProductRequest,
  CreateProductResponse,
  UpdateProductResponse,
  DeleteProductResponse,
} from '@/types/productRequest';
import { createProduct, updateProduct, deleteProduct } from '@/service/product.service';

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
        const response = await createProduct(productData);
        return response;
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
        const response = await updateProduct(productId, productData);
        return response;
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
        const response = await deleteProduct(productId);
        return response;
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




