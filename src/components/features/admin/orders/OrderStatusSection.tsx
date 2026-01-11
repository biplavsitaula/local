"use client";

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Loader2, Package, Clock } from 'lucide-react';
import { ordersService, Order as ApiOrder } from '@/services/orders.service';
import { useOrderStore, Order } from '@/hooks/useOrderStore';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface OrderStatusSectionProps {
  onOrderUpdate?: () => void;
}

export function OrderStatusSection({ onOrderUpdate }: OrderStatusSectionProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { canEdit } = useRoleAccess();

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

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getAll({
        limit: 1000, // Fetch all for statistics
      });
      const mappedOrders = (response.data || []).map(mapApiOrderToOrder);
      setOrders(mappedOrders);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate order status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      total: orders.length,
    };

    orders.forEach(order => {
      const statusLower = (order.status || '').toLowerCase();
      if (statusLower.includes('pending') || statusLower.includes('placed')) {
        counts.pending++;
      } else if (statusLower.includes('accepted') || statusLower === 'accepted') {
        counts.accepted++;
      } else if (statusLower.includes('rejected') || statusLower.includes('reject')) {
        counts.rejected++;
      } else if (statusLower.includes('completed') || statusLower.includes('delivered')) {
        counts.completed++;
      }
    });

    return counts;
  }, [orders]);

  // Get pending orders
  const pendingOrders = useMemo(() => {
    return orders.filter(order => {
      const statusLower = (order.status || '').toLowerCase();
      return statusLower.includes('pending') || statusLower.includes('placed');
    });
  }, [orders]);

  const handleAcceptOrder = async (order: Order) => {
    console.log('accepttttttttttttt')
    if (!canEdit) {
      toast.error('You do not have permission to accept orders');
      return;
    }

    if (!confirm(`Are you sure you want to accept order ${order.billNumber}?`)) {
      return;
    }
    
    try {
      setProcessingOrderId(order.id);
      const response = await ordersService.acceptOrder(order.id);
      if (response.success) {
        toast.success(response.message || `Order ${order.billNumber} accepted successfully`);
        // Refresh orders
        const refreshResponse = await ordersService.getAll({ limit: 1000 });
        const mappedOrders = (refreshResponse.data || []).map(mapApiOrderToOrder);
        setOrders(mappedOrders);
        // Notify parent component
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } else {
        toast.error(response.message || 'Failed to accept order');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.response?.message || 
                          err?.message || 
                          'Failed to accept order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (order: Order) => {
    if (!canEdit) {
      toast.error('You do not have permission to reject orders');
      return;
    }

    if (!confirm(`Are you sure you want to reject order ${order.billNumber}?`)) {
      return;
    }
    
    try {
      setProcessingOrderId(order.id);
      const response = await ordersService.rejectOrder(order.id);
      if (response.success) {
        toast.success(response.message || `Order ${order.billNumber} rejected successfully`);
        // Refresh orders
        const refreshResponse = await ordersService.getAll({ limit: 1000 });
        const mappedOrders = (refreshResponse.data || []).map(mapApiOrderToOrder);
        setOrders(mappedOrders);
        // Notify parent component
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } else {
        toast.error(response.message || 'Failed to reject order');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.response?.message || 
                          err?.message || 
                          'Failed to reject order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <h2 className="text-xl font-display font-bold text-foreground mb-4 sm:mb-6">
        Order Status Overview
      </h2>

      {/* Status Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{statusCounts.pending}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Accepted</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{statusCounts.accepted}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Rejected</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{statusCounts.rejected}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{statusCounts.completed}</p>
        </div>
      </div>

      {/* Pending Orders Actions */}
      {pendingOrders.length > 0 && canEdit && (
        <div className="border-t border-border pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Pending Orders ({pendingOrders.length})
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
            {pendingOrders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-foreground truncate">
                    {order.billNumber}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {order.customerName} • Rs. {order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                    {order.status}
                  </span>
                  <Button
                    onClick={() => handleAcceptOrder(order)}
                    disabled={processingOrderId === order.id}
                    size="sm"
                    className="bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20"
                  >
                    {processingOrderId === order.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Accepted
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRejectOrder(order)}
                    disabled={processingOrderId === order.id}
                    size="sm"
                    variant="outline"
                    className="bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20"
                  >
                    {processingOrderId === order.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {pendingOrders.length > 10 && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center pt-2">
                Showing first 10 of {pendingOrders.length} pending orders. View all in the table below.
              </p>
            )}
          </div>
        </div>
      )}

      {pendingOrders.length === 0 && (
        <div className="border-t border-border pt-4 sm:pt-6">
          <p className="text-sm sm:text-base text-muted-foreground text-center py-4">
            No pending orders at the moment.
          </p>
        </div>
      )}
    </div>
  );
}







