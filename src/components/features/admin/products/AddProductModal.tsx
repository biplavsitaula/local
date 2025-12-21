"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, Link, Star, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useProductStore } from "@/hooks/useProductStore";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const categories = [
  "Whiskey",
  "Vodka",
  "Cognac",
  "Tequila",
  "Gin",
  "Rum",
  "Champagne",
  "Wine",
  "Beer",
];

interface AddProductModalProps {
  product?: Product | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddProductModal({ 
  product, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: AddProductModalProps = {}) {
  const { addProduct, updateProduct } = useProductStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const isEditMode = !!product;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    imageUrl: "",
    itemLink: "",
    rating: "",
    isRecommended: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price?.toString() || "",
        stock: (product.stock ?? 0).toString(),
        imageUrl: product.image || "",
        itemLink: (product as any).itemLink || "",
        rating: product.rating?.toString() || "",
        isRecommended: (product as any).isRecommended || false,
      });
    } else if (!product && open) {
      setFormData({
        name: "",
        category: "",
        price: "",
        stock: "",
        imageUrl: "",
        itemLink: "",
        rating: "",
        isRecommended: false,
      });
    }
  }, [product, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "Product image is required";
    }
    if (
      formData.rating &&
      (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)
    ) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const stock = parseInt(formData.stock);
    let status: "in-stock" | "out-of-stock" | "low-stock" = "in-stock";
    if (stock === 0) status = "out-of-stock";
    else if (stock <= 10) status = "low-stock";

    if (isEditMode && product) {
      const productId = typeof product.id === 'string' 
        ? parseInt(product.id) 
        : (product.id || 0);
      
      updateProduct(productId, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock,
        image: formData.imageUrl,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        ...(formData.itemLink && { itemLink: formData.itemLink }),
        isRecommended: formData.isRecommended,
      } as any);

      toast.success("Product updated successfully!");
    } else {
      addProduct({
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock,
        image: formData.imageUrl,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        reviews: 0,
        sales: 0,
        status,
        itemLink: formData.itemLink,
        isRecommended: formData.isRecommended,
      } as any);

      toast.success("Product added successfully!");
    }
    
    setOpen(false);
    if (!isEditMode) {
      setFormData({
        name: "",
        category: "",
        price: "",
        stock: "",
        imageUrl: "",
        itemLink: "",
        rating: "",
        isRecommended: false,
      });
    }
    setErrors({});
  };

  const handleClose = () => {
    setOpen(false);
    setErrors({});
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px] bg-card border-border">
      <DialogHeader>
        <DialogTitle className="text-xl font-display text-flame-orange">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </DialogTitle>
      </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Product Name <span className="text-flame-red">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Johnnie Walker Blue Label"
              className={cn(
                "bg-secondary/50 border-border",
                errors.name && "border-flame-red"
              )}
            />
            {errors.name && (
              <p className="text-xs text-flame-red flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category <span className="text-flame-red">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger
                  className={cn(
                    "bg-secondary/50 border-border",
                    errors.category && "border-flame-red"
                  )}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-flame-red flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.category}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">
                Price ($) <span className="text-flame-red">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                className={cn(
                  "bg-secondary/50 border-border",
                  errors.price && "border-flame-red"
                )}
              />
              {errors.price && (
                <p className="text-xs text-flame-red flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.price}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-foreground">
                Initial Stock <span className="text-flame-red">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="0"
                className={cn(
                  "bg-secondary/50 border-border",
                  errors.stock && "border-flame-red"
                )}
              />
              {errors.stock && (
                <p className="text-xs text-flame-red flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.stock}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-foreground">
                Rating (0-5){" "}
                <span className="text-muted-foreground text-xs">
                  (Optional)
                </span>
              </Label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-flame-yellow" />
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  placeholder="0.0"
                  className={cn(
                    "bg-secondary/50 border-border pl-10",
                    errors.rating && "border-flame-red"
                  )}
                />
              </div>
              {errors.rating && (
                <p className="text-xs text-flame-red flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.rating}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-foreground">
              Image URL <span className="text-flame-red">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className={cn(
                  "bg-secondary/50 border-border flex-1",
                  errors.imageUrl && "border-flame-red"
                )}
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {errors.imageUrl && (
              <p className="text-xs text-flame-red flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.imageUrl}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Image is mandatory for product listing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemLink" className="text-foreground">
              Product Link{" "}
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="itemLink"
                value={formData.itemLink}
                onChange={(e) =>
                  setFormData({ ...formData, itemLink: e.target.value })
                }
                placeholder="https://supplier.com/product"
                className="bg-secondary/50 border-border pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recommended"
              checked={formData.isRecommended}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isRecommended: checked as boolean })
              }
            />
            <Label
              htmlFor="recommended"
              className="text-foreground cursor-pointer"
            >
              Mark as Recommended Product
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="outline" className="flex-1">
              {isEditMode ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
  );

  if (isEditMode) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add Product
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
