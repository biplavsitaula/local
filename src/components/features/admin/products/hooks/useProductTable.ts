import { useMemo, useState, useEffect } from 'react';
import { Product } from '@/types';

type FilterType = 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'top-reviewed' | 'recommended';
type SortKey = 'name' | 'category' | 'price' | 'stock' | 'status' | 'rating' | 'sales';
type SortDir = 'asc' | 'desc';

const getStock = (p: Product) => p.stock ?? 0;
const getStatusRank = (p: Product) => {
  const stock = getStock(p);
  if (stock > 20) return 2; // In Stock
  if (stock > 0) return 1; // Low Stock
  return 0; // Out of Stock
};
const getRating = (p: Product) => p.rating ?? 0;
const getSales = (p: Product) => (p as Product & { sales?: number }).sales ?? 0;

interface UseProductTableProps {
  filter: FilterType;
  products?: Product[];
  onRefresh?: () => void;
  onFiltersChange?: (filters: {
    category?: string;
    stockStatus?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
  }) => void;
}

export function useProductTable({
  filter,
  products = [],
  onRefresh,
  onFiltersChange,
}: UseProductTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  // Expose filters to parent component
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        category: filters.category,
        stockStatus: filters.stockStatus,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
      });
    }
  }, [filters, onFiltersChange]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteProduct(null);
    
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleEditModalClose = () => {
    setEditProduct(null);
  };

  const sortedProducts = useMemo(() => {
    const productsArray = Array.isArray(products) ? products : [];
    
    let filtered: Product[] = [...productsArray];

    switch (filter) {
      case 'out-of-stock':
        filtered = productsArray.filter((p) => !p.stock || p.stock === 0);
        break;
      case 'low-stock':
        filtered = productsArray.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 20);
        break;
      case 'top-sellers':
        filtered = [...productsArray].sort((a, b) => b.price - a.price).slice(0, 10);
        break;
      case 'top-reviewed':
        filtered = [...productsArray]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .filter((p) => p.rating && p.rating > 0)
          .slice(0, 10);
        break;
      case 'recommended':
        filtered = productsArray
          .filter((p) => p.tag || (p.rating && p.rating >= 4))
          .slice(0, 10);
        break;
      case 'all':
      default:
        filtered = productsArray;
        break;
    }

    if (filters.category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.stockStatus) {
      if (filters.stockStatus === 'in-stock') {
        filtered = filtered.filter(p => (p.stock || 0) > 20);
      } else if (filters.stockStatus === 'low-stock') {
        filtered = filtered.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 20);
      } else if (filters.stockStatus === 'out-of-stock') {
        filtered = filtered.filter(p => !p.stock || p.stock === 0);
      }
    }

    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter(p => p.price >= min);
      }
    }

    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter(p => p.price <= max);
      }
    }

    if (filters.minRating) {
      const min = parseFloat(filters.minRating);
      if (!isNaN(min)) {
        filtered = filtered.filter(p => (p.rating || 0) >= min);
      }
    }

    const dir = sortDir === 'asc' ? 1 : -1;

    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'category':
          return dir * a.category.localeCompare(b.category);
        case 'price':
          return dir * (a.price - b.price);
        case 'stock':
          return dir * (getStock(a) - getStock(b));
        case 'status':
          return dir * (getStatusRank(a) - getStatusRank(b));
        case 'rating':
          return dir * (getRating(a) - getRating(b));
        case 'sales':
          return dir * (getSales(a) - getSales(b));
        default:
          return 0;
      }
    });

    return sorted;
  }, [filter, sortDir, sortKey, products, filters]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, filters, sortKey, sortDir]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const clearFilters = () => {
    setFilters({
      category: '',
      stockStatus: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
    });
  };

  const hasActiveFilters = filters.category || filters.stockStatus || filters.minPrice || filters.maxPrice || filters.minRating;

  return {
    sortKey,
    sortDir,
    handleSort,
    editProduct,
    setEditProduct,
    deleteProduct,
    setDeleteProduct,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    paginatedProducts,
    sortedProducts,
    totalPages,
    categories,
    clearFilters,
    hasActiveFilters,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditModalClose,
    getStock,
    getStatusRank,
    getRating,
    getSales,
  };
}





