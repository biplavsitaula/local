"use client";

import { useState, useEffect } from 'react';
import { Search, Edit, Eye, Trash2, Package, Star, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { reviewsService } from '@/services/reviews.service';
import { productsService } from '@/services/products.service';
import { ArrowUpDown } from 'lucide-react';
import Image from 'next/image';

type SortKey = 'name' | 'category' | 'price' | 'stock' | 'rating' | 'sales';
type SortDir = 'asc' | 'desc';

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [mostReviewedProducts, setMostReviewedProducts] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, mostReviewedRes] = await Promise.all([
          reviewsService.getSummary(),
          reviewsService.getMostReviewed(10),
        ]);

        setReviewSummary(summaryRes.data || {});
        
        // Fetch product details for most reviewed
        const mostReviewedData = mostReviewedRes.data || [];
        const productIds = mostReviewedData
          .map((item: any) => item.productId)
          .filter((id: string) => id && id !== 'undefined' && id !== undefined);
        
        if (productIds.length > 0) {
          const productsPromises = productIds.map((id: string) => 
            productsService.getById(id).catch(() => ({ data: null }))
          );
          const productsRes = await Promise.all(productsPromises);
          
          const productsWithReviews = productsRes
            .map((res, index) => {
              if (!res.data) return null;
              // Find the matching review data by productId
              const reviewData = mostReviewedData.find((item: any) => item.productId === productIds[index]);
              return {
                ...res.data,
                reviewCount: reviewData?.count || 0,
              };
            })
            .filter((product) => product !== null); // Remove null entries
          
          setMostReviewedProducts(productsWithReviews);
        } else {
          setMostReviewedProducts([]);
        }

      } catch (err: any) {
        setError(err.message || 'Failed to load reviews');
        setMostReviewedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('desc');
  };

  // Get top 5 for the card
  const top5Reviewed = mostReviewedProducts.slice(0, 5);

  // Filter and sort for table
  const filteredAndSorted = mostReviewedProducts
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
    if (stock <= 20) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'success' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading reviews...</p>
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
            <p className="text-lg font-semibold text-foreground mb-2">Error loading reviews</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalReviews = reviewSummary?.totalReviews || 0;
  const averageRating = reviewSummary?.averageRating?.toFixed(1) || '0.0';
  const ratingDistribution = reviewSummary?.ratingDistribution || [];
  const maxReviewCount = Math.max(...ratingDistribution.map((r: any) => r.count || 0), 1);

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground mt-1">Customer feedback and ratings.</p>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Reviewed Products Card */}
        <div className="glass-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-flame-orange" />
            <h2 className="text-lg font-semibold text-foreground">Most Reviewed Products</h2>
          </div>
          <div className="space-y-4">
            {top5Reviewed.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.image || product.imageUrl ? (
                    <Image
                      src={product.image || product.imageUrl || ''}
                      alt={product.name || ''}
                      width={48}
                      height={48}
                      className="object-cover rounded-full"
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
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{(product as any).reviewCount || 0}</p>
                  <p className="text-xs text-muted-foreground">reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Summary Card */}
        <div className="glass-card rounded-xl p-6 border border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-6">Review Summary</h2>
          
          {/* Average Rating */}
          <div className="mb-6 pb-6 border-b border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-8 w-8 text-flame-orange fill-flame-orange" />
              <div>
                <p className="text-3xl font-bold text-foreground">{averageRating}</p>
                <p className="text-sm text-muted-foreground">/ 5</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>

          {/* Total Reviews */}
          <div className="mb-6 pb-6 border-b border-border/50">
            <p className="text-3xl font-bold text-foreground mb-1">{totalReviews.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground mb-3">Rating Distribution</p>
            {ratingDistribution.map((rating: any) => (
              <div key={rating.stars} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{rating.stars}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <span className="text-muted-foreground">{rating.count}</span>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-flame-gradient transition-all duration-500"
                    style={{ width: `${((rating.count || 0) / maxReviewCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Reviewed Products Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-bold text-foreground">Most Reviewed Products</h2>
        
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
                  {renderSortableTh('Sales', 'sales')}
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map((product) => {
                    const status = getStatus(product);
                    const stock = getStock(product);
                    const reviewCount = (product as any).reviewCount || 0;
                    
                    return (
                      <tr key={product.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
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
                              <p className="text-xs text-muted-foreground">{(product as any).reviewCount || 0} reviews</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-foreground capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-foreground">${(product.price || 0).toLocaleString()}</td>
                        <td className="p-4 text-sm text-foreground">{stock} units</td>
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
    </div>
  );
}
