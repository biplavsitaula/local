"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types";
import { Star, Eye } from "lucide-react";
import ProductActionButtons from "@/components/ui/ProductActionButtons";
import { toast } from "sonner";
import Image from "next/image";

const DEFAULT_IMAGE = "/assets/image_not_found.png";

const getValidImageUrl = (product: Product | null | undefined): string => {
  if (!product) return DEFAULT_IMAGE;
  const imageUrl = product.image || product.imageUrl;
  if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
    return DEFAULT_IMAGE;
  }
  const trimmedUrl = imageUrl.trim();
  if (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("/") ||
    trimmedUrl.startsWith("data:")
  ) {
    return trimmedUrl;
  }
  return DEFAULT_IMAGE;
};

const isExternalUrl = (url: string): boolean => {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  );
};

interface HomeProductCardProps {
  product: Product;
  onBuyNow: (product: Product, quantity?: number) => void;
  onViewDetails: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  hidePreviewIcon?: boolean;
}

const HomeProductCard: React.FC<HomeProductCardProps> = ({
  product,
  onBuyNow,
  onViewDetails,
  onAddToCart,
}) => {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const imageUrl = getValidImageUrl(product);
  const rating = product.rating || 0;

  const handleAddToCart = () => {
    addToCart(product, 1);
    if (onAddToCart) {
      onAddToCart(product, 1);
    } else {
      toast.success(
        language === "en" ? "Added to Cart!" : "कार्टमा थपियो!",
        {
          description: `1x ${language === "en" ? product?.name : product?.nameNe}`,
        }
      );
    }
  };

  const handleBuyNow = () => {
    onBuyNow(product, 1);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(product);
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col h-full cursor-pointer overflow-hidden rounded-xl border border-border transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-1 hover:border-primary/50"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={product?.name || "Product"}
          fill
          className="object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-4"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={isExternalUrl(imageUrl)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_IMAGE;
          }}
        />

        {/* Subtle gradient at the bottom of the image */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        {/* Preview / Eye Icon - Top Right */}
        <button
          onClick={handleViewDetails}
          className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-primary hover:scale-110 cursor-pointer"
        >
          <Eye className="h-5 w-5" />
        </button>

        {/* Hover Overlay with Action Buttons */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {/* Add to Cart & Buy Now */}
          {product.inStock && (
            <div className="w-full px-4" onClick={(e) => e.stopPropagation()}>
              <ProductActionButtons
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                disabled={!product.inStock}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Out of Stock */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px] z-10">
            <span className="bg-red-800 text-white px-5 py-1.5 text-sm font-medium rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-1 flex flex-col gap-1.5 mt-auto">
        {/* Category */}
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-gray-500 font-medium">
          {product?.category}
        </p>

        {/* Product Name */}
        <h3 className="font-display text-sm sm:text-base font-semibold text-white leading-tight line-clamp-1">
          {language === "en" ? product?.name : product?.nameNe}
        </h3>

        {/* Price & Rating Row */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-amber-500">
              Rs. {(product?.price || 0).toLocaleString()}
            </span>
            {product?.originalPrice && (
              <span className="text-xs text-gray-600 line-through">
                Rs. {(product?.originalPrice || 0).toLocaleString()}
              </span>
            )}
          </div>

          {/* Star Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-400">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeProductCard;
