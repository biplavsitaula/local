"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { productsService, Product as ApiProduct } from "@/services/products.service";
import { Product } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CheckoutModal from "@/components/CheckoutModal";
import CartNotification from "@/components/CartNotification";
import { Percent, Clock, Truck, Gift, Sparkles, Loader2, AlertCircle } from "lucide-react";

const Offers = () => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState<Product | null>(null);
  const [notificationQuantity, setNotificationQuantity] = useState(1);

  // Map API product to internal Product type
  const mapApiProductToProduct = (apiProduct: any): Product => {
    // Handle multiple possible discount field names from API
    const discountPercent = apiProduct.discountPercent || apiProduct.discountPercentage || apiProduct.discount || 0;
    const discountAmount = apiProduct.discountAmount || 0;
    const finalPrice = apiProduct.finalPrice;
    
    // Calculate original price if there's a discount
    let originalPrice: number | undefined = undefined;
    if (discountPercent > 0) {
      // If discountPercent exists, calculate original price
      originalPrice = Math.round((apiProduct.price / (1 - discountPercent / 100)) * 100) / 100;
    } else if (discountAmount > 0 && finalPrice) {
      // If discountAmount exists, original price = finalPrice + discountAmount
      originalPrice = finalPrice + discountAmount;
    } else if (discountAmount > 0) {
      // If only discountAmount exists, original price = price + discountAmount
      originalPrice = (apiProduct.price || 0) + discountAmount;
    }

    // Handle API response structure: type instead of category
    const categoryValue = apiProduct.type || apiProduct.category || '';
    let category = categoryValue ? categoryValue.toLowerCase() : 'other';
    if (category === 'whiskey' || category === 'whisky') {
      category = 'whisky';
    }

    // Use finalPrice if available, otherwise use price
    const productPrice = finalPrice || apiProduct.price || 0;

    return {
      id: apiProduct._id || apiProduct.id || '',
      name: apiProduct.name || '',
      category,
      price: productPrice,
      originalPrice,
      image: apiProduct.image || apiProduct.imageUrl || '',
      description: apiProduct.description || `Premium ${categoryValue || 'Beverage'} - ${apiProduct.name || 'Product'}`,
      volume: apiProduct.volume || '750ml',
      alcoholContent: apiProduct.alcoholContent || apiProduct.alcohol || '40%',
      alcohol: apiProduct.alcohol || apiProduct.alcoholContent || '40%',
      inStock: (apiProduct.stock || 0) > 0,
      isNew: false,
      stock: apiProduct.stock || 0,
      rating: apiProduct.rating || 0,
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
        console.log('Fetched products:', mappedProducts);
        console.log('Products with discounts:', mappedProducts.filter(p => p.originalPrice && p.originalPrice > p.price));
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

  // Filter products that have discounts (originalPrice > price)
  // Also include products that have discountPercent, discountAmount, or finalPrice fields
  const discountedProducts = products.filter((p) => {
    // Check if product has an original price higher than current price
    if (p.originalPrice && p.originalPrice > p.price) {
      return true;
    }
    return false;
  });

  // Filter discounted products based on search query
  const filteredProducts = discountedProducts.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      product.name.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  });

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
  
  console.log('Discounted products count:', discountedProducts.length);
  console.log('Filtered products count:', filteredProducts.length);
  console.log('All products:', products);

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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <div className="text-center py-12 bg-card rounded-xl">
                  <Percent className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {searchQuery.trim() 
                      ? (language === "en" ? `No products found for "${searchQuery}"` : `"${searchQuery}" को लागि कुनै उत्पादन फेला परेन`)
                      : t("noProductsOnSale")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
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

export default Offers;

