"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, AlertCircle, Filter, X } from "lucide-react";
import { paymentsService, Payment as ApiPayment } from "@/services/payments.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

type MethodFilter = "all" | "qr" | "cod";
type SortKey = "billNumber" | "customerName" | "amount" | "method" | "gateway" | "status" | "createdAt";
type SortDir = "asc" | "desc";

interface PaymentTableProps {
  methodFilter: MethodFilter;
  searchQuery?: string;
  onFiltersChange?: (filters: {
    status?: string;
    dateRange?: string;
    minAmount?: string;
    maxAmount?: string;
  }) => void;
}

interface Payment {
  id: string;
  billNumber: string;
  customerName: string;
  customerMobile: string;
  amount: number;
  method: "cod" | "qr";
  gateway: string | null;
  status: string;
  notes: string;
  createdAt: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("paid") || s.includes("success")) {
    return "bg-success/20 text-success";
  }
  if (s.includes("pending") || s.includes("processing")) {
    return "bg-warning/20 text-warning";
  }
  if (s.includes("failed") || s.includes("cancelled")) {
    return "bg-destructive/20 text-destructive";
  }
  return "bg-muted/20 text-muted-foreground";
};

const getMethodPill = (method: "cod" | "qr", gateway: string | null) => {
  if (method === "qr") {
    // Show gateway name for online payments
    const gatewayLabel = gateway ? gateway.charAt(0).toUpperCase() + gateway.slice(1) : "Online";
    return {
      label: gatewayLabel,
      className: gateway === "esewa" 
        ? "bg-green-500/15 text-green-500 border border-green-500/30"
        : gateway === "khalti"
        ? "bg-purple-500/15 text-purple-500 border border-purple-500/30"
        : "bg-success/15 text-success border border-success/30",
    };
  }
  return {
    label: "COD",
    className: "bg-warning/15 text-warning border border-warning/30",
  };
};

