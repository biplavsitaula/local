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
  const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
    const originalPrice = apiProduct.discountPercent
      ? Math.round(apiProduct.price / (1 - apiProduct.discountPercent / 100))
      : undefined;

    let category = apiProduct.category.toLowerCase();
    if (category === 'whiskey' || category === 'whisky') {
      category = 'whisky';
    }

    return {
      id: apiProduct._id || apiProduct.id || '',
      name: apiProduct.name,
      category,
      price: apiProduct.price,
      originalPrice,
      image: apiProduct.imageUrl || apiProduct.image,
      description: apiProduct.description || `Premium ${apiProduct.category} - ${apiProduct.name}`,
      volume: '750ml',
      alcoholContent: '40%',
      alcohol: '40%',
      inStock: (apiProduct.stock || 0) > 0,
      isNew: false,
      stock: apiProduct.stock,
      rating: apiProduct.rating,
      tag: apiProduct.tag,
    } as Product;
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsService.getAll({ limit: 1000 });
        const mappedProducts = (response.data || []).map(mapApiProductToProduct);
        setProducts(mappedProducts);
      } catch (err: any) {
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
  ];

  const getCategoryName = (categoryId: string): string => {
    const categoryMap: Record<string, string> = {
      whisky: "categoryWhisky",
      vodka: "categoryVodka",
      rum: "categoryRum",
      beer: "categoryBeer",
      wine: "categoryWine",
      gin: "categoryGin",
    };
    return t(categoryMap[categoryId] as any) || categoryId;
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
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
  }, [selectedCategory, searchQuery]);

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
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Error loading products</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-gradient text-text-inverse rounded-xl hover:shadow-primary-lg transition-all cursor-pointer"
            >
              Retry
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
            ) : (
              <div className="text-center py-12">
                <p
                  className={`text-lg ${
                    currentTheme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
                  }`}
                >
                  {t('noProductsInCategory')}
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

