"use client";


import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Product } from '@/types';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, Loader2, Wine, Beer, GlassWater, Martini, Grape, Cherry, Sparkles, Coffee, FlameKindling, Package, LucideIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import CheckoutModal from '@/components/CheckoutModal';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import CartNotification from '@/components/CartNotification';
import CategorySelector from '@/components/CategorySelector';
import { productsService, Product as ApiProduct } from '@/services/products.service';
import { settingsService } from '@/services/settings.service';


const ITEMS_PER_PAGE = 10;

// Mapping for category metadata (icons and Nepali names)
const categoryMetadata: Record<string, { icon: LucideIcon; color: string; nameNe: string }> = {
  whisky: { icon: Wine, color: "from-amber-500 to-orange-600", nameNe: 'व्हिस्की' },
  whiskey: { icon: Wine, color: "from-amber-500 to-orange-600", nameNe: 'व्हिस्की' },
  vodka: { icon: GlassWater, color: "from-blue-400 to-cyan-500", nameNe: 'भोड्का' },
  rum: { icon: Cherry, color: "from-amber-600 to-yellow-500", nameNe: 'रम' },
  gin: { icon: Martini, color: "from-emerald-400 to-teal-500", nameNe: 'जिन' },
  wine: { icon: Grape, color: "from-purple-500 to-pink-500", nameNe: 'वाइन' },
  beer: { icon: Beer, color: "from-yellow-400 to-amber-500", nameNe: 'बियर' },
  tequila: { icon: FlameKindling, color: "from-lime-500 to-lime-700", nameNe: 'टकिला' },
  cognac: { icon: Coffee, color: "from-orange-600 to-orange-800", nameNe: 'कोग्न्याक' },
  champagne: { icon: Sparkles, color: "from-yellow-400 to-yellow-600", nameNe: 'शैम्पेन' },
  brandy: { icon: GlassWater, color: "from-orange-600 to-orange-800", nameNe: 'ब्राण्डी' },
};

// Default metadata for unknown categories
const defaultMetadata = { icon: Package, color: "from-gray-500 to-gray-700", nameNe: '' };


