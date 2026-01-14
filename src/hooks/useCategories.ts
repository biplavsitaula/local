import { useState, useEffect, useMemo } from 'react';
import { Wine, Beer, GlassWater, Martini, Grape, Cherry, LayoutGrid, Sparkles, Coffee, FlameKindling, Package, LucideIcon } from 'lucide-react';
import { settingsService } from '@/services/settings.service';

// Mapping for category metadata (icons, colors, Nepali names)
const categoryMetadata: Record<string, { icon: LucideIcon; color: string; nameNe: string }> = {
  all: { icon: LayoutGrid, color: 'from-flame-orange to-flame-red', nameNe: 'सबै' },
  whisky: { icon: Wine, color: "from-amber-500 to-orange-600", nameNe: "व्हिस्की" },
  whiskey: { icon: Wine, color: "from-amber-500 to-orange-600", nameNe: "व्हिस्की" },
  vodka: { icon: GlassWater, color: "from-blue-400 to-cyan-500", nameNe: "भोड्का" },
  rum: { icon: Cherry, color: "from-amber-600 to-yellow-500", nameNe: "रम" },
  gin: { icon: Martini, color: "from-emerald-400 to-teal-500", nameNe: "जिन" },
  wine: { icon: Grape, color: "from-purple-500 to-pink-500", nameNe: "वाइन" },
  beer: { icon: Beer, color: "from-yellow-400 to-amber-500", nameNe: "बियर" },
  tequila: { icon: FlameKindling, color: "from-lime-500 to-lime-700", nameNe: "टकिला" },
  cognac: { icon: Coffee, color: "from-orange-600 to-orange-800", nameNe: "कोग्न्याक" },
  champagne: { icon: Sparkles, color: "from-yellow-400 to-yellow-600", nameNe: "शैम्पेन" },
  brandy: { icon: GlassWater, color: "from-orange-600 to-orange-800", nameNe: "ब्राण्डी" },
};

// Default metadata for unknown categories
const defaultMetadata = { icon: Package, color: "from-gray-500 to-gray-700", nameNe: "" };

export interface Category {
  id: string;
  name: string;
  nameNe: string;
  icon: LucideIcon;
  color: string;
}

interface UseCategoriesOptions {
  includeAll?: boolean; // Whether to include an "All" category at the beginning
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch and process categories from the API
 * @param options - Configuration options for the hook
 * @returns Object containing categories array, loading state, and error state
 */
export const useCategories = (options: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const { includeAll = false } = options;
  const [apiCategories, setApiCategories] = useState<{ name: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await settingsService.getCategories();
        if (response.success && response.data) {
          setApiCategories(response.data);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Build categories array from API data
  const categories = useMemo(() => {
    // Map API categories to full category objects (filter out invalid entries)
    const mappedCategories = apiCategories
      .filter((cat) => cat && cat.name) // Filter out invalid entries
      .map((cat) => {
        const catName = cat.name;
        const lowerCat = catName.toLowerCase();
        const metadata = categoryMetadata[lowerCat] || defaultMetadata;
        return {
          id: lowerCat,
          name: catName.charAt(0).toUpperCase() + catName.slice(1), // Capitalize first letter
          nameNe: metadata.nameNe || catName,
          icon: metadata.icon,
          color: metadata.color,
        };
      });

    // Optionally include "All" category at the beginning
    if (includeAll) {
      const allCategory: Category = {
        id: 'all',
        name: 'All',
        nameNe: categoryMetadata.all.nameNe,
        icon: categoryMetadata.all.icon,
        color: categoryMetadata.all.color,
      };
      return [allCategory, ...mappedCategories];
    }

    return mappedCategories;
  }, [apiCategories, includeAll]);

  return {
    categories,
    loading,
    error,
  };
};

