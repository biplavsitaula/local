"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Clock, Package, Truck, Gift } from "lucide-react";

interface OfferBannerProps {
  show?: boolean;
}

const OfferBanner: React.FC<OfferBannerProps> = ({ show = true }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  if (!show) return null;

  const offers = [
    {
      icon: Clock,
      title: t('hourDelivery'),
      color: 'from-flame-red to-flame-orange',
    },
    {
      icon: Package,
      title: t('bulkDiscount'),
      color: 'from-flame-orange to-flame-yellow',
    },
    {
      icon: Truck,
      title: t('freeDelivery'),
      color: 'from-flame-yellow to-flame-gold',
    },
    {
      icon: Gift,
      title: t('eventOffer'),
      color: 'from-flame-gold to-flame-orange',
    },
  ];

  return (
    <div className={`relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-gradient-to-r from-secondary/30 via-secondary/20 to-secondary/30'
        : 'bg-gradient-to-r from-orange-50/80 via-yellow-50/80 to-orange-50/80'
    }`}>
      <div className="relative container mx-auto px-4 py-2 sm:py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {offers.map((offer, index) => {
            const IconComponent = offer.icon;
            return (
              <div
                key={index}
                className={`group relative flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-3xl border-2 transition-all duration-300 overflow-hidden border-1 border-text-primary ${
                  theme === 'dark'
                    ? 'bg-card/80 border-border/50 hover:border-primary/60 hover:bg-card/90 card-glow hover:shadow-xl hover:shadow-primary/20'
                    : 'bg-white/95 border-orange-200/60 hover:border-orange-400/80 hover:bg-white shadow-sm hover:shadow-lg hover:shadow-orange-200/50'
                }`}
              >
                {/* Decorative curved accent */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${offer.color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300`} />
                
                {/* Icon with curved border */}
                <div className={`relative w-7 h-7 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br ${offer.color} flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 z-10`}>
                  <IconComponent className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
                </div>
                
                {/* Text */}
                <p className={`text-[10px] sm:text-xs font-medium leading-tight ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-800'
                }`}>
                  {offer.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;

