
"use client";

import { useMemo, useState } from 'react';
import { Product } from '@/types';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';
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
  }, [filter, sortDir, sortKey, products]);

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
    <>
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
                sortedProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
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
    </>
  );
}

