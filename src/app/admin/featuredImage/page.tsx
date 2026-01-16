"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
  ExternalLink,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  featureImagesService,
  FeatureImage,
} from "@/services/feature-images.service";
import Image from "next/image";
import { toast } from "sonner";

// Add/Edit Modal Component
function FeatureImageModal({
  open,
  onClose,
  onSave,
  featureImage,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<FeatureImage>) => void;
  featureImage: FeatureImage | null;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    imageUrl: "",
    name: "",
    description: "",
    tag: "",
    // ctaLink: "",
    isActive: true,
    order: 0,
  });
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (featureImage) {
      setFormData({
        imageUrl: featureImage.imageUrl || "",
        name: featureImage.name || "",
        description: featureImage.description || "",
        tag: featureImage.tag || "",
        // ctaLink: featureImage.ctaLink || "",
        isActive: featureImage.isActive ?? true,
        order: featureImage.order || 0,
      });
    } else {
      setFormData({
        imageUrl: "",
        name: "",
        description: "",
        tag: "",
        // ctaLink: "",
        isActive: true,
        order: 0,
      });
    }
    setImageError(false);
  }, [featureImage, open]);

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
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
        setImageError(false);
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
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-2xl">
          <h2 className="text-xl font-bold text-foreground">
            {featureImage ? "Edit Featured Image" : "Add Featured Image"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {featureImage
              ? "Update the details of this featured image"
              : "Create a new banner for the homepage carousel"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-6"
        >
          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Image <span className="text-destructive">*</span>
            </label>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Image Preview or Upload Area */}
            {formData.imageUrl ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border bg-secondary/30 group">
                {!imageError ? (
                  <>
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        title="Change image"
                      >
                        <Upload className="w-5 h-5 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Invalid image URL</p>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="mt-2 text-xs text-destructive hover:underline"
                      >
                        Remove and try again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => !uploadingImage && fileInputRef.current?.click()}
                className={`w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  uploadingImage
                    ? "border-flame-orange/50 bg-flame-orange/5"
                    : "border-border hover:border-flame-orange/50 hover:bg-secondary/30"
                }`}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-8 h-8 text-flame-orange animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-secondary/50">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Click to upload image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, GIF or WebP (max 5MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Or enter URL manually */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or enter URL</span>
              </div>
            </div>

            <Input
              value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
              onChange={(e) => {
                setFormData({ ...formData, imageUrl: e.target.value });
                setImageError(false);
              }}
              placeholder="https://example.com/banner.jpg"
              className="bg-secondary/50 border-border"
              disabled={formData.imageUrl.startsWith('data:')}
            />
            {formData.imageUrl.startsWith('data:') && (
              <p className="text-xs text-muted-foreground">
                Image uploaded from computer. Clear to enter URL instead.
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Premium Whiskey Collection"
              className="bg-secondary/50 border-border"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Discover the finest aged spirits from around the world"
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Tag & CTA Link */}
          {/* <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tag (Button Text)
              </label>
              <Input
                value={formData.tag}
                onChange={(e) =>
                  setFormData({ ...formData, tag: e.target.value })
                }
                placeholder="Shop Now"
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                CTA Link
              </label>
              <Input
                value={formData.ctaLink}
                onChange={(e) =>
                  setFormData({ ...formData, ctaLink: e.target.value })
                }
                placeholder="/products?category=whiskey"
                className="bg-secondary/50 border-border"
              />
            </div>
          </div> */}

          {/* Order & Active Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Display Order
              </label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
                className="bg-secondary/50 border-border"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <div className="flex items-center gap-3 h-10">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? "bg-success" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-foreground">
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploadingImage || !formData.imageUrl || !formData.name}
              className="bg-flame-orange hover:bg-flame-orange/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : featureImage ? (
                "Update Image"
              ) : (
                "Add Image"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteModal({
  open,
  onClose,
  onConfirm,
  featureImage,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  featureImage: FeatureImage | null;
  isLoading: boolean;
}) {
  if (!open || !featureImage) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-destructive/10">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Delete Image</h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-secondary/30 rounded-lg">
          <p className="text-sm text-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold">&quot;{featureImage.name}&quot;</span>?
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedImagesPage() {
  const [featureImages, setFeatureImages] = useState<FeatureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FeatureImage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFeatureImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await featureImagesService.getAll();
      setFeatureImages(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load feature images");
      setFeatureImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatureImages();
  }, [fetchFeatureImages]);

  // Filter images by search
  const filteredImages = featureImages.filter(
    (img) =>
      img.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle save (create/update)
  const handleSave = async (data: Partial<FeatureImage>) => {
    try {
      setIsSaving(true);
      if (selectedImage) {
        await featureImagesService.update(
          selectedImage._id || selectedImage.id || "",
          data
        );
        toast.success("Featured image updated successfully");
      } else {
        await featureImagesService.create(data as any);
        toast.success("Featured image created successfully");
      }
      setEditModalOpen(false);
      setSelectedImage(null);
      fetchFeatureImages();
    } catch (err: any) {
      toast.error(err.message || "Failed to save feature image");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedImage) return;
    try {
      setIsSaving(true);
      await featureImagesService.delete(
        selectedImage._id || selectedImage.id || ""
      );
      toast.success("Featured image deleted successfully");
      setDeleteModalOpen(false);
      setSelectedImage(null);
      fetchFeatureImages();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete feature image");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (image: FeatureImage) => {
    try {
      await featureImagesService.update(image._id || image.id || "", {
        isActive: !image.isActive,
      });
      toast.success(
        image.isActive ? "Image hidden from carousel" : "Image shown in carousel"
      );
      fetchFeatureImages();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
          <p className="text-muted-foreground">Loading featured images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">
              Error loading featured images
            </p>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchFeatureImages} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Featured Images
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage homepage carousel banners ({featureImages.length} total)
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedImage(null);
            setEditModalOpen(true);
          }}
          className="bg-flame-orange hover:bg-flame-orange/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </Button>
      </div>

      {/* Search */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or subtitle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>
      </div>

      {/* Images Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-0 animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        {filteredImages.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No images found" : "No featured images yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Add your first banner image to get started"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => {
                  setSelectedImage(null);
                  setEditModalOpen(true);
                }}
                className="bg-flame-orange hover:bg-flame-orange/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Image
              </Button>
            )}
          </div>
        ) : (
          filteredImages
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((image, index) => (
              <div
                key={image._id || image.id || index}
                className={`glass-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  image.isActive
                    ? "border-border/50"
                    : "border-warning/30 opacity-70"
                }`}
              >
                {/* Image Preview */}
                <div className="relative h-40 bg-secondary/30">
                  <Image
                    src={image.imageUrl}
                    alt={image.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/600x400/1a1a2e/ffffff?text=Image+Not+Found";
                    }}
                  />
                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                      image.isActive
                        ? "bg-success/20 text-success"
                        : "bg-warning/20 text-warning"
                    }`}
                  >
                    {image.isActive ? "Active" : "Inactive"}
                  </div>
                  {/* Order Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                    #{(image.order || 0) + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate">
                    {image.name}
                  </h3>
                  {image.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                  {/* {image.tag && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-flame-orange/20 text-flame-orange rounded-full">
                        {image.tag}
                      </span>
                      {image.ctaLink && (
                        <a
                          href={image.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )} */}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(image)}
                      className="flex-1 gap-2"
                    >
                      {image.isActive ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Show
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(image);
                        setEditModalOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(image);
                        setDeleteModalOpen(true);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <FeatureImageModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedImage(null);
        }}
        onSave={handleSave}
        featureImage={selectedImage}
        isLoading={isSaving}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedImage(null);
        }}
        onConfirm={handleDelete}
        featureImage={selectedImage}
        isLoading={isSaving}
      />
    </div>
  );
}




