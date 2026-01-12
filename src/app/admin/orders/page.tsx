"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { OrderTable } from '@/components/features/admin/orders/OrderTable';
import { OrderStatusSection } from '@/components/features/admin/orders/OrderStatusSection';
import { ExportButton } from '@/components/features/admin/ExportButton';
import { ordersService, Order as ApiOrder } from '@/services/orders.service';
import { Order } from '@/hooks/useOrderStore';
import { Loader2 } from 'lucide-react';

const Orders = () => {
  const [orderFilters, setOrderFilters] = useState<{
    search?: string;
    status?: string;
    billNumber?: string;
    location?: string;
    paymentMethod?: string;
  }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapApiOrderToOrder = (apiOrder: ApiOrder): Order => {
    const customerName = (apiOrder.customer as any)?.fullName || 
                       apiOrder.customer?.name || 
                       apiOrder.customerName || 
                       '';
    const location = (apiOrder.customer as any)?.location || 
                  apiOrder.customer?.address || 
                  apiOrder.location || 
                  '';
    
    let paymentMethod: 'cod' | 'qr' = 'cod';
    const paymentMethodLower = (apiOrder.paymentMethod || '').toLowerCase();
    if (paymentMethodLower === 'online' || paymentMethodLower === 'qr' || paymentMethodLower === 'qr payment') {
      paymentMethod = 'qr';
    }
    
    return {
      id: apiOrder._id || apiOrder.id || '',
      billNumber: apiOrder.billNumber,
      customerName,
      location,
      totalAmount: apiOrder.totalAmount,
      status: apiOrder.status,
      paymentMethod,
      createdAt: apiOrder.createdAt,
    };
  };

  // Single API call to fetch all orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.getAll({
        limit: 1000, // Fetch all, paginate client-side
      });
      const mappedOrders = (response.data || []).map(mapApiOrderToOrder);
      setOrders(mappedOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderUpdate = useCallback(() => {
    // Single refresh call that updates both components
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders based on search and filters for OrderTable
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply search filter
    if (orderFilters.search) {
      const searchLower = orderFilters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.billNumber.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (orderFilters.status) {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === orderFilters.status?.toLowerCase()
      );
    }

    // Apply payment method filter
    if (orderFilters.paymentMethod) {
      const paymentLower = orderFilters.paymentMethod.toLowerCase();
      filtered = filtered.filter(order => {
        if (paymentLower === 'cod' || paymentLower === 'cash on delivery') {
          return order.paymentMethod === 'cod';
        }
        if (paymentLower === 'online' || paymentLower === 'qr' || paymentLower === 'qr payment') {
          return order.paymentMethod === 'qr';
        }
        return true;
      });
    }

    return filtered;
  }, [orders, orderFilters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

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
        <OrderStatusSection orders={orders} onOrderUpdate={handleOrderUpdate} />
      </div>

      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <OrderTable 
          orders={filteredOrders} 
          allOrders={orders}
          onFiltersChange={setOrderFilters} 
          onOrderUpdate={handleOrderUpdate} 
        />
      </div>
    </div>
  );
};

export default Orders;
