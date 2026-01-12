import { useMemo, useState, useEffect } from 'react';
import { ordersService } from '@/services/orders.service';
import { Order } from '@/hooks/useOrderStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { toast } from 'sonner';

interface UseOrderTableProps {
  orders: Order[];
  onFiltersChange?: (filters: {
    search?: string;
    status?: string;
    billNumber?: string;
    location?: string;
    paymentMethod?: string;
  }) => void;
  onOrderUpdate?: () => void;
}

export function useOrderTable({
  orders: propOrders,
  onFiltersChange,
  onOrderUpdate,
}: UseOrderTableProps) {
  const [orders, setOrders] = useState<Order[]>(propOrders || []);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    billNumber: '',
    location: '',
    paymentMethod: '',
  });
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { canEdit } = useRoleAccess();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  // Modal states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  type SortKey = 'billNumber' | 'customerName' | 'location' | 'totalAmount' | 'status';
  type SortDir = 'asc' | 'desc';
  const [sortKey, setSortKey] = useState<SortKey>('billNumber');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  
  // Expose filters to parent component
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        search: debouncedSearch,
        status: filters.status,
        billNumber: filters.billNumber,
        location: filters.location,
        paymentMethod: filters.paymentMethod,
      });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  // Update orders when propOrders changes
  useEffect(() => {
    if (propOrders) {
      setOrders(propOrders);
    }
  }, [propOrders]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters.status, filters.paymentMethod]);

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

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [orders, sortDir, sortKey, filters, currentPage, itemsPerPage]);

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
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (err: any) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleAcceptOrder = async (order: Order) => {
    setPendingOrder(order);
    setConfirmTitle("Accept Order");
    setConfirmMessage(`Are you sure you want to accept order ${order.billNumber}?`);
    setConfirmAction(() => {
      setConfirmModalOpen(false);
      performAcceptOrder(order);
    });
    setConfirmModalOpen(true);
  };

  const performAcceptOrder = async (order: Order) => {
    try {
      setProcessingOrderId(order.id);
      const orderId = (order as any)._id || order.id;
      const response = await ordersService.acceptOrder(orderId);
      
      if (response.success) {
        setSuccessMessage(response.message || `Order ${order.billNumber} accepted successfully`);
        setSuccessModalOpen(true);
        
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } else {
        toast.error(response.message || 'Failed to accept order');
      }
    } catch (err: any) {
      console.error('Error accepting order:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.response?.message || 
                          err?.message || 
                          'Failed to accept order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setProcessingOrderId(null);
      setPendingOrder(null);
    }
  };

  const handleRejectOrder = async (order: Order) => {
    setPendingOrder(order);
    setConfirmTitle("Reject Order");
    setConfirmMessage(`Are you sure you want to reject order ${order.billNumber}?`);
    setConfirmAction(() => {
      setConfirmModalOpen(false);
      performRejectOrder(order);
    });
    setConfirmModalOpen(true);
  };

  const performRejectOrder = async (order: Order) => {
    try {
      setProcessingOrderId(order.id);
      const orderId = (order as any)._id || order.id;
      const response = await ordersService.rejectOrder(orderId);
      
      if (response.success) {
        setSuccessMessage(response.message || `Order ${order.billNumber} rejected successfully`);
        setSuccessModalOpen(true);
        
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } else {
        toast.error(response.message || 'Failed to reject order');
      }
    } catch (err: any) {
      console.error('Error rejecting order:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.response?.message || 
                          err?.message || 
                          'Failed to reject order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setProcessingOrderId(null);
      setPendingOrder(null);
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

  const getOrderItems = (order: Order) => {
    if (order.billNumber === 'FB-2024-003') {
      return [
        { name: 'Macallan 18 Year', quantity: 1, price: 349.99 },
        { name: 'Hennessy XO', quantity: 1, price: 229.99 },
      ];
    }
    return [
      { name: 'Premium Whiskey', quantity: 1, price: order.totalAmount * 0.6 },
      { name: 'Premium Brandy', quantity: 1, price: order.totalAmount * 0.4 },
    ];
  };

  const handlePrint = async (order: Order) => {
    try {
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
                    <td>Rs ${item.price.toFixed(2)}</td>
                    <td>Rs ${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-amount">Total Amount: Rs ${total.toFixed(2)}</div>
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
    } catch (err: any) {
      console.error('Failed to fetch order details:', err);
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
                    <td>Rs ${item.price.toFixed(2)}</td>
                    <td>Rs ${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-amount">Total Amount: Rs ${total.toFixed(2)}</div>
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

  // Calculate total filtered items for pagination
  const totalFiltered = useMemo(() => {
    let filtered = [...orders];
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
    return filtered;
  }, [orders, filters.billNumber, filters.location]);

  const totalPages = Math.ceil(totalFiltered.length / itemsPerPage);

  return {
    // State
    searchInput,
    setSearchInput,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredAndSortedOrders,
    totalFiltered,
    totalPages,
    canEdit,
    processingOrderId,
    
    // Modal states
    confirmModalOpen,
    setConfirmModalOpen,
    confirmAction,
    confirmTitle,
    confirmMessage,
    successModalOpen,
    setSuccessModalOpen,
    successMessage,
    pendingOrder,
    selectedOrder,
    isModalOpen,
    
    // Sort
    sortKey,
    sortDir,
    handleSort,
    
    // Handlers
    clearFilters,
    hasActiveFilters,
    handleStatusUpdate,
    handleAcceptOrder,
    handleRejectOrder,
    handleView,
    handleCloseModal,
    handlePrint,
    formatDate,
    getStatusColor,
  };
}



