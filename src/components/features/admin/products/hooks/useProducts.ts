import { useEffect, useState, useCallback } from 'react';
import { productsService, Product } from '@/services/products.service';
import { Product as ProductType } from '@/types';

type FilterType = 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'top-reviewed' | 'recommended';

const ITEMS_PER_PAGE = 25;

export function useProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableFilters, setTableFilters] = useState<{
    category?: string;
    stockStatus?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
  }>({});

  const mapApiProductToProduct = (apiProduct: any): ProductType => {
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

  // Check if any search/filter is active
  const hasActiveFilters = searchInput.trim() !== '' || 
    tableFilters.category || 
    tableFilters.stockStatus || 
    tableFilters.minPrice || 
    tableFilters.maxPrice || 
    tableFilters.minRating;

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

      // When search is active, fetch all matching results from server
      // Otherwise, use server-side pagination
      const isSearching = search && search.trim() !== '';
      
      const filters = {
        view: viewMap[filter] || 'all' as const,
        search: search || undefined,
        page: isSearching ? 1 : (pageNum || page),
        limit: isSearching ? 1000 : ITEMS_PER_PAGE, // Fetch all when searching, paginate otherwise
      };

      const response = await productsService.getAll(filters);
      const mappedProducts = (response.data || []).map(mapApiProductToProduct);
      
      setProducts(mappedProducts);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || mappedProducts.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Fetch when filter or page changes (not search - that's debounced)
  useEffect(() => {
    fetchProducts(currentFilter, searchInput, page);
  }, [currentFilter, page]);

  // Separate effect for search with reset to page 1
  useEffect(() => {
    if (searchInput !== undefined) {
      setPage(1); // Reset to page 1 when searching
      fetchProducts(currentFilter, searchInput, 1);
    }
  }, [searchInput, currentFilter]);

  // Listen for product changed event (added or updated) to refresh the list
  useEffect(() => {
    const handleProductChanged = () => {
      fetchProducts(currentFilter, searchInput, page);
    };

    window.addEventListener('productChanged', handleProductChanged);
    
    return () => {
      window.removeEventListener('productChanged', handleProductChanged);
    };
  }, [currentFilter, searchInput, page, fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts(currentFilter, searchInput, page);
  }, [currentFilter, searchInput, page, fetchProducts]);

  return {
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
    itemsPerPage: ITEMS_PER_PAGE,
  };
}





























