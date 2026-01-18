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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, AlertCircle, Gift, Tag, Truck, Clock, Zap, Star, 
  Heart, Percent, ShoppingBag, Award, Crown, Flame, Package,
  Sparkles, BadgePercent, PartyPopper, Ticket, Trophy,
  LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import { offersService, Offer } from "@/services/offers.service";

// Available icons for offers
const availableIcons: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "gift", icon: Gift, label: "Gift" },
  { name: "tag", icon: Tag, label: "Tag" },
  { name: "truck", icon: Truck, label: "Truck / Delivery" },
  { name: "clock", icon: Clock, label: "Clock / Time" },
  { name: "zap", icon: Zap, label: "Zap / Flash" },
  { name: "star", icon: Star, label: "Star" },
  { name: "heart", icon: Heart, label: "Heart" },
  { name: "percent", icon: Percent, label: "Percent" },
  { name: "shoppingbag", icon: ShoppingBag, label: "Shopping Bag" },
  { name: "award", icon: Award, label: "Award" },
  { name: "crown", icon: Crown, label: "Crown / Premium" },
  { name: "flame", icon: Flame, label: "Flame / Hot" },
  { name: "package", icon: Package, label: "Package" },
  { name: "sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "badgepercent", icon: BadgePercent, label: "Badge Percent" },
  { name: "partypopper", icon: PartyPopper, label: "Party / Celebration" },
  { name: "ticket", icon: Ticket, label: "Ticket / Coupon" },
  { name: "trophy", icon: Trophy, label: "Trophy / Winner" },
];

