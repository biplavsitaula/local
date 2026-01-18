"use client";




import React, { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import AgeDeniedScreen from "@/components/features/age-verification/AgeDeniedScreen";
import AgeVerificationModal from "@/components/features/age-verification/AgeVerificationModal";
import CategorySection from "@/components/CategorySection";
import CheckoutModal from "@/components/CheckoutModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ImageCarousel from "@/components/ImageCarousel";
import BrandCarousel from "@/components/BrandCarousel";
import ProductGrid from "@/components/features/product/ProductGrid";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CartNotification from "@/components/CartNotification";
import HierarchicalCategorySelector from "@/components/HierarchicalCategorySelector";
import { SuccessMsgModal } from "@/components/SuccessMsgModal";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { AgeStatus, Product } from "@/types";
import { useSeasonalTheme } from "@/hooks/useSeasonalTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { productsService, Product as ApiProduct } from "@/services/products.service";
import { ordersService } from "@/services/orders.service";
import { useCategories, CategoryFilter } from "@/hooks/useCategories";

// Storage key for tracked orders (must match CheckoutModal)
const TRACKED_ORDERS_KEY = 'flame_tracked_orders';

interface TrackedOrder {
  billNumber: string;
  email: string;
  status: string;
  createdAt: string;
  notified: boolean;
}




function PageContent() {
const { t } = useLanguage();
const { user, isAuthenticated } = useAuth();
const [searchQuery, setSearchQuery] = useState("");
const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>({});
const [checkoutOpen, setCheckoutOpen] = useState(false);

// Use categories hook with subcategories
const { categories } = useCategories({ includeAll: true, fetchSubCategories: true });
const [showSeasonalSection, setShowSeasonalSection] = useState(true);
const { theme: seasonalTheme } = useSeasonalTheme();
const { theme } = useTheme();
const [recentArrivals, setRecentArrivals] = useState<Product[]>([]);
const [mostRecommended, setMostRecommended] = useState<Product[]>([]);
const [loadingRecent, setLoadingRecent] = useState(true);
const [loadingRecommended, setLoadingRecommended] = useState(true);
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [notificationProduct, setNotificationProduct] = useState<Product | null>(null);
const [notificationQuantity, setNotificationQuantity] = useState(1);
const [buyNowItem, setBuyNowItem] = useState<{ product: Product; quantity: number } | null>(null);

// Order status notification state
const [orderStatusModal, setOrderStatusModal] = useState<{
  open: boolean;
  billNumber: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
} | null>(null);

// Check for order status updates
const checkOrderStatusUpdates = useCallback(async () => {
  if (!isAuthenticated || !user?.email) return;

  try {
    const stored = localStorage.getItem(TRACKED_ORDERS_KEY);
    if (!stored) return;

    const orders: TrackedOrder[] = JSON.parse(stored);
    const userEmail = user.email.toLowerCase();
    
    // Filter orders for current user that haven't been notified
    const userOrders = orders.filter(
      (o) => o.email.toLowerCase() === userEmail && !o.notified && o.status === 'pending'
    );

    if (userOrders.length === 0) return;

    // Check status for each order
    for (const order of userOrders) {
      try {
        const response = await ordersService.getOrderStatus(order.billNumber);
        if (response.success && response.data) {
          const newStatus = response.data.status?.toLowerCase();
          
          // If status changed from pending to accepted/rejected
          if (newStatus && newStatus !== 'pending' && order.status === 'pending') {
            // Update stored order
            const updatedOrders = orders.map((o) =>
              o.billNumber === order.billNumber
                ? { ...o, status: newStatus, notified: true }
                : o
            );
            localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify(updatedOrders));

            // Show notification modal
            const statusMessage = newStatus === 'accepted'
              ? t('orderAcceptedMessage') || 'Your order has been accepted and is being processed!'
              : t('orderRejectedMessage') || 'Your order has been rejected. Please contact support for more information.';

            setOrderStatusModal({
              open: true,
              billNumber: order.billNumber,
              status: newStatus as 'accepted' | 'rejected',
              message: statusMessage,
            });
            
            // Only show one notification at a time
            break;
          }
        }
      } catch (err) {
        console.error('Error checking order status:', err);
      }
    }
  } catch (err) {
    console.error('Error reading tracked orders:', err);
  }
}, [isAuthenticated, user?.email, t]);

// Poll for order status updates every 30 seconds
useEffect(() => {
  if (!isAuthenticated || !user?.email) return;

  // Check immediately on mount
  checkOrderStatusUpdates();

  // Then check every 30 seconds
  const interval = setInterval(checkOrderStatusUpdates, 30000);

  return () => clearInterval(interval);
}, [isAuthenticated, user?.email, checkOrderStatusUpdates]);




 // Map API product to internal Product type
 const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
   // Cast to any to access fields that may not be in the TypeScript interface
   const product = apiProduct as any;
  
   // Handle API response structure: type instead of category
   const categoryValue = product.type || product.category || '';
   // Keep original category name from API (capitalized)
   const category = categoryValue || 'Other';

   // Get discount info from API
   const discountPercent = product.discountPercent || 0;
   const discountAmount = product.discountAmount || 0;
   const hasDiscount = discountPercent > 0 || discountAmount > 0;

   // Use finalPrice as current price, original price is the base price when there's a discount
   const currentPrice = product.finalPrice || product.price || 0;
   const originalPrice = hasDiscount ? product.price : undefined;

   // Use API tag directly (discount is shown separately via originalPrice)
   const tag = product.tag || undefined;

   return {
     id: product._id || product.id || '',
     name: product.name || '',
     nameNe: product.nameNe || product.name || '',
     category,
     price: currentPrice,
     originalPrice,
     image: product.image || product.imageUrl || '',
     description: product.description || `Premium ${categoryValue || 'Beverage'} - ${product.name || 'Product'}`,
     volume: product.volume || '750ml',
     alcoholContent: product.alcoholPercentage ? `${product.alcoholPercentage}%` : '40%',
     alcohol: product.alcoholPercentage ? `${product.alcoholPercentage}%` : '40%',
     inStock: (product.stock || 0) > 0,
     isNew: product.isNew || false, // Only show NEW badge if API says it's new
     stock: product.stock,
     rating: product.rating,
     tag,
   } as Product;
 };




