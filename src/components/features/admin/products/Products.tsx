"use client";

import { useEffect, useState, useCallback } from 'react';
import { ProductTable } from '@/components/features/admin/products/ProductTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButton } from '@/components/features/admin/ExportButton';
import { productsService, Product } from '@/services/products.service';
import { Loader2, AlertCircle } from 'lucide-react';
import { Product as ProductType } from '@/types';

const Products = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const mapApiProductToProduct = (apiProduct: any): ProductType => {
    // Handle API response structure: type instead of category, image instead of imageUrl
    const category = (apiProduct.type || apiProduct.category || '').toLowerCase();
    
    return {
      id: apiProduct._id || apiProduct.id || '',
      name: apiProduct.name || '',
      category: category || 'other',
      price: apiProduct.price || 0,
      image: apiProduct.image || apiProduct.imageUrl || '',
      stock: apiProduct.stock || 0,
      rating: apiProduct.rating || 0,
      tag: apiProduct.tag,
      description: apiProduct.description || '',
      sales: apiProduct.sales || apiProduct.totalSold || 0,
    } as ProductType;
  };

  const fetchProducts = useCallback(async (filter: string, search?: string, pageNum?: number) => {
    try {
      setLoading(true);
      setError(null);

      const viewMap: Record<string, 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'most-reviewed' | 'recommended'> = {
        'all': 'all',
        'out-of-stock': 'out-of-stock',
        'low-stock': 'low-stock',
        'top-sellers': 'top-sellers',
        'top-reviewed': 'most-reviewed',
        'recommended': 'recommended',
      };

      const filters = {
        view: viewMap[filter] || 'all' as const,
        search: search || undefined,
        page: pageNum || page,
        limit: 50,
      };

      const response = await productsService.getAll(filters);
      const mappedProducts = (response.data || []).map(mapApiProductToProduct);
      
      setProducts(mappedProducts);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts(currentFilter, searchQuery);
  }, [currentFilter, searchQuery, fetchProducts]);

  // Listen for product changed event (added or updated) to refresh the list
  useEffect(() => {
    const handleProductChanged = () => {
      fetchProducts(currentFilter, searchQuery);
    };

    window.addEventListener('productChanged', handleProductChanged);
    
    return () => {
      window.removeEventListener('productChanged', handleProductChanged);
    };
  }, [currentFilter, searchQuery, fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts(currentFilter, searchQuery);
  }, [currentFilter, searchQuery, fetchProducts]);

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

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between opacity-0 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product inventory</p>
          </div>
          <ExportButton defaultDataType="products" />
        </div>

        <Tabs 
          defaultValue="all" 
          className="opacity-0 animate-fade-in" 
          style={{ animationDelay: '100ms' }}
          onValueChange={(value) => {
            setCurrentFilter(value);
            setPage(1);
          }}
        >
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="top-sellers">Top Sellers</TabsTrigger>
            <TabsTrigger value="top-reviewed">Most Reviewed</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <ProductTable filter="all" products={products} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="out-of-stock" className="mt-6">
            <ProductTable filter="out-of-stock" products={products} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="low-stock" className="mt-6">
            <ProductTable filter="low-stock" products={products} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="top-sellers" className="mt-6">
            <ProductTable filter="top-sellers" products={products} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="top-reviewed" className="mt-6">
            <ProductTable filter="top-reviewed" products={products} onRefresh={refetch} />
          </TabsContent>
          <TabsContent value="recommended" className="mt-6">
            <ProductTable filter="recommended" products={products} onRefresh={refetch} />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Products;
