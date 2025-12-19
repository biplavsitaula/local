"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useOrderStore } from "@/hooks/useOrderStore";

type MethodFilter = "all" | "qr" | "cod";
type SortKey = "billNumber" | "customerName" | "amount" | "method" | "status" | "createdAt";
type SortDir = "asc" | "desc";

interface PaymentTableProps {
  methodFilter: MethodFilter;
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
  const { payments } = useOrderStore();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = payments;
    if (methodFilter !== "all") {
      list = list.filter((p) => p.method === methodFilter);
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.billNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q)
      );
    }

    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...list].sort((a, b) => {
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

    return sorted;
  }, [methodFilter, payments, query, sortDir, sortKey]);

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
                    <td className="p-4 text-sm font-medium text-flame-orange">
                      {p.billNumber}
                    </td>
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


