"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { offersService, Offer } from "@/services/offers.service";
import { 
  Clock, Package, Truck, Gift, Tag, Zap, Star, Heart, 
  Percent, ShoppingBag, Award, Crown, Flame, Loader2,
  Sparkles, BadgePercent, PartyPopper, Ticket, Trophy,
  LucideIcon
} from "lucide-react";

// Map icon string names to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  package: Package,
  truck: Truck,
  gift: Gift,
  tag: Tag,
  zap: Zap,
  star: Star,
  heart: Heart,
  percent: Percent,
  shopping: ShoppingBag,
  shoppingbag: ShoppingBag,
  award: Award,
  crown: Crown,
  flame: Flame,
  sparkles: Sparkles,
  badgepercent: BadgePercent,
  partypopper: PartyPopper,
  ticket: Ticket,
  trophy: Trophy,
};

// Default gradient colors for offers
const defaultGradients = [
  'from-flame-red to-flame-orange',
  'from-flame-orange to-flame-yellow',
  'from-flame-yellow to-flame-gold',
  'from-flame-gold to-flame-orange',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
];

interface OfferBannerProps {
  show?: boolean;
}

const OfferBanner: React.FC<OfferBannerProps> = ({ show = true }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await offersService.getAll();
        
        if (response.success) {
          // Filter only active offers and sort by order, limit to 4
          const activeOffers = (response.data || [])
            .filter(offer => offer.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .slice(0, 4);
          setOffers(activeOffers);
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchOffers();
    }
  }, [show]);

  if (!show) return null;

  // Helper function to check if icon is an image URL
  const isImageUrl = (icon?: string): boolean => {
    if (!icon) return false;
    return icon.startsWith('http') || icon.startsWith('/');
  };

  // Helper function to get icon component from icon name string
  const getIconComponent = (iconName?: string): LucideIcon => {
    if (!iconName) return Gift; // Default icon
    const normalizedName = iconName.toLowerCase().trim();
    return iconMap[normalizedName] || Gift;
  };

  // Helper function to get gradient color
  const getGradientColor = (color?: string, index: number = 0): string => {
    if (!color || color.trim() === '') {
      return defaultGradients[index % defaultGradients.length];
    }
    
    // If it already looks like a gradient class, use it
    if (color.includes('from-') || color.includes('to-')) {
      return color;
    }
    
    // Otherwise, try to use it as a Tailwind color
    return `from-${color}-500 to-${color}-600`;
  };

  // Show loading skeleton
  if (loading) {
    return (
      <div className={`relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-secondary/30 via-secondary/20 to-secondary/30'
          : 'bg-gradient-to-r from-orange-50/80 via-yellow-50/80 to-orange-50/80'
      }`}>
        <div className="relative container mx-auto px-4 py-2 sm:py-3">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't show banner if no offers
  if (offers.length === 0) return null;

  return (
    <div className={`relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-gradient-to-r from-secondary/30 via-secondary/20 to-secondary/30'
        : 'bg-gradient-to-r from-orange-50/80 via-yellow-50/80 to-orange-50/80'
    }`}>
      <div className="relative container mx-auto px-4 py-2 sm:py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {offers.map((offer, index) => {
            const isImage = isImageUrl(offer.icon);
            const IconComponent = !isImage ? getIconComponent(offer.icon) : null;
            const gradientColor = getGradientColor(offer.color, index);
            
            return (
              <div
                key={offer._id || offer.id || index}
                className={`group relative flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-3xl border-2 transition-all duration-300 overflow-hidden border-1 border-text-primary ${
                  theme === 'dark'
                    ? 'bg-card/80 border-border/50 hover:border-primary/60 hover:bg-card/90 card-glow hover:shadow-xl hover:shadow-primary/20'
                    : 'bg-white/95 border-orange-200/60 hover:border-orange-400/80 hover:bg-white shadow-sm hover:shadow-lg hover:shadow-orange-200/50'
                }`}
                style={offer.color?.startsWith('#') ? { 
                  borderColor: `${offer.color}40`
                } : undefined}
              >
                {/* Decorative curved accent */}
                <div 
                  className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300`}
                  style={offer.color?.startsWith('#') ? { 
                    background: `linear-gradient(to bottom right, ${offer.color}, ${offer.color}80)` 
                  } : undefined}
                />
                
                {/* Icon with curved border */}
                <div 
                  className={`relative w-7 h-7 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 z-10`}
                  style={offer.color?.startsWith('#') ? { 
                    background: `linear-gradient(to bottom right, ${offer.color}, ${offer.color}cc)` 
                  } : undefined}
                >
                  {isImage ? (
                    <img 
                      src={offer.icon} 
                      alt={offer.title} 
                      className="w-3.5 h-3.5 sm:w-5 sm:h-5 object-contain"
                    />
                  ) : IconComponent && (
                    <IconComponent className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
                  )}
                </div>
                
                {/* Text */}
                <div className="flex flex-col min-w-0">
                  <p className={`text-[10px] sm:text-xs font-medium leading-tight truncate ${
                    theme === 'dark' ? 'text-foreground' : 'text-gray-800'
                  }`}>
                    {offer.title}
                  </p>
                  {offer.discountPercent && (
                    <span className="text-[8px] sm:text-[10px] text-primary font-semibold">
                      {offer.discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;

