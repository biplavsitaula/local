"use client";

import { useState } from 'react';
import { OrderTable } from '@/components/features/admin/orders/OrderTable';
import { ExportButton } from '@/components/features/admin/ExportButton';

const Orders = () => {
  const [orderFilters, setOrderFilters] = useState<{
    search?: string;
    status?: string;
    billNumber?: string;
    location?: string;
    paymentMethod?: string;
  }>({});

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
        <OrderTable onFiltersChange={setOrderFilters} />
      </div>
    </div>
  );
};

export default Orders;
