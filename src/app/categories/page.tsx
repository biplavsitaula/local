"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { productsService, Product as ApiProduct } from "@/services/products.service";
import { Product } from "@/types";
import { Wine, Beer, GlassWater, Martini, Grape, Cherry, Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CheckoutModal from "@/components/CheckoutModal";
import CartNotification from "@/components/CartNotification";

const Categories = () => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState<Product | null>(null);
  const [notificationQuantity, setNotificationQuantity] = useState(1);

  // Map API product to internal Product type
  const mapApiProductToProduct = (apiProduct: any): Product => {
    // Calculate original price if there's a discount
    const originalPrice = apiProduct.discountPercent && apiProduct.discountPercent > 0
      ? apiProduct.price / (1 - apiProduct.discountPercent / 100)
      : undefined;

    // Normalize category - handle API response structure: type instead of category
    const categoryValue = apiProduct.type || apiProduct.category || '';
    let category = categoryValue ? categoryValue.toLowerCase() : 'other';
    if (category === 'whiskey' || category === 'whisky') {
      category = 'whisky';
    }

    // Use finalPrice if available, otherwise use price
    const finalPrice = apiProduct.finalPrice || apiProduct.price;

    // Format alcohol percentage
    const alcoholPercentage = apiProduct.alcoholPercentage 
      ? `${apiProduct.alcoholPercentage}%`
      : undefined;

    // Determine tag based on isRecommended or status
    let tag = apiProduct.tag;
    if (!tag && apiProduct.isRecommended) {
      tag = 'RECOMMENDED';
    }

    // Check if product is new (created within last 30 days)
    const isNew = apiProduct.createdAt 
      ? (Date.now() - new Date(apiProduct.createdAt).getTime()) < (30 * 24 * 60 * 60 * 1000)
      : false;

    return {
      id: apiProduct._id || apiProduct.id || '',
      name: apiProduct.name || '',
      category,
      price: finalPrice,
      originalPrice: originalPrice ? Math.round(originalPrice * 100) / 100 : undefined,
      image: apiProduct.image || apiProduct.imageUrl || '',
      description: apiProduct.description || `Premium ${categoryValue || 'Beverage'} - ${apiProduct.name || 'Product'}`,
      volume: apiProduct.volume || '750ml',
      alcoholContent: alcoholPercentage,
      alcohol: alcoholPercentage,
      inStock: (apiProduct.stock || 0) > 0 && apiProduct.status !== 'Out of Stock',
      isNew,
      stock: apiProduct.stock || 0,
      rating: apiProduct.rating,
      tag,
      sales: apiProduct.totalSold,
    } as Product;
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsService.getAll({ limit: 1000 });
        
        // Debug logging
        console.log('API Response:', response);
        console.log('Products data:', response.data);
        console.log('Products count:', response.data?.length || 0);
        
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid response data:', response);
          setError('Invalid response format from server');
          setProducts([]);
          return;
        }

        const mappedProducts = response.data.map(mapApiProductToProduct);
        console.log('Mapped products:', mappedProducts);
        console.log('Mapped products count:', mappedProducts.length);
        
        setProducts(mappedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { id: "whisky", icon: Wine, color: "from-amber-500 to-amber-700", key: "categoryWhisky" },
    { id: "vodka", icon: GlassWater, color: "from-blue-400 to-blue-600", key: "categoryVodka" },
    { id: "rum", icon: Cherry, color: "from-red-500 to-red-700", key: "categoryRum" },
    { id: "beer", icon: Beer, color: "from-yellow-500 to-yellow-700", key: "categoryBeer" },
    { id: "gin", icon: Martini, color: "from-green-500 to-green-700", key: "categoryGin" },
    { id: "tequila", icon: Grape, color: "from-purple-500 to-purple-700", key: "categoryTequila" },
    { id: "cognac", icon: Wine, color: "from-amber-600 to-amber-800", key: "categoryCognac" },
    { id: "champagne", icon: GlassWater, color: "from-yellow-400 to-yellow-600", key: "categoryChampagne" },
  ];

  const getCategoryName = (categoryId: string): string => {
    const categoryMap: Record<string, string> = {
      whisky: "categoryWhisky",
      whiskey: "categoryWhisky",
      vodka: "categoryVodka",
      rum: "categoryRum",
      beer: "categoryBeer",
      wine: "categoryWine",
      gin: "categoryGin",
      tequila: "categoryTequila",
      cognac: "categoryCognac",
      champagne: "categoryChampagne",
    };
    const normalizedId = categoryId.toLowerCase();
    return t(categoryMap[normalizedId] as any) || categoryId;
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        const productCategory = p.category.toLowerCase();
        const selectedCategoryLower = selectedCategory.toLowerCase();
        // Handle variations like whiskey/whisky
        if (selectedCategoryLower === 'whisky' || selectedCategoryLower === 'whiskey') {
          return productCategory === 'whisky' || productCategory === 'whiskey';
        }
        return productCategory === selectedCategoryLower;
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.nameNe && p.nameNe.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

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

  // Use default theme during SSR to prevent hydration mismatch
  const currentTheme = mounted ? theme : 'dark';

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
        {/* Page Title */}
        <h1 className={`text-3xl md:text-4xl font-display font-bold text-center mb-8 ${
          currentTheme === 'dark' ? 'text-foreground' : 'text-gray-900'
        }`}>
          {t('browseCategories')}
        </h1>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`relative p-6 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  currentTheme === 'dark'
                    ? isSelected
                      ? `ring-2 ring-flame-orange bg-gradient-to-br ${category.color}`
                      : "bg-card hover:bg-card/80 border border-border hover:border-flame-orange/50"
                    : isSelected
                      ? `ring-2 ring-orange-500 bg-gradient-to-br ${category.color}`
                      : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-400 shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Icon
                    className={`w-10 h-10 ${
                      isSelected
                        ? "text-white"
                        : currentTheme === 'dark'
                        ? "text-flame-orange"
                        : "text-orange-600"
                    }`}
                  />
                  <span
                    className={`font-medium text-sm ${
                      isSelected
                        ? "text-white"
                        : currentTheme === 'dark'
                        ? "text-foreground"
                        : "text-gray-900"
                    }`}
                  >
                    {t(category.key as any)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('loadingProducts' as any)}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('errorLoadingProducts' as any)}</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-gradient text-text-inverse rounded-xl hover:shadow-primary-lg transition-all cursor-pointer"
            >
              {t('retry' as any)}
            </button>
          </div>
        )}

        {/* Products Section */}
        {!loading && !error && (
          <>
            <div className="mb-4">
              <h2
                className={`text-2xl font-display font-bold mb-6 ${
                  currentTheme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}
              >
                {selectedCategory
                  ? getCategoryName(selectedCategory)
                  : t('allProducts')}
                <span
                  className={`text-lg ml-2 ${
                    currentTheme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
                  }`}
                >
                  ({filteredProducts.length})
                </span>
              </h2>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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
            ) : !loading && !error ? (
              <div className="text-center py-12">
                <p
                  className={`text-lg ${
                    currentTheme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
                  }`}
                >
                  {selectedCategory 
                    ? t('noProductsInCategory') 
                    : t('noProductsFound' as any)}
                </p>
                {products.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('tryRefreshing' as any)}
                  </p>
                )}
              </div>
            ) : null}
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

export default Categories;

