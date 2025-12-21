import { useState, useEffect } from 'react';
import { SeasonalTheme, SeasonalThemeData } from '@/types/seasonal';

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
 * Expected API Response Format:
 * {
 *   "keyname": "christmas" | "thanksgiving" | "newyear" | "default"
 * }
 * 
 * The API endpoint can be configured via:
 * 1. Environment variable: NEXT_PUBLIC_SEASONAL_THEME_API
 * 2. Pass directly to hook: useSeasonalTheme('https://your-api.com/theme')
 * 3. Default: '/api/seasonal-theme'
 */
interface SeasonalThemeApiResponse {
  keyname: SeasonalTheme;
  [key: string]: any; // Allow additional fields from API
}

export function useSeasonalTheme(apiEndpoint?: string) {
  const [theme, setTheme] = useState<SeasonalThemeData>(themeConfigs.default);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        // Use provided API endpoint or default to environment variable or mock
        const endpoint = apiEndpoint || process.env.NEXT_PUBLIC_SEASONAL_THEME_API || '/api/seasonal-theme';
        
        let keyname: SeasonalTheme = 'default';
        
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data: SeasonalThemeApiResponse = await response.json();
            keyname = (data.keyname || 'default') as SeasonalTheme;
          } else {
            console.warn('Failed to fetch seasonal theme, using default');
          }
        } catch (fetchError) {
          // If API call fails, fall back to default theme
          console.warn('Error fetching seasonal theme from API, using default:', fetchError);
        }
        
        // Validate keyname and get theme config
        const selectedTheme = themeConfigs[keyname] || themeConfigs.default;
        setTheme(selectedTheme);
      } catch (error) {
        console.error('Error setting seasonal theme:', error);
        setTheme(themeConfigs.default);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [apiEndpoint]);

  return { theme, loading };
}

