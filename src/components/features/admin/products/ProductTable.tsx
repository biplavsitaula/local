
"use client";

import { useMemo, useState } from 'react';
import { Product } from '@/types';
import { ArrowUpDown, Edit, Trash2, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddProductModal } from './AddProductModal';
import { DeleteProductModal } from './DeleteProductModal';

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

interface ProductTableProps {
  filter: FilterType;
  products?: Product[];
  onRefresh?: () => void;
}

export function ProductTable({ filter, products = [], onRefresh }: ProductTableProps) {
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
    // The DeleteProductModal now handles the API call and refresh
    // This callback is called after successful deletion
    setDeleteProduct(null);
    
    // Trigger refresh via the onRefresh callback
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleEditModalClose = () => {
    setEditProduct(null);
  };

  const sortedProducts = useMemo(() => {
    // Ensure products is always an array
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
        // Sort by price (assuming higher price = more popular) or by stock movement
        filtered = [...productsArray].sort((a, b) => b.price - a.price).slice(0, 10);
        break;
      case 'top-reviewed':
        // Sort by rating if available, otherwise by price
        filtered = [...productsArray]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .filter((p) => p.rating && p.rating > 0)
          .slice(0, 10);
        break;
      case 'recommended':
        // Products with tags or high ratings
        filtered = productsArray
          .filter((p) => p.tag || (p.rating && p.rating >= 4))
          .slice(0, 10);
        break;
      case 'all':
      default:
        filtered = productsArray;
        break;
    }

    // Apply additional filters
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

  // Get unique categories from products
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

  const renderSortableTh = (label: string, columnKey: SortKey) => (
    <th
      className="text-left p-4 text-sm font-semibold text-foreground"
      aria-sort={
        sortKey === columnKey ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        onClick={() => handleSort(columnKey)}
        className={`inline-flex items-center gap-2 transition-colors ${
          sortKey === columnKey ? 'text-flame-orange' : 'hover:text-flame-orange'
        }`}
      >
        <span>{label}</span>
        <ArrowUpDown className="h-4 w-4 opacity-70" />
      </button>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="gap-2 border-border"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 bg-flame-orange rounded-full" />
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card rounded-xl p-4 border border-border/50 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Filter Products</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                >
                  Clear All
                </Button>
              )}
              <Button
                onClick={() => setShowFilters(false)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Category</label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Stock Status</label>
              <Select
                value={filters.stockStatus || 'all'}
                onValueChange={(value) => setFilters({ ...filters, stockStatus: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Price Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Min Price</label>
              <Input
                type="number"
                placeholder="Min price..."
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="bg-secondary/50 border-border"
              />
            </div>

            {/* Max Price Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Max Price</label>
              <Input
                type="number"
                placeholder="Max price..."
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="bg-secondary/50 border-border"
              />
            </div>

            {/* Min Rating Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Min Rating</label>
              <Input
                type="number"
                placeholder="Min rating..."
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="bg-secondary/50 border-border"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {renderSortableTh('Product', 'name')}
                {renderSortableTh('Category', 'category')}
                {renderSortableTh('Price', 'price')}
                {renderSortableTh('Stock', 'stock')}
                {renderSortableTh('Status', 'status')}
                {renderSortableTh('Rating', 'rating')}
                {renderSortableTh('Sales', 'sales')}
                <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product, index) => (
                  <tr key={product.id || product._id || `product-${index}`} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-foreground">{product.name}</td>
                    <td className="p-4 text-sm text-muted-foreground capitalize">{product.category}</td>
                    <td className="p-4 text-sm text-foreground">Rs. {product.price.toLocaleString()}</td>
                    <td className="p-4 text-sm text-foreground">{getStock(product)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getStock(product) > 20 
                          ? 'bg-success/20 text-success' 
                          : getStock(product) > 0 
                          ? 'bg-warning/20 text-warning' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {getStock(product) > 20 ? 'In Stock' : getStock(product) > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      {product.rating ? product.rating.toFixed(1) : '-'}
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      {getSales(product) ? getSales(product).toLocaleString() : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {editProduct && (
        <AddProductModal
          product={editProduct}
          open={true}
          onOpenChange={handleEditModalClose}
          onSuccess={onRefresh}
        />
      )}
      <DeleteProductModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        product={deleteProduct}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

