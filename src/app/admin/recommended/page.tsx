"use client";

import { useState, useEffect } from 'react';
import { Search, Edit, Eye, Trash2, Package, ThumbsUp, AlertTriangle, Star, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { productsService } from '@/services/products.service';
import { ArrowUpDown } from 'lucide-react';
import Image from 'next/image';

type SortKey = 'name' | 'category' | 'price' | 'stock' | 'rating' | 'sales';
type SortDir = 'asc' | 'desc';

export default function RecommendedPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsService.getAll({ view: 'recommended', limit: 100 });
        setRecommendedProducts(response.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load recommended products');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('desc');
  };

  // Get top 4 most recommended for sidebar
  const mostRecommended = [...recommendedProducts]
    .sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return ((b as any).sales || 0) - ((a as any).sales || 0);
    })
    .slice(0, 4);

  // Filter and sort for table
  const filteredAndSorted = recommendedProducts
    .filter((p) => {
      const query = searchQuery.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'name':
          return dir * (a.name || '').localeCompare(b.name || '');
        case 'category':
          return dir * (a.category || '').localeCompare(b.category || '');
        case 'price':
          return dir * ((a.price || 0) - (b.price || 0));
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

  const getStock = (p: any) => p.stock ?? 0;
  const getStatus = (p: any) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading recommended products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">Error loading recommended products</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ThumbsUp className="h-8 w-8 text-flame-orange" />
            <h1 className="text-3xl font-display font-bold text-foreground">Recommended Products</h1>
          </div>
          <p className="text-muted-foreground">Manage your recommended product selections.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or category..."
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
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map((product, index) => {
                    const status = getStatus(product);
                    const stock = getStock(product);
                    const reviews = Math.floor(Math.random() * 200) + 50; // Mock reviews count
                    
                    return (
                      <tr key={product.id || product._id || `product-${index}`} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden">
                              {product.image || product.imageUrl ? (
                                <Image
                                  src={product.image || product.imageUrl || ''}
                                  alt={product.name || ''}
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
                              <p className="text-xs text-muted-foreground">{product.reviews || 0} reviews</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-foreground capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-foreground">${(product.price || 0).toLocaleString()}</td>
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
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span>{product.rating.toFixed(1)}</span>
                            </span>
                          ) : '-'}
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
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Most Recommended Sidebar */}
      <div className="lg:col-span-1">
        <div className="glass-card rounded-xl p-6 border border-border/50 sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <ThumbsUp className="h-5 w-5 text-flame-orange" />
            <h2 className="text-lg font-semibold text-foreground">Most Recommended</h2>
          </div>
          <div className="space-y-4">
            {mostRecommended.map((product, index) => {
              const rank = index + 1;
              return (
                <div
                  key={product.id || product._id || `recommended-${index}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className="text-lg font-bold text-flame-orange w-6">#{rank}</div>
                  <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.image || product.imageUrl ? (
                      <Image
                        src={product.image || product.imageUrl || ''}
                        alt={product.name || ''}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-foreground capitalize inline-block mt-1">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-semibold text-foreground">${(product.price || 0).toLocaleString()}</p>
                      {product.rating && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          {product.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
