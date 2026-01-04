
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
import { Star, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reviewsService, Review } from "@/services/reviews.service";
import { cn } from "@/lib/utils";


interface EditReviewModalProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 review: Review | null;
 onSuccess?: () => void;
}


export function EditReviewModal({
 open,
 onOpenChange,
 review,
 onSuccess,
}: EditReviewModalProps) {
 const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
   customerName: "",
   rating: "",
   comment: "",
 });
 const [errors, setErrors] = useState<Record<string, string>>({});


 useEffect(() => {
   if (review && open) {
     setFormData({
       customerName: review.customerName || "",
       rating: review.rating?.toString() || "",
       comment: review.comment || "",
     });
     setErrors({});
   }
 }, [review, open]);


 const validateForm = () => {
   const newErrors: Record<string, string> = {};


   if (!formData.customerName.trim()) {
     newErrors.customerName = "Customer name is required";
   }
   if (!formData.rating || parseFloat(formData.rating) < 1 || parseFloat(formData.rating) > 5) {
     newErrors.rating = "Rating must be between 1 and 5";
   }


   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };


 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();


   if (!validateForm() || !review) {
     toast.error("Please fill in all required fields");
     return;
   }


   try {
     setLoading(true);
    
     const reviewId = review._id || review.id;
     if (!reviewId) {
       throw new Error("Review ID not found");
     }


     const updateData = {
       customerName: formData.customerName,
       rating: parseFloat(formData.rating),
       comment: formData.comment || undefined,
     };


     await reviewsService.update(reviewId, updateData);
     toast.success("Review updated successfully!");
    
     if (onSuccess) {
       onSuccess();
     }
    
     // Dispatch custom event to notify other components to refresh
     if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('reviewChanged'));
     }
    
     onOpenChange(false);
   } catch (err) {
     const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
     toast.error(errorMessage);
     console.error('Error updating review:', err);
   } finally {
     setLoading(false);
   }
 };


 const handleClose = () => {
   onOpenChange(false);
   setErrors({});
 };


 // Star rating component
 const StarRating = () => {
   const rating = parseFloat(formData.rating) || 0;
   return (
     <div className="flex items-center gap-1">
       {[1, 2, 3, 4, 5].map((star) => (
         <button
           key={star}
           type="button"
           onClick={() => setFormData({ ...formData, rating: star.toString() })}
           className="focus:outline-none transition-transform hover:scale-110"
         >
           <Star
             className={cn(
               "h-6 w-6 transition-colors",
               star <= rating
                 ? "text-yellow-400 fill-yellow-400"
                 : "text-muted-foreground"
             )}
           />
         </button>
       ))}
     </div>
   );
 };


 return (
   <Dialog open={open} onOpenChange={onOpenChange}>
     <DialogContent className="sm:max-w-[500px] bg-card border-border">
       <DialogHeader>
         <DialogTitle className="text-xl font-display text-flame-orange">
           Edit Review
         </DialogTitle>
       </DialogHeader>
       <form onSubmit={handleSubmit} className="space-y-4 mt-4">
         {/* Product Info (Read-only) */}
         {review?.productName && (
           <div className="space-y-2">
             <Label className="text-foreground">Product</Label>
             <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md">
               {review.productName}
             </p>
           </div>
         )}


         <div className="space-y-2">
           <Label htmlFor="customerName" className="text-foreground">
             Customer Name <span className="text-flame-red">*</span>
           </Label>
           <Input
             id="customerName"
             value={formData.customerName}
             onChange={(e) =>
               setFormData({ ...formData, customerName: e.target.value })
             }
             placeholder="Customer name"
             className={cn(
               "bg-secondary/50 border-border",
               errors.customerName && "border-flame-red"
             )}
           />
           {errors.customerName && (
             <p className="text-xs text-flame-red flex items-center gap-1">
               <AlertCircle className="h-3 w-3" /> {errors.customerName}
             </p>
           )}
         </div>


         <div className="space-y-2">
           <Label className="text-foreground">
             Rating <span className="text-flame-red">*</span>
           </Label>
           <div className="flex items-center gap-4">
             <StarRating />
             <span className="text-sm text-muted-foreground">
               {formData.rating ? `${formData.rating} / 5` : "Select rating"}
             </span>
           </div>
           {errors.rating && (
             <p className="text-xs text-flame-red flex items-center gap-1">
               <AlertCircle className="h-3 w-3" /> {errors.rating}
             </p>
           )}
         </div>


         <div className="space-y-2">
           <Label htmlFor="comment" className="text-foreground">
             Comment{" "}
             <span className="text-muted-foreground text-xs">(Optional)</span>
           </Label>
           <textarea
             id="comment"
             value={formData.comment}
             onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
               setFormData({ ...formData, comment: e.target.value })
             }
             placeholder="Review comment..."
             className="flex w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
           />
         </div>


         <div className="flex gap-3 pt-4">
           <Button
             type="button"
             variant="outline"
             className="flex-1"
             onClick={handleClose}
             disabled={loading}
           >
             Cancel
           </Button>
           <Button
             type="submit"
             variant="outline"
             className="flex-1"
             disabled={loading}
           >
             {loading ? (
               <>
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                 Saving...
               </>
             ) : (
               "Save Changes"
             )}
           </Button>
         </div>
       </form>
     </DialogContent>
   </Dialog>
 );
}
