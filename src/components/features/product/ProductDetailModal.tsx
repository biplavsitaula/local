import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShoppingCart, Plus, Minus, Wine, Droplets, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { IProductDetailModalProps } from '@/interface/IProductDetailModalProps';
import Image from 'next/image';

const ProductDetailModal: React.FC<IProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(
      language === 'en'
        ? `${quantity} × ${product?.name} added to cart!`
        : `${quantity} × ${product?.nameNe} कार्टमा थपियो!`
    );
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border/50 p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-secondary/30 p-6 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
            {/* Decorative Frame */}
            <div className="absolute inset-4 border-2 border-flame-orange/30 rounded-lg pointer-events-none" />
            <div className="absolute inset-6 border border-flame-orange/20 rounded-md pointer-events-none" />
            
            {/* Corner Accents */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-flame-orange/50 rounded-tl" />
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-flame-orange/50 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-flame-orange/50 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-flame-orange/50 rounded-br" />

            <Image
              src={product?.image || "/assets/liquor1.jpeg"}
              alt={product?.name}
              className="max-w-full max-h-[320px] object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
              }}
            />
          </div>

          {/* Details Section */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="mb-4">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-secondary rounded-full text-muted-foreground capitalize w-fit mb-2">
                <Tag className="w-3 h-3 mr-1" />
                {product?.category}
              </span>
              <DialogTitle className="text-2xl font-display text-foreground">
                {language === 'en' ? product?.name : product?.nameNe}
              </DialogTitle>
            </DialogHeader>

            {/* Product Info */}
            <div className="space-y-4 flex-1">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product?.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                  <Wine className="w-4 h-4 text-flame-orange" />
                  <span className="text-sm text-foreground">{product?.volume}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                  <Droplets className="w-4 h-4 text-flame-orange" />
                  <span className="text-sm text-foreground">{product?.alcohol}</span>
                </div>
              </div>

              {/* Price */}
              <div className="pt-2">
                <p className="text-3xl font-bold flame-text">
                  Rs. {((product?.price || 0) * quantity).toLocaleString()}
                </p>
                {quantity > 1 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Rs. {(product?.price || 0).toLocaleString()} × {quantity}
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="mt-6 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between py-3 border-t border-border/50">
                <span className="text-muted-foreground">Total:</span>
                <span className="text-xl font-bold text-foreground">
                  Rs. {((product?.price || 0) * quantity).toLocaleString()}
                </span>
              </div>

              {/* Quantity Selector & Add to Cart - Single Row */}
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center border border-border/50 rounded-lg shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center text-base font-medium text-foreground">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    className="h-10 w-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-flame-orange hover:bg-flame-red text-primary-foreground py-5 text-base font-medium"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t('addToCart')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
