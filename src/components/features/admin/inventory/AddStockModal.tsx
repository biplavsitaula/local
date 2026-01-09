"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inventoryService } from "@/services/inventory.service";
import { productsService, Product } from "@/services/products.service";
import { cn } from "@/lib/utils";

interface AddStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedProductId?: string;
}

const commonReasons = [
  "New shipment arrived",
  "Supplier delivery",
  "Stock correction",
  "Returned goods",
  "Inventory audit adjustment",
  "Other",
];

export function AddStockModal({
  open,
  onOpenChange,
  onSuccess,
  preselectedProductId,
}: AddStockModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    productId: preselectedProductId || "",
    quantity: "",
    reason: "",
    customReason: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch products for selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await productsService.getAll({ limit: 500 });
        setProducts(response.data || []);
      } catch (error) {
        console.error("Failed to load products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    if (open) {
      fetchProducts();
    }
  }, [open]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        productId: preselectedProductId || "",
        quantity: "",
        reason: "",
        customReason: "",
        notes: "",
      });
      setErrors({});
      setSearchTerm("");
    }
  }, [open, preselectedProductId]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProduct = products.find(
    (p) => (p._id || p.id) === formData.productId
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = "Please select a product";
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity (greater than 0)";
    }
    if (!formData.reason) {
      newErrors.reason = "Please select a reason";
    }
    if (formData.reason === "Other" && !formData.customReason.trim()) {
      newErrors.customReason = "Please specify the reason";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const reason =
        formData.reason === "Other" ? formData.customReason : formData.reason;

      const response = await inventoryService.addStock({
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        reason,
        notes: formData.notes || undefined,
      });

      toast.success(
        `Successfully added ${formData.quantity} units to ${
          selectedProduct?.name || "product"
        }`
      );

      // Notify parent and close modal
      onSuccess?.();
      onOpenChange(false);

      // Dispatch event to notify other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inventoryChanged"));
        window.dispatchEvent(new CustomEvent("productChanged"));
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to add stock. Please try again.";
      toast.error(errorMessage);
      console.error("Add stock error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-emerald-500 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Stock (Bulk)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product" className="text-foreground">
              Product <span className="text-flame-red">*</span>
            </Label>

            {loadingProducts ? (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading products...
                </span>
              </div>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-secondary/50 border-border mb-2"
                />
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "bg-secondary/50 border-border",
                      errors.productId && "border-flame-red"
                    )}
                  >
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {filteredProducts.map((product) => (
                      <SelectItem
                        key={product._id || product.id}
                        value={product._id || product.id || ""}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{product.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            (Stock: {product.stock ?? 0})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            {errors.productId && (
              <p className="text-xs text-flame-red flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.productId}
              </p>
            )}
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-emerald-500">
                  {selectedProduct.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Current Stock:{" "}
                <span className="font-semibold">
                  {selectedProduct.stock ?? 0}
                </span>{" "}
                units
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-foreground">
              Quantity to Add <span className="text-flame-red">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="e.g., 1200"
              className={cn(
                "bg-secondary/50 border-border",
                errors.quantity && "border-flame-red"
              )}
            />
            {errors.quantity && (
              <p className="text-xs text-flame-red flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.quantity}
              </p>
            )}
            {formData.quantity && selectedProduct && (
              <p className="text-xs text-muted-foreground">
                New stock will be:{" "}
                <span className="font-semibold text-emerald-500">
                  {(selectedProduct.stock ?? 0) + parseInt(formData.quantity)}
                </span>{" "}
                units
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground">
              Reason <span className="text-flame-red">*</span>
            </Label>
            <Select
              value={formData.reason}
              onValueChange={(value) =>
                setFormData({ ...formData, reason: value })
              }
            >
              <SelectTrigger
                className={cn(
                  "bg-secondary/50 border-border",
                  errors.reason && "border-flame-red"
                )}
              >
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {commonReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-xs text-flame-red flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.reason}
              </p>
            )}
          </div>

          {/* Custom Reason (if Other selected) */}
          {formData.reason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="customReason" className="text-foreground">
                Specify Reason <span className="text-flame-red">*</span>
              </Label>
              <Input
                id="customReason"
                value={formData.customReason}
                onChange={(e) =>
                  setFormData({ ...formData, customReason: e.target.value })
                }
                placeholder="Enter the reason"
                className={cn(
                  "bg-secondary/50 border-border",
                  errors.customReason && "border-flame-red"
                )}
              />
              {errors.customReason && (
                <p className="text-xs text-flame-red flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.customReason}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes{" "}
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g., Supplier: ABC Imports, Invoice #12345"
              className="bg-secondary/50 border-border min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Stock...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

