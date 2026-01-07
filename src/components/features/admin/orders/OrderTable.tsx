"use client";

import { useMemo, useState, useEffect } from 'react';
import { ArrowUpDown, Eye, Printer, Loader2, AlertCircle, Filter, X } from 'lucide-react';
import { ordersService, Order as ApiOrder } from '@/services/orders.service';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useOrderStore, Order } from '@/hooks/useOrderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    billNumber: '',
    location: '',
    paymentMethod: '',
  });

  const mapApiOrderToOrder = (apiOrder: ApiOrder): Order => {
    // Handle API response structure - customer can be an object with fullName and location
    const customerName = (apiOrder.customer as any)?.fullName || 
                         apiOrder.customer?.name || 
                         apiOrder.customerName || 
                         '';
    const location = (apiOrder.customer as any)?.location || 
                    apiOrder.customer?.address || 
                    apiOrder.location || 
                    '';
    
    // Map payment method - API returns "COD", "Online", "QR Payment"
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersService.getAll({
          search: searchQuery || undefined,
          status: filters.status || undefined,
          paymentMethod: filters.paymentMethod || undefined,
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
  }, [searchQuery, filters.status, filters.paymentMethod]);

  type SortKey = 'billNumber' | 'customerName' | 'location' | 'totalAmount' | 'status';
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

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply filters
    if (filters.billNumber) {
      filtered = filtered.filter(order => 
        order.billNumber.toLowerCase().includes(filters.billNumber.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(order => 
        order.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Note: Status and paymentMethod filters are applied via API call
    // Additional client-side filtering can be added here if needed

    // Sort
    const dir = sortDir === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sortKey) {
        case 'billNumber':
          return dir * a.billNumber.localeCompare(b.billNumber);
        case 'customerName':
          return dir * a.customerName.localeCompare(b.customerName);
        case 'location':
          return dir * a.location.localeCompare(b.location);
        case 'totalAmount':
          return dir * (a.totalAmount - b.totalAmount);
        case 'status':
          return dir * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, sortDir, sortKey, filters]);

  const clearFilters = () => {
    setFilters({
      status: '',
      billNumber: '',
      location: '',
      paymentMethod: '',
    });
  };

  const hasActiveFilters = filters.status || filters.billNumber || filters.location || filters.paymentMethod;

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
      {/* Search and Filter Bar */}
      <div className="space-y-4 mb-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders by bill number, customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-foreground placeholder-muted-foreground"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="gap-2 border-border"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-2 w-2 bg-flame-orange rounded-full" />
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-card rounded-xl p-4 border border-border/50 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Filter Orders</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  onClick={() => setShowFilters(false)}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bill Number Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Bill Number</label>
                <Input
                  placeholder="Filter by bill number..."
                  value={filters.billNumber}
                  onChange={(e) => setFilters({ ...filters, billNumber: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Location</label>
                <Input
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Payment Method</label>
                <Select
                  value={filters.paymentMethod || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, paymentMethod: value === 'all' ? '' : value })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="Online">Online Payment</SelectItem>
                    <SelectItem value="QR Payment">QR Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {renderSortableTh('Bill Number', 'billNumber')}
                {renderSortableTh('Customer', 'customerName')}
                {renderSortableTh('Location', 'location')}
                {renderSortableTh('Amount', 'totalAmount')}
                <th className="text-left p-4 text-sm font-semibold text-foreground">Payment</th>
                {renderSortableTh('Status', 'status')}
                <th className="text-left p-4 text-sm font-semibold text-foreground">Date</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.length > 0 ? (
                filteredAndSortedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-foreground font-medium">{order.billNumber}</td>
                    <td className="p-4 text-sm text-foreground">{order.customerName}</td>
                    <td className="p-4 text-sm text-muted-foreground">{order.location}</td>
                    <td className="p-4 text-sm text-foreground font-medium">
                      Rs. {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-foreground uppercase">
                        {order.paymentMethod === 'qr' ? 'QR Payment' : 
                         order.paymentMethod === 'cod' ? 'COD' : 
                         order.paymentMethod === 'online' ? 'Online' : 
                         order.paymentMethod}
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