// Fetch recent arrivals (newest products)
useEffect(() => {
  const fetchRecentArrivals = async () => {
    try {
      setLoadingRecent(true);
      // Try to fetch products sorted by createdAt (newest first)
      const response = await productsService.getAll({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 20, // Fetch more to ensure we have enough after filtering
        search: searchQuery || undefined,
      });
    
      let products = response.data || [];
    
      // If no products with createdAt, try updatedAt
      if (products.length === 0) {
        const altResponse = await productsService.getAll({
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          limit: 20,
          search: searchQuery || undefined,
        });
        products = altResponse.data || [];
      }
    
      // Sort by createdAt or updatedAt if available, otherwise use the order from API
      const sortedProducts = [...products].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() :
                      (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() :
                      (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
        return dateB - dateA; // Descending order (newest first)
      });
    
      // Take the first 8 products and map them
      const mappedProducts = sortedProducts.slice(0, 8).map(mapApiProductToProduct);
      setRecentArrivals(mappedProducts);
    } catch (err: any) {
      console.error('Error fetching recent arrivals:', err);
      setRecentArrivals([]);
    } finally {
      setLoadingRecent(false);
    }
  };




  fetchRecentArrivals();
}, [searchQuery]);




// Fetch most recommended products
useEffect(() => {
  const fetchMostRecommended = async () => {
    try {
      setLoadingRecommended(true);
      const response = await productsService.getAll({
        view: 'recommended',
        limit: 10,
        search: searchQuery || undefined,
      });
      const mappedProducts = (response.data || []).slice(0, 8).map(mapApiProductToProduct);
      setMostRecommended(mappedProducts);
    } catch (err: any) {
      console.error('Error fetching most recommended:', err);
      setMostRecommended([]);
    } finally {
      setLoadingRecommended(false);
    }
  };




  fetchMostRecommended();
}, [searchQuery]);


// Search is now handled by API, so we can use products directly
// No need for client-side filtering since API handles search
const filteredRecentArrivals = recentArrivals;
const filteredMostRecommended = mostRecommended;




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




