"use client";

import { useMemo, useState, useEffect } from 'react';
import { ArrowUpDown, Eye, Printer, Loader2, AlertCircle } from 'lucide-react';
import { ordersService, Order as ApiOrder } from '@/services/orders.service';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useOrderStore, Order } from '@/hooks/useOrderStore';

export function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mapApiOrderToOrder = (apiOrder: ApiOrder): Order => {
    return {
      id: apiOrder._id || apiOrder.id || '',
      billNumber: apiOrder.billNumber,
      customerName: apiOrder.customer?.name || apiOrder.customerName || '',
      location: apiOrder.customer?.address || apiOrder.location || '',
      totalAmount: apiOrder.totalAmount,
      status: apiOrder.status,
      paymentMethod: apiOrder.paymentMethod === 'qr' ? 'qr' : 'cod',
      createdAt: apiOrder.createdAt,
    };
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersService.getAll({
          search: searchQuery || undefined,
          limit: 100,
        });
        const mappedOrders = (response.data || []).map(mapApiOrderToOrder);
        setOrders(mappedOrders);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchQuery]);

  type SortKey = 'billNumber' | 'customerName' | 'totalAmount' | 'status';
  type SortDir = 'asc' | 'desc';

  const [sortKey, setSortKey] = useState<SortKey>('billNumber');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      // Refresh orders
      const response = await ordersService.getAll({ limit: 100 });
      const mappedOrders = (response.data || []).map(mapApiOrderToOrder);
      setOrders(mappedOrders);
    } catch (err: any) {
      console.error('Failed to update order status:', err);
    }
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">Error loading orders</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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

  // Mock order items - in a real app, this would come from the order data
  const getOrderItems = (order: Order) => {
    if (order.billNumber === 'FB-2024-003') {
      return [
        { name: 'Macallan 18 Year', quantity: 1, price: 349.99 },
        { name: 'Hennessy XO', quantity: 1, price: 229.99 },
      ];
    }
    // Default mock items
    return [
      { name: 'Premium Whiskey', quantity: 1, price: order.totalAmount * 0.6 },
      { name: 'Premium Brandy', quantity: 1, price: order.totalAmount * 0.4 },
    ];
  };

  const handlePrint = async (order: Order) => {
    try {
      // Fetch full order details from API
      const orderResponse = await ordersService.getByBillNumber(order.billNumber);
      const fullOrder = orderResponse.data;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print order');
        return;
      }

      const orderItems = fullOrder.items || getOrderItems(order);
      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const printDate = new Date(order.createdAt);
      const formattedDate = printDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });

      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${order.billNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { margin: 0; }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              padding: 40px;
              color: #333;
              background: #fff;
              line-height: 1.6;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 32px;
              font-weight: bold;
              color: #f97316;
              margin-bottom: 5px;
              letter-spacing: 2px;
            }
            .company-subtitle {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .bill-info {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin-top: 15px;
              font-size: 14px;
            }
            .details-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .detail-box h3 {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e5e5;
            }
            .detail-item {
              margin-bottom: 10px;
              font-size: 14px;
            }
            .detail-label {
              font-weight: 600;
              color: #666;
              display: inline-block;
              min-width: 80px;
            }
            .detail-value {
              color: #333;
            }
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .products-table thead {
              background: #f97316;
              color: #fff;
            }
            .products-table th {
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
            }
            .products-table th:last-child,
            .products-table td:last-child {
              text-align: right;
            }
            .products-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e5e5;
              font-size: 14px;
            }
            .products-table tbody tr:last-child td {
              border-bottom: none;
            }
            .total-section {
              text-align: right;
              margin-bottom: 40px;
            }
            .total-amount {
              font-size: 20px;
              font-weight: bold;
              color: #f97316;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 30px;
              border-top: 1px solid #e5e5e5;
            }
            .footer p {
              margin-bottom: 8px;
              color: #666;
              font-size: 14px;
            }
            .footer a {
              color: #f97316;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="logo">🔥</div>
              <div class="company-name">FLAME BEVERAGE</div>
              <div class="company-subtitle">Premium Liquor Store</div>
              <div class="bill-info">
                <span><strong>Bill No:</strong> ${order.billNumber}</span>
                <span><strong>Date:</strong> ${formattedDate}</span>
              </div>
            </div>
            
            <div class="details-section">
              <div class="detail-box">
                <h3>Customer Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${order.customerName}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">PAN:</span>
                  <span class="detail-value">KLMNO9012P</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Mobile:</span>
                  <span class="detail-value">+977-9861234567</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">${order.location}</span>
                </div>
              </div>
              
              <div class="detail-box">
                <h3>Order Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">${order.id.split('-')[1] || '3'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">${order.status}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment:</span>
                  <span class="detail-value">${order.paymentMethod === 'qr' ? 'QR Payment' : 'Cash on Delivery'}</span>
                </div>
              </div>
            </div>
            
            <table class="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-amount">Total Amount: $${total.toFixed(2)}</div>
            </div>
            
            <div class="footer">
              <p>Thank you for shopping with Flame Beverage!</p>
              <p>For queries, contact us at <a href="mailto:support@flamebeverage.com">support@flamebeverage.com</a></p>
            </div>
          </div>
        </body>
      </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (err: any) {
      console.error('Failed to fetch order details:', err);
      // Fallback to using mock data if API call fails
      const orderItems = getOrderItems(order);
      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const printDate = new Date(order.createdAt);
      const formattedDate = printDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print order');
        return;
      }

      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${order.billNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { margin: 0; }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              padding: 40px;
              color: #333;
              background: #fff;
              line-height: 1.6;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 32px;
              font-weight: bold;
              color: #f97316;
              margin-bottom: 5px;
              letter-spacing: 2px;
            }
            .company-subtitle {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .bill-info {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin-top: 15px;
              font-size: 14px;
            }
            .details-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .detail-box h3 {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e5e5;
            }
            .detail-item {
              margin-bottom: 10px;
              font-size: 14px;
            }
            .detail-label {
              font-weight: 600;
              color: #666;
              display: inline-block;
              min-width: 80px;
            }
            .detail-value {
              color: #333;
            }
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .products-table thead {
              background: #f97316;
              color: #fff;
            }
            .products-table th {
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
            }
            .products-table th:last-child,
            .products-table td:last-child {
              text-align: right;
            }
            .products-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e5e5;
              font-size: 14px;
            }
            .products-table tbody tr:last-child td {
              border-bottom: none;
            }
            .total-section {
              text-align: right;
              margin-bottom: 40px;
            }
            .total-amount {
              font-size: 20px;
              font-weight: bold;
              color: #f97316;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 30px;
              border-top: 1px solid #e5e5e5;
            }
            .footer p {
              margin-bottom: 8px;
              color: #666;
              font-size: 14px;
            }
            .footer a {
              color: #f97316;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="logo">🔥</div>
              <div class="company-name">FLAME BEVERAGE</div>
              <div class="company-subtitle">Premium Liquor Store</div>
              <div class="bill-info">
                <span><strong>Bill No:</strong> ${order.billNumber}</span>
                <span><strong>Date:</strong> ${formattedDate}</span>
              </div>
            </div>
            
            <div class="details-section">
              <div class="detail-box">
                <h3>Customer Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${order.customerName}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">PAN:</span>
                  <span class="detail-value">KLMNO9012P</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Mobile:</span>
                  <span class="detail-value">+977-9861234567</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">${order.location}</span>
                </div>
              </div>
              
              <div class="detail-box">
                <h3>Order Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">${order.id.split('-')[1] || '3'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">${order.status}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment:</span>
                  <span class="detail-value">${order.paymentMethod === 'qr' ? 'QR Payment' : 'Cash on Delivery'}</span>
                </div>
              </div>
            </div>
            
            <table class="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-amount">Total Amount: $${total.toFixed(2)}</div>
            </div>
            
            <div class="footer">
              <p>Thank you for shopping with Flame Beverage!</p>
              <p>For queries, contact us at <a href="mailto:support@flamebeverage.com">support@flamebeverage.com</a></p>
            </div>
          </div>
        </body>
      </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
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
    <>
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search orders by bill number, customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-foreground placeholder-muted-foreground"
        />
      </div>

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
                <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
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
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(order)}
                          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                          aria-label="View order"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handlePrint(order)}
                          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                          aria-label="Print order"
                        >
                          <Printer className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPrint={handlePrint}
      />
    </>
  );
}

