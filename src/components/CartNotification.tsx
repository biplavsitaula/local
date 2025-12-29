"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/types";
import { X } from "lucide-react";

interface CartNotificationProps {
  product: Product | null;
  quantity: number;
  onClose: () => void;
}

const CartNotification: React.FC<CartNotificationProps> = ({ product, quantity, onClose }) => {
  const { language } = useLanguage();

  useEffect(() => {
    if (product) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-dismiss after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in-0">
      <div className="rounded-lg border border-gray-700/30 bg-gray-900/98 backdrop-blur-sm shadow-2xl p-4 min-w-[280px] max-w-[320px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-200 mb-1.5">
              {language === "en" ? "Added to Cart!" : "कार्टमा थपियो!"}
            </p>
            <p className="text-xs text-gray-400">
              {quantity}x {language === "en" ? product.name : product.nameNe || product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartNotification;