const handleCloseSeasonalSection = () => {
  setShowSeasonalSection(false);
};




return (
  <div className={`min-h-screen text-foreground transition-colors ${
    theme === 'dark'
      ? 'bg-gradient-to-b from-background via-galaxy-dark to-background'
      : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
  }`}>
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCheckout={() => setCheckoutOpen(true)}
            />
            <main className="flex flex-col gap-12">
              <HeroSection />
              
              {/* Image Carousel / Promotional Banners */}
              <ImageCarousel />

              {/* Brands Section */}
              <BrandCarousel />
            
              {/* Recent Arrivals Section */}
              <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-color-secondary">
                    {t("recentArrivals")}
                  </h2>
                  <Link
                    href="/products"
                    className="view-all-link gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-2 rounded-lg sm:rounded-xl"
                  >
                    {t("viewAll")}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              
                {loadingRecent ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredRecentArrivals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredRecentArrivals.map((product, index) => (
                      <ProductCard
                        key={product.id || `recent-${index}`}
                        product={product}
                        onBuyNow={handleBuyNow}
                        onViewDetails={setSelectedProduct}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery.trim() 
                        ? `${t("noRecentArrivalsSearch")} "${searchQuery}"`
                        : t("noRecentArrivals")}
                    </p>
                  </div>
                )}
              </section>




              {/* Most Recommended Section */}
              <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-color-secondary">
                    {t("mostRecommended")}
                  </h2>
                  <Link
                    href="/products"
                    className="view-all-link gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-2 rounded-lg sm:rounded-xl"
                  >
                    {t("viewAll")}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              
                {loadingRecommended ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredMostRecommended.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredMostRecommended.map((product, index) => (
                      <ProductCard
                        key={product.id || `recommended-${index}`}
                        product={product}
                        onBuyNow={handleBuyNow}
                        onViewDetails={setSelectedProduct}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery.trim() 
                        ? `${t("noRecommendedProductsSearch")} "${searchQuery}"`
                        : t("noRecommendedProducts")}
                    </p>
                  </div>
                )}
              </section>




              {/* Hierarchical Category Selector */}
              <section className="container mx-auto px-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-color-secondary">
                  {t("browseByCategory")}
                </h2>
                <HierarchicalCategorySelector
                  categories={categories}
                  selectedFilter={selectedFilter}
                  onFilterChange={setSelectedFilter}
                />
              </section>

              {/* Products Section */}
              <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-color-secondary">
                    {t("allProducts")}
                  </h2>
                  <Link
                    href="/products"
                    className="view-all-link gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-2 rounded-lg sm:rounded-xl"
                  >
                    {t("viewAll")}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
                <ProductGrid
                  searchQuery={searchQuery}
                  selectedCategory={selectedFilter.category || "All"}
                  selectedOriginType={selectedFilter.originType}
                  selectedSubCategory={selectedFilter.subCategory}
                  onCheckout={() => setCheckoutOpen(true)}
                  limit={selectedFilter.category ? undefined : 10}
                />
              </section>
            
              {showSeasonalSection && (
                <section className={`mx-auto w-full max-w-6xl min-w-0 relative overflow-hidden rounded-3xl border ${seasonalTheme.colors.accent} p-8 px-4 md:px-8 transition-colors mb-4 ${
                  theme === 'dark'
                    ? 'gradient-card shadow-glow'
                    : 'bg-white/90 border-orange-200/60 shadow-lg'
                }`}>
                  <button
                    onClick={handleCloseSeasonalSection}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full border transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-background/80 hover:bg-background/90 border-border/50 hover:border-border'
                        : 'bg-white/90 hover:bg-white border-gray-300 hover:border-gray-400'
                    }`}
                    aria-label="Close seasonal section"
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </button>
                  <div className={`absolute inset-0 ${seasonalTheme.gradient}`} />
                  <div className="relative grid gap-6 md:grid-cols-2 md:items-center w-full">
                    <div className="space-y-3">
                      <p className="text-sm uppercase tracking-[0.3em] text-color-accent">
                        {seasonalTheme.subtitle}
                      </p>
                      <h3 className="text-2xl font-semibold text-foreground">
                        {seasonalTheme.emoji && <span className="mr-2">{seasonalTheme.emoji}</span>}
                        {seasonalTheme.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {seasonalTheme.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {seasonalTheme.tags.map((tag, index) => (
                          <span key={index} className="rounded-full px-3 py-1 bg-secondary/50 text-foreground border border-color-muted">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="relative h-56">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${seasonalTheme.colors.primary} blur-2xl`} />
                      <div className={`relative flex h-full items-center justify-center rounded-2xl border ${seasonalTheme.colors.accent} p-4 bg-card/30 shadow-glow`}>
                        <div className="text-center text-foreground">
                          <p className="text-lg font-semibold">{t("festivalAd")}</p>
                          <p className="text-sm text-muted-foreground">
                            {seasonalTheme.keyname === 'christmas' && 'Red theme, santa art, event-specific CTA.'}
                            {seasonalTheme.keyname === 'thanksgiving' && 'Amber theme, harvest art, thanksgiving CTA.'}
                            {seasonalTheme.keyname === 'newyear' && 'Gold theme, celebration art, new year CTA.'}
                            {seasonalTheme.keyname === 'default' && 'Premium theme, quality art, collection CTA.'}
                          </p>
                          <button
                            onClick={() => setSelectedFilter({ category: seasonalTheme.category || undefined })}
                            className="mt-3 rounded-full gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground cursor-pointer"
                          >
                            {seasonalTheme.ctaText}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </main>
            <Footer />
            <CheckoutModal
              open={checkoutOpen}
              onClose={() => {
                setCheckoutOpen(false);
                setBuyNowItem(null);
              }}
              buyNowItem={buyNowItem}
            />





            {/* Product Detail Modal */}
            {selectedProduct && (
              <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onBuyNow={handleBuyNow}
                onAddToCart={handleAddToCart}
              />
            )}




            {/* Cart Notification */}
            <CartNotification
              product={notificationProduct}
              quantity={notificationQuantity}
              onClose={() => setNotificationProduct(null)}
            />

            {/* Order Status Notification Modal */}
            {orderStatusModal && (
              <SuccessMsgModal
                open={orderStatusModal.open}
                onOpenChange={(open) => {
                  if (!open) setOrderStatusModal(null);
                }}
                title={
                  orderStatusModal.status === 'accepted'
                    ? t('orderAccepted') || 'Order Accepted!'
                    : t('orderRejected') || 'Order Rejected'
                }
                message={orderStatusModal.message}
                billNumber={orderStatusModal.billNumber}
                orderStatus={orderStatusModal.status}
              />
            )}
  </div>
);
}




