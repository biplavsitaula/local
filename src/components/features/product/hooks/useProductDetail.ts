import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Product } from '@/types';

interface UseProductDetailProps {
  product: Product;
  onClose: () => void;
}

export function useProductDetail({ product, onClose }: UseProductDetailProps) {
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

  return {
    quantity,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    handleAddToCart,
    t,
    language,
  };
}























