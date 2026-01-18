"use client";

import React from 'react';
import { ShoppingCart, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ProductActionButtonsProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
  size?: ButtonSize;
  showLabels?: boolean;
  className?: string;
}

const sizeClasses: Record<ButtonSize, {
  container: string;
  button: string;
  icon: string;
  text: string;
}> = {
  sm: {
    container: 'gap-1 sm:gap-2',
    button: 'py-1.5 sm:py-2.5 px-1 sm:px-3 gap-0.5 sm:gap-1.5',
    icon: 'h-4 w-4 sm:h-4 sm:w-4',
    text: 'text-xs sm:text-xs',
  },
  md: {
    container: 'gap-2 sm:gap-3',
    button: 'py-2 sm:py-3 px-2 sm:px-4 gap-1.5 sm:gap-2',
    icon: 'h-4 w-4 sm:h-5 sm:w-5',
    text: 'text-sm sm:text-base',
  },
  lg: {
    container: 'gap-3 sm:gap-4',
    button: 'py-3 sm:py-4 px-4 sm:px-6 gap-2 sm:gap-3',
    icon: 'h-5 w-5 sm:h-6 sm:w-6',
    text: 'text-base sm:text-lg',
  },
};

const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  onAddToCart,
  onBuyNow,
  disabled = false,
  size = 'sm',
  showLabels = true,
  className = '',
}) => {
  const { t } = useLanguage();
  const classes = sizeClasses[size];

  return (
    <div className={`flex ${classes.container} ${className}`}>
      <button
        onClick={onAddToCart}
        disabled={disabled}
        className={`flex flex-1 items-center justify-center rounded-lg btn-outline-to-primary-custom ${classes.button} font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0 group`}
      >
        <ShoppingCart className={`${classes.icon} flex-shrink-0 group-hover:scale-110 transition-transform`} />
        {showLabels && (
          <span className={`${classes.text} whitespace-nowrap`}>{t('addToCart')}</span>
        )}
      </button>
      <button
        onClick={onBuyNow}
        disabled={disabled}
        className={`flex flex-1 items-center justify-center rounded-lg btn-primary-custom ${classes.button} font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0 group`}
      >
        <Zap className={`${classes.icon} flex-shrink-0 group-hover:scale-110 transition-transform`} />
        {showLabels && (
          <span className={`${classes.text} whitespace-nowrap`}>{t('buyNow')}</span>
        )}
      </button>
    </div>
  );
};

export default ProductActionButtons;