interface AddOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddOfferModal({
  open,
  onOpenChange,
  onSuccess,
}: AddOfferModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercent: "",
    discountAmount: "",
    startDate: "",
    endDate: "",
    isActive: true,
    imageUrl: "",
    category: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    color: "",
    icon: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        description: "",
        discountPercent: "",
        discountAmount: "",
        startDate: "",
        endDate: "",
        isActive: true,
        imageUrl: "",
        category: "",
        minPurchaseAmount: "",
        maxDiscountAmount: "",
        color: "",
        icon: "",
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Title is required
    if (!formData.title.trim()) {
      newErrors.title = "Title is required. Please enter an offer title.";
    }

    // At least one discount type is required
    // if (!formData.discountPercent && !formData.discountAmount) {
    //   newErrors.discountPercent = "Please provide either discount percent or discount amount.";
    //   newErrors.discountAmount = "Please provide either discount percent or discount amount.";
    // }

    // Cannot have both discount types
    if (formData.discountPercent && formData.discountAmount) {
      newErrors.discountPercent = "Please provide either discount percent or amount, not both.";
      newErrors.discountAmount = "Please provide either discount percent or amount, not both.";
    }

    // Validate discount percent
    if (formData.discountPercent) {
      const percent = parseFloat(formData.discountPercent);
      if (isNaN(percent)) {
        newErrors.discountPercent = "Please enter a valid number for discount percent.";
      } else if (percent < 0) {
        newErrors.discountPercent = "Discount percent cannot be negative.";
      } else if (percent > 100) {
        newErrors.discountPercent = "Discount percent cannot exceed 100%.";
      }
    }

    // Validate discount amount
    if (formData.discountAmount) {
      const amount = parseFloat(formData.discountAmount);
      if (isNaN(amount)) {
        newErrors.discountAmount = "Please enter a valid number for discount amount.";
      } else if (amount < 0) {
        newErrors.discountAmount = "Discount amount cannot be negative.";
      }
    }

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = "End date must be after the start date.";
      }
    }

    // Validate start date is not in the past (optional validation)
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        // Warning, not error - allow past dates if needed
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const payload: Partial<Offer> = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : undefined,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        isActive: formData.isActive,
        imageUrl: formData.imageUrl.trim() || undefined,
        category: formData.category.trim() || undefined,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        // Only send color and icon if they have values (exclude "none" placeholder)
        color: formData.color && formData.color.trim() ? formData.color.trim() : undefined,
        icon: formData.icon && formData.icon.trim() && formData.icon !== "none" ? formData.icon.trim() : undefined,
      };

      const response = await offersService.create(payload);

      if (response.success) {
        toast.success("Offer created successfully!");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message || "Failed to create offer");
      }
    } catch (error: any) {
      console.error("Error creating offer:", error);
      toast.error(error?.message || "Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-display font-bold text-primary-text">
            Create New Offer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                // Clear error when user starts typing
                if (errors.title) {
                  setErrors({ ...errors, title: "" });
                }
              }}
              placeholder="Enter offer title"
              className={`bg-background border-border text-base sm:text-base ${errors.title ? 'border-destructive' : ''}`}
            />
            {errors.title && (
              <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter offer description"
              rows={3}
              className="bg-background border-border text-base sm:text-base"
            />
          </div>

          {/* Discount Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountPercent" className="text-sm font-medium text-foreground">
                Discount Percent (%) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.discountPercent}
                onChange={(e) => {
                  setFormData({ ...formData, discountPercent: e.target.value, discountAmount: "" });
                  // Clear error when user starts typing
                  if (errors.discountPercent) {
                    setErrors({ ...errors, discountPercent: "" });
                  }
                }}
                placeholder="e.g., 20"
                className={`bg-background border-border text-base sm:text-base ${errors.discountPercent ? 'border-destructive' : ''}`}
              />
              {errors.discountPercent && (
                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.discountPercent}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountAmount" className="text-sm font-medium text-foreground">
                Discount Amount (Rs.) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="discountAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discountAmount}
                onChange={(e) => {
                  setFormData({ ...formData, discountAmount: e.target.value, discountPercent: "" });
                  // Clear error when user starts typing
                  if (errors.discountAmount) {
                    setErrors({ ...errors, discountAmount: "" });
                  }
                }}
                placeholder="e.g., 500"
                className={`bg-background border-border text-base sm:text-base ${errors.discountAmount ? 'border-destructive' : ''}`}
              />
              {errors.discountAmount && (
                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.discountAmount}
                </p>
              )}
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-foreground">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-background border-border text-base sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-foreground">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-background border-border text-base sm:text-base"
              />
              {errors.endDate && (
                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium text-foreground">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="Enter image URL"
              className="bg-background border-border text-base sm:text-base"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground">
              Category
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Whiskey, Vodka"
              className="bg-background border-border text-base sm:text-base"
            />
          </div>

          {/* Color and Icon Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color" className="text-sm font-medium text-foreground">
                Color
              </Label>
              <Input
                id="color"
                type="color"
                value={formData.color || "#000000"}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="bg-background border-border text-base sm:text-base h-10 cursor-pointer"
              />
              {formData.color && (
                <p className="text-xs text-muted-foreground">Selected: {formData.color}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Icon
              </Label>
              {/* Toggle between icon selection and image URL */}
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={!formData.icon?.startsWith('http') && !formData.icon?.startsWith('/') ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, icon: "" })}
                  className="text-xs"
                >
                  Select Icon
                </Button>
                <Button
                  type="button"
                  variant={formData.icon?.startsWith('http') || formData.icon?.startsWith('/') ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, icon: "https://" })}
                  className="text-xs"
                >
                  Custom Image URL
                </Button>
              </div>
              
              {/* Show icon selector or image URL input based on current value */}
              {formData.icon?.startsWith('http') || formData.icon?.startsWith('/') ? (
                <div className="space-y-2">
                  <Input
                    id="iconUrl"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="https://example.com/icon.png"
                    className="bg-background border-border text-base sm:text-base"
                  />
                  {formData.icon && formData.icon !== "https://" && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        <img 
                          src={formData.icon} 
                          alt="Icon preview" 
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                  )}
                </div>
              ) : (
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger className="bg-background border-border text-base sm:text-base">
                    <SelectValue placeholder="Select an icon">
                      {formData.icon && (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const selectedIcon = availableIcons.find(i => i.name === formData.icon);
                            if (selectedIcon) {
                              const IconComp = selectedIcon.icon;
                              return (
                                <>
                                  <IconComp className="h-4 w-4" />
                                  <span>{selectedIcon.label}</span>
                                </>
                              );
                            }
                            return formData.icon;
                          })()}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No icon</span>
                  </SelectItem>
                    {availableIcons.map((iconOption) => {
                      const IconComp = iconOption.icon;
                      return (
                        <SelectItem key={iconOption.name} value={iconOption.name}>
                          <div className="flex items-center gap-2">
                            <IconComp className="h-4 w-4" />
                            <span>{iconOption.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {formData.icon && !formData.icon.startsWith('http') && !formData.icon.startsWith('/') && (
                <p className="text-xs text-muted-foreground">
                  Selected: {formData.icon}
                </p>
              )}
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPurchaseAmount" className="text-sm font-medium text-foreground">
                Minimum Purchase Amount (Rs.)
              </Label>
              <Input
                id="minPurchaseAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.minPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                placeholder="e.g., 1000"
                className="bg-background border-border text-base sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDiscountAmount" className="text-sm font-medium text-foreground">
                Maximum Discount Amount (Rs.)
              </Label>
              <Input
                id="maxDiscountAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                placeholder="e.g., 2000"
                className="bg-background border-border text-base sm:text-base"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked as boolean })
              }
            />
            <Label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
              Active Offer
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
              type="submit"
              disabled={loading}
              className="bg-primary-gradient text-text-inverse text-base sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Offer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

