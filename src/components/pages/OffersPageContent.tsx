"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { productsService, Product as ApiProduct } from "@/services/products.service";
import { offersService, Offer } from "@/services/offers.service";
import { Product } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CheckoutModal from "@/components/CheckoutModal";
import CartNotification from "@/components/CartNotification";
import {
  Percent, Clock, Truck, Gift, Sparkles, Loader2, AlertCircle,
  Tag, Zap, Star, Heart, ShoppingBag, Award, Crown, Flame,
  Package, BadgePercent, PartyPopper, Ticket, Trophy,
  LucideIcon
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

// Map icon string names to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  clock: Clock,
  gift: Gift,
  sparkles: Sparkles,
  tag: Tag,
  zap: Zap,
  star: Star,
  heart: Heart,
  percent: Percent,
  shopping: ShoppingBag,
  shoppingbag: ShoppingBag,
  award: Award,
  crown: Crown,
  flame: Flame,
  package: Package,
  badgepercent: BadgePercent,
  partypopper: PartyPopper,
  ticket: Ticket,
  trophy: Trophy,
};

// Default gradient colors for offers
const defaultGradients = [
  "from-green-500 to-emerald-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-pink-600",
  "from-primary-btn to-secondary-btn",
  "from-orange-500 to-red-600",
  "from-indigo-500 to-purple-600",
];

