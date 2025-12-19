
"use client";

import { useMemo, useState } from 'react';
import { products } from '@/data/products';
import { Product } from '@/types';
import { ArrowUpDown } from 'lucide-react';

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
}

export function ProductTable({ filter }: ProductTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  const sortedProducts = useMemo(() => {
    let filtered: Product[] = [...products];

    switch (filter) {
      case 'out-of-stock':
        filtered = products.filter((p) => !p.stock || p.stock === 0);
        break;
      case 'low-stock':
        filtered = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 20);
        break;
      case 'top-sellers':
        // Sort by price (assuming higher price = more popular) or by stock movement
        filtered = [...products].sort((a, b) => b.price - a.price).slice(0, 10);
        break;
      case 'top-reviewed':
        // Sort by rating if available, otherwise by price
        filtered = [...products]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .filter((p) => p.rating && p.rating > 0)
          .slice(0, 10);
        break;
      case 'recommended':
        // Products with tags or high ratings
        filtered = products
          .filter((p) => p.tag || (p.rating && p.rating >= 4))
          .slice(0, 10);
        break;
      case 'all':
      default:
        filtered = products;
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
  }, [filter, sortDir, sortKey]);

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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

