"use client";

import { ProductTable } from '@/components/features/admin/products/ProductTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButton } from '@/components/features/admin/ExportButton';

const Products = () => {
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
            <ProductTable filter="all" />
          </TabsContent>
          <TabsContent value="out-of-stock" className="mt-6">
            <ProductTable filter="out-of-stock" />
          </TabsContent>
          <TabsContent value="low-stock" className="mt-6">
            <ProductTable filter="low-stock" />
          </TabsContent>
          <TabsContent value="top-sellers" className="mt-6">
            <ProductTable filter="top-sellers" />
          </TabsContent>
          <TabsContent value="top-reviewed" className="mt-6">
            <ProductTable filter="top-reviewed" />
          </TabsContent>
          <TabsContent value="recommended" className="mt-6">
            <ProductTable filter="recommended" />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Products;