const OffersPageContent = () => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState<Product | null>(null);
  const [notificationQuantity, setNotificationQuantity] = useState(1);
  const [buyNowItem, setBuyNowItem] = useState<{ product: Product; quantity: number } | null>(null);

  // Offers state
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);

  // Map API product to internal Product type
  const mapApiProductToProduct = (apiProduct: any): Product => {
    // Get discount info from API
    const discountPercent = apiProduct.discountPercent || 0;
    const discountAmount = apiProduct.discountAmount || 0;
    const hasDiscount = discountPercent > 0 || discountAmount > 0;

    // Use finalPrice as current price, original price is the base price when there's a discount
    const currentPrice = apiProduct.finalPrice || apiProduct.price || 0;
    const originalPrice = hasDiscount ? apiProduct.price : undefined;

    // Handle API response structure: type instead of category
    const categoryValue = apiProduct.type || apiProduct.category || '';
    let category = categoryValue ? categoryValue.toLowerCase() : 'other';
    if (category === 'whiskey' || category === 'whisky') {
      category = 'whisky';
    }

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

      const response = await productsService.getAll({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
      });

      const mappedProducts = (response.data || []).map(mapApiProductToProduct);

      if (append) {
        setProducts(prev => [...prev, ...mappedProducts]);
      } else {
        setProducts(mappedProducts);
      }

      // Check if there are more products to load
      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalProducts(pagination.total || 0);
        setHasMore(pageNum < (pagination.pages || 1));
      } else {
        setHasMore(mappedProducts.length === ITEMS_PER_PAGE);
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
  }, [searchQuery]);

  // Fetch products when search changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setOffersLoading(true);
        setOffersError(null);

        const response = await offersService.getAll();

        if (response.success) {
          // Filter only active offers and sort by order
          const activeOffers = (response.data || [])
            .filter(offer => offer.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setOffers(activeOffers);
        } else {
          setOffersError(response.message || 'Failed to load offers');
        }
      } catch (err: any) {
        console.error('Error fetching offers:', err);
        setOffersError(err?.message || 'Failed to load offers');
      } finally {
        setOffersLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  // Filter products that have discounts (originalPrice > price)
  // Also include products that have discountPercent, discountAmount, or finalPrice fields
  const discountedProducts = products.filter((p) => {
    // Check if product has an original price higher than current price
    if (p.originalPrice && p.originalPrice > p.price) {
      return true;
    }
    return false;
  });

  // Search is handled by API, so we just use discounted products
  // No need for additional client-side search filtering
  const filteredProducts = discountedProducts;

  // Helper function to check if icon is an image URL
  const isImageUrl = (icon?: string): boolean => {
    if (!icon) return false;
    return icon.startsWith('http') || icon.startsWith('/');
  };

  // Helper function to get icon component from icon name string
  const getIconComponent = (iconName?: string): LucideIcon => {
    if (!iconName) return Gift; // Default icon
    const normalizedName = iconName.toLowerCase().trim();
    return iconMap[normalizedName] || Gift;
  };

  // Helper function to get gradient color
  const getGradientColor = (color?: string, index: number = 0): string => {
    if (!color || color.trim() === '') {
      // Return a default gradient based on index
      return defaultGradients[index % defaultGradients.length];
    }

    // If it's a hex color, create a gradient from it
    if (color.startsWith('#')) {
      return `from-[${color}] to-[${color}]/80`;
    }

    // If it already looks like a gradient class, use it
    if (color.includes('from-') || color.includes('to-')) {
      return color;
    }

    // Otherwise, try to use it as a Tailwind color
    return `from-${color}-500 to-${color}-600`;
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    // Buy Now goes directly to checkout without adding to cart or showing notification
    setBuyNowItem({ product, quantity });
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

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary-gradient text-center mb-6 sm:mb-8">
          {t("specialOffers")}
        </h1>

        {/* Offer Cards */}
        {offersLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-xl bg-card border border-border animate-pulse h-[100px] sm:h-[120px] md:h-[160px] flex flex-col justify-end"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-muted rounded-md mb-2 sm:mb-4 absolute top-2 sm:top-4 md:top-6 left-2 sm:left-4 md:left-6" />
                <div className="h-3 sm:h-5 md:h-6 bg-muted rounded-md w-3/4 mb-1 sm:mb-2" />
                <div className="h-2 sm:h-3 md:h-4 bg-muted rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : offersError ? (
          <div className="text-center py-8 mb-8 sm:mb-12 bg-card rounded-xl">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-muted-foreground">{offersError}</p>
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
            {offers.map((offer, index) => {
              const isImage = isImageUrl(offer.icon);
              const Icon = !isImage ? getIconComponent(offer.icon) : null;
              const gradientColor = getGradientColor(offer.color, index);

              return (
                <div
                  key={offer._id || offer.id || index}
                  className={`relative p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradientColor} text-white overflow-hidden group hover:scale-[1.03] hover:shadow-xl transition-all duration-300 cursor-pointer`}
                  style={offer.color?.startsWith('#') ? {
                    background: `linear-gradient(135deg, ${offer.color}, ${offer.color}cc)`
                  } : undefined}
                >
                  {/* Decorative background icon */}
                  <div className="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                    {isImage ? (
                      <img src={offer.icon} alt="" className="w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 object-contain" />
                    ) : Icon && (
                      <Icon className="w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28" />
                    )}
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                  {/* Icon + Text inline */}
                  <div className="relative z-10 flex items-start gap-2.5 sm:gap-3">
                    {/* Icon container */}
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300 shadow-sm">
                      {isImage ? (
                        <img src={offer.icon} alt={offer.title} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain" />
                      ) : Icon && (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      )}
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm md:text-base font-bold leading-tight">
                        {offer.title}
                      </h3>
                      {((offer.discountPercent !== undefined && offer.discountPercent > 0) || (offer.discountAmount !== undefined && offer.discountAmount > 0)) && (
                        <span className="inline-block mt-1 sm:mt-1.5 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold text-yellow-100 shadow-sm">
                          {offer.discountPercent && offer.discountPercent > 0 ? `${offer.discountPercent}% OFF` : `Rs. ${offer.discountAmount} OFF`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 mb-8 sm:mb-12 bg-card rounded-xl">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">{t('noOffers') || 'No special offers available at the moment'}</p>
          </div>
        )}

        {/* Discounted Products */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Percent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-color-secondary" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-color-secondary">
              {t("productsOnSale")}
            </h2>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border border-border bg-card-purple animate-pulse">
                  {/* Image Skeleton */}
                  <div className="relative w-full overflow-hidden bg-muted" style={{ paddingBottom: '75%' }}></div>

                  {/* Content Skeleton */}
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="h-3 w-1/4 bg-muted rounded"></div>
                    <div className="h-5 w-3/4 bg-muted rounded"></div>
                    <div className="h-3 w-1/2 bg-muted rounded"></div>

                    {/* Price */}
                    <div className="mt-4 flex gap-2">
                      <div className="h-6 w-1/3 bg-muted rounded"></div>
                      <div className="h-6 w-1/4 bg-muted rounded"></div>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-12 bg-muted rounded"></div>
                        <div className="h-8 w-24 bg-muted rounded"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-10 flex-1 bg-muted rounded"></div>
                        <div className="h-10 flex-1 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

                  {/* Load More Button - only show if we have enough discounted products and more to load */}
                  {hasMore && !searchQuery && discountedProducts.length >= ITEMS_PER_PAGE && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-8 py-3 bg-flame-gradient text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-flame-orange/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <>
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
                  {!hasMore && discountedProducts.length > 0 && !searchQuery && (
                    <div className="text-center mt-10">
                      <p className="text-muted-foreground">
                        Showing all {discountedProducts.length} discounted products
                      </p>
                    </div>
                  )}
                </>
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
        onClose={() => {
          setCheckoutOpen(false);
          setBuyNowItem(null);
        }}
        buyNowItem={buyNowItem}
      />

      <CartNotification
        product={notificationProduct}
        quantity={notificationQuantity}
        onClose={() => setNotificationProduct(null)}
      />
    </div>
  );
};

export default OffersPageContent;