export function PaymentTable({ methodFilter, searchQuery = "", onFiltersChange }: PaymentTableProps) {
  // --------------------
  // Hooks must always run first
  // --------------------
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    minAmount: '',
    maxAmount: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  // Use the searchQuery prop from parent (already debounced)
  const query = searchQuery;
  
  // Expose filters to parent component
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        status: filters.status,
        dateRange: filters.dateRange,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
      });
    }
  }, [filters, onFiltersChange]);

  const mapApiPaymentToPayment = (apiPayment: any): Payment => {
    // Handle API response structure - customer can be an object with fullName
    const customerName = apiPayment.customer?.fullName || 
                         apiPayment.customer?.name || 
                         apiPayment.customerName || 
                         'N/A';
    
    const customerMobile = apiPayment.customer?.mobile || '';
    
    // Map payment method - API returns "COD", "Online", "QR Payment"
    let method: "cod" | "qr" = "cod";
    const paymentMethod = (apiPayment.method || '').toLowerCase();
    if (paymentMethod === 'online' || paymentMethod === 'qr' || paymentMethod === 'qr payment') {
      method = 'qr';
    }

    // Get gateway (esewa, khalti, etc.)
    const gateway = apiPayment.gateway || null;

    // Get order items from orderId object
    const orderItems = (apiPayment.orderId?.items || []).map((item: any) => ({
      name: item.name || '',
      quantity: item.quantity || 0,
      price: item.price || 0,
      total: item.total || 0,
    }));
    
    return {
      id: apiPayment._id || apiPayment.id || "",
      billNumber: apiPayment.billNumber,
      customerName,
      customerMobile,
      amount: apiPayment.amount,
      method,
      gateway,
      status: apiPayment.status,
      notes: apiPayment.notes || '',
      createdAt: apiPayment.createdAt,
      orderItems,
    };
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all payments and filter on client side
        const response = await paymentsService.getAll({
          limit: 100,
        });

        let mappedPayments = (response.data || []).map(mapApiPaymentToPayment);
        
        // Filter by method on client side
        if (methodFilter === "qr") {
          mappedPayments = mappedPayments.filter(p => p.method === "qr");
        } else if (methodFilter === "cod") {
          mappedPayments = mappedPayments.filter(p => p.method === "cod");
        }
        
        setPayments(mappedPayments);
      } catch (err: any) {
        setError(err.message || "Failed to load payments");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [methodFilter]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  // --------------------
  // Memoized rows (hook)
  // --------------------
  const filteredAndSortedRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = payments;
    
    // Apply search query
    if (q) {
      list = list.filter(
        (p) =>
          p.billNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (filters.status) {
      list = list.filter(p => p.status.toLowerCase() === filters.status.toLowerCase());
    }

    // Apply amount range filter
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      if (!isNaN(min)) {
        list = list.filter(p => p.amount >= min);
      }
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      if (!isNaN(max)) {
        list = list.filter(p => p.amount <= max);
      }
    }

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      let cutoffDate = new Date();
      if (filters.dateRange === '7d') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (filters.dateRange === '30d') {
        cutoffDate.setDate(now.getDate() - 30);
      } else if (filters.dateRange === '90d') {
        cutoffDate.setDate(now.getDate() - 90);
      }
      list = list.filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate >= cutoffDate;
      });
    }

    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "billNumber":
          return dir * a.billNumber.localeCompare(b.billNumber);
        case "customerName":
          return dir * a.customerName.localeCompare(b.customerName);
        case "amount":
          return dir * (a.amount - b.amount);
        case "method":
          return dir * a.method.localeCompare(b.method);
        case "gateway":
          return dir * (a.gateway || '').localeCompare(b.gateway || '');
        case "status":
          return dir * a.status.localeCompare(b.status);
        case "createdAt":
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        default:
          return 0;
      }
    });
  }, [payments, query, sortDir, sortKey, filters]);

  // Apply pagination
  const rows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedRows.slice(startIndex, endIndex);
  }, [filteredAndSortedRows, currentPage, itemsPerPage]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters.status, filters.dateRange, filters.minAmount, filters.maxAmount, sortKey, sortDir]);

  const clearFilters = () => {
    setFilters({
      status: '',
      dateRange: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const hasActiveFilters = filters.status || filters.dateRange || filters.minAmount || filters.maxAmount;

  const renderSortableTh = (label: string, columnKey: SortKey) => {
    const isActive = sortKey === columnKey;
    const SortIcon = !isActive ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
        <button
          type="button"
          onClick={() => handleSort(columnKey)}
          className={`inline-flex items-center gap-2 transition-colors ${
            isActive ? "text-foreground" : "hover:text-foreground"
          }`}
        >
          <span>{label}</span>
          <SortIcon className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-60"}`} />
        </button>
      </th>
    );
  };

  // --------------------
  // Conditional UI rendering after hooks
  // --------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading payments...</p>
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
            <p className="text-lg font-semibold text-foreground mb-2">Error loading payments</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------
  // Render table
  // --------------------
  return (
    <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 border-b border-border/50 space-y-4">
        <div className="flex gap-4 justify-end">
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
              <h3 className="text-sm font-semibold text-foreground">Filter Payments</h3>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Date Range</label>
                <Select
                  value={filters.dateRange || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, dateRange: value === 'all' ? '' : value })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Amount Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Min Amount</label>
                <Input
                  type="number"
                  placeholder="Min amount..."
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>

              {/* Max Amount Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Max Amount</label>
                <Input
                  type="number"
                  placeholder="Max amount..."
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {renderSortableTh("Bill No", "billNumber")}
              {renderSortableTh("Customer", "customerName")}
              {renderSortableTh("Amount", "amount")}
              {renderSortableTh("Method", "method")}
              {renderSortableTh("Gateway", "gateway")}
              {renderSortableTh("Status", "status")}
              {renderSortableTh("Date", "createdAt")}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((p) => {
                const methodPill = getMethodPill(p.method, p.gateway);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-flame-orange">{p.billNumber}</td>
                    <td className="p-4">
                      <div className="text-sm text-foreground font-medium">{p.customerName}</div>
                      {p.customerMobile && (
                        <div className="text-xs text-muted-foreground">{p.customerMobile}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-foreground font-medium">
                      Rs. {p.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        p.method === "qr" 
                          ? "bg-success/15 text-success border border-success/30" 
                          : "bg-warning/15 text-warning border border-warning/30"
                      }`}>
                        {p.method === "qr" ? "Online" : "COD"}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.gateway ? (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          p.gateway === "esewa" 
                            ? "bg-green-500/15 text-green-500 border border-green-500/30"
                            : p.gateway === "khalti"
                            ? "bg-purple-500/15 text-purple-500 border border-purple-500/30"
                            : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                        }`}>
                          {p.gateway.charAt(0).toUpperCase() + p.gateway.slice(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {(() => {
        const totalPages = Math.ceil(filteredAndSortedRows.length / itemsPerPage);
        
        return filteredAndSortedRows.length > itemsPerPage ? (
          <div className="border-t border-border/50 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              itemsPerPage={itemsPerPage}
              totalItems={filteredAndSortedRows.length}
            />
          </div>
        ) : null;
      })()}
    </div>
  );
}




// "use client";

// import { useMemo, useState, useEffect } from "react";
// import { ArrowDown, ArrowUp, ArrowUpDown, Search, Loader2, AlertCircle } from "lucide-react";
// import { paymentsService, Payment as ApiPayment } from "@/services/payments.service";

// type MethodFilter = "all" | "qr" | "cod";
// type SortKey = "billNumber" | "customerName" | "amount" | "method" | "status" | "createdAt";
// type SortDir = "asc" | "desc";

// interface PaymentTableProps {
//   methodFilter: MethodFilter;
// }

// interface Payment {
//   id: string;
//   billNumber: string;
//   customerName: string;
//   amount: number;
//   method: "cod" | "qr";
//   status: string;
//   createdAt: string;
// }

// const getStatusColor = (status: string) => {
//   const s = status.toLowerCase();
//   if (s.includes("completed") || s.includes("paid") || s.includes("success")) {
//     return "bg-success/20 text-success";
//   }
//   if (s.includes("pending") || s.includes("processing")) {
//     return "bg-warning/20 text-warning";
//   }
//   if (s.includes("failed") || s.includes("cancelled")) {
//     return "bg-destructive/20 text-destructive";
//   }
//   return "bg-muted/20 text-muted-foreground";
// };

// const getMethodPill = (method: "cod" | "qr") => {
//   if (method === "qr") {
//     return {
//       label: "QR Payment",
//       className: "bg-success/15 text-success border border-success/30",
//     };
//   }
//   return {
//     label: "COD",
//     className: "bg-warning/15 text-warning border border-warning/30",
//   };
// };

// export function PaymentTable({ methodFilter }: PaymentTableProps) {
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [query, setQuery] = useState("");
//   const [sortKey, setSortKey] = useState<SortKey>("createdAt");
//   const [sortDir, setSortDir] = useState<SortDir>("desc");

//   const mapApiPaymentToPayment = (apiPayment: ApiPayment): Payment => {
//     return {
//       id: apiPayment._id || apiPayment.id || '',
//       billNumber: apiPayment.billNumber,
//       customerName: apiPayment.billNumber, // API might not have customerName, use billNumber as fallback
//       amount: apiPayment.amount,
//       method: apiPayment.method === 'qr' ? 'qr' : 'cod',
//       status: apiPayment.status,
//       createdAt: apiPayment.createdAt,
//     };
//   };

//   useEffect(() => {
//     const fetchPayments = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await paymentsService.getAll({
//           method: methodFilter !== 'all' ? methodFilter : undefined,
//           search: query || undefined,
//           limit: 100,
//         });
//         const mappedPayments = (response.data || []).map(mapApiPaymentToPayment);
//         setPayments(mappedPayments);
//       } catch (err: any) {
//         setError(err.message || 'Failed to load payments');
//         setPayments([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPayments();
//   }, [methodFilter, query]);

//   const handleSort = (key: SortKey) => {
//     if (key === sortKey) {
//       setSortDir((d) => (d === "asc" ? "desc" : "asc"));
//       return;
//     }
//     setSortKey(key);
//     setSortDir("asc");
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
//           <p className="text-muted-foreground">Loading payments...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="flex flex-col items-center gap-4 text-center">
//           <AlertCircle className="h-8 w-8 text-destructive" />
//           <div>
//             <p className="text-lg font-semibold text-foreground mb-2">Error loading payments</p>
//             <p className="text-muted-foreground">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ✅ MOVE THIS BLOCK UP — BEFORE loading/error returns
// const rows = useMemo(() => {
//   const q = query.trim().toLowerCase();

//   let list = payments;
//   if (q) {
//     list = list.filter(
//       (p) =>
//         p.billNumber.toLowerCase().includes(q) ||
//         p.customerName.toLowerCase().includes(q) ||
//         p.status.toLowerCase().includes(q)
//     );
//   }

//   const dir = sortDir === "asc" ? 1 : -1;
//   return [...list].sort((a, b) => {
//     switch (sortKey) {
//       case "billNumber":
//         return dir * a.billNumber.localeCompare(b.billNumber);
//       case "customerName":
//         return dir * a.customerName.localeCompare(b.customerName);
//       case "amount":
//         return dir * (a.amount - b.amount);
//       case "method":
//         return dir * a.method.localeCompare(b.method);
//       case "status":
//         return dir * a.status.localeCompare(b.status);
//       case "createdAt":
//         return (
//           dir *
//           (new Date(a.createdAt).getTime() -
//             new Date(b.createdAt).getTime())
//         );
//       default:
//         return 0;
//     }
//   });
// }, [payments, query, sortDir, sortKey]);

//   // const rows = useMemo(() => {
//   //   const q = query.trim().toLowerCase();

//   //   let list = payments;
//   //   if (q) {
//   //     list = list.filter(
//   //       (p) =>
//   //         p.billNumber.toLowerCase().includes(q) ||
//   //         p.customerName.toLowerCase().includes(q) ||
//   //         p.status.toLowerCase().includes(q)
//   //     );
//   //   }

//   //   const dir = sortDir === "asc" ? 1 : -1;
//   //   const sorted = [...list].sort((a, b) => {
//   //     switch (sortKey) {
//   //       case "billNumber":
//   //         return dir * a.billNumber.localeCompare(b.billNumber);
//   //       case "customerName":
//   //         return dir * a.customerName.localeCompare(b.customerName);
//   //       case "amount":
//   //         return dir * (a.amount - b.amount);
//   //       case "method":
//   //         return dir * a.method.localeCompare(b.method);
//   //       case "status":
//   //         return dir * a.status.localeCompare(b.status);
//   //       case "createdAt":
//   //         return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
//   //       default:
//   //         return 0;
//   //     }
//   //   });

//   //   return sorted;
//   // }, [methodFilter, payments, query, sortDir, sortKey]);

//   const renderSortableTh = (label: string, columnKey: SortKey) => {
//     const isActive = sortKey === columnKey;
//     const SortIcon = !isActive ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
//     return (
//       <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
//         <button
//           type="button"
//           onClick={() => handleSort(columnKey)}
//           className={`inline-flex items-center gap-2 transition-colors ${
//             isActive ? "text-foreground" : "hover:text-foreground"
//           }`}
//         >
//           <span>{label}</span>
//           <SortIcon className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-60"}`} />
//         </button>
//       </th>
//     );
//   };

//   return (
//     <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
//       {/* Search */}
//       <div className="p-4 border-b border-border/50">
//         <div className="relative max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search payments..."
//             className="h-10 w-full rounded-md border border-border bg-secondary/30 px-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//           />
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead>
//             <tr className="border-b border-border/50">
//               {renderSortableTh("Bill No", "billNumber")}
//               {renderSortableTh("Customer", "customerName")}
//               {renderSortableTh("Amount", "amount")}
//               {renderSortableTh("Method", "method")}
//               {renderSortableTh("Status", "status")}
//               {renderSortableTh("Date", "createdAt")}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.length > 0 ? (
//               rows.map((p) => {
//                 const methodPill = getMethodPill(p.method);
//                 return (
//                   <tr
//                     key={p.id}
//                     className="border-b border-border/30 hover:bg-muted/30 transition-colors"
//                   >
//                     <td className="p-4 text-sm font-medium text-flame-orange">
//                       {p.billNumber}
//                     </td>
//                     <td className="p-4 text-sm text-foreground">{p.customerName}</td>
//                     <td className="p-4 text-sm text-foreground font-medium">
//                       ${p.amount.toFixed(2)}
//                     </td>
//                     <td className="p-4">
//                       <span className={`text-xs px-2 py-1 rounded-full ${methodPill.className}`}>
//                         {methodPill.label}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(p.status)}`}>
//                         {p.status}
//                       </span>
//                     </td>
//                     <td className="p-4 text-sm text-muted-foreground">
//                       {new Date(p.createdAt).toLocaleDateString("en-US")}
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan={6} className="p-10 text-center text-muted-foreground">
//                   No payments found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


