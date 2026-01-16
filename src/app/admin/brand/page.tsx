"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  Upload,
  X,
  Package,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { brandService, Brand } from "@/services/brand.service";
import Image from "next/image";
import { toast } from "sonner";

// Add/Edit Modal Component
function BrandModal({
  open,
  onClose,
  onSave,
  brand,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Brand>) => void;
  brand: Brand | null;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    description: "",
    isActive: true,
  });
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        logo: brand.logo || "",
        description: brand.description || "",
        isActive: brand.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        logo: "",
        description: "",
        isActive: true,
      });
    }
    setImageError(false);
  }, [brand, open]);

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

    // Validate file size (max 2MB for logos)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Logo size must be less than 2MB');
      return;
    }

    setUploadingImage(true);
    
    try {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, logo: base64String }));
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
    setFormData(prev => ({ ...prev, logo: '' }));
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-2xl">
          <h2 className="text-xl font-bold text-foreground">
            {brand ? "Edit Brand" : "Add Brand"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {brand
              ? "Update the details of this brand"
              : "Create a new brand"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-5"
        >
          {/* Brand Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Jack Daniel's"
              required
              className="bg-background"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Brand Logo
            </label>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="hidden"
            />

            {/* Upload Area */}
            {!formData.logo ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-flame-orange/50 hover:bg-flame-orange/5 transition-all"
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-flame-orange" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, GIF, WebP (max 2MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <div className="aspect-square max-w-[200px] mx-auto relative bg-muted/50 p-4">
                  {!imageError ? (
                    <Image
                      src={formData.logo}
                      alt="Logo preview"
                      fill
                      className="object-contain"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Building2 className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* URL Input as fallback */}
            <div className="relative">
              <Input
                value={formData.logo.startsWith('data:') ? '' : formData.logo}
                onChange={(e) => {
                  setFormData({ ...formData, logo: e.target.value });
                  setImageError(false);
                }}
                placeholder="Or enter logo URL"
                className="bg-background"
                disabled={formData.logo.startsWith('data:')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the brand"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-flame-orange/50 resize-none"
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Active Status</p>
              <p className="text-sm text-muted-foreground">
                Show this brand on the website
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.isActive ? "bg-green-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.isActive ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-flame-orange hover:bg-flame-orange/90"
              disabled={isLoading || !formData.name}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : brand ? (
                "Update Brand"
              ) : (
                "Create Brand"
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
  brandName,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  brandName: string;
  isLoading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Delete Brand</h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone
            </p>
          </div>
        </div>
        <p className="text-foreground mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">&quot;{brandName}&quot;</span>?
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
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

export default function BrandManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = await brandService.getAll();
      setBrands(response.data || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Filter brands based on search
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle save (create or update)
  const handleSave = async (data: Partial<Brand>) => {
    try {
      setSaving(true);
      console.log("Saving brand:", data, "selectedBrand:", selectedBrand);
      
      if (selectedBrand) {
        // Update existing brand
        const brandId = selectedBrand._id || selectedBrand.id;
        console.log("Updating brand with ID:", brandId);
        if (brandId) {
          const response = await brandService.update(brandId, data);
          console.log("Update response:", response);
          // Update local state directly instead of re-fetching
          if (response.data) {
            setBrands(prev => prev.map(b => 
              (b._id === brandId || b.id === brandId) ? { ...b, ...response.data } : b
            ));
          }
          toast.success("Brand updated successfully");
        } else {
          toast.error("Brand ID not found");
          return;
        }
      } else {
        // Create new brand
        console.log("Creating new brand:", data);
        const response = await brandService.create(data);
        console.log("Create response:", response);
        // Add to local state directly instead of re-fetching
        if (response.data) {
          setBrands(prev => [...prev, response.data]);
        }
        toast.success("Brand created successfully");
      }
      setModalOpen(false);
      setSelectedBrand(null);
    } catch (error: any) {
      console.error("Failed to save brand:", error);
      toast.error(error?.message || "Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedBrand) {
      toast.error("No brand selected");
      return;
    }
    try {
      setDeleting(true);
      const brandId = selectedBrand._id || selectedBrand.id;
      console.log("Deleting brand with ID:", brandId);
      if (brandId) {
        const response = await brandService.delete(brandId);
        console.log("Delete response:", response);
        // Remove from local state directly instead of re-fetching
        setBrands(prev => prev.filter(b => b._id !== brandId && b.id !== brandId));
        toast.success("Brand deleted successfully");
      } else {
        toast.error("Brand ID not found");
        return;
      }
      setDeleteModalOpen(false);
      setSelectedBrand(null);
    } catch (error: any) {
      console.error("Failed to delete brand:", error);
      toast.error(error?.message || "Failed to delete brand");
    } finally {
      setDeleting(false);
    }
  };

  // Open edit modal
  const openEditModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setDeleteModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Brand Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage brands displayed on your website
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedBrand(null);
            setModalOpen(true);
          }}
          className="bg-flame-orange hover:bg-flame-orange/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Brands</p>
              <p className="text-2xl font-bold text-foreground">
                {brands.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Brands</p>
              <p className="text-2xl font-bold text-foreground">
                {brands.filter((b) => b.isActive !== false).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">
                {brands.reduce((acc, b) => acc + (b.productCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search brands..."
          className="pl-10 bg-card"
        />
      </div>

      {/* Brands List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-flame-orange" />
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? "No brands found" : "No brands yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Add your first brand to get started"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => {
                setSelectedBrand(null);
                setModalOpen(true);
              }}
              className="bg-flame-orange hover:bg-flame-orange/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBrands.map((brand, index) => (
            <div
              key={brand._id || brand.id || `brand-${index}`}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-flame-orange/50 transition-colors"
            >
              {/* Logo */}
              <div className="aspect-square relative bg-muted/30 p-6 flex items-center justify-center">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain p-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-4xl font-bold text-muted-foreground">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Status Badge */}
                <span
                  className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${
                    brand.isActive !== false
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {brand.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground truncate">
                  {brand.name}
                </h3>
                {brand.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {brand.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">
                    {brand.productCount || 0} products
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(brand)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <BrandModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBrand(null);
        }}
        onSave={handleSave}
        brand={selectedBrand}
        isLoading={saving}
      />

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedBrand(null);
        }}
        onConfirm={handleDelete}
        brandName={selectedBrand?.name || ""}
        isLoading={deleting}
      />
    </div>
  );
}



