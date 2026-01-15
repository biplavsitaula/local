"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { productsService, Product as ApiProduct } from "@/services/products.service";
import { Product } from "@/types";
import { Loader2, AlertCircle, Wine } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CheckoutModal from "@/components/CheckoutModal";
import CartNotification from "@/components/CartNotification";
import CategorySelector from "@/components/CategorySelector";
import { useCategories } from "@/hooks/useCategories";

const ITEMS_PER_PAGE = 10;

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
  
  // Use categories hook
  const { categories } = useCategories({ includeAll: false });

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
      // For "whisky" or "whiskey", don't filter by category in API since API might use either variation
      // We'll filter client-side to handle both variations
      let apiCategory: string | null = selectedCategory;
      const normalizedCategory = selectedCategory?.toLowerCase();
      if (normalizedCategory === 'whisky' || normalizedCategory === 'whiskey') {
        apiCategory = null; // Fetch all and filter client-side
      }
      
      // When a category is selected, fetch all products (use high limit, always from page 1)
      // This ensures category filtering works across ALL products, not just 10
      // Otherwise use pagination with ITEMS_PER_PAGE
      const limit = selectedCategory ? 10000 : ITEMS_PER_PAGE;
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

  // Products are already filtered by API, but we need to handle category normalization
  // API might return "whiskey" but we filter by "whisky" (or vice versa), so normalize here
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Normalize category matching - handle both "whiskey" and "whisky"
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        const productCategory = p.category?.toLowerCase();
        const normalizedSelectedCategory = selectedCategory.toLowerCase();
        
        // Handle both "whisky" and "whiskey" variations
        if (normalizedSelectedCategory === 'whisky' || normalizedSelectedCategory === 'whiskey') {
          return productCategory === 'whisky' || productCategory === 'whiskey';
        }
        
        return productCategory === normalizedSelectedCategory;
      });
    }

    return filtered;
  }, [products, selectedCategory]);

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    // Buy Now goes directly to checkout without adding to cart or showing notification
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

        {/* Categories Selector */}
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

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

