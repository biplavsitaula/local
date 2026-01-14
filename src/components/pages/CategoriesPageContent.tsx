"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { productsService, Product as ApiProduct } from "@/services/products.service";
import { settingsService } from "@/services/settings.service";
import { Product } from "@/types";
import { Wine, Beer, GlassWater, Martini, Grape, Cherry, Loader2, AlertCircle, LayoutGrid, Sparkles, Coffee, FlameKindling, Package, LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CheckoutModal from "@/components/CheckoutModal";
import CartNotification from "@/components/CartNotification";

const ITEMS_PER_PAGE = 10;

// Mapping for category metadata (icons, colors, Nepali names)
const categoryMetadata: Record<string, { icon: LucideIcon; color: string; nameNe: string }> = {
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

const CategoriesPageContent = () => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState<Product | null>(null);
  const [notificationQuantity, setNotificationQuantity] = useState(1);
  const [apiCategories, setApiCategories] = useState<string[]>([]);

  // Map API product to internal Product type
  const mapApiProductToProduct = (apiProduct: any): Product => {
    // Normalize category - handle API response structure: type instead of category
    const categoryValue = apiProduct.type || apiProduct.category || '';
    let category = categoryValue ? categoryValue.toLowerCase() : 'other';
    if (category === 'whiskey' || category === 'whisky') {
      category = 'whisky';
    }

    // Get discount info from API
    const discountPercent = apiProduct.discountPercent || 0;
    const discountAmount = apiProduct.discountAmount || 0;
    const hasDiscount = discountPercent > 0 || discountAmount > 0;

    // Use finalPrice as current price, original price is the base price when there's a discount
    const currentPrice = apiProduct.finalPrice || apiProduct.price || 0;
    const originalPrice = hasDiscount ? apiProduct.price : undefined;

    // Use API tag directly (discount is shown separately via originalPrice)
    const tag = apiProduct.tag || undefined;

    return {
      id: apiProduct._id || apiProduct.id || '',
      name: apiProduct.name || '',
      category,
      price: currentPrice,
      originalPrice,
      image: apiProduct.image || apiProduct.imageUrl || '',
      description: apiProduct.description || `Premium ${categoryValue || 'Beverage'} - ${apiProduct.name || 'Product'}`,
      volume: apiProduct.volume || '750ml',
      alcoholContent: apiProduct.alcoholPercentage ? `${apiProduct.alcoholPercentage}%` : '40%',
      alcohol: apiProduct.alcoholPercentage ? `${apiProduct.alcoholPercentage}%` : '40%',
      inStock: (apiProduct.stock || 0) > 0,
      isNew: apiProduct.isNew || false,
      stock: apiProduct.stock || 0,
      rating: apiProduct.rating || 0,
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
      // For "whisky", don't filter by category in API since API might use "whiskey"
      // We'll filter client-side to handle both variations
      let apiCategory: string | null = selectedCategory;
      if (selectedCategory === 'whisky') {
        apiCategory = null; // Fetch all and filter client-side
      }
      
      // When a category is selected, fetch all products (use high limit, always from page 1)
      // Otherwise use pagination with ITEMS_PER_PAGE
      const limit = selectedCategory ? 1000 : ITEMS_PER_PAGE;
      const fetchPage = selectedCategory ? 1 : pageNum; // Always fetch page 1 when category is selected
      
      const response = await productsService.getAll({
        page: fetchPage,
        limit: limit,
        search: searchQuery || undefined,
        category: apiCategory || undefined,
      });
      
      const mappedProducts = (response.data || []).map(mapApiProductToProduct);
      
      // When category is selected, always replace (don't append) since we fetch all at once
      if (append && !selectedCategory) {
        setProducts(prev => [...prev, ...mappedProducts]);
      } else {
        setProducts(mappedProducts);
      }
      
      // Check if there are more products to load
      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalProducts(pagination.total || 0);
        // When category is selected, we fetch all products at once, so no more pages
        if (selectedCategory) {
          setHasMore(false);
        } else {
          setHasMore(pageNum < (pagination.pages || 1));
        }
      } else {
        // When category is selected, assume we got all products
        setHasMore(selectedCategory ? false : mappedProducts.length === ITEMS_PER_PAGE);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
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
    return apiCategories.map((cat) => {
      const lowerCat = cat.toLowerCase();
      const metadata = categoryMetadata[lowerCat] || defaultMetadata;
      return {
        id: lowerCat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1), // Capitalize first letter
        nameNe: metadata.nameNe || cat,
        icon: metadata.icon,
        color: metadata.color,
      };
    });
  }, [apiCategories]);

  // Products are already filtered by API, but we need to handle category normalization
  // API might return "whiskey" but we filter by "whisky", so normalize here
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Normalize category matching - handle both "whiskey" and "whisky"
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        const productCategory = p.category?.toLowerCase();
        if (selectedCategory === 'whisky') {
          return productCategory === 'whisky' || productCategory === 'whiskey';
        }
        return productCategory === selectedCategory.toLowerCase();
      });
    }

    return filtered;
  }, [products, selectedCategory]);

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    setNotificationProduct(product);
    setNotificationQuantity(quantity);
    setCheckoutOpen(true);
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setNotificationProduct(product);
    setNotificationQuantity(quantity);
  };

  const handleCheckout = () => {
    setCheckoutOpen(true);
  };

  // Use default theme during SSR to prevent hydration mismatch
  const currentTheme = mounted ? theme : 'dark';

  return (
    <div className={`min-h-screen transition-colors ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-b from-background via-galaxy-dark to-background'
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
    }`}>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} />
      
      <main className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-6 sm:mb-8 ${
          currentTheme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
        }`}>
          {t("browseByCategory" )}
        </h1>

        {/* Categories Grid - Desktop */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer group ${
                  isSelected
                    ? `bg-gradient-to-br ${category.color} text-white shadow-lg scale-105`
                    : currentTheme === 'dark'
                      ? 'bg-card hover:bg-card/80 border border-border hover:border-flame-orange/50'
                      : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-300 shadow-sm'
                }`}
              >
                <div className={`flex flex-col items-center gap-3 ${
                  isSelected ? '' : currentTheme === 'dark' ? 'text-foreground' : 'text-gray-700'
                }`}>
                  <div className={`p-3 rounded-xl ${
                    isSelected 
                      ? 'bg-white/20' 
                      : currentTheme === 'dark'
                        ? 'bg-secondary'
                        : 'bg-orange-50'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      isSelected ? 'text-white' : 'text-flame-orange'
                    }`} />
                  </div>
                  <span className="font-medium text-sm">
                    {language === "en" ? category.name : category.nameNe}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Categories Dropdown - Mobile */}
        <div className="md:hidden mb-8">
          <Select
            value={selectedCategory || "all"}
            onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
          >
            <SelectTrigger className={`w-full ${
              currentTheme === 'dark'
                ? 'bg-card border-border text-foreground'
                : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <SelectValue placeholder={t("selectCategory" )} />
            </SelectTrigger>
            <SelectContent className={currentTheme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'}>
              <SelectItem value="all" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-flame-orange" />
                  <span>{t("allCategories" )}</span>
                </div>
              </SelectItem>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <SelectItem key={category.id} value={category.id} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-flame-orange" />
                      <span>{language === "en" ? category.name : category.nameNe}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Category Header */}
        {selectedCategory && (
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-display font-bold ${
              currentTheme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
            }`}>
              {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {t("clearFilter" )}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('loadingProducts')}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16 bg-card rounded-xl">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
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

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id || `product-${index}`}
                      product={product}
                      onViewDetails={setSelectedProduct}
                      onBuyNow={handleBuyNow}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Load More Button - only show when no category is selected */}
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
                {!hasMore && products.length > 0 && !searchQuery && (
                  <div className="text-center mt-10">
                    <p className="text-muted-foreground">
                      Showing all {filteredProducts.length} products
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl">
                <Wine className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  {searchQuery.trim() 
                    ? (language === "en" ? `No products found for "${searchQuery}"` : `"${searchQuery}" को लागि कुनै उत्पादन फेला परेन`)
                    : t("noProductsInCategory" )}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

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

export default CategoriesPageContent;

