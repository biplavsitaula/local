"use client";

import { ArrowUpDown, Eye, Printer, Loader2, AlertCircle, Filter, X, Search, CheckCircle, XCircle } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Order } from '@/hooks/useOrderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmModal } from '@/components/ConfirmModal';
import { SuccessMsgModal } from '@/components/SuccessMsgModal';
import { useOrderTable } from './hooks/useOrderTable';

interface OrderTableProps {
  orders: Order[];
  allOrders?: Order[];
  onFiltersChange?: (filters: {
    search?: string;
    status?: string;
    billNumber?: string;
    location?: string;
    paymentMethod?: string;
  }) => void;
  onOrderUpdate?: () => void;
}

export function OrderTable({ orders: propOrders, allOrders, onFiltersChange, onOrderUpdate }: OrderTableProps) {
  const {
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
    sortKey,
    sortDir,
    handleSort,
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
  } = useOrderTable({
    orders: propOrders,
    onFiltersChange,
    onOrderUpdate,
  });

  const debouncedSearch = useDebounce(searchInput, 300);

  type SortKey = 'billNumber' | 'customerName' | 'location' | 'totalAmount' | 'status';

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


  return (
    <>
      {/* Search and Filter Bar */}
      <div className="space-y-4 mb-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders by bill number, customer name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-foreground placeholder-muted-foreground"
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
                        {(() => {
                          const statusLower = order.status?.toLowerCase() || '';
                          const isAccepted = statusLower.includes('accepted') || statusLower === 'accepted';
                          const isRejected = statusLower.includes('rejected') || statusLower === 'rejected' || statusLower.includes('reject');
                          const isPending = statusLower.includes('pending') || statusLower === 'pending' || statusLower.includes('placed');
                          
                          // Accept/Reject icon buttons (visible for pending/placed orders, but only superadmin can use them)
                          if (isPending) {
                            return (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Accept button clicked', { orderId: order.id, canEdit, processingOrderId });
                                    if (processingOrderId === order.id) {
                                      console.log('Order is already being processed');
                                      return;
                                    }
                                    handleAcceptOrder(order);
                                  }}
                                  disabled={processingOrderId === order.id}
                                  className={`p-2 rounded-lg transition-colors relative z-10 ${
                                    canEdit 
                                      ? 'hover:bg-green-500/10 text-green-500 cursor-pointer active:scale-95' 
                                      : 'opacity-50 text-green-500/50 cursor-pointer hover:opacity-70'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  aria-label="Accept order"
                                  title={canEdit ? "Accept order" : "Only super admin can accept orders"}
                                  type="button"
                                >
                                  {processingOrderId === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Reject button clicked', { orderId: order.id, canEdit, processingOrderId });
                                    if (processingOrderId === order.id) {
                                      console.log('Order is already being processed');
                                      return;
                                    }
                                    handleRejectOrder(order);
                                  }}
                                  disabled={processingOrderId === order.id}
                                  className={`p-2 rounded-lg transition-colors relative z-10 ${
                                    canEdit 
                                      ? 'hover:bg-red-500/10 text-red-500 cursor-pointer active:scale-95' 
                                      : 'opacity-50 text-red-500/50 cursor-pointer hover:opacity-70'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  aria-label="Reject order"
                                  title={canEdit ? "Reject order" : "Only super admin can reject orders"}
                                  type="button"
                                >
                                  {processingOrderId === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            );
                          }
                          
                          // Status indicators for accepted/rejected orders
                          if (isAccepted) {
                            return (
                              <button
                                disabled
                                className="p-2 bg-green-500/20 rounded-lg cursor-not-allowed"
                                title="Order Accepted"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </button>
                            );
                          }
                          
                          if (isRejected) {
                            return (
                              <button
                                disabled
                                className="p-2 bg-red-500/20 rounded-lg cursor-not-allowed"
                                title="Order Rejected"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </button>
                            );
                          }
                          
                          return null;
                        })()}
                        <button
                          onClick={() => handleView(order)}
                          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                          aria-label="View order"
                          title="View order details"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handlePrint(order)}
                          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                          aria-label="Print order"
                          title="Print order"
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
        
        {/* Pagination */}
        {totalFiltered.length > itemsPerPage ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            itemsPerPage={itemsPerPage}
            totalItems={totalFiltered.length}
          />
        ) : null}
      </div>
      
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPrint={handlePrint}
      />
      
      <ConfirmModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
        }}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmTitle.includes("Accept") ? "Accept" : "Reject"}
        variant={confirmTitle.includes("Reject") ? "destructive" : "default"}
        isLoading={pendingOrder !== null && processingOrderId === (pendingOrder?.id || null)}
      />
      
      <SuccessMsgModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        message={successMessage}
        title="Success"
      />
    </>
  );
}

