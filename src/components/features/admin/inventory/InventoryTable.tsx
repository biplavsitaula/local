"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ArrowUpDown,
  Eye,
  Loader2,
  AlertCircle,
  Filter,
  X,
  Plus,
  Minus,
  Package,
  Search,
} from "lucide-react";
import {
  inventoryService,
  InventoryTransaction,
} from "@/services/inventory.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  productId?: string;
}

export function InventoryTable({ productId }: InventoryTableProps) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    productName: "",
  });

  type SortKey =
    | "productName"
    | "type"
    | "quantity"
    | "previousStock"
    | "newStock"
    | "currentStock"
    | "createdAt";
  type SortDir = "asc" | "desc";

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (productId) {
        response = await inventoryService.getByProduct(productId);
      } else {
        response = await inventoryService.getAll({
          type: filters.type as "add" | "remove" | undefined,
          limit: 200,
        });
      }

      setTransactions(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [productId, filters.type]);

  // Listen for inventory changes
  useEffect(() => {
    const handleInventoryChange = () => {
      fetchTransactions();
    };

    window.addEventListener("inventoryChanged", handleInventoryChange);
    return () => {
      window.removeEventListener("inventoryChanged", handleInventoryChange);
    };
  }, [productId, filters.type]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.productName.toLowerCase().includes(query) ||
          t.reason?.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query)
      );
    }

    // Product name filter
    if (filters.productName) {
      filtered = filtered.filter((t) =>
        t.productName.toLowerCase().includes(filters.productName.toLowerCase())
      );
    }

    // Sort
    const dir = sortDir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sortKey) {
        case "productName":
          return dir * a.productName.localeCompare(b.productName);
        case "type":
          return dir * a.type.localeCompare(b.type);
        case "quantity":
          return dir * (a.quantity - b.quantity);
        case "previousStock":
          return dir * (a.previousStock - b.previousStock);
        case "newStock":
          return dir * (a.newStock - b.newStock);
        case "currentStock":
          return dir * ((a.currentStock ?? 0) - (b.currentStock ?? 0));
        case "createdAt":
          return (
            dir *
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          );

        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, searchQuery, filters.productName, sortDir, sortKey]);

  const clearFilters = () => {
    setFilters({
      type: "",
      productName: "",
    });
    setSearchQuery("");
  };

  const hasActiveFilters = filters.type || filters.productName || searchQuery;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPerformedByName = (
    performedBy: InventoryTransaction["performedBy"]
  ) => {
    if (!performedBy) return "System";
    if (typeof performedBy === "string") return performedBy;
    return performedBy.fullName || performedBy.email || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">
              Error loading inventory
            </p>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchTransactions} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Search and Filters */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, reason, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-secondary")}
          >
            <Filter className="h-4 w-4" />
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="add">Stock Added</SelectItem>
                  <SelectItem value="remove">Stock Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Filter by product..."
              value={filters.productName}
              onChange={(e) =>
                setFilters({ ...filters, productName: e.target.value })
              }
              className="w-48 bg-secondary/50"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("productName")}
                >
                  Product
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("type")}
                >
                  Type
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("quantity")}
                >
                  Quantity
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("previousStock")}
                >
                  Previous
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("newStock")}
                >
                  New Stock
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("currentStock")}
                >
                  Current Stock
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Reason
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  Date
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Performed By
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No inventory transactions found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {transaction.productName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        transaction.type === "add"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-flame-red/20 text-flame-red"
                      )}
                    >
                      {transaction.type === "add" ? (
                        <Plus className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {transaction.type === "add" ? "Added" : "Removed"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "font-semibold",
                        transaction.type === "add"
                          ? "text-emerald-500"
                          : "text-flame-red"
                      )}
                    >
                      {transaction.type === "add" ? "+" : "-"}
                      {transaction.quantity}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {transaction.previousStock}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-foreground">
                      {transaction.newStock}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {transaction.currentStock ?? 0}
                  </td>
                  <td className="p-4">
                    <div className="max-w-[200px]">
                      <p className="text-sm text-foreground truncate">
                        {transaction.reason || "-"}
                      </p>
                      {transaction.notes && (
                        <p
                          className="text-xs text-muted-foreground truncate"
                          title={transaction.notes}
                        >
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {getPerformedByName(transaction.performedBy)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-secondary/20">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedTransactions.length} of{" "}
          {transactions.length} transactions
        </p>
      </div>
    </div>
  );
}

