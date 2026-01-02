"use client";

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package, Loader2, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/features/admin/StatCard';
import { SalesChart } from '@/components/features/admin/SalesChart';
import { StockChart } from '@/components/features/admin/StockChart';
import { CategoryPieChart } from '@/components/features/admin/CategoryPieChart';
import { analyticsService } from '@/services/analytics.service';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    avgOrderValue: 0,
    productsSold: 0,
    totalRevenueGrowth: 0,
    totalSalesGrowth: 0,
    avgOrderValueGrowth: 0,
    productsSoldGrowth: 0,
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

        // Fetch analytics summary
        const summaryRes = await analyticsService.getSummary();
        setAnalytics(summaryRes.data || {});

        // Fetch sales trend
        const salesTrendRes = await analyticsService.getSalesTrend();
        setSalesData((salesTrendRes.data || []).map(item => ({
          month: item.month,
          sales: item.sales,
        })));

        // Fetch stock by category
        const stockByCategoryRes = await analyticsService.getStockByCategory();
        setStockData(stockByCategoryRes.data || []);

        // Fetch products by category
        const productsByCategoryRes = await analyticsService.getProductsByCategory();
        setCategoryData(productsByCategoryRes.data || []);

        // Fetch revenue by category
        const revenueByCategoryRes = await analyticsService.getRevenueByCategory();
        const revenueData = revenueByCategoryRes.data || [];
        const totalCategoryRevenue = revenueData.reduce((sum, item) => sum + (item.value || 0), 0);
        setRevenueByCategoryData(
          revenueData
            .map(item => ({
              ...item,
              percentage: totalCategoryRevenue > 0 ? Math.round((item.value / totalCategoryRevenue) * 100) : 0,
            }))
            .sort((a, b) => (b.value || 0) - (a.value || 0))
        );
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

  // Format revenue
  const formatRevenue = (value: number | undefined) => {
    if (!value || isNaN(value)) return '$0';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
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
          value={formatRevenue(analytics.totalRevenue)}
          icon={DollarSign}
          trend={{ isPositive: true, value: analytics.totalRevenueGrowth || 15 }}
          variant="success"
          delay={0}
        />
        <StatCard
          title="Total Sales"
          value={(analytics.totalSales || 0).toLocaleString()}
          icon={ShoppingCart}
          trend={{ isPositive: true, value: analytics.totalSalesGrowth || 8 }}
          variant="default"
          delay={100}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${(analytics.avgOrderValue || 0).toFixed(2)}`}
          icon={TrendingUp}
          trend={{ isPositive: true, value: analytics.avgOrderValueGrowth || 3 }}
          variant="default"
          delay={200}
        />
        <StatCard
          title="Products Sold"
          value={(analytics.productsSold || 0).toLocaleString()}
          icon={Package}
          trend={{ isPositive: true, value: analytics.productsSoldGrowth || 12 }}
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
