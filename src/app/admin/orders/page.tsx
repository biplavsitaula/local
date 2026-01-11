"use client";

import { useState, useCallback } from 'react';
import { OrderTable } from '@/components/features/admin/orders/OrderTable';
import { OrderStatusSection } from '@/components/features/admin/orders/OrderStatusSection';
import { ExportButton } from '@/components/features/admin/ExportButton';

const Orders = () => {
  const [orderFilters, setOrderFilters] = useState<{
    search?: string;
    status?: string;
    billNumber?: string;
    location?: string;
    paymentMethod?: string;
  }>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusRefreshKey, setStatusRefreshKey] = useState(0);

  const handleOrderUpdate = useCallback(() => {
    // Trigger refresh of OrderTable by updating key
    setRefreshKey(prev => prev + 1);
    // Trigger refresh of OrderStatusSection by updating key
    setStatusRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and track deliveries</p>
        </div>
        <ExportButton defaultDataType="orders" orderFilters={orderFilters} />
      </div>

      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <OrderStatusSection key={statusRefreshKey} onOrderUpdate={handleOrderUpdate} />
      </div>

      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <OrderTable key={refreshKey} onFiltersChange={setOrderFilters} onOrderUpdate={handleOrderUpdate} />
      </div>
    </div>
  );
};

export default Orders;
