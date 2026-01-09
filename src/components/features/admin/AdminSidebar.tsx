"use client";

import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  AlertTriangle,
  Star,
  TrendingUp,
  ThumbsUp,
  Settings,
  Flame,
  LogOut,
  ShoppingCart,
  CreditCard,
  Bell,
  Loader2,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Image from "next/image";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Products", icon: Package, path: "/admin/products" },
  { title: "Inventory", icon: Warehouse, path: "/admin/inventory" },
  { title: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { title: "Payments", icon: CreditCard, path: "/admin/payments" },
  { title: "Notifications", icon: Bell, path: "/admin/notifications" },
  { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { title: "Stock Alerts", icon: AlertTriangle, path: "/admin/alerts" },
  { title: "Top Sellers", icon: TrendingUp, path: "/admin/top-sellers" },
  { title: "Recommended", icon: ThumbsUp, path: "/admin/recommended" },
  { title: "Reviews", icon: Star, path: "/admin/reviews" },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        {/* <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
            <Flame className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-flame-orange">
              Flame Beverage
            </h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div> */}
        <div >
              <Image
                src="/assets/newlogo.png"
                alt="Flame Beverage logo"
                width={180}
                height={48}
                className="object-contain h-12 w-auto"
                priority
              />
              <div className="text-left mt-2 text-bold">
              <p>Admin Panel</p>


             </div>
          </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground transition-all duration-200",
              "hover:bg-sidebar-accent hover:text-flame-orange"
            )}
            activeClassName="bg-sidebar-accent text-flame-orange font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <NavLink
          to="/admin/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-flame-orange transition-colors"
          activeClassName="bg-sidebar-accent text-flame-orange"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-flame-red/10 hover:text-flame-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
