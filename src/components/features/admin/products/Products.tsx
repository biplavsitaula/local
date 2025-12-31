"use client";

import { useEffect } from 'react';
import { ProductTable } from '@/components/features/admin/products/ProductTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButton } from '@/components/features/admin/ExportButton';
import { useProductList } from '@/hooks/useProductList';
import { Loader2, AlertCircle } from 'lucide-react';

const Products = () => {
  const { products, loading, error, refetch } = useProductList();

  // Listen for product changed event (added or updated) to refresh the list
  useEffect(() => {
    const handleProductChanged = () => {
      refetch();
    };

    window.addEventListener('productChanged', handleProductChanged);
    
    return () => {
      window.removeEventListener('productChanged', handleProductChanged);
    };
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">Error loading products</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-gradient text-text-inverse rounded-lg hover:shadow-primary-lg transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : [];

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between opacity-0 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product inventory</p>
          </div>
          <ExportButton defaultDataType="products" />
        </div>

        <Tabs defaultValue="all" className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="top-sellers">Top Sellers</TabsTrigger>
            <TabsTrigger value="top-reviewed">Most Reviewed</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <ProductTable filter="all" products={productsArray} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="out-of-stock" className="mt-6">
            <ProductTable filter="out-of-stock" products={productsArray} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="low-stock" className="mt-6">
            <ProductTable filter="low-stock" products={productsArray} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="top-sellers" className="mt-6">
            <ProductTable filter="top-sellers" products={productsArray} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="top-reviewed" className="mt-6">
            <ProductTable filter="top-reviewed" products={productsArray} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="recommended" className="mt-6">
            <ProductTable filter="recommended" products={productsArray} onRefresh={refetch} />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Products;
