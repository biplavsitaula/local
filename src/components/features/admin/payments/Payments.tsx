"use client";

import { useMemo, useEffect, useState } from "react";
import { CreditCard, QrCode, Wallet, Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from "@/components/features/admin/ExportButton";
import { paymentsService, Payment as ApiPayment } from "@/services/payments.service";
import { PaymentTable } from "@/components/features/admin/payments/PaymentTable";

type MethodFilter = "all" | "qr" | "cod";

interface PaymentSummary {
  totalPayments: number;
  completed: number;
  pending: number;
}

function SummaryCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="glass-card rounded-xl border border-border/50 p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}

export default function Payments() {
  const [mounted, setMounted] = useState(false);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MethodFilter>("all");

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

  if (!mounted) return null;

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">
              Error loading payments
            </p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Payments
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all payment records and transactions
          </p>
        </div>
        <ExportButton defaultDataType="payments" />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as MethodFilter)}
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="all" className="gap-2">
            <CreditCard className="h-4 w-4" />
            All Payments
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {payments.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="qr" className="gap-2">
            <QrCode className="h-4 w-4" />
            QR Payments
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {payments.filter(isQrPayment).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="cod" className="gap-2">
            <Wallet className="h-4 w-4" />
            Cash on Delivery
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {payments.filter(isCodPayment).length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ALL */}
        <TabsContent value="all" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Payments"
              value={`$${totalsAll.totalPayments.toFixed(2)}`}
              valueClassName="text-flame-orange"
            />
            <SummaryCard
              label="Completed"
              value={`$${totalsAll.completed.toFixed(2)}`}
              valueClassName="text-success"
            />
            <SummaryCard
              label="Pending"
              value={`$${totalsAll.pending.toFixed(2)}`}
              valueClassName="text-warning"
            />
          </div>
          <PaymentTable methodFilter="all" />
        </TabsContent>

        {/* QR */}
        <TabsContent value="qr" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Payments"
              value={`$${totalsQr.totalPayments.toFixed(2)}`}
              valueClassName="text-flame-orange"
            />
            <SummaryCard
              label="Completed"
              value={`$${totalsQr.completed.toFixed(2)}`}
              valueClassName="text-success"
            />
            <SummaryCard
              label="Pending"
              value={`$${totalsQr.pending.toFixed(2)}`}
              valueClassName="text-warning"
            />
          </div>
          <PaymentTable methodFilter="qr" />
        </TabsContent>

        {/* COD */}
        <TabsContent value="cod" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Payments"
              value={`$${totalsCod.totalPayments.toFixed(2)}`}
              valueClassName="text-flame-orange"
            />
            <SummaryCard
              label="Completed"
              value={`$${totalsCod.completed.toFixed(2)}`}
              valueClassName="text-success"
            />
            <SummaryCard
              label="Pending"
              value={`$${totalsCod.pending.toFixed(2)}`}
              valueClassName="text-warning"
            />
          </div>
          <PaymentTable methodFilter="cod" />
        </TabsContent>
      </Tabs>
    </div>
  );
}









// "use client";

// import { useMemo, useEffect, useState } from "react";
// import { CreditCard, QrCode, Wallet, Loader2, AlertCircle } from "lucide-react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { ExportButton } from "@/components/features/admin/ExportButton";
// import { paymentsService } from "@/services/payments.service";
// import { PaymentTable } from "@/components/features/admin/payments/PaymentTable";

// type MethodFilter = "all" | "qr" | "cod";

// function SummaryCard({
//   label,
//   value,
//   valueClassName,
// }: {
//   label: string;
//   value: string;
//   valueClassName: string;
// }) {
//   return (
//     <div className="glass-card rounded-xl border border-border/50 p-6">
//       <p className="text-sm text-muted-foreground">{label}</p>
//       <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
//     </div>
//   );
// }

