import { useState, useEffect } from 'react';
import { SeasonalTheme, SeasonalThemeData } from '@/types/seasonal';
import { seasonalThemesService } from '@/services/seasonal-themes.service';

// Default theme configurations
const themeConfigs: Record<SeasonalTheme, SeasonalThemeData> = {
  christmas: {
    keyname: 'christmas',
    title: 'Crimson Christmas',
    subtitle: 'Seasonal spotlight',
    description: 'Santa-approved hampers, mulled wine kits, sparkling sets. Red-and-gold theme, limited-time artful packaging.',
    tags: ['🎅 Santa drops', '🎁 Gifting ready', '🕯️ Warm spices'],
    ctaText: 'Explore festive picks',
    category: 'Wine',
    colors: {
      primary: 'from-red-500/30 to-red-600/20',
      secondary: 'from-red-400/30 to-orange-400/20',
      accent: 'border-red-500/30',
    },
    gradient: 'bg-[radial-gradient(circle_at_15%_30%,rgba(220,38,38,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(234,88,12,0.25),transparent_40%)]',
    emoji: '🎄',
  },
  thanksgiving: {
    keyname: 'thanksgiving',
    title: 'Harvest Thanksgiving',
    subtitle: 'Seasonal spotlight',
    description: 'Warm autumn flavors, spiced ciders, and premium selections perfect for your Thanksgiving feast. Rich amber and gold theme.',
    tags: ['🍂 Autumn harvest', '🦃 Feast ready', '🍷 Premium selection'],
    ctaText: 'Shop Thanksgiving',
    category: 'Wine',
    colors: {
      primary: 'from-amber-500/30 to-orange-500/20',
      secondary: 'from-yellow-400/30 to-amber-400/20',
      accent: 'border-amber-500/30',
    },
    gradient: 'bg-[radial-gradient(circle_at_15%_30%,rgba(217,119,6,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(234,179,8,0.25),transparent_40%)]',
    emoji: '🦃',
  },
  newyear: {
    keyname: 'newyear',
    title: 'New Year Celebration',
    subtitle: 'Seasonal spotlight',
    description: 'Ring in the new year with premium champagne, sparkling wines, and celebration sets. Elegant gold and silver theme.',
    tags: ['🥂 Champagne collection', '✨ Sparkling sets', '🎊 Party ready'],
    ctaText: 'Celebrate New Year',
    category: 'Wine',
    colors: {
      primary: 'from-yellow-400/30 to-amber-400/20',
      secondary: 'from-gold-400/30 to-yellow-400/20',
      accent: 'border-yellow-500/30',
    },
    gradient: 'bg-[radial-gradient(circle_at_15%_30%,rgba(234,179,8,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(251,191,36,0.25),transparent_40%)]',
    emoji: '🎉',
  },
  default: {
    keyname: 'default',
    title: 'Premium Collection',
    subtitle: 'Seasonal spotlight',
    description: 'Discover our curated selection of premium spirits and beverages. Quality guaranteed, delivered to your door.',
    tags: ['⭐ Premium quality', '🚚 Fast delivery', '🎯 Best selection'],
    ctaText: 'Explore collection',
    category: 'All',
    colors: {
      primary: 'from-flame-orange/30 to-flame-red/20',
      secondary: 'from-flame-orange/30 to-flame-red/20',
      accent: 'border-flame-orange/30',
    },
    gradient: 'bg-[radial-gradient(circle_at_15%_30%,rgba(255,80,80,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,200,120,0.25),transparent_40%)]',
  },
};

/**
 * Hook to fetch and use seasonal theme from API
 * Falls back to default theme if API is unavailable
 */
export function useSeasonalTheme() {
  const [theme, setTheme] = useState<SeasonalThemeData>(themeConfigs.default);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        setLoading(true);
        const response = await seasonalThemesService.getCurrent();
        
        if (response.success && response.data) {
          const apiData = response.data;
          const keyname = (apiData.keyname || 'default') as SeasonalTheme;
          
          // If API returns full theme data, use it; otherwise use keyname to get from configs
          if (apiData.title && apiData.description) {
            // API returned full theme data
            setTheme({
              keyname,
              title: apiData.title,
              subtitle: apiData.subtitle || 'Seasonal spotlight',
              description: apiData.description,
              tags: apiData.tags || [],
              ctaText: apiData.ctaText || 'Explore collection',
              category: apiData.category,
              colors: apiData.colors || themeConfigs[keyname]?.colors || themeConfigs.default.colors,
              gradient: apiData.gradient || themeConfigs[keyname]?.gradient || themeConfigs.default.gradient,
              emoji: apiData.emoji,
            });
          } else {
            // API only returned keyname, use config
            const selectedTheme = themeConfigs[keyname] || themeConfigs.default;
            setTheme(selectedTheme);
          }
        } else {
          // Fallback to default
          setTheme(themeConfigs.default);
        }
      } catch (error) {
        console.error('Error fetching seasonal theme:', error);
        // Fallback to default theme on error
        setTheme(themeConfigs.default);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  return { theme, loading };
}

