"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { ShoppingCart, Zap, Plus, Minus, Eye, Package } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

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
    addToCart(product, quantity);
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
    onBuyNow(product, quantity);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
        {product.tag && (
          <span className="rounded-full bg-primary-gradient px-3 py-1 text-xs font-bold text-text-inverse">
            {product.tag}
          </span>
        )}
        {product.originalPrice && (
          <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Quick View Button */}
      <button
        onClick={() => onViewDetails(product)}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground cursor-pointer"
      >
        <Eye className="h-5 w-5" />
      </button>

      {/* Image - Square */}
      <div className="relative w-full overflow-hidden bg-muted" style={{ paddingBottom: '100%' }}>
        {product?.image ? (
          <Image
            src={product.image}
            alt={product?.name || 'Product image'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            width={400}
            height={400}
          />
        ) : (
          <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-muted/50">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="rounded-full bg-destructive px-4 py-2 font-bold text-destructive-foreground">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground capitalize">{product?.category}</p>
        <h3 className="mt-1 line-clamp-1 font-display text-lg font-bold text-tertiary-text">
          {language === 'en' ? product?.name : product?.nameNe}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {product?.volume} • {product?.alcoholContent || product?.alcohol}
        </p>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            Rs. {((product?.price || 0) * quantity).toLocaleString()}
          </span>
          {product?.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              Rs. {((product?.originalPrice || 0) * quantity).toLocaleString()}
            </span>
          )}
          {quantity > 1 && (
            <span className="text-xs text-muted-foreground">
              (Rs. {(product?.price || 0).toLocaleString()} × {quantity})
            </span>
          )}
        </div>

        {/* Quantity Selector and Actions - All in one line on mobile */}
        {product.inStock !== false && (
          <div className="mt-3 flex items-center gap-2">
            {/* Quantity Selector */}
            <div className="flex items-center rounded-lg border border-border shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-foreground">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
            
            {/* Actions */}
            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              className="flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-lg border border-primary-border bg-btn-outline py-2 sm:py-2.5 px-2 sm:px-3 font-medium text-primary-text transition-all hover:bg-primary-hover hover:text-text-inverse cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">{t('addToCart')}</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.inStock === false}
              className="flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-lg bg-primary-gradient py-2 sm:py-2.5 px-2 sm:px-3 font-medium text-text-inverse transition-all hover:shadow-primary-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">{t('buyNow')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;