const ProductsPageContent: React.FC = () => {
 const { t, language } = useLanguage();
 const { addToCart } = useCart();
 const { theme } = useTheme();
 const [products, setProducts] = useState<Product[]>([]);
 const [loading, setLoading] = useState(true);
 const [loadingMore, setLoadingMore] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [mounted, setMounted] = useState(false);
 const [page, setPage] = useState(1);
 const [hasMore, setHasMore] = useState(true);
 const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
 const [sortBy, setSortBy] = useState('newest');
 const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [showFilters, setShowFilters] = useState(false);
 const [checkoutOpen, setCheckoutOpen] = useState(false);
 const [notificationProduct, setNotificationProduct] = useState<Product | null>(null);
 const [notificationQuantity, setNotificationQuantity] = useState(1);
 const [apiCategories, setApiCategories] = useState<{ name: string; icon: string }[]>([]);


 // Map API product to internal Product type
 const mapApiProductToProduct = (apiProduct: any): Product => {
   // Handle API response structure: type instead of category
   const categoryValue = apiProduct?.type || apiProduct?.category || '';
   let category = categoryValue ? categoryValue.toLowerCase() : 'other';
   if (category === 'whiskey' || category === 'whisky') {
     category = 'whisky';
   }

   // Get discount info from API
   const discountPercent = apiProduct?.discountPercent || 0;
   const discountAmount = apiProduct?.discountAmount || 0;
   const hasDiscount = discountPercent > 0 || discountAmount > 0;

   // Use finalPrice as current price, original price is the base price when there's a discount
   const currentPrice = apiProduct?.finalPrice || apiProduct?.price || 0;
   const originalPrice = hasDiscount ? apiProduct?.price : undefined;

   // Use API tag directly (discount is shown separately via originalPrice)
   const tag = apiProduct?.tag || undefined;

   return {
     id: apiProduct?._id || apiProduct?.id || '',
     name: apiProduct?.name || '',
     category,
     price: currentPrice,
     originalPrice,
     image: apiProduct?.image || apiProduct?.imageUrl || '',
     description: apiProduct?.description || `Premium ${categoryValue || 'Beverage'} - ${apiProduct?.name || 'Product'}`,
     volume: apiProduct?.volume || '750ml',
     alcoholContent: apiProduct?.alcoholPercentage ? `${apiProduct?.alcoholPercentage}%` : '40%',
     alcohol: apiProduct?.alcoholPercentage ? `${apiProduct?.alcoholPercentage}%` : '40%',
     inStock: (apiProduct?.stock || 0) > 0,
     isNew: apiProduct?.isNew || false,
     stock: apiProduct?.stock,
     rating: apiProduct?.rating,
     tag,
   } as Product;
 };


 // Fetch products from API with pagination
 const fetchProducts = useCallback(async (pageNum: number, append: boolean = false) => {
   try {
     if (append) {
       setLoadingMore(true);
     } else {
       setLoading(true);
     }
     setError(null);
    
     // Map category to API format
     // For "whisky" or "whiskey", don't filter by category in API since API might use either variation
     // We'll filter client-side to handle both variations
     let apiCategory: string | null = selectedCategory;
     const normalizedCategory = selectedCategory?.toLowerCase();
     if (normalizedCategory === 'whisky' || normalizedCategory === 'whiskey') {
       apiCategory = null; // Fetch all and filter client-side
     }
    
     // When search query OR category is selected, fetch all products (use high limit, always from page 1)
     // This ensures search and category filtering work across ALL products, not just 10
     // Otherwise use pagination with ITEMS_PER_PAGE
     const hasActiveFilter = searchQuery || selectedCategory;
     const limit = hasActiveFilter ? 10000 : ITEMS_PER_PAGE;
     const fetchPage = hasActiveFilter ? 1 : pageNum; // Always fetch page 1 when filter is active
    
     const response = await productsService.getAll({
       page: fetchPage,
       limit: limit,
       search: searchQuery || undefined,
       category: apiCategory || undefined,
     });
    
     const mappedProducts = (response.data || []).map(mapApiProductToProduct);
    
     // When filter is active, always replace (don't append) since we fetch all at once
     if (append && !hasActiveFilter) {
       setProducts(prev => [...prev, ...mappedProducts]);
     } else {
       setProducts(mappedProducts);
     }
    
     // Check if there are more products to load
     const pagination = (response as any).pagination;
     if (pagination) {
       setTotalProducts(pagination.total || 0);
       // When filter is active, we fetch all products at once, so no more pages
       if (hasActiveFilter) {
         setHasMore(false);
       } else {
         setHasMore(pageNum < (pagination.pages || 1));
       }
     } else {
       // When filter is active, assume we got all products
       setHasMore(hasActiveFilter ? false : mappedProducts.length === ITEMS_PER_PAGE);
     }
   } catch (err: any) {
     setError(err?.message || 'Failed to fetch products');
     if (!append) {
       setProducts([]);
     }
   } finally {
     setLoading(false);
     setLoadingMore(false);
   }
 }, [searchQuery, selectedCategory]);


 // Fetch products when search or category changes
 useEffect(() => {
   setPage(1);
   setProducts([]);
   fetchProducts(1, false);
 }, [fetchProducts]);


 // Handle load more
 const handleLoadMore = () => {
   const nextPage = page + 1;
   setPage(nextPage);
   fetchProducts(nextPage, true);
 };


 // Prevent hydration mismatch
 useEffect(() => {
   setMounted(true);
 }, []);

 // Fetch categories from API
 useEffect(() => {
   const fetchCategories = async () => {
     try {
       const response = await settingsService.getCategories();
       if (response.success && response.data) {
         setApiCategories(response.data);
       }
     } catch (error) {
       console.error('Error fetching categories:', error);
     }
   };
   fetchCategories();
 }, []);

 // Build categories array from API data
 const categories = useMemo(() => {
   return apiCategories
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
 }, [apiCategories]);

 // Use default theme during SSR to prevent hydration mismatch
 const currentTheme = mounted ? theme : 'dark';


 const filteredProducts = useMemo(() => {
   let filtered = [...products];

  // Search is handled by API, but we do client-side filtering for category normalization
  // This handles cases where API returns "whiskey" but we filter by "whisky" (or vice versa)
  if (selectedCategory) {
    filtered = filtered.filter((p) => {
      const productCategory = p?.category?.toLowerCase();
      const normalizedSelectedCategory = selectedCategory.toLowerCase();
      
      // Handle both "whisky" and "whiskey" variations
      if (normalizedSelectedCategory === 'whisky' || normalizedSelectedCategory === 'whiskey') {
        return productCategory === 'whisky' || productCategory === 'whiskey';
      }
      
      return productCategory === normalizedSelectedCategory;
    });
  }


  // Price filter
  filtered = filtered.filter((p) => p?.price >= priceRange[0] && p?.price <= priceRange[1]);


  // Sort
  switch (sortBy) {
    case 'lowToHigh':
      filtered.sort((a, b) => (a?.price || 0) - (b?.price || 0));
      break;
    case 'highToLow':
      filtered.sort((a, b) => (b?.price || 0) - (a?.price || 0));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => (b?.isNew ? 1 : 0) - (a?.isNew ? 1 : 0));
  }


   return filtered;
 }, [products, selectedCategory, sortBy, priceRange]);


 const handleBuyNow = (product: Product, quantity: number = 1) => {
   // ProductCard already adds to cart before calling onBuyNow, so we just open checkout
   setNotificationProduct(product);
   setNotificationQuantity(quantity);
   setCheckoutOpen(true);
 };


 const handleAddToCart = (product: Product, quantity: number = 1) => {
   // ProductCard already adds to cart before calling onAddToCart, so we just show notification
   setNotificationProduct(product);
   setNotificationQuantity(quantity);
 };


 const handleCheckout = () => {
   setCheckoutOpen(true);
 };


 const clearFilters = () => {
   setSearchQuery('');
   setSelectedCategory(null);
   setSortBy('newest');
   setPriceRange([0, 100000]);
 };


 const hasActiveFilters = searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 100000;
 return (
   <div className={`min-h-screen transition-colors ${
     currentTheme === 'dark'
       ? 'bg-gradient-to-b from-background via-galaxy-dark to-background'
       : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
   }`}>
     <Header
       searchQuery={searchQuery}
       onSearchChange={setSearchQuery}
       onCheckout={handleCheckout}
     />


     <main className="container mx-auto px-4 py-8 pt-24">
       <div className="container mx-auto px-4">
         {/* Page Header */}
         <div className="mb-6 sm:mb-8">
           <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-display mb-1 sm:mb-2 ${
             currentTheme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
           }`}>
             {t('allProducts')}
           </h1>
           <p className={`text-sm sm:text-base ${currentTheme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'}`}>
             {t('discoverCollection')}
           </p>
         </div>


         {/* Search and Filter Bar */}
         <div className="flex flex-col lg:flex-row gap-4 mb-8">
           {/* Search */}
           <div className="flex-1 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t('searchPlaceholder')}
               className="w-full pl-12 pr-4 py-3 bg-card/80 backdrop-blur-sm border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20 transition-all"
             />
             {searchQuery && (
               <button
                 onClick={() => setSearchQuery('')}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
               >
                 <X className="h-4 w-4" />
               </button>
             )}
           </div>


           {/* Filter Toggle (Mobile) */}
           <button
             onClick={() => setShowFilters(!showFilters)}
             className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-card/80 border border-border rounded-xl text-foreground cursor-pointer"
           >
             <SlidersHorizontal className="h-5 w-5" />
             {t('filters')}
             {hasActiveFilters && (
               <span className="h-2 w-2 bg-primary-btn rounded-full"></span>
             )}
           </button>


           {/* Desktop Filters */}
           <div className="hidden lg:flex items-center gap-4">
             {/* Category Dropdown - Uses categories from API response */}
             <Select
               value={selectedCategory || "all"}
               onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
             >
               <SelectTrigger className={`w-[180px] ${
                 currentTheme === 'dark'
                   ? 'bg-card/80 border-border text-foreground'
                   : 'bg-white border-gray-200 text-gray-900'
               }`}>
                 <SelectValue placeholder={t('allCategories')} />
               </SelectTrigger>
               <SelectContent 
                 side="bottom"
                 className={currentTheme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'}
               >
                 <SelectItem value="all" className="cursor-pointer">
                   {t('allCategories')}
                 </SelectItem>
                 {categories.map((cat) => (
                   <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                     {language === 'en' ? cat.name : cat.nameNe}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>


             {/* Price Range */}
             <div className="relative">
               <select
                 value={`${priceRange[0]}-${priceRange[1]}`}
                 onChange={(e) => {
                   const [min, max] = e.target.value.split('-').map(Number);
                   setPriceRange([min, max]);
                 }}
                 className="appearance-none pl-4 pr-10 py-3 bg-card/80 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-border cursor-pointer"
               >
                 <option value="0-100000">{t('allPrices')}</option>
                 <option value="0-1000">{t('under1000')}</option>
                 <option value="1000-3000">{t('price1000to3000')}</option>
                 <option value="3000-5000">{t('price3000to5000')}</option>
                 <option value="5000-10000">{t('price5000to10000')}</option>
                 <option value="10000-100000">{t('above10000')}</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
             </div>


             {/* Sort */}
             <div className="relative">
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="appearance-none pl-4 pr-10 py-3 bg-card/80 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-border cursor-pointer"
               >
                 <option value="newest">{t('newest')}</option>
                 <option value="lowToHigh">{t('lowToHigh')}</option>
                 <option value="highToLow">{t('highToLow')}</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
             </div>


             {/* View Mode */}
             <div className="flex items-center bg-card/80 border border-border rounded-xl overflow-hidden">
               <button
                 onClick={() => setViewMode('grid')}
                 className={`p-3 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-primary-btn text-text-inverse' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 <Grid3X3 className="h-5 w-5" />
               </button>
               <button
                 onClick={() => setViewMode('list')}
                 className={`p-3 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-primary-btn text-text-inverse' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 <List className="h-5 w-5" />
               </button>
             </div>


             {/* Clear Filters */}
             {hasActiveFilters && (
               <button
                 onClick={clearFilters}
                 className="px-4 py-3 text-primary-text hover:text-ternary-text transition-colors cursor-pointer"
               >
                 {t('clearAllFilters')}
               </button>
             )}
           </div>
         </div>


         {/* Mobile Filters Panel */}
         {showFilters && (
           <div className="lg:hidden bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-6 space-y-4">
             {/* Category - Uses categories from API response */}
             <div>
               <label className="text-sm font-medium text-foreground mb-2 block">{t('category')}</label>
               <select
                 value={selectedCategory || ''}
                 onChange={(e) => setSelectedCategory(e.target.value || null)}
                 className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground"
               >
                 <option value="">{t('allCategories')}</option>
                 {categories.map((cat) => (
                   <option key={cat.id} value={cat.id}>
                   {language === 'en' ? cat.name : cat.nameNe}
                   </option>
                 ))}
               </select>
             </div>


             {/* Price Range */}
             <div>
               <label className="text-sm font-medium text-foreground mb-2 block">{t('priceRange')}</label>
               <select
                 value={`${priceRange[0]}-${priceRange[1]}`}
                 onChange={(e) => {
                   const [min, max] = e.target.value.split('-').map(Number);
                   setPriceRange([min, max]);
                 }}
                 className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground"
               >
                 <option value="0-100000">{t('allPrices')}</option>
                 <option value="0-1000">{t('under1000')}</option>
                 <option value="1000-3000">{t('price1000to3000')}</option>
                 <option value="3000-5000">{t('price3000to5000')}</option>
                 <option value="5000-10000">{t('price5000to10000')}</option>
                 <option value="10000-100000">{t('above10000')}</option>
               </select>
             </div>


             {/* Sort */}
             <div>
               <label className="text-sm font-medium text-foreground mb-2 block">{t('sortBy')}</label>
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground"
               >
                 <option value="newest">{t('newest')}</option>
                 <option value="lowToHigh">{t('lowToHigh')}</option>
                 <option value="highToLow">{t('highToLow')}</option>
               </select>
             </div>


             {/* Clear Filters */}
             {hasActiveFilters && (
               <button
                 onClick={clearFilters}
                 className="w-full py-3 text-primary-text border border-primary-border rounded-xl hover:bg-primary-btn/10 transition-colors cursor-pointer"
               >
                 {t('clearAllFilters')}
               </button>
             )}
           </div>
         )}


        {/* Category Selector */}
        {/* <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        /> */}


         {/* Loading State */}
         {loading && (
           <div className="flex flex-col items-center justify-center py-16">
             <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
             <p className="text-muted-foreground">{t('loadingProducts')}</p>
           </div>
         )}


         {/* Error State */}
         {error && !loading && (
           <div className="text-center py-16">
             <div className="text-6xl mb-4">⚠️</div>
             <h3 className="text-xl font-semibold text-foreground mb-2">{t('errorLoadingProducts')}</h3>
             <p className="text-muted-foreground mb-6">{error}</p>
             <button
               onClick={() => window.location.reload()}
               className="px-6 py-3 bg-primary-gradient text-text-inverse rounded-xl hover:shadow-primary-lg transition-all cursor-pointer"
             >
               {t('retry')}
             </button>
           </div>
         )}


         {/* Results Count */}
         {!loading && !error && (
           <div className="flex items-center justify-between mb-6">
             <p className="text-muted-foreground">
               {t('showingProducts')} <span className="text-foreground font-medium">{filteredProducts.length}</span> {t('productsCount')}
             </p>
           </div>
         )}


         {/* Products Grid */}
         {!loading && !error && filteredProducts.length > 0 ? (
           <>
             <div className={`grid ${
               viewMode === 'grid'
                 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                 : 'grid-cols-1 gap-4'
             }`}>
               {filteredProducts.map((product, index) => (
                 <ProductCard
                   key={product.id || `product-${index}`}
                   product={product}
                   onBuyNow={handleBuyNow}
                   onViewDetails={setSelectedProduct}
                   onAddToCart={handleAddToCart}
                 />
               ))}
             </div>


             {/* Load More Button - only show when no filters are active */}
             {hasMore && !searchQuery && !selectedCategory && (
               <div className="flex justify-center mt-10">
                 <button
                   onClick={handleLoadMore}
                   disabled={loadingMore}
                   className="flex items-center gap-2 px-8 py-3 bg-flame-gradient text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-flame-orange/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {loadingMore ? (
                     <>
                       <Loader2 className="h-5 w-5 animate-spin" />
                       Loading...
                     </>
                   ) : (
                     <>
                       Load More Products
                       {totalProducts > 0 && (
                         <span className="text-sm opacity-80">
                           ({products.length} of {totalProducts})
                         </span>
                       )}
                     </>
                   )}
                 </button>
               </div>
             )}


             {/* Show total count when all loaded */}
             {!hasMore && products.length > 0 && (
               <div className="text-center mt-10">
                 <p className="text-muted-foreground">
                   Showing all {products.length} products
                 </p>
               </div>
             )}
           </>
         ) : !loading && !error ? (
           <div className="text-center py-16">
             <div className="text-6xl mb-4">🍷</div>
             <h3 className="text-xl font-semibold text-foreground mb-2">{t('noProductsFound')}</h3>
             <p className="text-muted-foreground mb-6">{t('tryAdjustingFilters')}</p>
             <button
               onClick={clearFilters}
               className="px-6 py-3 bg-primary-gradient text-text-inverse rounded-xl hover:shadow-primary-lg transition-all cursor-pointer"
             >
               {t('clearAllFilters')}
             </button>
           </div>
         ) : null}
       </div>
     </main>


     <Footer />


     {/* Product Detail Modal */}
     {selectedProduct && (
       <ProductDetailModal
         product={selectedProduct}
         onClose={() => setSelectedProduct(null)}
         onBuyNow={handleBuyNow}
         onAddToCart={handleAddToCart}
       />
     )}


     {/* Checkout Modal */}
     <CheckoutModal
       open={checkoutOpen}
       onClose={() => setCheckoutOpen(false)}
     />


     <CartNotification
       product={notificationProduct}
       quantity={notificationQuantity}
       onClose={() => setNotificationProduct(null)}
     />
   </div>
 );
};

export default ProductsPageContent;

