"use client";

import React, { useState, useEffect } from 'react';
import { X, Truck, ShoppingBag, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ordersService } from '@/services/orders.service';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

const PromotionalBanner: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkBannerShow = async () => {
      // Check if banner was already closed in this session
      const isClosed = sessionStorage.getItem('promo_banner_closed');
      if (isClosed === 'true') {
        setShouldRender(false);
        return;
      }

      if (isAuthenticated && user?.email) {
        try {
          const response = await ordersService.getUserOrderCount();
          if (response.success && response.data) {
            const count = response.data.count;
            setOrderCount(count);

            // Show banner only for 0 or 1 orders
            if (count === 0 || count === 1) {
              setShouldRender(true);
              // Small delay for entrance animation
              setTimeout(() => setIsVisible(true), 500);
            } else {
              setShouldRender(false);
            }
          }
        } catch (error) {
          console.error('Error fetching order count for banner:', error);
          setShouldRender(false);
        }
      } else {
        // Guest user - always show "Free Delivery on First Order"
        setOrderCount(0);
        setShouldRender(true);
        // Small delay for entrance animation
        setTimeout(() => setIsVisible(true), 500);
      }
    };

    checkBannerShow();
  }, [isAuthenticated, user?.email]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('promo_banner_closed', 'true');
    // Remove from DOM after animation
    setTimeout(() => setShouldRender(false), 300);
  };

  if (!shouldRender) return null;

  const isFirstOrder = orderCount === 0;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}
    >
      <div className="relative w-auto sm:w-96 overflow-hidden rounded-2xl border border-amber-500/30 bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-orange-900/20 card-glow">
        {/* Animated background accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-500"></div>

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-900/40">
              {isFirstOrder ? (
                <Gift className="w-6 h-6 text-white" />
              ) : (
                <Truck className="w-6 h-6 text-white" />
              )}
            </div>

            <div className="flex-1 pr-6">
              <h3 className="text-lg font-bold text-foreground leading-snug">
                {isFirstOrder
                  ? "Free Delivery on Your First Order 🎉"
                  : "50% Off on Delivery for Your Second Order 🚚"
                }
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {isFirstOrder
                  ? "Enjoy your first drink with us! No delivery charges on your very first order."
                  : "Welcome back! Get halfway off on delivery for your next order."
                }
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/products"
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
