"use client";

import { ArrowUpDown, Edit, Trash2, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddProductModal } from './AddProductModal';
import { DeleteProductModal } from './DeleteProductModal';
import { Pagination } from '@/components/ui/pagination';
import { useProductTable } from './hooks/useProductTable';
import { Product } from '@/types';

type FilterType = 'all' | 'out-of-stock' | 'low-stock' | 'top-sellers' | 'top-reviewed' | 'recommended';
type SortKey = 'name' | 'category' | 'price' | 'stock' | 'status' | 'rating' | 'sales';

interface ProductTableProps {
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

export function ProductTable({ filter, products = [], onRefresh, onFiltersChange }: ProductTableProps) {
  const {
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
  } = useProductTable({
    filter,
    products,
    onRefresh,
    onFiltersChange,
  });

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
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product, index) => (
                  <tr key={product.id || (product as any)?._id || `product-${index}`} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
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
        {sortedProducts.length > itemsPerPage && (
          <div className="border-t border-border/50 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              itemsPerPage={itemsPerPage}
              totalItems={sortedProducts.length}
            />
          </div>
        )}
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

