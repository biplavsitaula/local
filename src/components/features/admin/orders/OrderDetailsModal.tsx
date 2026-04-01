"use client";

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import { Order } from '@/hooks/useOrderStore';

interface OrderDetailsModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (order: any) => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onPrint,
}: OrderDetailsModalProps) {
  if (!order) return null;

  // Use actual items from the order, or empty array as fallback
  const orderItems = order.items || [];
  const subtotal = order.subtotal || orderItems.reduce((sum: number, item: any) => sum + (item.total || (item.price || 0) * (item.quantity || 0)), 0);
  const deliveryFee = order.deliveryFee || 0;
  const totalAmount = order.totalAmount || (subtotal + deliveryFee);

  // Get customer details from the nested customer object or top-level fields
  const customerName = order.customer?.fullName || order.customer?.name || order.customerName || 'N/A';
  const customerPhone = order.customer?.mobile || order.customer?.phone || 'N/A';
  const customerEmail = order.customer?.email || 'N/A';
  const customerPan = order.customer?.pan || 'N/A';
  const customerLocation = order.customer?.location || order.customer?.address || order.location || 'N/A';

  const getPaymentMethodLabel = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'qr': return 'QR Payment';
      case 'cod': return 'Cash on Delivery';
      case 'online': return 'Online Payment';
      case 'card': return 'Card Payment';
      default: return method || 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("placed") ||
      statusLower.includes("pending") ||
      statusLower.includes("processing")
    ) {
      return "bg-blue-500/20 text-blue-400";
    }
    if (
      statusLower.includes("completed") ||
      statusLower.includes("delivered")
    ) {
      return "bg-green-500/20 text-green-400";
    }
    if (statusLower.includes("cancelled") || statusLower.includes("failed")) {
      return "bg-red-500/20 text-red-400";
    }
    return "bg-gray-500/20 text-gray-400";
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
              <h3 className="text-lg font-semibold text-[#f97316] mb-4">
                Customer Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="text-foreground">{customerName}</span>
                </div>
                {customerPan !== 'N/A' && (
                  <div>
                    <span className="text-muted-foreground">PAN: </span>
                    <span className="text-foreground">{customerPan}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Mobile: </span>
                  <span className="text-foreground">{customerPhone}</span>
                </div>
                {customerEmail !== 'N/A' && (
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="text-foreground">{customerEmail}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span className="text-foreground">{customerLocation}</span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div>
              <h3 className="text-lg font-semibold text-[#f97316] mb-4">
                Order Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment: </span>
                  <span className="text-foreground">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span className="text-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#f97316] mb-4">
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-sm font-semibold text-foreground">
                      Product
                    </th>
                    <th className="text-center p-3 text-sm font-semibold text-foreground">
                      Qty
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-foreground">
                      Price (Rs)
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.length > 0 ? (
                    orderItems.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-border/30">
                        <td className="p-3 text-sm text-foreground">{item.name || item.productId?.name || 'Unknown Product'}</td>
                        <td className="p-3 text-sm text-center text-foreground">{item.quantity || 0}</td>
                        <td className="p-3 text-sm text-right text-foreground">{(item.price || 0).toFixed(2)}</td>
                        <td className="p-3 text-sm text-right text-foreground">{(item.total || (item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-sm text-center text-muted-foreground">No items found</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-sm text-muted-foreground">
                      Subtotal:
                    </td>
                    <td className="p-3 text-right text-sm text-foreground">
                      Rs {subtotal.toFixed(2)}
                    </td>
                  </tr>
                  {deliveryFee > 0 && (
                    <tr>
                      <td colSpan={3} className="p-3 text-right text-sm text-muted-foreground">
                        Delivery Fee:
                      </td>
                      <td className="p-3 text-right text-sm text-foreground">
                        Rs {deliveryFee.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={3}
                      className="p-3 text-right text-sm font-semibold text-foreground"
                    >
                      Total:
                    </td>
                    <td className="p-3 text-right text-lg font-bold text-[#f97316]">
                      Rs {totalAmount.toFixed(2)}
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


