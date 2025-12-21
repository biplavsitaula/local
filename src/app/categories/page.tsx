"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { products } from "@/data/products";
import { Product } from "@/types";
import { Wine, Beer, GlassWater, Martini, Grape, Cherry } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CheckoutModal from "@/components/CheckoutModal";

const Categories = () => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { id: "whisky", icon: Wine, color: "from-amber-500 to-amber-700" },
    { id: "vodka", icon: GlassWater, color: "from-blue-400 to-blue-600" },
    { id: "rum", icon: Cherry, color: "from-red-500 to-red-700" },
    { id: "beer", icon: Beer, color: "from-yellow-500 to-yellow-700" },
  ];

  const categoryNames: Record<string, Record<string, string>> = {
    whisky: { en: "Whiskey", ne: "व्हिस्की" },
    vodka: { en: "Vodka", ne: "भोड्का" },
    rum: { en: "Rum", ne: "रम" },
    beer: { en: "Beer", ne: "बियर" },
    wine: { en: "Wine", ne: "वाइन" },
    gin: { en: "Gin", ne: "जिन" },
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

  const handleBuyNow = (product: Product) => {
    addToCart(product, 1);
    setCheckoutOpen(true);
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
                className={`relative p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  currentTheme === 'dark'
                    ? isSelected
                      ? `ring-2 ring-flame-orange bg-gradient-to-br ${category.color}`
                      : "bg-card hover:bg-card/80 border border-border"
                    : isSelected
                      ? `ring-2 ring-orange-500 bg-gradient-to-br ${category.color}`
                      : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
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
                    {categoryNames[category.id][language]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Products Section */}
        <div className="mb-4">
          <h2
            className={`text-2xl font-display font-bold mb-6 ${
              currentTheme === 'dark' ? 'text-foreground' : 'text-gray-900'
            }`}
          >
            {selectedCategory
              ? categoryNames[selectedCategory][language]
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
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
                onBuyNow={handleBuyNow}
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
      </main>

      <Footer />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={handleBuyNow}
        />
      )}

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
};

export default Categories;

