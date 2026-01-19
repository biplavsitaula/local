"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { Plus, Minus, Eye } from 'lucide-react';
import ProductActionButtons from '@/components/ui/ProductActionButtons';
import { toast } from 'sonner';
import Image from 'next/image';

const DEFAULT_IMAGE = "/assets/liquor1.jpeg";

// Helper function to get valid image URL
const getValidImageUrl = (product: Product | null | undefined): string => {
  if (!product) {
    return DEFAULT_IMAGE;
  }
  
  const imageUrl = product.image || product.imageUrl;
  
  // Return default if no image
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return DEFAULT_IMAGE;
  }
  
  const trimmedUrl = imageUrl.trim();
  
  // Check if it's a valid URL or base64
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('/') || trimmedUrl.startsWith('data:')) {
    return trimmedUrl;
  }
  
  return DEFAULT_IMAGE;
};

// Check if URL is external (needs unoptimized)
const isExternalUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
};

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product, quantity?: number) => void;
  onViewDetails: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow, onViewDetails, onAddToCart }) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    if (onAddToCart) {
      onAddToCart(product, quantity);
    } else {
      toast.success(
        language === 'en' ? 'Added to Cart!' : 'कार्टमा थपियो!',
        {
          description: `${quantity}x ${language === 'en' ? product?.name : product?.nameNe}`,
        }
      );
    }
    setQuantity(1);
  };

  const handleBuyNow = () => {
    // Proceed directly to checkout without adding to cart
    onBuyNow(product, quantity);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
        {product.tag && (
          <span className="rounded-full bg-primary-gradient px-3 py-1 text-sm md:text-xs font-bold text-color-inverse">
            {product.tag}
          </span>
        )}
        {product.originalPrice && (
          <span className="rounded-full bg-destructive px-3 py-1 text-sm md:text-xs font-bold text-color-white">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Quick View Button - Always visible on mobile, hover on desktop */}
      <button
        onClick={() => onViewDetails(product)}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-color-default opacity-100 md:opacity-0 shadow-lg backdrop-blur-sm transition-all md:group-hover:opacity-100 hover:bg-primary hover:text-color-white cursor-pointer"
      >
        <Eye className="h-5 w-5" />
      </button>

      {/* Image - Square */}
      <div className="relative w-full overflow-hidden bg-muted" style={{ paddingBottom: '100%' }}>
        <Image
          src={getValidImageUrl(product)}
          alt={product?.name || 'Product image'}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={isExternalUrl(getValidImageUrl(product))}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_IMAGE;
          }}
        />
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="rounded-full bg-destructive px-4 py-2 text-sm md:text-xs font-bold text-color-white">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <p className="text-xs md:text-[12px] text-color-muted capitalize">{product?.category}</p>
        <h3 className="mt-1 line-clamp-1 font-display text-base sm:text-base md:text-lg font-bold text-color-tertiary">
          {language === 'en' ? product?.name : product?.nameNe}
        </h3>
        <p className="mt-1 text-sm sm:text-sm text-color-muted">
          {product?.volume} • {product?.alcoholContent || product?.alcohol}
        </p>

        {/* Price */}
        <div className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-lg sm:text-lg md:text-xl font-bold text-color-accent">
            Rs. {((product?.price || 0) * quantity).toLocaleString()}
          </span>
          {product?.originalPrice && (
            <span className="text-sm sm:text-sm text-color-muted line-through">
              Rs. {((product?.originalPrice || 0) * quantity).toLocaleString()}
            </span>
          )}
          {quantity > 1 && (
              <span className="text-xs sm:text-xs text-color-muted">
                (Rs. {(product?.price || 0).toLocaleString()} × {quantity})
              </span>
          )}
        </div>

        {/* Quantity Selector and Actions */}
        {product.inStock === true && (
          <div className="mt-2 sm:mt-3 space-y-2">
            {/* Row 1: Quantity Selector */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-xs text-muted-foreground">{t('quantity')}:</span>
              <div className="flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
                >
                  <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
                <span className="w-6 sm:w-8 text-center text-sm sm:text-sm font-medium text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
                >
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            </div>
            
            {/* Row 2: Action Buttons */}
            <ProductActionButtons
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              disabled={!product.inStock}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;


