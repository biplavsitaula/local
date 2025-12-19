"use client";

import { useMemo } from "react";
import { CreditCard, QrCode, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from "@/components/features/admin/ExportButton";
import { useOrderStore } from "@/hooks/useOrderStore";
import { PaymentTable } from "@/components/features/admin/payments/PaymentTable";

type MethodFilter = "all" | "qr" | "cod";

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
  const { payments } = useOrderStore();

  const calcTotals = (method: MethodFilter) => {
    const list =
      method === "all" ? payments : payments.filter((p) => p.method === method);

    const total = list.reduce((sum, p) => sum + p.amount, 0);
    const completed = list
      .filter((p) => p.status.toLowerCase().includes("completed") || p.status.toLowerCase().includes("paid"))
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = list
      .filter((p) => p.status.toLowerCase().includes("pending") || p.status.toLowerCase().includes("processing"))
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, completed, pending };
  };

  const totalsAll = useMemo(() => calcTotals("all"), [payments]);
  const totalsQr = useMemo(() => calcTotals("qr"), [payments]);
  const totalsCod = useMemo(() => calcTotals("cod"), [payments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Track all payment records and transactions
          </p>
        </div>
        <ExportButton />
      </div>

      <Tabs defaultValue="all" className="opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="all" className="gap-2">
            <CreditCard className="h-4 w-4" />
            All Payments
          </TabsTrigger>
          <TabsTrigger value="qr" className="gap-2">
            <QrCode className="h-4 w-4" />
            QR Payments
          </TabsTrigger>
          <TabsTrigger value="cod" className="gap-2">
            <Wallet className="h-4 w-4" />
            Cash on Delivery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Payments"
              value={`$${totalsAll.total.toFixed(2)}`}
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

        <TabsContent value="qr" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Payments"
              value={`$${totalsQr.total.toFixed(2)}`}
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

        <TabsContent value="cod" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Payments"
              value={`$${totalsCod.total.toFixed(2)}`}
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


