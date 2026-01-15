"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { X, ShoppingCart, Zap, Plus, Minus, MapPin, Wine, Percent } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onBuyNow, onAddToCart }) => {
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
  };

  const handleBuyNow = () => {
    // Buy Now goes directly to checkout without adding to cart
    onClose(); // Close the product detail modal first
    onBuyNow(product, quantity); // Then open checkout modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto animate-in fade-in-0 zoom-in-95 rounded-2xl border border-border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <Image
              src={product?.image || "/assets/liquor1.jpeg"}
              alt={product?.name}
              className="h-full w-full object-cover"
              width={500}
              height={500}
            />
            {product.isNew && (
              <span className="absolute left-4 top-4 rounded-full bg-primary-gradient px-4 py-1.5 text-sm font-bold text-text-inverse">
                NEW
              </span>
            )}
            {product.originalPrice && (
              <span className="absolute left-4 top-14 rounded-full bg-destructive px-4 py-1.5 text-sm font-bold text-destructive-foreground">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-xs sm:text-sm uppercase tracking-wide text-muted-foreground">{product?.category}</p>
            <h2 className="mt-2 font-display text-xl sm:text-2xl md:text-3xl font-bold text-tertiary-text">
              {language === 'en' ? product?.name : product?.nameNe}
            </h2>

            {/* Price */}
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  Rs. {((product?.price || 0) * quantity).toLocaleString()}
                </span>
                {product?.originalPrice && (
                  <span className="text-sm sm:text-base md:text-lg text-muted-foreground line-through">
                    Rs. {((product?.originalPrice || 0) * quantity).toLocaleString()}
                  </span>
                )}
              </div>
              {quantity > 1 && (
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  (Rs. {(product?.price || 0).toLocaleString()} × {quantity})
                </p>
              )}
            </div>

            {/* Status */}
            <div className="mt-3 sm:mt-4">
              {product.inStock !== false ? (
                <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-green-500/20 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-green-500">
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" />
                  {t('inStock')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-destructive/20 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-destructive">
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-destructive" />
                  {t('outOfStock')}
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center">
                <Wine className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{t('volume')}</p>
                <p className="text-xs sm:text-sm font-medium text-foreground">{product?.volume}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center">
                <Percent className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{t('alcoholContent')}</p>
                <p className="text-xs sm:text-sm font-medium text-foreground">{product?.alcoholContent || product?.alcohol}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center">
                <MapPin className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{t('origin')}</p>
                <p className="text-xs sm:text-sm font-medium text-foreground">{product?.origin || 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 sm:mt-6">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">{t('description')}</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-muted-foreground">
                {language === 'en' ? product?.description : product?.descriptionNe || product?.description}
              </p>
            </div>

            {/* Quantity & Actions */}
            {product.inStock !== false && (
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-sm sm:text-base font-medium text-foreground">{t('quantity')}:</span>
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <span className="w-8 sm:w-12 text-center text-sm sm:text-base font-medium text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg border-2 border-primary bg-transparent py-2 sm:py-3 text-sm sm:text-base font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t('addToCart')}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-primary-gradient py-2 sm:py-3 text-sm sm:text-base font-semibold text-text-inverse transition-all hover:shadow-primary-lg cursor-pointer"
                  >
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t('buyNow')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;


