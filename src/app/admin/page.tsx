import { StatCard } from "@/components/features/admin/StatCard";
import { StockChart } from "@/components/features/admin/StockChart";
import { SalesChart } from "@/components/features/admin/SalesChart";
import { CategoryPieChart } from "@/components/features/admin/CategoryPieChart";
import { ProductTable } from "@/components/features/admin/products/ProductTable";
import { TopProductsCard } from "@/components/features/admin/products/TopProductsCard";
import { OutOfStockAlert } from "@/components/features/admin/OutOfStockAlert";
import { RecommendedProductsCard } from "@/components/features/admin/products/RecommendedProductsCard";
import { dashboardStats, stockData, salesData, categoryData } from "@/data/mockData";
import {
  Package,
  AlertTriangle,
  DollarSign,
  Star,
  ShoppingCart,
} from "lucide-react";

const Index = () => {
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
          value={dashboardStats.totalProducts}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          delay={50}
        />
        <StatCard
          title="Out of Stock"
          value={dashboardStats.outOfStock}
          icon={AlertTriangle}
          variant="danger"
          delay={100}
        />
        <StatCard
          title="Low Stock"
          value={dashboardStats.lowStock}
          icon={AlertTriangle}
          variant="warning"
          delay={150}
        />
        <StatCard
          title="Total Sales"
          value={dashboardStats.totalSales.toLocaleString()}
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
          delay={200}
        />
        <StatCard
          title="Revenue"
          value={`$${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
          variant="success"
          delay={250}
        />
        <StatCard
          title="Total Reviews"
          value={dashboardStats.totalReviews.toLocaleString()}
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
        <ProductTable filter="all" />
      </div>
    </div>
  );
};

export default Index;
