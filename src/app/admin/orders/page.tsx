"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { OrderTable } from '@/components/features/admin/orders/OrderTable';
import { OrderStatusSection } from '@/components/features/admin/orders/OrderStatusSection';
import { ExportButton } from '@/components/features/admin/ExportButton';
import { ordersService, Order as ApiOrder } from '@/services/orders.service';
import { Order } from '@/hooks/useOrderStore';
import { Loader2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 25;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Use ref to track filters without causing re-renders
  const filtersRef = useRef(orderFilters);
  filtersRef.current = orderFilters;

  // Check if any filter is active
  const hasActiveFilters = !!(orderFilters.search || orderFilters.status || orderFilters.paymentMethod);

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

  // Fetch orders with server-side pagination - no dependencies on orderFilters object
  const fetchOrders = useCallback(async (page: number = 1, isFiltering: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use ref to get current filters without dependency
      const currentFilters = filtersRef.current;
      
      // When filters are active, fetch all to filter/search client-side
      // Otherwise, use server-side pagination
      const response = await ordersService.getAll({
        limit: isFiltering ? 1000 : ITEMS_PER_PAGE,
        page: isFiltering ? 1 : page,
        search: currentFilters.search || undefined,
        status: currentFilters.status || undefined,
        paymentMethod: currentFilters.paymentMethod || undefined,
      });
      
      const mappedOrders = (response.data || []).map(mapApiOrderToOrder);
      setOrders(mappedOrders);
      setTotalPages(response.pagination?.pages || Math.ceil(mappedOrders.length / ITEMS_PER_PAGE));
      setTotalItems(response.pagination?.total || mappedOrders.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - uses ref for filters

  // Initial fetch
  useEffect(() => {
    fetchOrders(1, false);
  }, [fetchOrders]);

  // Fetch when page changes (only for server-side pagination without filters)
  useEffect(() => {
    if (!hasActiveFilters && currentPage > 1) {
      fetchOrders(currentPage, false);
    }
  }, [currentPage, hasActiveFilters, fetchOrders]);

  // Fetch all data when filters change
  useEffect(() => {
    if (hasActiveFilters) {
      setCurrentPage(1);
      fetchOrders(1, true);
    } else {
      // Reset to page 1 and fetch without filters
      setCurrentPage(1);
      fetchOrders(1, false);
    }
    // Only trigger when actual filter values change
  }, [orderFilters.search, orderFilters.status, orderFilters.paymentMethod, fetchOrders]);

  const handleOrderUpdate = useCallback(() => {
    // Refresh using current state
    const isFiltering = !!(filtersRef.current.search || filtersRef.current.status || filtersRef.current.paymentMethod);
    fetchOrders(isFiltering ? 1 : currentPage, isFiltering);
  }, [fetchOrders, currentPage]);

  // Filter orders based on search and filters for OrderTable (client-side when filtering)
  const filteredOrders = useMemo(() => {
    if (!hasActiveFilters) {
      return orders; // Server already filtered/paginated
    }

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
  }, [orders, orderFilters, hasActiveFilters]);

  // Client-side pagination when filters are active
  const paginatedOrders = useMemo(() => {
    if (hasActiveFilters) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }
    return filteredOrders;
  }, [filteredOrders, currentPage, hasActiveFilters]);

  const calculatedTotalPages = hasActiveFilters 
    ? Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) 
    : totalPages;

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
          orders={paginatedOrders} 
          allOrders={orders}
          onFiltersChange={setOrderFilters} 
          onOrderUpdate={handleOrderUpdate} 
        />
        {/* Server-side pagination */}
        {calculatedTotalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={calculatedTotalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={hasActiveFilters ? filteredOrders.length : totalItems}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
