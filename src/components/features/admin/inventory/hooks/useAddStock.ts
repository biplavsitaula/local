import { useState, useEffect } from "react";
import { toast } from "sonner";
import { inventoryService } from "@/services/inventory.service";
import { productsService, Product } from "@/services/products.service";

export const commonReasons = [
  "New shipment arrived",
  "Supplier delivery",
  "Stock correction",
  "Returned goods",
  "Inventory audit adjustment",
  "Other",
];

interface UseAddStockProps {
  open: boolean;
  preselectedProductId?: string;
  onSuccess?: () => void;
  onClose: () => void;
}

export function useAddStock({
  open,
  preselectedProductId,
  onSuccess,
  onClose,
}: UseAddStockProps) {
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

      await inventoryService.addStock({
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
      onClose();

      // Dispatch event to notify other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inventoryChanged"));
        window.dispatchEvent(new CustomEvent("productChanged"));
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to add stock. Please try again.";
      toast.error(errorMessage);
      console.error("Add stock error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    loadingProducts,
    products: filteredProducts,
    filteredProducts,
    selectedProduct,
    formData,
    errors,
    searchTerm,
    setSearchTerm,
    setFormData,
    handleSubmit,
  };
}


