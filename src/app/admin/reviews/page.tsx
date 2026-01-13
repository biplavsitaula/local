"use client";


import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Edit, Trash2, Package, Star, Loader2, AlertCircle, MessageSquare, Eye, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reviewsService, Review } from '@/services/reviews.service';
import { ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import { EditReviewModal, DeleteReviewModal } from '@/components/features/admin/reviews';
import { AddProductModal } from '@/components/features/admin/products/AddProductModal';
import { DeleteProductModal } from '@/components/features/admin/products/DeleteProductModal';
import { Product } from '@/types';


type SortKey = 'name' | 'category' | 'price' | 'stock' | 'status' | 'rating' | 'sales';
type ReviewSortKey = 'customerName' | 'rating' | 'createdAt' | 'productName';
type SortDir = 'asc' | 'desc';


export default function ReviewsPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [reviewSearchQuery, setReviewSearchQuery] = useState('');
 const [sortKey, setSortKey] = useState<SortKey>('rating');
 const [reviewSortKey, setReviewSortKey] = useState<ReviewSortKey>('createdAt');
 const [sortDir, setSortDir] = useState<SortDir>('desc');
 const [reviewSortDir, setReviewSortDir] = useState<SortDir>('desc');
 const [mostReviewedProducts, setMostReviewedProducts] = useState<any[]>([]);
 const [reviews, setReviews] = useState<Review[]>([]);
 const [reviewSummary, setReviewSummary] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  // Review Modal states
 const [editModalOpen, setEditModalOpen] = useState(false);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  // Product Modal states (for Most Reviewed Products table)
 const [editProductModalOpen, setEditProductModalOpen] = useState(false);
 const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Review filters
 const [showReviewFilters, setShowReviewFilters] = useState(false);
 const [reviewFilters, setReviewFilters] = useState({
   rating: '',
   dateRange: '',
   product: '',
 });


 const fetchData = useCallback(async () => {
   try {
     setLoading(true);
     setError(null);


     const [summaryRes, mostReviewedRes, reviewsRes] = await Promise.all([
       reviewsService.getSummary(),
       reviewsService.getMostReviewed(10),
       reviewsService.getAll(),
     ]);


     setReviewSummary(summaryRes.data || {});
    
     // Most reviewed API already returns full product data
     const mostReviewedData = mostReviewedRes.data || [];
     const productsWithReviews = mostReviewedData.map((item: any) => ({
       id: item._id,
       name: item.name,
       category: item.category,
       rating: item.rating,
       imageUrl: item.imageUrl,
       reviewCount: item.reviewCount || 0,
       price: item.price,
       stock: item.stock,
       sales: item.sales,
     }));
    
     setMostReviewedProducts(productsWithReviews);
     setReviews(reviewsRes.data || []);


   } catch (err: any) {
     setError(err.message || 'Failed to load reviews');
     setMostReviewedProducts([]);
     setReviews([]);
   } finally {
     setLoading(false);
   }
 }, []);


 useEffect(() => {
   fetchData();
 }, [fetchData]);


 // Listen for review changes from modals
 useEffect(() => {
   const handleReviewChanged = () => {
     fetchData();
   };


   window.addEventListener('reviewChanged', handleReviewChanged);
   return () => {
     window.removeEventListener('reviewChanged', handleReviewChanged);
   };
 }, [fetchData]);


 const handleSort = (key: SortKey) => {
   if (key === sortKey) {
     setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
     return;
   }
   setSortKey(key);
   setSortDir('desc');
 };


 const handleReviewSort = (key: ReviewSortKey) => {
   if (key === reviewSortKey) {
     setReviewSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
     return;
   }
   setReviewSortKey(key);
   setReviewSortDir('desc');
 };


 // Handle edit review
 const handleEditReview = (review: Review) => {
   setSelectedReview(review);
   setEditModalOpen(true);
 };


 // Handle delete review
 const handleDeleteReview = (review: Review) => {
   setSelectedReview(review);
   setDeleteModalOpen(true);
 };


 // Handle edit product (for Most Reviewed Products table)
 const handleEditProduct = (product: any) => {
   // Convert to Product type format
   const productData: Product = {
     id: product.id || (product as any)?._id,
     name: product.name,
     category: product.category,
     price: product.price || 0,
     stock: product.stock || 0,
     rating: product.rating,
     image: product.image || product.imageUrl || '',
     description: product.description || '',
   };
   setSelectedProduct(productData);
   setEditProductModalOpen(true);
 };


 // Handle delete product (for Most Reviewed Products table)
 const handleDeleteProduct = (product: any) => {
   const productData: Product = {
     id: product.id || (product as any)?._id,
     name: product.name,
     category: product.category,
     price: product.price || 0,
     stock: product.stock || 0,
     rating: product.rating,
     image: product.image || product.imageUrl || '',
     description: product.description || '',
   };
   setSelectedProduct(productData);
   setDeleteProductModalOpen(true);
 };


 // Get top 5 for the card
 const top5Reviewed = mostReviewedProducts.slice(0, 5);


 // Get unique products for filter
 const uniqueProducts = useMemo(() => {
   const prods = new Set<string>();
   reviews.forEach(r => {
     if (r.productName) prods.add(r.productName);
   });
   return Array.from(prods).sort();
 }, [reviews]);

 // Filter and sort reviews
 const filteredAndSortedReviews = reviews
   .filter((r) => {
     const query = reviewSearchQuery.toLowerCase();
     const matchesSearch = (
       (r.customerName || '').toLowerCase().includes(query) ||
       (r.productName || '').toLowerCase().includes(query) ||
       (r.comment || '').toLowerCase().includes(query)
     );

     // Apply rating filter
     if (reviewFilters.rating) {
       const rating = parseInt(reviewFilters.rating);
       if (!isNaN(rating) && (r.rating || 0) !== rating) {
         return false;
       }
     }

     // Apply product filter
     if (reviewFilters.product && r.productName?.toLowerCase() !== reviewFilters.product.toLowerCase()) {
       return false;
     }

     // Apply date range filter
     if (reviewFilters.dateRange) {
       const now = new Date();
       let cutoffDate = new Date();
       if (reviewFilters.dateRange === '7d') {
         cutoffDate.setDate(now.getDate() - 7);
       } else if (reviewFilters.dateRange === '30d') {
         cutoffDate.setDate(now.getDate() - 30);
       } else if (reviewFilters.dateRange === '90d') {
         cutoffDate.setDate(now.getDate() - 90);
       }
       const reviewDate = new Date(r.createdAt);
       if (reviewDate < cutoffDate) return false;
     }

     return matchesSearch;
   })
   .sort((a, b) => {
     const dir = reviewSortDir === 'asc' ? 1 : -1;
     switch (reviewSortKey) {
       case 'customerName':
         return dir * (a.customerName || '').localeCompare(b.customerName || '');
       case 'productName':
         return dir * (a.productName || '').localeCompare(b.productName || '');
       case 'rating':
         return dir * ((a.rating || 0) - (b.rating || 0));
       case 'createdAt':
         return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
       default:
         return 0;
     }
   });


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
       case 'status':
         // Sort by stock level (status is derived from stock)
         return dir * ((a.stock || 0) - (b.stock || 0));
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
  // Convert ratingDistribution from object {"1": 20, "2": 17, ...} to array format
 const rawDistribution = reviewSummary?.ratingDistribution || {};
 const ratingDistribution = Object.entries(rawDistribution)
   .map(([stars, count]) => ({ stars: parseInt(stars), count: count as number }))
   .sort((a, b) => b.stars - a.stars); // Sort from 5 to 1
  const maxReviewCount = Math.max(...ratingDistribution.map((r) => r.count || 0), 1);


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


 const renderReviewSortableTh = (label: string, columnKey: ReviewSortKey) => (
   <th
     className="text-left p-4 text-sm font-semibold text-foreground"
     aria-sort={
       reviewSortKey === columnKey ? (reviewSortDir === 'asc' ? 'ascending' : 'descending') : 'none'
     }
   >
     <button
       type="button"
       onClick={() => handleReviewSort(columnKey)}
       className={`inline-flex items-center gap-2 transition-colors ${
         reviewSortKey === columnKey ? 'text-flame-orange' : 'hover:text-flame-orange'
       }`}
     >
       <span>{label}</span>
       <ArrowUpDown className="h-4 w-4 opacity-70" />
     </button>
   </th>
 );


 const formatDate = (dateString: string) => {
   return new Date(dateString).toLocaleDateString('en-US', {
     year: 'numeric',
     month: 'short',
     day: 'numeric',
   });
 };

 const clearReviewFilters = () => {
   setReviewFilters({
     rating: '',
     dateRange: '',
     product: '',
   });
 };

 const hasActiveReviewFilters = reviewFilters.rating || reviewFilters.dateRange || reviewFilters.product;




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
                     src={product.image || product.imageUrl || '/assets/liquor1.jpeg'}
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
                                 src={product.image || product.imageUrl || '/assets/liquor1.jpeg'}
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
                           <button
                             className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                             onClick={() => handleEditProduct(product)}
                             title="Edit product"
                           >
                             <Edit className="h-4 w-4 text-muted-foreground" />
                           </button>
                           <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                             <Eye className="h-4 w-4 text-muted-foreground" />
                           </button>
                           <button
                             className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                             onClick={() => handleDeleteProduct(product)}
                             title="Delete product"
                           >
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


     {/* Individual Reviews Table */}
     <div className="space-y-4">
       <div className="flex items-center gap-2">
         <MessageSquare className="h-6 w-6 text-flame-orange" />
         <h2 className="text-2xl font-display font-bold text-foreground">All Reviews</h2>
       </div>
      
       {/* Search and Filter Bar for Reviews */}
       <div className="space-y-4">
         <div className="flex gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search reviews by customer, product, or comment..."
               value={reviewSearchQuery}
               onChange={(e) => setReviewSearchQuery(e.target.value)}
               className="pl-10 bg-secondary/50 border-border"
             />
           </div>
           <Button
             onClick={() => setShowReviewFilters(!showReviewFilters)}
             variant="outline"
             className="gap-2 border-border"
           >
             <Filter className="h-4 w-4" />
             Filters
             {hasActiveReviewFilters && (
               <span className="ml-1 h-2 w-2 bg-flame-orange rounded-full" />
             )}
           </Button>
         </div>

         {/* Filter Panel */}
         {showReviewFilters && (
           <div className="glass-card rounded-xl p-4 border border-border/50 space-y-4">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-sm font-semibold text-foreground">Filter Reviews</h3>
               <div className="flex items-center gap-2">
                 {hasActiveReviewFilters && (
                   <Button
                     onClick={clearReviewFilters}
                     variant="ghost"
                     size="sm"
                     className="text-xs h-7"
                   >
                     Clear All
                   </Button>
                 )}
                 <Button
                   onClick={() => setShowReviewFilters(false)}
                   variant="ghost"
                   size="sm"
                   className="h-7 w-7 p-0"
                 >
                   <X className="h-4 w-4" />
                 </Button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Rating Filter */}
               <div className="space-y-2">
                 <label className="text-xs font-medium text-foreground">Rating</label>
                 <Select
                   value={reviewFilters.rating || 'all'}
                   onValueChange={(value) => setReviewFilters({ ...reviewFilters, rating: value === 'all' ? '' : value })}
                 >
                   <SelectTrigger className="bg-secondary/50 border-border">
                     <SelectValue placeholder="All ratings" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All ratings</SelectItem>
                     <SelectItem value="5">5 Stars</SelectItem>
                     <SelectItem value="4">4 Stars</SelectItem>
                     <SelectItem value="3">3 Stars</SelectItem>
                     <SelectItem value="2">2 Stars</SelectItem>
                     <SelectItem value="1">1 Star</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* Product Filter */}
               <div className="space-y-2">
                 <label className="text-xs font-medium text-foreground">Product</label>
                 <Select
                   value={reviewFilters.product || 'all'}
                   onValueChange={(value) => setReviewFilters({ ...reviewFilters, product: value === 'all' ? '' : value })}
                 >
                   <SelectTrigger className="bg-secondary/50 border-border">
                     <SelectValue placeholder="All products" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All products</SelectItem>
                     {uniqueProducts.map(prod => (
                       <SelectItem key={prod} value={prod}>{prod}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* Date Range Filter */}
               <div className="space-y-2">
                 <label className="text-xs font-medium text-foreground">Date Range</label>
                 <Select
                   value={reviewFilters.dateRange || 'all'}
                   onValueChange={(value) => setReviewFilters({ ...reviewFilters, dateRange: value === 'all' ? '' : value })}
                 >
                   <SelectTrigger className="bg-secondary/50 border-border">
                     <SelectValue placeholder="All time" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All time</SelectItem>
                     <SelectItem value="7d">Last 7 days</SelectItem>
                     <SelectItem value="30d">Last 30 days</SelectItem>
                     <SelectItem value="90d">Last 90 days</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
           </div>
         )}
       </div>


       {/* Reviews Table */}
       <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="border-b border-border/50">
                 {renderReviewSortableTh('Customer', 'customerName')}
                 {renderReviewSortableTh('Product', 'productName')}
                 {renderReviewSortableTh('Rating', 'rating')}
                 <th className="text-left p-4 text-sm font-semibold text-foreground">Comment</th>
                 {renderReviewSortableTh('Date', 'createdAt')}
                 <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
               </tr>
             </thead>
             <tbody>
               {filteredAndSortedReviews.length > 0 ? (
                 filteredAndSortedReviews.map((review) => {
                   const reviewId = review._id || review.id || '';
                   return (
                     <tr key={reviewId} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                       <td className="p-4">
                         <p className="text-sm font-medium text-foreground">{review.customerName}</p>
                       </td>
                       <td className="p-4">
                         <p className="text-sm text-foreground">{review.productName || '-'}</p>
                       </td>
                       <td className="p-4">
                         <div className="flex items-center gap-1">
                           {[1, 2, 3, 4, 5].map((star) => (
                             <Star
                               key={star}
                               className={`h-4 w-4 ${
                                 star <= (review.rating || 0)
                                   ? "text-yellow-400 fill-yellow-400"
                                   : "text-muted-foreground"
                               }`}
                             />
                           ))}
                           <span className="ml-2 text-sm text-muted-foreground">
                             ({review.rating})
                           </span>
                         </div>
                       </td>
                       <td className="p-4">
                         <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                           {review.comment || '-'}
                         </p>
                       </td>
                       <td className="p-4 text-sm text-foreground">
                         {review.createdAt ? formatDate(review.createdAt) : '-'}
                       </td>
                       <td className="p-4">
                         <div className="flex items-center gap-2">
                           <button
                             className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                             onClick={() => handleEditReview(review)}
                             title="Edit review"
                           >
                             <Edit className="h-4 w-4 text-muted-foreground" />
                           </button>
                           <button
                             className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                             onClick={() => handleDeleteReview(review)}
                             title="Delete review"
                           >
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </button>
                         </div>
                       </td>
                     </tr>
                   );
                 })
               ) : (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-muted-foreground">
                     No reviews found
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
     </div>


     {/* Edit Review Modal */}
     <EditReviewModal
       open={editModalOpen}
       onOpenChange={setEditModalOpen}
       review={selectedReview}
       onSuccess={fetchData}
     />


     {/* Delete Review Modal */}
     <DeleteReviewModal
       open={deleteModalOpen}
       onOpenChange={setDeleteModalOpen}
       review={selectedReview}
       onSuccess={fetchData}
     />


     {/* Edit Product Modal */}
     <AddProductModal
       product={selectedProduct}
       open={editProductModalOpen}
       onOpenChange={setEditProductModalOpen}
       onSuccess={fetchData}
     />


     {/* Delete Product Modal */}
     <DeleteProductModal
       open={deleteProductModalOpen}
       onOpenChange={setDeleteProductModalOpen}
       product={selectedProduct}
       onConfirm={fetchData}
     />
   </div>
 );
}