export function ClientPageContent() {
 const [mounted, setMounted] = useState(false);
 const [ageStatus, setAgeStatus] = useState<AgeStatus>("pending");


 // Check sessionStorage after component mounts to avoid hydration mismatch
 useEffect(() => {
   const verified = sessionStorage.getItem("age-verified");
   if (verified === "true") {
     setAgeStatus("verified");
   }
   setMounted(true);
 }, []);


 const handleAgeVerified = () => {
   sessionStorage.setItem("age-verified", "true");
   setAgeStatus("verified");
 };


 const handleAgeDenied = () => {
   setAgeStatus("denied");
 };


 // Don't render anything until mounted to prevent flicker
 if (!mounted) {
   return (
     <div className="fixed inset-0 bg-black flex items-center justify-center">
       <div className="w-16 h-16 border-4 border-color-primary border-t-transparent rounded-full animate-spin" />
     </div>
   );
 }


 return (
   <ThemeProvider>
     <LanguageProvider>
       <AuthProvider>
         <CartProvider>
           <AuthModalProvider>
             {ageStatus === "pending" && (
               <AgeVerificationModal
                 onVerified={handleAgeVerified}
                 onDenied={handleAgeDenied}
               />
             )}

             {ageStatus === "denied" && (
               <AgeDeniedScreen onBack={() => setAgeStatus("pending")} />
             )}

             {ageStatus === "verified" && (
               <PageContent />
             )}
           </AuthModalProvider>
         </CartProvider>
       </AuthProvider>
     </LanguageProvider>
   </ThemeProvider>
 );
}












