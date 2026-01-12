import { useMemo, useEffect, useState } from "react";
import { paymentsService, Payment as ApiPayment } from "@/services/payments.service";

export type MethodFilter = "all" | "qr" | "cod";

interface PaymentSummary {
  totalPayments: number;
  completed: number;
  pending: number;
}

export function usePayments() {
  const [mounted, setMounted] = useState(false);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MethodFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableFilters, setTableFilters] = useState<{
    status?: string;
    dateRange?: string;
    minAmount?: string;
    maxAmount?: string;
  }>({});

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await paymentsService.getAll({ limit: 1000 });
        setPayments(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Helper to check if payment is QR/Online
  const isQrPayment = (p: ApiPayment) => {
    const method = (p.method || '').toLowerCase();
    return method === 'online' || method === 'qr' || method === 'qr payment';
  };

  // Helper to check if payment is COD
  const isCodPayment = (p: ApiPayment) => {
    const method = (p.method || '').toLowerCase();
    return method === 'cod' || method === 'cash on delivery';
  };

  // Calculate summaries from actual payment data
  const calcTotals = (method: MethodFilter): PaymentSummary => {
    let filtered = payments;
    
    if (method === "qr") {
      filtered = payments.filter(isQrPayment);
    } else if (method === "cod") {
      filtered = payments.filter(isCodPayment);
    }

    const total = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completed = filtered
      .filter(p => (p.status || '').toLowerCase() === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = filtered
      .filter(p => (p.status || '').toLowerCase() === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalPayments: total,
      completed,
      pending,
    };
  };

  const totalsAll = useMemo(() => calcTotals("all"), [payments]);
  const totalsQr = useMemo(() => calcTotals("qr"), [payments]);
  const totalsCod = useMemo(() => calcTotals("cod"), [payments]);

  return {
    mounted,
    payments,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    tableFilters,
    setTableFilters,
    isQrPayment,
    isCodPayment,
    totalsAll,
    totalsQr,
    totalsCod,
  };
}



