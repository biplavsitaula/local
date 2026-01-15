"use client";

import { ProductTable } from '@/components/features/admin/products/ProductTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButton } from '@/components/features/admin/ExportButton';
import { ImportButton } from '@/components/features/admin/ImportButton';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useProducts } from './hooks/useProducts';
import { Pagination } from '@/components/ui/pagination';

type FilterType = 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'top-reviewed' | 'recommended';

const Products = () => {
  const {
    products,
    loading,
    error,
    currentFilter,
    setCurrentFilter,
    searchInput,
    setSearchInput,
    page,
    setPage,
    totalPages,
    totalItems,
    tableFilters,
    setTableFilters,
    refetch,
    hasActiveFilters,
    itemsPerPage,
  } = useProducts();
  
  const debouncedSearch = useDebounce(searchInput, 300);

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

    return <ProductTable filter={currentFilter} products={products} onRefresh={refetch} onFiltersChange={setTableFilters} />;
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
          <ImportButton onImportSuccess={refetch} />
          <ExportButton 
            defaultDataType="products" 
            productFilters={{
              filterType: currentFilter,
              searchQuery: debouncedSearch,
              category: tableFilters.category,
              stockStatus: tableFilters.stockStatus,
              minPrice: tableFilters.minPrice,
              maxPrice: tableFilters.maxPrice,
              minRating: tableFilters.minRating,
            }}
          />
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
        {/* Server-side pagination - only show when not actively searching */}
        {!loading && !error && totalPages > 1 && !hasActiveFilters && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default Products;