"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { offersService, Offer } from "@/services/offers.service";

interface DeleteOfferModalProps {
  offer: Offer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteOfferModal({
  offer,
  open,
  onOpenChange,
  onSuccess,
}: DeleteOfferModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const offerId = offer._id || offer.id;
      if (!offerId) {
        toast.error("Invalid offer ID");
        return;
      }

      const response = await offersService.delete(offerId);

      if (response.success) {
        toast.success("Offer deleted successfully!");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message || "Failed to delete offer");
      }
    } catch (error: any) {
      console.error("Error deleting offer:", error);
      toast.error(error?.message || "Failed to delete offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-display font-bold text-primary-text flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            Delete Offer
          </DialogTitle>
          <DialogDescription className="text-base sm:text-sm text-muted-foreground pt-2">
            Are you sure you want to delete this offer? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <p className="text-base sm:text-sm font-semibold text-foreground mb-2">
              {offer.title}
            </p>
            {offer.description && (
              <p className="text-sm sm:text-xs text-muted-foreground line-clamp-2">
                {offer.description}
              </p>
            )}
            {offer.discountPercent && (
              <p className="text-sm sm:text-xs text-muted-foreground mt-1">
                Discount: {offer.discountPercent}%
              </p>
            )}
            {offer.discountAmount && (
              <p className="text-sm sm:text-xs text-muted-foreground mt-1">
                Discount: Rs. {offer.discountAmount.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-base sm:text-base"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="text-base sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Offer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



