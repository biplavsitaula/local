"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Loader2, AlertCircle } from "lucide-react";
import { paymentsService, Payment as ApiPayment } from "@/services/payments.service";

type MethodFilter = "all" | "qr" | "cod";
type SortKey = "billNumber" | "customerName" | "amount" | "method" | "status" | "createdAt";
type SortDir = "asc" | "desc";

interface PaymentTableProps {
  methodFilter: MethodFilter;
}

interface Payment {
  id: string;
  billNumber: string;
  customerName: string;
  amount: number;
  method: "cod" | "qr";
  status: string;
  createdAt: string;
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

const getMethodPill = (method: "cod" | "qr") => {
  if (method === "qr") {
    return {
      label: "QR Payment",
      className: "bg-success/15 text-success border border-success/30",
    };
  }
  return {
    label: "COD",
    className: "bg-warning/15 text-warning border border-warning/30",
  };
};

export function PaymentTable({ methodFilter }: PaymentTableProps) {
  // --------------------
  // Hooks must always run first
  // --------------------
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const mapApiPaymentToPayment = (apiPayment: ApiPayment): Payment => ({
    id: apiPayment._id || apiPayment.id || "",
    billNumber: apiPayment.billNumber,
    customerName: apiPayment.customerName || apiPayment.billNumber, // fallback
    amount: apiPayment.amount,
    method: apiPayment.method === "qr" ? "qr" : "cod",
    status: apiPayment.status,
    createdAt: apiPayment.createdAt,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await paymentsService.getAll({
          method: methodFilter !== "all" ? methodFilter : undefined,
          search: query || undefined,
          limit: 100,
        });

        const mappedPayments = (response.data || []).map(mapApiPaymentToPayment);
        setPayments(mappedPayments);
      } catch (err: any) {
        setError(err.message || "Failed to load payments");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [methodFilter, query]);

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
  const rows = useMemo(() => {
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
        case "status":
          return dir * a.status.localeCompare(b.status);
        case "createdAt":
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        default:
          return 0;
      }
    });
  }, [payments, query, sortDir, sortKey]);

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
      {/* Search */}
      <div className="p-4 border-b border-border/50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search payments..."
            className="h-10 w-full rounded-md border border-border bg-secondary/30 px-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {renderSortableTh("Bill No", "billNumber")}
              {renderSortableTh("Customer", "customerName")}
              {renderSortableTh("Amount", "amount")}
              {renderSortableTh("Method", "method")}
              {renderSortableTh("Status", "status")}
              {renderSortableTh("Date", "createdAt")}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((p) => {
                const methodPill = getMethodPill(p.method);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-flame-orange">{p.billNumber}</td>
                    <td className="p-4 text-sm text-foreground">{p.customerName}</td>
                    <td className="p-4 text-sm text-foreground font-medium">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${methodPill.className}`}>
                        {methodPill.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("en-US")}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-foreground">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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


