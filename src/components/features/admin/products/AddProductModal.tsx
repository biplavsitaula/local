"use client";
import { useState, useRef } from "react";
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
import { Plus, Upload, Link, Star, AlertCircle, Percent, Tag, X, Image as ImageIcon, Building2, Globe, Layers } from "lucide-react";
import { toast } from "sonner";
import { useProductMutation } from "@/hooks/useProductMutation";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SuccessMsgModal } from "@/components/SuccessMsgModal";
import { useCategories } from "@/hooks/useCategories";

interface AddProductModalProps {
  product?: Product | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddProductModal({ 
  product, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  onSuccess
}: AddProductModalProps = {}) {
  const { createProductMutation, updateProductMutation, loading, error } = useProductMutation();
  const { categories, loading: categoriesLoading } = useCategories();
  const [internalOpen, setInternalOpen] = useState(false);
  const isEditMode = !!product;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subCategory: "",
    brand: "",
    originType: "domestic",
    price: "",
    originalPrice: "",
    stock: "",
    imageUrl: "",
    itemLink: "",
    rating: "",
    discountPercent: "",
    tag: "",
    isRecommended: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (product && open) {
      // Cast product to any for accessing all possible fields
      const p = product as any;
      
      // Get category - API returns as 'category'
      const categoryValue = p.category || "";
      
      // Get discount - API returns as 'discountPercent'
      const discountValue = p.discountPercent ?? "";
      
      // Get origin type - API returns as 'originType', default to 'domestic' if not set
      const originValue = p.originType || "domestic";
      
      // Get sub category - API returns as 'subCategory'
      const subCategoryValue = p.subCategory || "";
      
      // Get image - API returns as 'imageUrl'
      const imageValue = p.imageUrl || product.image || "";
      
      // Get tag - API returns as 'tag'
      const tagValue = p.tag || "";
      
      // Get brand - API returns as 'brand'
      const brandValue = p.brand || "";
      
      // Get itemLink - API returns as 'itemLink'
      const itemLinkValue = p.itemLink || "";
      
      // Get isRecommended - API returns as 'isRecommended'
      const isRecommendedValue = p.isRecommended || false;
      
      setFormData({
        name: product.name || "",
        category: categoryValue.toLowerCase(),
        subCategory: subCategoryValue,
        brand: brandValue,
        originType: originValue,
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        stock: (product.stock ?? 0).toString(),
        imageUrl: imageValue,
        itemLink: itemLinkValue,
        rating: product.rating?.toString() || "",
        discountPercent: discountValue?.toString() || "",
        tag: tagValue,
        isRecommended: isRecommendedValue,
      });
      // Set image preview for edit mode
      if (imageValue) {
        setImagePreview(imageValue);
      }
    } else if (!product && open) {
      setFormData({
        name: "",
        category: "",
        subCategory: "",
        brand: "",
        originType: "domestic",
        price: "",
        originalPrice: "",
        stock: "",
        imageUrl: "",
        itemLink: "",
        rating: "",
        discountPercent: "",
        tag: "",
        isRecommended: false,
      });
      setImagePreview(null);
    }
  }, [product, open]);

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    
    try {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Failed to process image');
      setUploadingImage(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    // if (!formData.imageUrl.trim()) {
    //   newErrors.imageUrl = "Product image is required";
    // }
    if (
      formData.rating &&
      (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)
    ) {
      newErrors.rating = "Rating must be between 0 and 5";
    }
    if (
      formData.discountPercent &&
      (parseFloat(formData.discountPercent) < 0 || parseFloat(formData.discountPercent) > 100)
    ) {
      newErrors.discountPercent = "Discount must be between 0 and 100";
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
      // Map category to type (API uses 'type' instead of 'category')
      // Normalize category name to match API expectations
      let categoryToType = formData.category.toLowerCase();
      // Handle common variations
      if (categoryToType === 'whiskey' || categoryToType === 'whisky') {
        categoryToType = 'whiskey'; // API uses 'whiskey'
      }
      
      // Prepare the product data for API
      const productData = {
        name: formData.name,
        type: categoryToType,
        subCategory: formData.subCategory || "",
        originType: formData.originType || "domestic",
        price: parseFloat(formData.price),
        image: formData.imageUrl,
        brand: formData.brand || "",
        discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : 0,
        tag: formData.tag ? formData.tag.toUpperCase() : "",
        ...(formData.originalPrice && { originalPrice: parseFloat(formData.originalPrice) }),
        ...(formData.rating && { rating: parseFloat(formData.rating) }),
        ...(formData.stock && { stock: parseInt(formData.stock) }),
        ...(formData.itemLink && { itemLink: formData.itemLink }),
        ...(formData.isRecommended && { isRecommended: formData.isRecommended }),
      };

      let response;
      if (isEditMode && product) {
        // For update, use product.id (which should be the _id from API)
        const productId = typeof product.id === 'string' ? product.id : String(product.id);
        
        response = await updateProductMutation(productId, productData);
        // Show API response message in modal instead of toast
        setSuccessMessage(response?.message || "Product updated successfully!");
        setSuccessModalOpen(true);
      } else {
        response = await createProductMutation(productData);
        // Show API response message in modal instead of toast
        setSuccessMessage(response?.message || "Product added successfully!");
        setSuccessModalOpen(true);
      }
      
      // Call onSuccess callback to refresh the product list
      if (onSuccess) {
        onSuccess();
      }
      
      // Dispatch custom event to notify other components (like Products page) to refresh
      // This works for both create and update operations
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('productChanged'));
      }
      
      setOpen(false);
      if (!isEditMode) {
        setFormData({
          name: "",
          category: "",
          subCategory: "",
          brand: "",
          originType: "domestic",
          price: "",
          originalPrice: "",
          stock: "",
          imageUrl: "",
          itemLink: "",
          rating: "",
          discountPercent: "",
          tag: "",
          isRecommended: false,
        });
        setImagePreview(null);
      }
      setErrors({});
    } catch (err: any) {
      // Extract API response message if available
      // Try multiple possible error structures
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.response?.message || 
                          err?.message || 
                          err?.toString() ||
                          'Failed to save product';
      toast.error(errorMessage);
      console.error('Error saving product:', err);
    }
  };
  console.log(formData.tag,'formData.tagformData.tag')

  const handleClose = () => {
    setOpen(false);
    setErrors({});
    if (!isEditMode) {
      setImagePreview(null);
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
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

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-foreground">
              Brand{" "}
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                placeholder="e.g., Johnnie Walker, Grey Goose"
                className="bg-secondary/50 border-border pl-10"
              />
            </div>
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
                disabled={categoriesLoading}
              >
                <SelectTrigger
                  className={cn(
                    "bg-secondary/50 border-border",
                    errors.category && "border-flame-red"
                  )}
                >
                  <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
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
              <Label htmlFor="subCategory" className="text-foreground">
                Sub Category{" "}
                <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="subCategory"
                  value={formData.subCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategory: e.target.value })
                  }
                  placeholder="e.g., Red Wine, Single Malt"
                  className="bg-secondary/50 border-border pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originType" className="text-foreground">
                Origin Type
              </Label>
              <Select
                value={formData.originType}
                onValueChange={(value) =>
                  setFormData({ ...formData, originType: value })
                }
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select origin" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domestic">Domestic</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default: Domestic
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">
                Price (Rs) <span className="text-flame-red">*</span>
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

          <div className="space-y-2">
            <Label htmlFor="originalPrice" className="text-foreground">
              Original Price (Rs){" "}
              <span className="text-muted-foreground text-xs">
                (Optional - for showing strikethrough price)
              </span>
            </Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData({ ...formData, originalPrice: e.target.value })
              }
              placeholder="0.00"
              className="bg-secondary/50 border-border"
            />
            <p className="text-xs text-muted-foreground">
              Set higher than price to show discount (e.g., Original: Rs. 1000, Price: Rs. 800 = 20% off)
            </p>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountPercent" className="text-foreground">
                Discount Percent{" "}
                <span className="text-muted-foreground text-xs">
                  (Optional)
                </span>
              </Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-flame-orange" />
                <Input
                  id="discountPercent"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPercent: e.target.value })
                  }
                  placeholder="0"
                  className={cn(
                    "bg-secondary/50 border-border pl-10",
                    errors.discountPercent && "border-flame-red"
                  )}
                />
              </div>
              {errors.discountPercent && (
                <p className="text-xs text-flame-red flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.discountPercent}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag" className="text-foreground">
                Product Tag{" "}
                <span className="text-muted-foreground text-xs">
                  (Optional)
                </span>
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-flame-yellow" />
                <Input
                  id="tag"
                  type="text"
                  value={formData.tag}
                  onChange={(e) =>
                    setFormData({ ...formData, tag: e.target.value })
                  }
                  placeholder="e.g., NEW, BEST, TOP"
                  className="bg-secondary/50 border-border pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                e.g., NEW, BEST, TOP, HOT
              </p>
            </div>
          </div>

          {/* <div className="space-y-2">
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
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-foreground">
              Product Image
            </Label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative w-full h-32 rounded-lg border border-border overflow-hidden bg-secondary/30">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="w-full h-full object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Upload Options */}
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={imagePreview?.startsWith('data:') ? '' : formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setImagePreview(e.target.value || null);
                }}
                placeholder="Enter image URL or upload file"
                className={cn(
                  "bg-secondary/50 border-border flex-1",
                  errors.imageUrl && "border-flame-red"
                )}
                disabled={imagePreview?.startsWith('data:')}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                title="Upload image from computer"
              >
                {uploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>

            {errors.imageUrl && (
              <p className="text-xs text-flame-red flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.imageUrl}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Upload an image (JPEG, PNG, GIF, WebP - max 5MB) or enter a URL
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
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              ) : (
                isEditMode ? "Save Changes" : "Add Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
  );

  if (isEditMode) {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          {dialogContent}
        </Dialog>
        <SuccessMsgModal
          open={successModalOpen}
          onOpenChange={setSuccessModalOpen}
          message={successMessage}
          title="Success"
        />
      </>
    );
  }

  return (
    <>
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
      <SuccessMsgModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        message={successMessage}
        title="Success"
      />
    </>
  );
}
