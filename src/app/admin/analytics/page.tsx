"use client";

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package, Loader2, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/features/admin/StatCard';
import { SalesChart } from '@/components/features/admin/SalesChart';
import { StockChart } from '@/components/features/admin/StockChart';
import { CategoryPieChart } from '@/components/features/admin/CategoryPieChart';
import { analyticsService } from '@/services/analytics.service';

// Interface for the nested summary structure from API
interface AnalyticsSummary {
  totalRevenue: { value: number; growth: number; previousValue: number };
  totalSales: { value: number; growth: number; previousValue: number };
  avgOrderValue: { value: number; growth: number; previousValue: number };
  productsSold: { value: number; growth: number; previousValue: number };
}

// Helper to normalize category name (capitalize first letter)
const normalizeCategory = (category: string): string => {
  if (!category) return 'Unknown';
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

// Helper to merge duplicate categories (case-insensitive)
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
    const normalizedName = normalizeCategory(item.category);
    if (merged[normalizedName]) {
      merged[normalizedName].value += item.count || 0;
    } else {
      merged[normalizedName] = {
        name: normalizedName,
        value: item.count || 0,
      };
    }
  });
  
  return Object.values(merged).sort((a, b) => b.value - a.value);
};

// Helper to merge duplicate revenue categories
const mergeRevenueCategories = (data: any[]): any[] => {
  const merged: Record<string, { name: string; value: number; count: number }> = {};
  let totalRevenue = 0;
  
  data.forEach(item => {
    const normalizedName = normalizeCategory(item.category);
    totalRevenue += item.revenue || 0;
    if (merged[normalizedName]) {
      merged[normalizedName].value += item.revenue || 0;
      merged[normalizedName].count += item.count || 0;
    } else {
      merged[normalizedName] = {
        name: normalizedName,
        value: item.revenue || 0,
        count: item.count || 0,
      };
    }
  });
  
  // Recalculate percentages after merging
  return Object.values(merged)
    .map(item => ({
      ...item,
      percentage: totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalRevenue: { value: 0, growth: 0, previousValue: 0 },
    totalSales: { value: 0, growth: 0, previousValue: 0 },
    avgOrderValue: { value: 0, growth: 0, previousValue: 0 },
    productsSold: { value: 0, growth: 0, previousValue: 0 },
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [revenueByCategoryData, setRevenueByCategoryData] = useState<any[]>([]);


  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch analytics summary - API returns nested objects with value, growth, previousValue
        const summaryRes = await analyticsService.getSummary();
        const summaryData = summaryRes.data || {};
        setAnalytics({
          totalRevenue: summaryData.totalRevenue || { value: 0, growth: 0, previousValue: 0 },
          totalSales: summaryData.totalSales || { value: 0, growth: 0, previousValue: 0 },
          avgOrderValue: summaryData.avgOrderValue || { value: 0, growth: 0, previousValue: 0 },
          productsSold: summaryData.productsSold || { value: 0, growth: 0, previousValue: 0 },
        });

        // Fetch sales trend - API returns { month, revenue, count }
        // SalesChart expects { month, sales }
        const salesTrendRes = await analyticsService.getSalesTrend();
        setSalesData((salesTrendRes.data || []).map(item => ({
          month: item.month || '',
          sales: item.revenue || 0, // Map 'revenue' to 'sales' for the chart
        })));

        // Fetch stock by category - API returns { category, inStock, lowStock, outOfStock }
        // Merge duplicate categories (e.g., "Gin" and "gin")
        const stockByCategoryRes = await analyticsService.getStockByCategory();
        setStockData(mergeStockCategories(stockByCategoryRes.data || []));

        // Fetch products by category - API returns { category, count, percentage }
        // CategoryPieChart expects { name, value }
        // Merge duplicate categories
        const productsByCategoryRes = await analyticsService.getProductsByCategory();
        setCategoryData(mergeProductCategories(productsByCategoryRes.data || []));

        // Fetch revenue by category - API returns { category, revenue, count, percentage }
        // Merge duplicate categories and recalculate percentages
        const revenueByCategoryRes = await analyticsService.getRevenueByCategory();
        setRevenueByCategoryData(mergeRevenueCategories(revenueByCategoryRes.data || []));
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading analytics...</p>
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
            <p className="text-lg font-semibold text-foreground mb-2">Error loading analytics</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Format revenue with Rs. currency
  const formatRevenue = (value: number | undefined) => {
    if (!value || isNaN(value)) return 'Rs. 0';
    if (value >= 1000000) {
      return `Rs. ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `Rs. ${(value / 1000).toFixed(1)}K`;
    }
    return `Rs. ${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your store performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatRevenue(analytics.totalRevenue.value)}
          icon={DollarSign}
          trend={{ 
            isPositive: analytics.totalRevenue.growth >= 0, 
            value: Math.abs(analytics.totalRevenue.growth) 
          }}
          variant="success"
          delay={0}
        />
        <StatCard
          title="Total Sales"
          value={(analytics.totalSales.value || 0).toLocaleString()}
          icon={ShoppingCart}
          trend={{ 
            isPositive: analytics.totalSales.growth >= 0, 
            value: Math.abs(analytics.totalSales.growth) 
          }}
          variant="default"
          delay={100}
        />
        <StatCard
          title="Avg Order Value"
          value={`Rs. ${Number(analytics.avgOrderValue.value || 0).toFixed(2)}`}
          icon={TrendingUp}
          trend={{ 
            isPositive: analytics.avgOrderValue.growth >= 0, 
            value: Math.abs(analytics.avgOrderValue.growth) 
          }}
          variant="default"
          delay={200}
        />
        <StatCard
          title="Products Sold"
          value={(analytics.productsSold.value || 0).toLocaleString()}
          icon={Package}
          trend={{ 
            isPositive: analytics.productsSold.growth >= 0, 
            value: Math.abs(analytics.productsSold.growth) 
          }}
          variant="default"
          delay={300}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesData} />
        <StockChart data={stockData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={categoryData} />
        
        {/* Revenue by Category */}
        <div className="glass-card rounded-xl p-6 border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-6">Revenue by Category</h3>
          <div className="space-y-4">
            {revenueByCategoryData.map((item, index) => (
              <div key={item.name || `category-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.name || 'Unknown'}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatRevenue(item.value)} ({item.percentage || 0}%)
                  </span>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-flame-gradient transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
