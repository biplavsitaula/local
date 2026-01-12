import React, { useMemo, useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { paymentsService, Payment as ApiPayment } from "@/services/payments.service";

type MethodFilter = "all" | "qr" | "cod";
type SortKey = "billNumber" | "customerName" | "amount" | "method" | "gateway" | "status" | "createdAt";
type SortDir = "asc" | "desc";

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

interface UsePaymentTableProps {
  methodFilter: MethodFilter;
  searchQuery?: string;
  onFiltersChange?: (filters: {
    status?: string;
    dateRange?: string;
    minAmount?: string;
    maxAmount?: string;
  }) => void;
}

export function usePaymentTable({
  methodFilter,
  searchQuery = "",
  onFiltersChange,
}: UsePaymentTableProps) {
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
    const customerName = apiPayment.customer?.fullName || 
                         apiPayment.customer?.name || 
                         apiPayment.customerName || 
                         'N/A';
    
    const customerMobile = apiPayment.customer?.mobile || '';
    
    let method: "cod" | "qr" = "cod";
    const paymentMethod = (apiPayment.method || '').toLowerCase();
    if (paymentMethod === 'online' || paymentMethod === 'qr' || paymentMethod === 'qr payment') {
      method = 'qr';
    }

    const gateway = apiPayment.gateway || null;

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

        const response = await paymentsService.getAll({
          limit: 100,
        });

        let mappedPayments = (response.data || []).map(mapApiPaymentToPayment);
        
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

  const filteredAndSortedRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = payments;
    
    if (q) {
      list = list.filter(
        (p) =>
          p.billNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q)
      );
    }

    if (filters.status) {
      list = list.filter(p => p.status.toLowerCase() === filters.status.toLowerCase());
    }

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

  const rows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedRows.slice(startIndex, endIndex);
  }, [filteredAndSortedRows, currentPage, itemsPerPage]);

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

  const totalPages = Math.ceil(filteredAndSortedRows.length / itemsPerPage);

  return {
    loading,
    error,
    rows,
    filteredAndSortedRows,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    sortKey,
    sortDir,
    handleSort,
    renderSortableTh,
    getStatusColor,
    getMethodPill,
  };
}

