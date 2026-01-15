import { useState, useMemo, useEffect, useCallback } from "react";
import { productsService } from "@/services/products.service";
import { Product } from "@/types";

interface UseProductGridProps {
  searchQuery: string;
  selectedCategory: string;
  limit?: number;
}

const ITEMS_PER_PAGE = 10;

export function useProductGrid({
  searchQuery,
  selectedCategory,
  limit,
}: UseProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Map API product to internal Product type
  const mapApiProductToProduct = (apiProduct: any): Product => {
    const categoryValue = apiProduct?.type || apiProduct?.category || '';
    const category = categoryValue || 'Other';

    return {
      id: apiProduct?._id || apiProduct?.id || '',
      name: apiProduct?.name || '',
      nameNe: apiProduct?.nameNe || apiProduct?.name || '',
      category,
      price: apiProduct?.finalPrice || apiProduct?.price || 0,
      originalPrice: apiProduct?.discountPercent ? apiProduct?.price : undefined,
      image: apiProduct?.image || apiProduct?.imageUrl || '',
      description: apiProduct?.description || `Premium ${categoryValue || 'Beverage'} - ${apiProduct?.name || 'Product'}`,
      volume: apiProduct?.volume || '750ml',
      alcoholContent: apiProduct?.alcoholPercentage ? `${apiProduct?.alcoholPercentage}%` : '40%',
      alcohol: apiProduct?.alcoholPercentage ? `${apiProduct?.alcoholPercentage}%` : '40%',
      inStock: (apiProduct?.stock || 0) > 0,
      isNew: false,
      stock: apiProduct?.stock || 0,
      rating: apiProduct?.rating || 0,
      tag: apiProduct?.discountPercent ? `${apiProduct?.discountPercent}% OFF` : apiProduct?.tag,
    } as Product;
  };

  // Fetch products from API
  const fetchProducts = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
     
      // Map category to API format
      // API returns categories with mixed case (Whiskey, Cognac, etc.)
      // So we fetch all products and filter client-side with case-insensitive matching
      const normalizedCategory = selectedCategory?.toLowerCase();
      
      // Don't send category to API since API has mixed case categories
      // We'll filter client-side with case-insensitive matching
      // Only send search query to API
     
      // Fetch products based on whether category is selected
      const hasCategory = normalizedCategory && normalizedCategory !== 'all' && normalizedCategory !== '';
      // When category is selected, fetch all products for filtering
      // Otherwise, fetch only 10 products by default
      const fetchLimit = hasCategory ? 10000 : ITEMS_PER_PAGE; // Fetch all when category selected, 10 otherwise
      const fetchPage = hasCategory ? 1 : pageNum; // When category selected, always page 1
     
      const response = await productsService.getAll({
        page: fetchPage,
        limit: fetchLimit,
        search: searchQuery || undefined,
        // Don't send category - filter client-side instead
      });
     
      const mappedProducts = (response.data || []).map(mapApiProductToProduct);
     
      // When category is selected, always replace (fetch all at once)
      // When no category, append for pagination
      if (append && !hasCategory) {
        setProducts(prev => [...prev, ...mappedProducts]);
      } else {
        setProducts(mappedProducts);
      }
     
      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalProducts(pagination.total || 0);
        // When category is selected, we fetch all products, so no more pages
        if (hasCategory) {
          setHasMore(false);
        } else {
          // When no category, check if there are more pages
        setHasMore(pageNum < (pagination.pages || 1));
        }
      } else {
        // When category is selected, assume we got all products
        // Otherwise, check if we got a full page
        setHasMore(hasCategory ? false : mappedProducts.length === ITEMS_PER_PAGE);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch products');
      if (!append) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedCategory]);

  // Fetch products when search or category changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const filteredProducts = useMemo(() => {
    // Filter products client-side with case-insensitive category matching
    // API returns categories with mixed case (Whiskey, Cognac, Vodka, etc.)
    let filtered = [...products];
    
    const normalizedCategory = selectedCategory?.toLowerCase();
    const hasCategory = normalizedCategory && normalizedCategory !== 'all' && normalizedCategory !== '';
    
    if (hasCategory) {
      filtered = filtered.filter((product) => {
        const productCategory = product?.category?.toLowerCase();
        
        // Handle whiskey/whisky variations (API might use either)
        if (normalizedCategory === 'whisky' || normalizedCategory === 'whiskey') {
          return productCategory === 'whisky' || productCategory === 'whiskey';
        }
        
        // Case-insensitive matching for all other categories
        return productCategory === normalizedCategory;
      });
    }
   
    // Show 10 products by default, all products when category is selected
    if (hasCategory) {
      // When category is selected, show all filtered products
      return filtered;
    } else {
      // When no category, show products based on limit prop or default to ITEMS_PER_PAGE (10)
      const displayLimit = limit || ITEMS_PER_PAGE;
      return filtered.slice(0, displayLimit);
    }
  }, [products, selectedCategory, limit]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  return {
    selectedProduct,
    setSelectedProduct,
    filteredProducts,
    loading,
    loadingMore,
    error,
    hasMore,
    totalProducts,
    products,
    handleLoadMore,
    handleViewDetails,
  };
}



