"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useProductMutation } from "@/hooks/useProductMutation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm?: () => void;
}

export function DeleteProductModal({
  open,
  onOpenChange,
  product,
  onConfirm,
}: DeleteProductModalProps) {
  const { deleteProductMutation, loading } = useProductMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!product) return;

    try {
      setIsDeleting(true);
      
      // Get product ID (should be _id from API)
      const productId = typeof product.id === 'string' ? product.id : String(product.id);
      
      await deleteProductMutation(productId);
      toast.success("Product deleted successfully!");
      
      // Call onConfirm callback if provided
      if (onConfirm) {
        onConfirm();
      }
      
      // Dispatch custom event to notify other components to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('productChanged'));
      }
      
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      toast.error(errorMessage);
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">
            Delete Product
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{product?.name}"
            </span>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={loading || isDeleting}
          >
            {loading || isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


















