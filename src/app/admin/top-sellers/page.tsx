















"use client";


import { useState, useEffect, useCallback, useMemo } from "react";
import {
 Search,
 Edit,
 Eye,
 Trash2,
 Package,
 Loader2,
 AlertCircle,
 ArrowUpDown,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { topSellersService } from "@/services/top-sellers.service";
import { AddProductModal } from "@/components/features/admin/products/AddProductModal";
import { DeleteProductModal } from "@/components/features/admin/products/DeleteProductModal";
import { Product as ProductType } from "@/types";
import { Pagination } from "@/components/ui/pagination";


type SortKey = "name" | "category" | "price" | "stock" | "rating" | "sales";
type SortDir = "asc" | "desc";


interface Product {
 _id?: string;
 id?: string;
 name: string;
 category: string;
 price: number;
 stock: number;
 rating?: number;
 imageUrl?: string;
 totalSold?: number;
 reviewCount?: number;
 status?: string;
}


export default function TopSellersPage() {
 const [searchQuery, setSearchQuery] = useState("");
 const [sortKey, setSortKey] = useState<SortKey>("sales");
 const [sortDir, setSortDir] = useState<SortDir>("desc");
 const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
 const [insights, setInsights] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;


 const fetchData = useCallback(async () => {
   try {
     setLoading(true);
     const [productsRes, insightsRes] = await Promise.all([
       topSellersService.getProducts(),
       topSellersService.getInsights(),
     ]);


     setTopSellingProducts(productsRes.data || []);
     setInsights(insightsRes.data || null);
   } catch (err: any) {
     setError(err.message || "Failed to load data");
   } finally {
     setLoading(false);
   }
 }, []);


 useEffect(() => {
   fetchData();
 }, [fetchData]);


 // Listen for product changes
 useEffect(() => {
   const handleProductChanged = () => {
     fetchData();
   };


   window.addEventListener('productChanged', handleProductChanged);
   return () => {
     window.removeEventListener('productChanged', handleProductChanged);
   };
 }, [fetchData]);


 // Handle edit product
 const handleEditProduct = (product: Product) => {
   const productData: ProductType = {
     id: product._id || product.id || '',
     name: product.name,
     category: product.category,
     price: product.price || 0,
     stock: product.stock || 0,
     rating: product.rating,
     image: product.imageUrl || '',
     description: '',
   };
   setSelectedProduct(productData);
   setEditModalOpen(true);
 };


 // Handle delete product
 const handleDeleteProduct = (product: Product) => {
   const productData: ProductType = {
     id: product._id || product.id || '',
     name: product.name,
     category: product.category,
     price: product.price || 0,
     stock: product.stock || 0,
     rating: product.rating,
     image: product.imageUrl || '',
     description: '',
   };
   setSelectedProduct(productData);
   setDeleteModalOpen(true);
 };


 const handleSort = (key: SortKey) => {
   if (key === sortKey) {
     setSortDir((d) => (d === "asc" ? "desc" : "asc"));
   } else {
     setSortKey(key);
     setSortDir("desc");
   }
 };


 const top3Products = topSellingProducts.slice(0, 3);


 const filteredAndSorted = useMemo(() => {
   const filtered = topSellingProducts
     .filter((p) => {
       const q = searchQuery.toLowerCase();
       return (
         p.name.toLowerCase().includes(q) ||
         p.category.toLowerCase().includes(q)
       );
     })
     .sort((a, b) => {
       const dir = sortDir === "asc" ? 1 : -1;
       switch (sortKey) {
         case "name":
           return dir * a.name.localeCompare(b.name);
         case "category":
           return dir * a.category.localeCompare(b.category);
         case "price":
           return dir * (a.price - b.price);
         case "stock":
           return dir * (a.stock - b.stock);
         case "rating":
           return dir * ((a.rating || 0) - (b.rating || 0));
         case "sales":
           return dir * ((a.totalSold || 0) - (b.totalSold || 0));
         default:
           return 0;
       }
     });

   // Apply pagination
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   return filtered.slice(startIndex, endIndex);
 }, [topSellingProducts, searchQuery, sortKey, sortDir, currentPage, itemsPerPage]);

 const totalFiltered = useMemo(() => {
   return topSellingProducts.filter((p) => {
     const q = searchQuery.toLowerCase();
     return (
       p.name.toLowerCase().includes(q) ||
       p.category.toLowerCase().includes(q)
     );
   });
 }, [topSellingProducts, searchQuery]);

 const totalPages = Math.ceil(totalFiltered.length / itemsPerPage);

 // Reset to page 1 when filters or search change
 useEffect(() => {
   setCurrentPage(1);
 }, [searchQuery, sortKey, sortDir]);


 const getStatus = (p: Product) => {
   if (p.stock === 0)
     return { label: "Out of Stock", color: "text-destructive bg-destructive/20" };
   if (p.stock <= 20)
     return { label: "Low Stock", color: "text-warning bg-warning/20" };
   return { label: "In Stock", color: "text-success bg-success/20" };
 };


 const trendingCategory =
   insights?.trendingCategory?.category ||
   insights?.trendingCategory ||
   "N/A";


 const bestCategory = insights?.bestCategory?.category || "N/A";


 const peakSalesDay = insights?.peakSalesDay?.day || "N/A";


 if (loading) {
   return (
     <div className="flex justify-center py-20">
       <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
     </div>
   );
 }


 if (error) {
   return (
     <div className="flex justify-center py-20 text-destructive">
       <AlertCircle className="mr-2" /> {error}
     </div>
   );
 }


 return (
   <div className="space-y-6">
     <h1 className="text-3xl font-bold">Top Sellers</h1>


     {/* TOP 3 CARDS */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       <div className="lg:col-span-2 space-y-3">
         {top3Products.map((p, i) => (
           <div
             key={p._id}
             className="glass-card p-4 rounded-xl flex items-center gap-4"
           >
             <div className="text-2xl font-bold text-flame-orange">
               {i + 1}
             </div>
             <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/50">
               {p.imageUrl ? (
                 <Image src={p.imageUrl || '/assets/liquor1.jpeg'} alt={p.name} width={48} height={48} />
               ) : (
                 <Package />
               )}
             </div>
             <div className="flex-1">
               <p className="font-medium">{p.name}</p>
               <p className="text-sm text-muted-foreground">{p.category}</p>
             </div>
             <p className="font-semibold">
               {(p.totalSold || 0).toLocaleString()} sold
             </p>
           </div>
         ))}
       </div>


       {/* INSIGHTS */}
       <div className="glass-card p-6 rounded-xl">
         <h3 className="font-semibold mb-4">Sales Insights</h3>
         <p className="text-sm text-muted-foreground">Trending Category</p>
         <p className="text-xl font-bold text-flame-orange capitalize">
           {trendingCategory}
         </p>


         <p className="text-sm mt-3 text-muted-foreground">Best Category</p>
         <p className="text-xl font-bold text-success capitalize">
           {bestCategory}
         </p>


         <p className="text-sm mt-3 text-muted-foreground">Peak Sales Day</p>
         <p className="text-xl font-bold">{peakSalesDay}</p>
       </div>
     </div>


     {/* SEARCH */}
     <div className="relative">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
       <Input
         className="pl-10"
         placeholder="Search products..."
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
       />
     </div>


     {/* TABLE */}
     <div className="glass-card rounded-xl overflow-hidden">
       <table className="w-full">
         <thead>
           <tr>
             {["Product", "Category", "Price", "Stock", "Status", "Rating", "Sales"].map(
               (h) => (
                 <th key={h} className="p-4 text-left">
                   {h}
                 </th>
               )
             )}
             <th className="p-4">Actions</th>
           </tr>
         </thead>
         <tbody>
           {filteredAndSorted.map((p) => {
             const status = getStatus(p);
             return (
               <tr key={p._id} className="border-t">
                 <td className="p-4">{p.name}</td>
                 <td className="p-4">{p.category}</td>
                 <td className="p-4">${p.price}</td>
                 <td className="p-4">{p.stock}</td>
                 <td className="p-4">
                   <span className={`px-2 py-1 rounded ${status.color}`}>
                     {status.label}
                   </span>
                 </td>
                 <td className="p-4">{p.rating?.toFixed(1) || "-"}</td>
                 <td className="p-4">
                   {(p.totalSold || 0).toLocaleString()}
                 </td>
                 <td className="p-4">
                   <div className="flex items-center gap-2">
                     <button
                       className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                       onClick={() => handleEditProduct(p)}
                       title="Edit product"
                     >
                       <Edit size={16} className="text-muted-foreground" />
                     </button>
                     <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                       <Eye size={16} className="text-muted-foreground" />
                     </button>
                     <button
                       className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                       onClick={() => handleDeleteProduct(p)}
                       title="Delete product"
                     >
                       <Trash2 size={16} className="text-destructive" />
                     </button>
                   </div>
                 </td>
               </tr>
             );
          })}
        </tbody>
      </table>
      {totalFiltered.length > itemsPerPage && (
        <div className="border-t border-border/50 p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            itemsPerPage={itemsPerPage}
            totalItems={totalFiltered.length}
          />
        </div>
      )}
    </div>


     {/* Edit Product Modal */}
     <AddProductModal
       product={selectedProduct}
       open={editModalOpen}
       onOpenChange={setEditModalOpen}
       onSuccess={fetchData}
     />


     {/* Delete Product Modal */}
     <DeleteProductModal
       open={deleteModalOpen}
       onOpenChange={setDeleteModalOpen}
       product={selectedProduct}
       onConfirm={fetchData}
     />
   </div>
 );
}
































// "use client";


// import { useState, useEffect } from 'react';
// import { Search, Edit, Eye, Trash2, Package, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { topSellersService } from '@/services/top-sellers.service';
// import { ArrowUpDown } from 'lucide-react';
// import Image from 'next/image';


// type SortKey = 'name' | 'category' | 'price' | 'stock' | 'rating' | 'sales';
// type SortDir = 'asc' | 'desc';


// export default function TopSellersPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortKey, setSortKey] = useState<SortKey>('sales');
//   const [sortDir, setSortDir] = useState<SortDir>('desc');
//   const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
//   const [insights, setInsights] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);


//   useEffect(() => {
//     const fetchTopSellers = async () => {
//       try {
//         setLoading(true);
//         setError(null);


//         const [productsRes, insightsRes] = await Promise.all([
//           topSellersService.getProducts(),
//           topSellersService.getInsights(),
//         ]);


//         setTopSellingProducts(productsRes.data || []);
//         setInsights(insightsRes.data || {});
//       } catch (err: any) {
//         setError(err.message || 'Failed to load top sellers');
//       } finally {
//         setLoading(false);
//       }
//     };


//     fetchTopSellers();
//   }, []);


//   const handleSort = (key: SortKey) => {
//     if (key === sortKey) {
//       setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
//       return;
//     }
//     setSortKey(key);
//     setSortDir('desc');
//   };


//   // Get top 3 for cards
//   const top3Products = topSellingProducts.slice(0, 3);


//   // Filter and sort for table
//   const filteredAndSorted = topSellingProducts
//     .filter((p) => {
//       const query = searchQuery.toLowerCase();
//       return (
//         (p.name || '').toLowerCase().includes(query) ||
//         (p.category || '').toLowerCase().includes(query)
//       );
//     })
//     .sort((a, b) => {
//       const dir = sortDir === 'asc' ? 1 : -1;
//       switch (sortKey) {
//         case 'name':
//           return dir * (a.name || '').localeCompare(b.name || '');
//         case 'category':
//           return dir * (a.category || '').localeCompare(b.category || '');
//         case 'price':
//           return dir * ((a.price || 0) - (b.price || 0));
//         case 'stock':
//           return dir * ((a.stock || 0) - (b.stock || 0));
//         case 'rating':
//           return dir * ((a.rating || 0) - (b.rating || 0));
//         case 'sales':
//           return dir * (((a as any).sales || 0) - ((b as any).sales || 0));
//         default:
//           return 0;
//       }
//     });


//   const getStock = (p: any) => p.stock ?? 0;
//   const getStatus = (p: any) => {
//     const stock = getStock(p);
//     if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' };
//     if (stock <= 20) return { label: 'Low Stock', variant: 'warning' };
//     return { label: 'In Stock', variant: 'success' };
//   };


//   const renderSortableTh = (label: string, columnKey: SortKey) => (
//     <th
//       className="text-left p-4 text-sm font-semibold text-foreground"
//       aria-sort={
//         sortKey === columnKey ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
//       }
//     >
//       <button
//         type="button"
//         onClick={() => handleSort(columnKey)}
//         className={`inline-flex items-center gap-2 transition-colors ${
//           sortKey === columnKey ? 'text-flame-orange' : 'hover:text-flame-orange'
//         }`}
//       >
//         <span>{label}</span>
//         <ArrowUpDown className="h-4 w-4 opacity-70" />
//       </button>
//     </th>
//   );


//   // Calculate peak sales day from insights
//   const peakSalesDay = insights ? {
//     day: insights.peakSalesDay || 'Saturday',
//     percentage: 45,
//     unitsSold: 567
//   } : {
//     day: 'Saturday',
//     percentage: 45,
//     unitsSold: 567
//   };


//   // Get insights data
//   const trendingCategory = insights?.trendingCategory || 'N/A';
//   const bestCategory = insights?.bestCategory || 'N/A';


//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
//           <p className="text-muted-foreground">Loading top sellers...</p>
//         </div>
//       </div>
//     );
//   }


//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="flex flex-col items-center gap-4 text-center">
//           <AlertCircle className="h-8 w-8 text-destructive" />
//           <div>
//             <p className="text-lg font-semibold text-foreground mb-2">Error loading top sellers</p>
//             <p className="text-muted-foreground">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }


//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-display font-bold text-foreground">Top Sellers</h1>
//         <p className="text-muted-foreground mt-1">View your best performing products.</p>
//       </div>


//       {/* Top Section: Cards and Insights */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Top Selling Products Cards */}
//         <div className="lg:col-span-2 space-y-4">
//           <h2 className="text-xl font-semibold text-foreground">Top Selling Products</h2>
//           <div className="space-y-3">
//             {top3Products.map((product, index) => {
//               const rank = index + 1; // Starting from 1
//               const sales = (product as any).sales || 0;
            
//               return (
//                 <div
//                   key={product.id || product._id || `top-product-${index}`}
//                   className="glass-card rounded-xl p-4 border border-border/50 flex items-center gap-4 hover:scale-[1.01] transition-transform"
//                 >
//                   <div className="text-2xl font-bold text-flame-orange w-8">{rank}</div>
//                   <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
//                     {product.image || product.imageUrl ? (
//                       <Image
//                         src={product.image || product.imageUrl || ''}
//                         alt={product.name || ''}
//                         width={48}
//                         height={48}
//                         className="object-cover"
//                       />
//                     ) : (
//                       <Package className="h-6 w-6 text-muted-foreground" />
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
//                     <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-foreground">{(product.sales || 0).toLocaleString()} sold</p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>


//         {/* Sales Insights Card */}
//         <div className="glass-card rounded-xl p-6 border border-border/50">
//           <h3 className="text-lg font-semibold text-foreground mb-4">Sales Insights</h3>
//           <div className="space-y-4">
//             <div>
//               <p className="text-sm text-muted-foreground mb-1">Trending Category</p>
//               <p className="text-xl font-bold text-flame-orange capitalize">{trendingCategory}</p>
//             </div>
//             <div className="pt-3 border-t border-border/50">
//               <p className="text-sm text-muted-foreground mb-1">Best Category</p>
//               <p className="text-xl font-bold text-success capitalize">{bestCategory}</p>
//             </div>
//             <div className="pt-3 border-t border-border/50">
//               <p className="text-sm text-muted-foreground mb-1">Peak Sales Day</p>
//               <p className="text-xl font-bold text-foreground">{peakSalesDay.day}</p>
//             </div>
//           </div>
//         </div>
//       </div>


//       {/* Top Selling Products Table */}
//       <div className="space-y-4">
//         <h2 className="text-2xl font-display font-bold text-foreground">Top Selling Products</h2>
      
//         {/* Search Bar */}
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search products by name or category..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10 bg-secondary/50 border-border"
//           />
//         </div>


//         {/* Table */}
//         <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-border/50">
//                   {renderSortableTh('Product', 'name')}
//                   {renderSortableTh('Category', 'category')}
//                   {renderSortableTh('Price', 'price')}
//                   {renderSortableTh('Stock', 'stock')}
//                   {renderSortableTh('Status', 'status')}
//                   {renderSortableTh('Rating', 'rating')}
//                   {renderSortableTh('Sales', 'sales')}
//                   <th className="text-left p-4 text-sm font-semibold text-foreground">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredAndSorted.length > 0 ? (
//                   filteredAndSorted.map((product, index) => {
//                     const status = getStatus(product);
//                     const stock = getStock(product);
//                     const reviews = Math.floor(Math.random() * 500) + 100; // Mock reviews count
//                     const sales = (product as any).sales || 0;
                  
//                     return (
//                       <tr key={product.id || product._id || `product-${index}`} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden">
//                               {product.image || product.imageUrl ? (
//                                 <Image
//                                   src={product.image || product.imageUrl || ''}
//                                   alt={product.name || ''}
//                                   width={40}
//                                   height={40}
//                                   className="object-cover"
//                                 />
//                               ) : (
//                                 <Package className="h-5 w-5 text-muted-foreground" />
//                               )}
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium text-foreground">{product.name}</p>
//                               <p className="text-xs text-muted-foreground">{product.reviews || 0} reviews</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-foreground capitalize">
//                             {product.category}
//                           </span>
//                         </td>
//                         <td className="p-4 text-sm text-foreground">${(product.price || 0).toLocaleString()}</td>
//                         <td className="p-4 text-sm text-foreground">{stock} units</td>
//                         <td className="p-4">
//                           <span className={`text-xs px-2 py-1 rounded-full ${
//                             status.variant === 'destructive'
//                               ? 'bg-destructive/20 text-destructive'
//                               : status.variant === 'warning'
//                               ? 'bg-warning/20 text-warning'
//                               : 'bg-success/20 text-success'
//                           }`}>
//                             {status.label}
//                           </span>
//                         </td>
//                         <td className="p-4 text-sm text-foreground">
//                           {product.rating ? (
//                             <span className="flex items-center gap-1">
//                               <span>★</span>
//                               <span>{product.rating.toFixed(1)}</span>
//                             </span>
//                           ) : '-'}
//                         </td>
//                         <td className="p-4 text-sm text-foreground">{(product.sales || 0).toLocaleString()}</td>
//                         <td className="p-4">
//                           <div className="flex items-center gap-2">
//                             <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
//                               <Edit className="h-4 w-4 text-muted-foreground" />
//                             </button>
//                             <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
//                               <Eye className="h-4 w-4 text-muted-foreground" />
//                             </button>
//                             <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
//                               <Trash2 className="h-4 w-4 text-destructive" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan={8} className="p-8 text-center text-muted-foreground">
//                       No products found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



