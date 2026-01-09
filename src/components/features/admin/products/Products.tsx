"use client";

import { useEffect, useState, useCallback } from 'react';
import { ProductTable } from '@/components/features/admin/products/ProductTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButton } from '@/components/features/admin/ExportButton';
import { productsService, Product } from '@/services/products.service';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import { Product as ProductType } from '@/types';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

type FilterType = 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'top-reviewed' | 'recommended';

const Products = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
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
    fetchProducts(currentFilter, debouncedSearch);
  }, [currentFilter, debouncedSearch, fetchProducts]);

  // Listen for product changed event (added or updated) to refresh the list
  useEffect(() => {
    const handleProductChanged = () => {
      fetchProducts(currentFilter, debouncedSearch);
    };

    window.addEventListener('productChanged', handleProductChanged);
    
    return () => {
      window.removeEventListener('productChanged', handleProductChanged);
    };
  }, [currentFilter, debouncedSearch, fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts(currentFilter, debouncedSearch);
  }, [currentFilter, debouncedSearch, fetchProducts]);

  // Render content based on loading/error state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[300px]">
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

    return <ProductTable filter={currentFilter} products={products} onRefresh={refetch} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <ExportButton defaultDataType="products" />
        </div>
      </div>

      <Tabs 
        value={currentFilter}
        onValueChange={(value) => {
          setCurrentFilter(value as FilterType);
          setPage(1);
        }}
        className="opacity-0 animate-fade-in" 
        style={{ animationDelay: '100ms' }}
      >
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="top-sellers">Top Sellers</TabsTrigger>
          <TabsTrigger value="top-reviewed">Most Reviewed</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          {renderContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default Products;
