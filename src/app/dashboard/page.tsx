"use client";


import { useEffect, useState } from 'react';
import { StatCard } from "@/components/features/admin/StatCard";
import { StockChart } from "@/components/features/admin/StockChart";
import { SalesChart } from "@/components/features/admin/SalesChart";
import { CategoryPieChart } from "@/components/features/admin/CategoryPieChart";
import { ProductTable } from "@/components/features/admin/products/ProductTable";
import { TopProductsCard } from "@/components/features/admin/products/TopProductsCard";
import { OutOfStockAlert } from "@/components/features/admin/OutOfStockAlert";
import { RecommendedProductsCard } from "@/components/features/admin/products/RecommendedProductsCard";
import {
 Package,
 AlertTriangle,
 DollarSign,
 Star,
 ShoppingCart,
 Loader2,
 AlertCircle,
} from "lucide-react";
import { analyticsService } from '@/services/analytics.service';
import { productsService } from '@/services/products.service';
import { stockAlertsService } from '@/services/stock-alerts.service';
import { topSellersService } from '@/services/top-sellers.service';
import { reviewsService } from '@/services/reviews.service';

// Helper to normalize category name (capitalize first letter)
const normalizeCategory = (category: string): string => {
  if (!category) return 'Unknown';
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

// Helper to merge duplicate stock categories (case-insensitive)
const mergeStockCategories = (data: any[]): any[] => {
  const merged: Record<string, { category: string; inStock: number; lowStock: number; outOfStock: number }> = {};
  
  data.forEach(item => {
    const normalizedName = normalizeCategory(item.category);
    if (merged[normalizedName]) {
      merged[normalizedName].inStock += item.inStock || 0;
      merged[normalizedName].lowStock += item.lowStock || 0;
      merged[normalizedName].outOfStock += item.outOfStock || 0;
    } else {
      merged[normalizedName] = {
        category: normalizedName,
        inStock: item.inStock || 0,
        lowStock: item.lowStock || 0,
        outOfStock: item.outOfStock || 0,
      };
    }
  });
  
  return Object.values(merged).sort((a, b) => 
    (b.inStock + b.lowStock + b.outOfStock) - (a.inStock + a.lowStock + a.outOfStock)
  );
};

// Helper to merge duplicate product categories
const mergeProductCategories = (data: any[]): { name: string; value: number }[] => {
  const merged: Record<string, { name: string; value: number }> = {};
  
  data.forEach(item => {
    const normalizedName = normalizeCategory(item.category || item.name);
    if (merged[normalizedName]) {
      merged[normalizedName].value += item.count || item.value || 0;
    } else {
      merged[normalizedName] = {
        name: normalizedName,
        value: item.count || item.value || 0,
      };
    }
  });
  
  return Object.values(merged).sort((a, b) => b.value - a.value);
};


const Dashboard = () => {
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [stats, setStats] = useState({
   totalProducts: 0,
   outOfStock: 0,
   lowStock: 0,
   totalSales: 0,
   totalRevenue: 0,
   totalReviews: 0,
 });
 const [stockData, setStockData] = useState<any[]>([]);
 const [salesData, setSalesData] = useState<any[]>([]);
 const [categoryData, setCategoryData] = useState<any[]>([]);
 const [products, setProducts] = useState<any[]>([]);
 const [analytics, setAnalytics] = useState<any>(null);


 useEffect(() => {
   const fetchDashboardData = async () => {
     try {
       setLoading(true);
       setError(null);


       // Fetch analytics summary
       const analyticsRes = await analyticsService.getSummary();
       const analyticsData = analyticsRes.data || {};
       setAnalytics(analyticsData);


       // Fetch products count
       const productsRes = await productsService.getAll({ limit: 1 });
       const totalProducts = productsRes.pagination?.total || 0;


       // Fetch stock alerts
       const outOfStockRes = await stockAlertsService.getOutOfStock();
       const lowStockRes = await stockAlertsService.getLowStock();
       const outOfStock = outOfStockRes.data?.length || 0;
       const lowStock = lowStockRes.data?.length || 0;


       // Fetch stock by category
       // API returns: { category, inStock, lowStock, outOfStock }
       // Merge duplicate categories (e.g., "Gin" and "gin")
       const stockByCategoryRes = await analyticsService.getStockByCategory();
       setStockData(mergeStockCategories(stockByCategoryRes.data || []));


       // Fetch sales trend
       // API returns: { month, revenue, count } - map to { month, sales }
       const salesTrendRes = await analyticsService.getSalesTrend();
       const salesTrendData = salesTrendRes.data || [];
       const mappedSalesData = salesTrendData.map(item => ({
         month: item.month || '',
         sales: item.revenue || item.sales || 0,
       }));
       setSalesData(mappedSalesData);


       // Calculate totals from sales trend data as fallback
       const calculatedTotalRevenue = salesTrendData.reduce((sum, item) => sum + (item.revenue || 0), 0);
       const calculatedTotalSales = salesTrendData.reduce((sum, item) => sum + (item.count || 0), 0);


       // Fetch products by category
       // API returns: { category, count, percentage } - map to { name, value }
       // Merge duplicate categories
       const productsByCategoryRes = await analyticsService.getProductsByCategory();
       setCategoryData(mergeProductCategories(productsByCategoryRes.data || []));


       // Fetch reviews summary
       const reviewsRes = await reviewsService.getSummary();
       const totalReviews = reviewsRes.data?.totalReviews || 0;


       // Fetch recent products and map to expected format
       const productsListRes = await productsService.getAll({ limit: 10 });
       const mappedProducts = (productsListRes.data || []).map((p: any) => ({
         id: p._id || p.id,
         name: p.name,
         category: p.type || p.category,
         price: p.price || 0,
         stock: p.stock ?? 0,
         rating: p.rating,
         image: p.image || p.imageUrl || '',
         description: p.description || '',
         sales: p.sales || p.totalSold || 0,
       }));
       setProducts(mappedProducts);


       setStats({
         totalProducts,
         outOfStock,
         lowStock,
         // Use analytics data if available (nested object with .value), otherwise use calculated values
         totalSales: analyticsData?.totalSales?.value || calculatedTotalSales,
         totalRevenue: analyticsData?.totalRevenue?.value || calculatedTotalRevenue,
         totalReviews,
       });
     } catch (err: any) {
       setError(err.message || 'Failed to load dashboard data');
       console.error('Dashboard error:', err);
     } finally {
       setLoading(false);
     }
   };


   fetchDashboardData();
 }, []);


 if (loading) {
   return (
     <div className="flex items-center justify-center min-h-[400px]">
       <div className="flex flex-col items-center gap-4">
         <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
         <p className="text-muted-foreground">Loading dashboard...</p>
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
           <p className="text-lg font-semibold text-foreground mb-2">Error loading dashboard</p>
           <p className="text-muted-foreground">{error}</p>
         </div>
       </div>
     </div>
   );
 }


 return (
   <div className="space-y-6">
     {/* Page Header */}
     <div className="opacity-0 animate-fade-in">
       <h1 className="text-3xl font-display font-bold text-foreground">
         Dashboard
       </h1>
       <p className="text-muted-foreground mt-1">
         Welcome back! Here's what's happening with your store.
       </p>
     </div>


     {/* Stats Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
       <StatCard
         title="Total Products"
         value={stats.totalProducts}
         icon={Package}
         trend={{ value: Math.abs(analytics?.totalRevenue?.growth || 0), isPositive: (analytics?.totalRevenue?.growth || 0) >= 0 }}
         delay={50}
       />
       <StatCard
         title="Out of Stock"
         value={stats.outOfStock}
         icon={AlertTriangle}
         variant="danger"
         delay={100}
       />
       <StatCard
         title="Low Stock"
         value={stats.lowStock}
         icon={AlertTriangle}
         variant="warning"
         delay={150}
       />
       <StatCard
         title="Total Sales"
         value={stats.totalSales.toLocaleString()}
         icon={ShoppingCart}
         trend={{ value: Math.abs(analytics?.totalSales?.growth || 0), isPositive: (analytics?.totalSales?.growth || 0) >= 0 }}
         delay={200}
       />
       <StatCard
         title="Revenue"
         value={stats.totalRevenue >= 1000 ? `Rs. ${(stats.totalRevenue / 1000).toFixed(1)}K` : `Rs. ${stats.totalRevenue.toFixed(2)}`}
         icon={DollarSign}
         trend={{ value: Math.abs(analytics?.totalRevenue?.growth || 0), isPositive: (analytics?.totalRevenue?.growth || 0) >= 0 }}
         variant="success"
         delay={250}
       />
       <StatCard
         title="Total Reviews"
         value={stats.totalReviews.toLocaleString()}
         icon={Star}
         delay={300}
       />
     </div>


     {/* Charts Row */}
     <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
       <StockChart data={stockData} />
       <SalesChart data={salesData} />
       <CategoryPieChart data={categoryData} />
     </div>


     {/* Alerts and Top Products */}
     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       <OutOfStockAlert delay={450} />
       <TopProductsCard type="sales" delay={500} />
       <TopProductsCard type="reviews" delay={550} />
       <RecommendedProductsCard delay={600} />
     </div>


     {/* Product Table */}
     <div>
       <h2 className="text-xl font-semibold text-foreground mb-4">
         All Products
       </h2>
       <ProductTable filter="all" products={products} />
     </div>
   </div>
 );
};


export default Dashboard;





