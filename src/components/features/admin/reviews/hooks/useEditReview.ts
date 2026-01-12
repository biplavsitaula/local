import { useState, useEffect } from "react";
import { toast } from "sonner";
import { reviewsService, Review } from "@/services/reviews.service";

interface UseEditReviewProps {
  review: Review | null;
  open: boolean;
  onSuccess?: () => void;
  onClose: () => void;
}

export function useEditReview({
  review,
  open,
  onSuccess,
  onClose,
}: UseEditReviewProps) {
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
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reviewChanged'));
      }
      
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      toast.error(errorMessage);
      console.error('Error updating review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return {
    loading,
    formData,
    errors,
    setFormData,
    handleSubmit,
    handleClose,
  };
}


