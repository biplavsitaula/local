"use client";

import { useMemo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { StatCard } from '@/components/features/admin/StatCard';
import { SalesChart } from '@/components/features/admin/SalesChart';
import { StockChart } from '@/components/features/admin/StockChart';
import { CategoryPieChart } from '@/components/features/admin/CategoryPieChart';
import { products } from '@/data/products';
import { salesData, stockData, categoryData } from '@/data/mockData';

export default function AnalyticsPage() {
  // Calculate analytics from products
  const analytics = useMemo(() => {
    const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.sales || 0)), 0);
    const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const productsSold = products.reduce((sum, p) => sum + (p.sales || 0), 0);

    // Calculate revenue by category
    const revenueByCategory = products.reduce((acc, p) => {
      const category = p.category.charAt(0).toUpperCase() + p.category.slice(1);
      const revenue = (p.price * (p.sales || 0));
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += revenue;
      return acc;
    }, {} as Record<string, number>);

    const totalCategoryRevenue = Object.values(revenueByCategory).reduce((sum, val) => sum + val, 0);
    const revenueByCategoryData = Object.entries(revenueByCategory)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: Math.round((value / totalCategoryRevenue) * 100)
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalRevenue,
      totalSales,
      avgOrderValue,
      productsSold,
      revenueByCategoryData
    };
  }, []);

  // Format revenue
  const formatRevenue = (value: number) => {
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
          trend={{ isPositive: true, value: 15 }}
          variant="success"
          delay={0}
        />
        <StatCard
          title="Total Sales"
          value={analytics.totalSales.toLocaleString()}
          icon={ShoppingCart}
          trend={{ isPositive: true, value: 8 }}
          variant="default"
          delay={100}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${analytics.avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          trend={{ isPositive: true, value: 3 }}
          variant="default"
          delay={200}
        />
        <StatCard
          title="Products Sold"
          value={analytics.productsSold.toLocaleString()}
          icon={Package}
          trend={{ isPositive: true, value: 12 }}
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
            {analytics.revenueByCategoryData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatRevenue(item.value)} ({item.percentage}%)
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
