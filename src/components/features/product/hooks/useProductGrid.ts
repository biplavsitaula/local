import { useState, useMemo, useEffect } from "react";
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
  const fetchProducts = async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
     
      const response = await productsService.getAll({
        page: pageNum,
        limit: ITEMS_PER_PAGE
      });
     
      const mappedProducts = (response.data || []).map(mapApiProductToProduct);
     
      if (append) {
        setProducts(prev => [...prev, ...mappedProducts]);
      } else {
        setProducts(mappedProducts);
      }
     
      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalProducts(pagination.total || 0);
        setHasMore(pageNum < (pagination.pages || 1));
      } else {
        setHasMore(mappedProducts.length === ITEMS_PER_PAGE);
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
  };

  // Initial fetch
  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(1, false);
  }, []);

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product?.nameNe && product?.nameNe?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product?.description && product?.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "All" ||
        selectedCategory === "" ||
        product?.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
   
    return limit ? filtered.slice(0, limit) : filtered;
  }, [products, searchQuery, selectedCategory, limit]);

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



