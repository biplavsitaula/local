"use client";

import { useState, useMemo } from 'react';
import { Search, Edit, Eye, Trash2, AlertTriangle, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';
import { Product } from '@/types';
import { ArrowUpDown } from 'lucide-react';
import Image from 'next/image';

type SortKey = 'name' | 'category' | 'price' | 'stock' | 'status' | 'rating' | 'sales';
type SortDir = 'asc' | 'desc';

interface StockProductTableProps {
  products: Product[];
  title: string;
  searchPlaceholder?: string;
}

function StockProductTable({ products, title, searchPlaceholder = "Search products by name or category..." }: StockProductTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredAndSorted = useMemo(() => {
    let filtered = products.filter((p) => {
      const query = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    });

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
          return dir * ((a.stock || 0) - (b.stock || 0));
        case 'rating':
          return dir * ((a.rating || 0) - (b.rating || 0));
        case 'sales':
          return dir * (((a as any).sales || 0) - ((b as any).sales || 0));
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchQuery, sortKey, sortDir]);

  const getStock = (p: Product) => p.stock ?? 0;
  const getStatus = (p: Product) => {
    const stock = getStock(p);
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' };
    if (stock <= 10) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'success' };
  };

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
      <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/50 border-border"
        />
      </div>

      {/* Table */}
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
                <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((product) => {
                  const status = getStatus(product);
                  const stock = getStock(product);
                  const reviews = Math.floor(Math.random() * 300) + 50; // Mock reviews count
                  
                  return (
                    <tr key={product.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{reviews} reviews</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-foreground capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-foreground">${product.price.toLocaleString()}</td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm text-foreground">{stock} units</p>
                          {stock > 0 && stock <= 10 && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3 text-warning" />
                              <p className="text-xs text-warning">Going to be out of stock soon</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status.variant === 'destructive'
                            ? 'bg-destructive/20 text-destructive'
                            : status.variant === 'warning'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-success/20 text-success'
                        }`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {product.rating ? (
                          <span className="flex items-center gap-1">
                            <span>★</span>
                            <span>{product.rating.toFixed(1)}</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {(product as any).sales ? (product as any).sales.toLocaleString() : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
}

export default function AlertsPage() {
  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => !p.stock || p.stock === 0);
  }, []);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 10);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Stock Alerts</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage your inventory levels.</p>
      </div>

      {/* Out of Stock Products */}
      <StockProductTable
        products={outOfStockProducts}
        title="Out of Stock Products"
      />

      {/* Low Stock Products */}
      <StockProductTable
        products={lowStockProducts}
        title="Low Stock Products"
      />
    </div>
  );
}
