"use client";

import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useOrderStore } from '@/hooks/useOrderStore';

export function OrderTable() {
  const { orders } = useOrderStore();

  type SortKey = 'billNumber' | 'customerName' | 'totalAmount' | 'status';
  type SortDir = 'asc' | 'desc';

  const [sortKey, setSortKey] = useState<SortKey>('billNumber');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  const sortedOrders = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;

    return [...orders].sort((a, b) => {
      switch (sortKey) {
        case 'billNumber':
          return dir * a.billNumber.localeCompare(b.billNumber);
        case 'customerName':
          return dir * a.customerName.localeCompare(b.customerName);
        case 'totalAmount':
          return dir * (a.totalAmount - b.totalAmount);
        case 'status':
          return dir * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [orders, sortDir, sortKey]);

  const renderSortableTh = (label: string, columnKey: SortKey) => (
    <th
      className="text-left p-4 text-sm font-semibold text-foreground"
      aria-sort={
        sortKey === columnKey ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        onClick={() => handleSort(columnKey)}
        className={`inline-flex items-center gap-2 transition-colors ${
          sortKey === columnKey ? 'text-flame-orange' : 'hover:text-flame-orange'
        }`}
      >
        <span>{label}</span>
        <ArrowUpDown className="h-4 w-4 opacity-70" />
      </button>
    </th>
  );

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
              {renderSortableTh('Bill Number', 'billNumber')}
              {renderSortableTh('Customer', 'customerName')}
              <th className="text-left p-4 text-sm font-semibold text-foreground">Location</th>
              {renderSortableTh('Amount', 'totalAmount')}
              <th className="text-left p-4 text-sm font-semibold text-foreground">Payment</th>
              {renderSortableTh('Status', 'status')}
              <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
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

