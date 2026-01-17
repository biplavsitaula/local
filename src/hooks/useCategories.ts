import { useState, useEffect, useMemo } from 'react';
import { Wine, Beer, GlassWater, Martini, Grape, Cherry, LayoutGrid, Sparkles, Coffee, FlameKindling, Package, LucideIcon, Home, Globe } from 'lucide-react';
import { settingsService } from '@/services/settings.service';
import { productsService } from '@/services/products.service';

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

// Origin type metadata
export const originTypeMetadata: Record<string, { icon: LucideIcon; label: string; labelNe: string }> = {
  domestic: { icon: Home, label: "Domestic", labelNe: "घरेलु" },
  imported: { icon: Globe, label: "Imported", labelNe: "आयातित" },
};

export interface SubCategoryInfo {
  name: string;
  count: number;
}

export interface OriginTypeInfo {
  type: string;
  label: string;
  labelNe: string;
  icon: LucideIcon;
  subCategories: SubCategoryInfo[];
}

export interface Category {
  id: string;
  name: string;
  nameNe: string;
  icon: LucideIcon;
  color: string;
  originTypes?: OriginTypeInfo[];
}

export interface CategoryFilter {
  category?: string;
  originType?: string;
  subCategory?: string;
}

interface UseCategoriesOptions {
  includeAll?: boolean; // Whether to include an "All" category at the beginning
  fetchSubCategories?: boolean; // Whether to fetch subcategory data from products
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  categoryHierarchy: Map<string, Map<string, string[]>>; // category -> originType -> subCategories[]
}

/**
 * Custom hook to fetch and process categories from the API
 * @param options - Configuration options for the hook
 * @returns Object containing categories array, loading state, and error state
 */
export const useCategories = (options: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const { includeAll = false, fetchSubCategories = false } = options;
  const [apiCategories, setApiCategories] = useState<{ name: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryHierarchy, setCategoryHierarchy] = useState<Map<string, Map<string, string[]>>>(new Map());

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

  // Fetch subcategory hierarchy from products if enabled
  useEffect(() => {
    if (!fetchSubCategories) return;
    
    const fetchHierarchy = async () => {
      try {
        // Fetch all products to build hierarchy
        const response = await productsService.getAll({ limit: 10000 });
        const products = response.data || [];
        
        // Build hierarchy: category -> originType -> subCategories[]
        const hierarchy = new Map<string, Map<string, string[]>>();
        
        products.forEach((product: any) => {
          const category = (product.category || product.type || '').toLowerCase();
          const originType = (product.originType || 'domestic').toLowerCase();
          const subCategory = (product.subCategory || '').toLowerCase();
          
          if (!category) return;
          
          if (!hierarchy.has(category)) {
            hierarchy.set(category, new Map());
          }
          
          const originMap = hierarchy.get(category)!;
          if (!originMap.has(originType)) {
            originMap.set(originType, []);
          }
          
          if (subCategory && !originMap.get(originType)!.includes(subCategory)) {
            originMap.get(originType)!.push(subCategory);
          }
        });
        
        setCategoryHierarchy(hierarchy);
      } catch (err) {
        console.error('Error fetching category hierarchy:', err);
      }
    };
    
    fetchHierarchy();
  }, [fetchSubCategories]);

  // Build categories array from API data
  const categories = useMemo(() => {
    // Map API categories to full category objects (filter out invalid entries)
    const mappedCategories = apiCategories
      .filter((cat) => cat && cat.name) // Filter out invalid entries
      .map((cat) => {
        const catName = cat.name;
        const lowerCat = catName.toLowerCase();
        const metadata = categoryMetadata[lowerCat] || defaultMetadata;
        
        // Build origin types with subcategories if hierarchy data is available
        // Logic: 
        // - If only domestic products exist -> only include domestic (will be auto-selected)
        // - If imported products exist -> show both domestic and imported options
        const originTypes: OriginTypeInfo[] = [];
        if (categoryHierarchy.has(lowerCat)) {
          const originMap = categoryHierarchy.get(lowerCat)!;
          const hasImported = originMap.has('imported');
          const hasDomestic = originMap.has('domestic');
          
          ['domestic', 'imported'].forEach(originType => {
            const originMeta = originTypeMetadata[originType];
            
            if (hasImported) {
              // If imported exists, show both options
              const subCats = originMap.get(originType) || [];
              originTypes.push({
                type: originType,
                label: originMeta.label,
                labelNe: originMeta.labelNe,
                icon: originMeta.icon,
                subCategories: subCats.map(sc => ({ name: sc, count: 0 })),
              });
            } else if (originType === 'domestic' && hasDomestic) {
              // Only domestic exists - include it (will be auto-selected)
              const subCats = originMap.get(originType) || [];
              originTypes.push({
                type: originType,
                label: originMeta.label,
                labelNe: originMeta.labelNe,
                icon: originMeta.icon,
                subCategories: subCats.map(sc => ({ name: sc, count: 0 })),
              });
            }
          });
        }
        
        return {
          id: lowerCat,
          name: catName.charAt(0).toUpperCase() + catName.slice(1), // Capitalize first letter
          nameNe: metadata.nameNe || catName,
          icon: metadata.icon,
          color: metadata.color,
          originTypes: originTypes.length > 0 ? originTypes : undefined,
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
  }, [apiCategories, includeAll, categoryHierarchy]);

  return {
    categories,
    loading,
    error,
    categoryHierarchy,
  };
};

