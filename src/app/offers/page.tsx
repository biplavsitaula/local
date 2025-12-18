"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import { Product } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CheckoutModal from "@/components/CheckoutModal";
import { Percent, Clock, Truck, Gift, Sparkles } from "lucide-react";

const Offers = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const discountedProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price);

  const offers = [
    {
      icon: Truck,
      title: t("freeDeliveryTitle"),
      description: t("freeDeliveryDesc"),
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Clock,
      title: t("expressDelivery"),
      description: t("expressDeliveryDesc"),
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Gift,
      title: t("bulkDiscountTitle"),
      description: t("bulkDiscountDesc"),
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Sparkles,
      title: t("festivalSpecial"),
      description: t("festivalSpecialDesc"),
      color: "from-primary-btn to-secondary-btn",
    },
  ];

  const handleBuyNow = (product: Product) => {
    addToCart(product, 1);
    setCheckoutOpen(true);
  };

  const handleCheckout = () => {
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-ternary-text text-center mb-8">
          {t("specialOffers")}
        </h1>

        {/* Offer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {offers.map((offer, index) => {
            const Icon = offer.icon;
            return (
              <div
                key={index}
                className={`relative p-6 rounded-xl bg-gradient-to-br ${offer.color} text-white overflow-hidden group hover:scale-105 transition-transform duration-300`}
              >
                <div className="absolute -right-4 -top-4 opacity-20">
                  <Icon className="w-24 h-24" />
                </div>
                <Icon className="w-10 h-10 mb-4" />
                <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                <p className="text-white/80">{offer.description}</p>
              </div>
            );
          })}
        </div>

        {/* Discounted Products */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Percent className="w-8 h-8 text-secondary-text" />
            <h2 className="text-2xl font-display font-bold text-ternary-text">
              {t("productsOnSale")}
            </h2>
          </div>

          {discountedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {discountedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl">
              <Percent className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {t("noProductsOnSale")}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
};

export default Offers;

