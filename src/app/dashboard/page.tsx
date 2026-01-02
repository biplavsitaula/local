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
        const stockByCategoryRes = await analyticsService.getStockByCategory();
        setStockData(stockByCategoryRes.data || []);

        // Fetch sales trend
        const salesTrendRes = await analyticsService.getSalesTrend();
        setSalesData((salesTrendRes.data || []).map(item => ({
          month: item.month,
          sales: item.sales,
        })));

        // Fetch products by category
        const productsByCategoryRes = await analyticsService.getProductsByCategory();
        setCategoryData(productsByCategoryRes.data || []);

        // Fetch reviews summary
        const reviewsRes = await reviewsService.getSummary();
        const totalReviews = reviewsRes.data?.totalReviews || 0;

        // Fetch recent products
        const productsListRes = await productsService.getAll({ limit: 10 });
        setProducts(productsListRes.data || []);

        setStats({
          totalProducts,
          outOfStock,
          lowStock,
          totalSales: analyticsData?.totalSales || 0,
          totalRevenue: analyticsData?.totalRevenue || 0,
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
          trend={{ value: analytics?.totalRevenueGrowth || 12, isPositive: true }}
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
          trend={{ value: analytics?.totalSalesGrowth || 8, isPositive: true }}
          delay={200}
        />
        <StatCard
          title="Revenue"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          trend={{ value: analytics?.totalRevenueGrowth || 15, isPositive: true }}
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

