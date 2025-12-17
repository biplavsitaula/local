"use client";

import { useOrderStore } from '@/hooks/useOrderStore';

export function OrderTable() {
  const { orders } = useOrderStore();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'bg-warning/20 text-warning';
    }
    if (statusLower.includes('completed') || statusLower.includes('delivered')) {
      return 'bg-success/20 text-success';
    }
    if (statusLower.includes('cancelled') || statusLower.includes('failed')) {
      return 'bg-destructive/20 text-destructive';
    }
    return 'bg-muted/20 text-muted-foreground';
  };

  return (
    <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-4 text-sm font-semibold text-foreground">Bill Number</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Customer</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Location</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Amount</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Payment</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-foreground font-medium">{order.billNumber}</td>
                  <td className="p-4 text-sm text-foreground">{order.customerName}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.location}</td>
                  <td className="p-4 text-sm text-foreground font-medium">
                    Rs. {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-foreground uppercase">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

