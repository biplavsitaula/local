"use client";

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import { Order } from '@/hooks/useOrderStore';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (order: Order) => void;
}

// Mock order items - in a real app, this would come from the order data
const getOrderItems = (order: Order): OrderItem[] => {
  // For now, return mock items based on the order
  // In a real implementation, order.items would be part of the Order interface
  if (order.billNumber === 'FB-2024-003') {
    return [
      { name: 'Macallan 18 Year', quantity: 1, price: 349.99 },
      { name: 'Hennessy XO', quantity: 1, price: 229.99 },
    ];
  }
  // Default mock items - split total amount proportionally
  const item1Price = Math.round((order.totalAmount * 0.6) * 100) / 100;
  const item2Price = Math.round((order.totalAmount * 0.4) * 100) / 100;
  return [
    { name: 'Premium Whiskey', quantity: 1, price: item1Price },
    { name: 'Premium Brandy', quantity: 1, price: item2Price },
  ];
};

export function OrderDetailsModal({ order, isOpen, onClose, onPrint }: OrderDetailsModalProps) {
  if (!order) return null;

  const orderItems = getOrderItems(order);
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('placed') || statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'bg-blue-500/20 text-blue-400';
    }
    if (statusLower.includes('completed') || statusLower.includes('delivered')) {
      return 'bg-green-500/20 text-green-400';
    }
    if (statusLower.includes('cancelled') || statusLower.includes('failed')) {
      return 'bg-red-500/20 text-red-400';
    }
    return 'bg-gray-500/20 text-gray-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#1a1a1a] border-border/50 p-0 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#f97316]">
              Order Details - {order.billNumber}
            </h2>
          </div>

          {/* Customer Info and Order Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold text-[#f97316] mb-4">Customer Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="text-foreground">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">PAN: </span>
                  <span className="text-foreground">KLMNO9012P</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile: </span>
                  <span className="text-foreground">+977-9861234567</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span className="text-foreground">{order.location}</span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div>
              <h3 className="text-lg font-semibold text-[#f97316] mb-4">Order Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment: </span>
                  <span className="text-foreground">{order.paymentMethod === 'qr' ? 'QR Payment' : 'Cash on Delivery'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span className="text-foreground">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#f97316] mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Product</th>
                    <th className="text-center p-3 text-sm font-semibold text-foreground">Qty</th>
                    <th className="text-right p-3 text-sm font-semibold text-foreground">Price</th>
                    <th className="text-right p-3 text-sm font-semibold text-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index} className="border-b border-border/30">
                      <td className="p-3 text-sm text-foreground">{item.name}</td>
                      <td className="p-3 text-sm text-center text-foreground">{item.quantity}</td>
                      <td className="p-3 text-sm text-right text-foreground">${item.price.toFixed(2)}</td>
                      <td className="p-3 text-sm text-right text-foreground">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-sm font-semibold text-foreground">
                      Total:
                    </td>
                    <td className="p-3 text-right text-lg font-bold text-[#f97316]">
                      ${total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/50">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-foreground transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onPrint(order)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white transition-colors flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Bill
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

