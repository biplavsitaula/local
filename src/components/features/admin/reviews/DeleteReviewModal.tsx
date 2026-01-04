"use client";
import { useState } from "react";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { reviewsService, Review } from "@/services/reviews.service";


interface DeleteReviewModalProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 review: Review | null;
 onSuccess?: () => void;
}


export function DeleteReviewModal({
 open,
 onOpenChange,
 review,
 onSuccess,
}: DeleteReviewModalProps) {
 const [loading, setLoading] = useState(false);


 const handleDelete = async () => {
   if (!review) return;


   try {
     setLoading(true);
    
     const reviewId = review._id || review.id;
     if (!reviewId) {
       throw new Error("Review ID not found");
     }


     await reviewsService.delete(reviewId);
     toast.success("Review deleted successfully!");
    
     if (onSuccess) {
       onSuccess();
     }
    
     // Dispatch custom event to notify other components to refresh
     if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('reviewChanged'));
     }
    
     onOpenChange(false);
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
     toast.error(errorMessage);
     console.error('Error deleting review:', error);
   } finally {
     setLoading(false);
   }
 };


 return (
   <Dialog open={open} onOpenChange={onOpenChange}>
     <DialogContent className="sm:max-w-[425px] bg-card border-border">
       <DialogHeader>
         <DialogTitle className="text-xl font-display text-foreground">
           Delete Review
         </DialogTitle>
       </DialogHeader>
       <div className="mt-4 space-y-4">
         <p className="text-sm text-muted-foreground">
           Are you sure you want to delete this review? This action cannot be undone.
         </p>
        
         {review && (
           <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium text-foreground">
                 {review.customerName}
               </span>
               <div className="flex items-center gap-1">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <Star
                     key={star}
                     className={`h-4 w-4 ${
                       star <= (review.rating || 0)
                         ? "text-yellow-400 fill-yellow-400"
                         : "text-muted-foreground"
                     }`}
                   />
                 ))}
               </div>
             </div>
             {review.comment && (
               <p className="text-xs text-muted-foreground line-clamp-2">
                 "{review.comment}"
               </p>
             )}
             {review.productName && (
               <p className="text-xs text-muted-foreground">
                 Product: {review.productName}
               </p>
             )}
           </div>
         )}
       </div>
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
           type="button"
           variant="destructive"
           className="flex-1 bg-destructive hover:bg-destructive/90"
           onClick={handleDelete}
           disabled={loading}
         >
           {loading ? (
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





