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
        
        // Get discount and tag values
        const discountPercent = (productData as any).discountPercent ?? productData.discountPercentage ?? 0;
        const tag = (productData as any).tag || '';
        
        // Map CreateProductRequest to service format - API expects 'type' not 'category'
        const serviceData: Record<string, any> = {
          name: productData.name,
          type: productData.type, // API uses 'type'
          price: productData.price,
          image: productData.image || '',
          stock: productData.stock || 0,
        };
        
        // Only include optional fields if they have values
        if (discountPercent > 0) serviceData.discountPercent = discountPercent;
        if (tag) serviceData.tag = tag;
        if (productData.rating !== undefined) serviceData.rating = productData.rating;
        if (productData.isRecommended) serviceData.isRecommended = productData.isRecommended;
        
        const response = await productsService.create(serviceData);
        const resData = response.data as any;
        
        // Transform response to match CreateProductResponse
        return {
          message: response?.message || 'Product created successfully',
          data: {
            _id: resData?._id || resData?.id || '',
            name: resData?.name || '',
            image: resData?.image || resData?.imageUrl || '',
            price: resData?.price || 0,
            type: resData?.type || resData?.category || '',
            discountPercentage: resData?.discountPercent || resData?.discountPercentage || 0,
            tag: resData?.tag || '',
            createdAt: resData?.createdAt,
            updatedAt: resData?.updatedAt,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err?.message : 'Failed to create product';
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
        
        // Map UpdateProductRequest to service format - API expects 'type' not 'category'
        const serviceData: Record<string, any> = {};
        
        if (productData.name !== undefined) serviceData.name = productData.name;
        if (productData.type !== undefined) serviceData.type = productData.type; // API uses 'type'
        if (productData.price !== undefined) serviceData.price = productData.price;
        if (productData.image !== undefined) serviceData.image = productData.image;
        if (productData.stock !== undefined) serviceData.stock = productData.stock;
        if (productData.rating !== undefined) serviceData.rating = productData.rating;
        if (productData.isRecommended !== undefined) serviceData.isRecommended = productData.isRecommended;
        
        // Handle both discountPercent and discountPercentage
        const discountValue = (productData as any).discountPercent ?? productData.discountPercentage;
        if (discountValue !== undefined) serviceData.discountPercent = discountValue;
        
        // Handle tag
        const tagValue = (productData as any).tag;
        if (tagValue !== undefined) serviceData.tag = tagValue;
        
        const response = await productsService.update(productId, serviceData);
        const resData = response.data as any;
        
        // Transform response to match UpdateProductResponse
        return {
          message: response?.message || 'Product updated successfully',
          data: {
            _id: resData?._id || resData?.id || productId,
            name: resData?.name || '',
            image: resData?.image || resData?.imageUrl || '',
            price: resData?.price || 0,
            type: resData?.type || resData?.category || '',
            discountPercentage: resData?.discountPercent || resData?.discountPercentage || 0,
            tag: resData?.tag || '',
            createdAt: resData?.createdAt,
            updatedAt: resData?.updatedAt,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err?.message : 'Failed to update product';
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
          message: response?.message || 'Product deleted successfully',
          data: {
            _id: productId,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err?.message : 'Failed to delete product';
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