// export default function Payments() {
//   const [summary, setSummary] = useState({
//     totalPayments: 0,
//     completed: 0,
//     pending: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await paymentsService.getSummary();
//         setSummary({
//           totalPayments: response.data?.totalPayments || 0,
//           completed: response.data?.completed || 0,
//           pending: response.data?.pending || 0,
//         });
//       } catch (err: any) {
//         setError(err.message || 'Failed to load payment summary');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSummary();
//   }, []);

//   const calcTotals = (method: MethodFilter) => {
//     // For filtered views, we'd need to fetch separately or calculate from payments list
//     // For now, return the summary for all
//     if (method === "all") {
//       return {
//         totalPayments: summary?.totalPayments || 0,
//         completed: summary?.completed || 0,
//         pending: summary?.pending || 0,
//       };
//     }
//     // For filtered views, we'd need additional API calls or client-side filtering
//     return { totalPayments: 0, completed: 0, pending: 0 };
//   };

//   const totalsAll = useMemo(() => calcTotals("all"), [summary]);
//   const totalsQr = useMemo(() => calcTotals("qr"), [summary]);
//   const totalsCod = useMemo(() => calcTotals("cod"), [summary]);

//   if (loading && !summary.totalPayments) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
//           <p className="text-muted-foreground">Loading payments...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error && !summary.totalPayments) {
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

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between opacity-0 animate-fade-in">
//         <div>
//           <h1 className="text-3xl font-display font-bold text-foreground">Payments</h1>
//           <p className="text-muted-foreground mt-1">
//             Track all payment records and transactions
//           </p>
//         </div>
//         <ExportButton defaultDataType="payments" />
//       </div>

//       <Tabs defaultValue="all" className="opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
//         <TabsList className="bg-secondary/50">
//           <TabsTrigger value="all" className="gap-2">
//             <CreditCard className="h-4 w-4" />
//             All Payments
//           </TabsTrigger>
//           <TabsTrigger value="qr" className="gap-2">
//             <QrCode className="h-4 w-4" />
//             QR Payments
//           </TabsTrigger>
//           <TabsTrigger value="cod" className="gap-2">
//             <Wallet className="h-4 w-4" />
//             Cash on Delivery
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="all" className="mt-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <SummaryCard
//               label="Total Payments"
//               value={`$${(totalsQr.total ?? 0).toFixed(2)}`}
//               valueClassName="text-flame-orange"
//             />
//             <SummaryCard
//               label="Completed"
//               value={`$${totalsAll.completed?.toFixed(2)}`}
//               valueClassName="text-success"
//             />
//             <SummaryCard
//               label="Pending"
//               value={`$${totalsAll.pending.toFixed(2)}`}
//               valueClassName="text-warning"
//             />
//           </div>
//           <PaymentTable methodFilter="all" />
//         </TabsContent>

//         <TabsContent value="qr" className="mt-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <SummaryCard
//               label="Total Payments"
//               value={`$${totalsQr.total.toFixed(2)}`}
//               valueClassName="text-flame-orange"
//             />
//             <SummaryCard
//               label="Completed"
//               value={`$${totalsQr.completed.toFixed(2)}`}
//               valueClassName="text-success"
//             />
//             <SummaryCard
//               label="Pending"
//               value={`$${totalsQr.pending.toFixed(2)}`}
//               valueClassName="text-warning"
//             />
//           </div>
//           <PaymentTable methodFilter="qr" />
//         </TabsContent>

//         <TabsContent value="cod" className="mt-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <SummaryCard
//               label="Total Payments"
//               value={`$${totalsCod.total.toFixed(2)}`}
//               valueClassName="text-flame-orange"
//             />
//             <SummaryCard
//               label="Completed"
//               value={`$${totalsCod.completed.toFixed(2)}`}
//               valueClassName="text-success"
//             />
//             <SummaryCard
//               label="Pending"
//               value={`$${totalsCod.pending.toFixed(2)}`}
//               valueClassName="text-warning"
//             />
//           </div>
//           <PaymentTable methodFilter="cod" />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }


