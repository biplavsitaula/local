"use client";

import { useState, useEffect } from "react";
import { InventoryTable } from "@/components/features/admin/inventory/InventoryTable";
import { AddStockModal } from "@/components/features/admin/inventory/AddStockModal";
import { RemoveStockModal } from "@/components/features/admin/inventory/RemoveStockModal";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/features/admin/ExportButton";
import {
  Plus,
  Minus,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Loader2,
} from "lucide-react";
import { inventoryService } from "@/services/inventory.service";

interface InventoryStats {
  totalAdded: number;
  totalRemoved: number;
  totalTransactions: number;
}

const Inventory = () => {
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [removeStockOpen, setRemoveStockOpen] = useState(false);
  const [stats, setStats] = useState<InventoryStats>({
    totalAdded: 0,
    totalRemoved: 0,
    totalTransactions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await inventoryService.getAll({ limit: 1000 });
      const transactions = response.data || [];

      const totalAdded = transactions
        .filter((t) => t.type === "add")
        .reduce((sum, t) => sum + t.quantity, 0);

      const totalRemoved = transactions
        .filter((t) => t.type === "remove")
        .reduce((sum, t) => sum + t.quantity, 0);

      setStats({
        totalAdded,
        totalRemoved,
        totalTransactions: transactions.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Listen for inventory changes to refresh stats
  useEffect(() => {
    const handleInventoryChange = () => {
      fetchStats();
    };

    window.addEventListener("inventoryChanged", handleInventoryChange);
    return () => {
      window.removeEventListener("inventoryChanged", handleInventoryChange);
    };
  }, []);

  const handleSuccess = () => {
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage stock levels, bulk add/remove products, and track inventory
            history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setAddStockOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
          <Button
            onClick={() => setRemoveStockOpen(true)}
            variant="destructive"
            className="gap-2"
          >
            <Minus className="h-4 w-4" />
            Remove Stock
          </Button>
          <ExportButton defaultDataType="inventory" />
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-0 animate-fade-in"
        style={{ animationDelay: "50ms" }}
      >
        {/* Total Added */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Stock Added</p>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin mt-2" />
              ) : (
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  +{stats.totalAdded.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">units</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Total Removed */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Stock Removed
              </p>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin mt-2" />
              ) : (
                <p className="text-2xl font-bold text-flame-red mt-1">
                  -{stats.totalRemoved.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">units</p>
            </div>
            <div className="p-3 bg-flame-red/10 rounded-lg">
              <ArrowDownCircle className="h-6 w-6 text-flame-red" />
            </div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Transactions
              </p>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin mt-2" />
              ) : (
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.totalTransactions.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">all time</p>
            </div>
            <div className="p-3 bg-flame-orange/10 rounded-lg">
              <History className="h-6 w-6 text-flame-orange" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-flame-orange" />
          <h2 className="text-xl font-semibold text-foreground">
            Inventory Transactions
          </h2>
        </div>
        <InventoryTable />
      </div>

      {/* Modals */}
      <AddStockModal
        open={addStockOpen}
        onOpenChange={setAddStockOpen}
        onSuccess={handleSuccess}
      />
      <RemoveStockModal
        open={removeStockOpen}
        onOpenChange={setRemoveStockOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Inventory;

