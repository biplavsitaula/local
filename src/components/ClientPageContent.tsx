"use client";




import React, { useState, useEffect } from "react";
import { X, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import AgeDeniedScreen from "@/components/features/age-verification/AgeDeniedScreen";
import AgeVerificationModal from "@/components/features/age-verification/AgeVerificationModal";
import CategorySection from "@/components/CategorySection";
import CheckoutModal from "@/components/CheckoutModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/features/product/ProductGrid";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CartNotification from "@/components/CartNotification";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { AgeStatus, Product } from "@/types";
import { useSeasonalTheme } from "@/hooks/useSeasonalTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { productsService, Product as ApiProduct } from "@/services/products.service";




function PageContent() {
const [searchQuery, setSearchQuery] = useState("");
const [selectedCategory, setSelectedCategory] = useState<string>("All");
const [checkoutOpen, setCheckoutOpen] = useState(false);
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




 // Map API product to internal Product type
 const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
   // Cast to any to access fields that may not be in the TypeScript interface
   const product = apiProduct as any;
  
  // Handle API response structure: type instead of category
  const categoryValue = product?.type || product?.category || '';
  // Keep original category name from API (capitalized)
  const category = categoryValue || 'Other';

  // Get discount info from API
  const discountPercent = product?.discountPercent || 0;
  const discountAmount = product?.discountAmount || 0;
  const hasDiscount = discountPercent > 0 || discountAmount > 0;

  // Use finalPrice as current price, original price is the base price when there's a discount
  const currentPrice = product?.finalPrice || product?.price || 0;
  const originalPrice = hasDiscount ? product?.price : undefined;

  // Use API tag directly (discount is shown separately via originalPrice)
  const tag = product?.tag || undefined;

  return {
    id: product?._id || product?.id || '',
    name: product?.name || '',
    nameNe: product?.nameNe || product?.name || '',
    category,
    price: currentPrice,
    originalPrice,
    image: product?.image || product?.imageUrl || '',
    description: product?.description || `Premium ${categoryValue || 'Beverage'} - ${product?.name || 'Product'}`,
    volume: product?.volume || '750ml',
    alcoholContent: product?.alcoholPercentage ? `${product?.alcoholPercentage}%` : '40%',
    alcohol: product?.alcoholPercentage ? `${product?.alcoholPercentage}%` : '40%',
    inStock: (product?.stock || 0) > 0,
    isNew: product?.isNew || false, // Only show NEW badge if API says it's new
    stock: product?.stock,
    rating: product?.rating,
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
        limit: 20 // Fetch more to ensure we have enough after filtering
      });
    
      let products = response.data || [];
    
      // If no products with createdAt, try updatedAt
      if (products.length === 0) {
        const altResponse = await productsService.getAll({
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          limit: 20
        });
        products = altResponse.data || [];
      }
    
      // Sort by createdAt or updatedAt if available, otherwise use the order from API
      const sortedProducts = [...products].sort((a, b) => {
        const dateA = a?.createdAt ? new Date(a.createdAt).getTime() :
                      (a?.updatedAt ? new Date(a.updatedAt).getTime() : 0);
        const dateB = b?.createdAt ? new Date(b.createdAt).getTime() :
                      (b?.updatedAt ? new Date(b.updatedAt).getTime() : 0);
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
}, []);




// Fetch most recommended products
useEffect(() => {
  const fetchMostRecommended = async () => {
    try {
      setLoadingRecommended(true);
      const response = await productsService.getAll({
        view: 'recommended',
        limit: 8
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
}, []);


// Filter function for search
const filterBySearch = (products: Product[]) => {
  if (!searchQuery.trim()) return products;
  const query = searchQuery.toLowerCase().trim();
  return products.filter((product) =>
    product?.name?.toLowerCase().includes(query) ||
    product?.category?.toLowerCase().includes(query) ||
    product?.description?.toLowerCase().includes(query)
  );
};

// Filtered products based on search query
const filteredRecentArrivals = filterBySearch(recentArrivals);
const filteredMostRecommended = filterBySearch(mostRecommended);




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
            
              {/* Recent Arrivals Section */}
              <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-3xl font-display font-bold ${
                    theme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
                  }`}>
                    Recent Arrivals
                  </h2>
                  <Link
                    href="/products"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors border-2 p-2 border-ternary-text hover:border-primary-text ${
                      theme === 'dark'
                        ? 'text-primary-text hover:text-flame-orange'
                        : 'text-orange-600 hover:text-orange-700'
                    }`}
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              
                {loadingRecent ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredRecentArrivals.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        ? `No recent arrivals found for "${searchQuery}"`
                        : 'No recent arrivals found.'}
                    </p>
                  </div>
                )}
              </section>




              {/* Most Recommended Section */}
              <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-3xl font-display font-bold ${
                    theme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
                  }`}>
                    Most Recommended
                  </h2>
                  <Link
                    href="/products"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors border-2 p-2 border-ternary-text hover:border-primary-text ${                      theme === 'dark'
                        ? 'text-primary-text hover:text-flame-orange'
                        : 'text-orange-600 hover:text-orange-700'
                    }`}
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              
                {loadingRecommended ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredMostRecommended.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        ? `No recommended products found for "${searchQuery}"`
                        : 'No recommended products found.'}
                    </p>
                  </div>
                )}
              </section>




              <CategorySection
                selected={selectedCategory}
                onSelect={(value: string) =>
                  setSelectedCategory(
                    selectedCategory === value ? "All" : value
                  )
                }
              />




              {/* Products Section */}
              <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-3xl font-display font-bold ${
                    theme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
                  }`}>
                    All Products
                  </h2>
                  <Link
                    href="/products"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors border-2 p-2 border-ternary-text hover:border-primary-text ${                      theme === 'dark'
                        ? 'text-primary-text hover:text-flame-orange'
                        : 'text-orange-600 hover:text-orange-700'
                    }`}
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <ProductGrid
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  onCheckout={() => setCheckoutOpen(true)}
                  limit={10}
                />
              </section>
              {/* <section className="mx-auto w-full max-w-6xl grid gap-3 px-4 md:grid-cols-4 md:px-8">
                <div className="rounded-2xl border border-flame-orange/20 bg-gradient-to-r from-flame-orange/30 to-flame-red/20 p-4 text-foreground shadow-glow">
                  <p className="text-lg font-semibold">1-hour delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Track to your door in lightning speed.
                  </p>
                </div>
                <div className="rounded-2xl border border-flame-orange/20 bg-card p-4 text-foreground shadow-card">
                  <p className="text-lg font-semibold">
                    12 bottle bundle offer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stock up & save across categories.
                  </p>
                </div>
                <div className="rounded-2xl border border-flame-orange/20 bg-card p-4 text-foreground shadow-card">
                  <p className="text-lg font-semibold">
                    Fast delivery windows
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Predictable time windows with alerts.
                  </p>
                </div>
                <div className="rounded-2xl border border-flame-orange/20 bg-gradient-to-r from-flame-red/30 to-flame-orange/30 p-4 text-foreground shadow-glow">
                  <p className="text-lg font-semibold">
                    Free delivery on 2000+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visible at top, hides on scroll.
                  </p>
                </div>
              </section> */}
              {showSeasonalSection && (
                <section className={`mx-auto max-w-6xl relative overflow-hidden rounded-3xl border ${seasonalTheme.colors.accent} p-8 px-4 md:px-8 transition-colors ${
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
                    <X className={`h-4 w-4 ${theme === 'dark' ? 'text-foreground' : 'text-gray-700'}`} />
                  </button>
                  <div className={`absolute inset-0 ${seasonalTheme.gradient}`} />
                  <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
                    <div className="space-y-3">
                      <p className={`text-sm uppercase tracking-[0.3em] ${
                        theme === 'dark' ? 'text-flame-orange/80' : 'text-orange-600'
                      }`}>
                        {seasonalTheme.subtitle}
                      </p>
                      <h3 className={`text-3xl font-semibold ${
                        theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                      }`}>
                        {seasonalTheme.emoji && <span className="mr-2">{seasonalTheme.emoji}</span>}
                        {seasonalTheme.title}
                      </h3>
                      <p className={theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'}>
                        {seasonalTheme.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {seasonalTheme?.tags?.map((tag, index) => (
                          <span key={index} className={`rounded-full px-3 py-1 ${
                            theme === 'dark'
                              ? 'bg-secondary/50 text-foreground'
                              : 'bg-orange-50 text-gray-800 border border-orange-200'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="relative h-56">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${seasonalTheme.colors.primary} blur-2xl`} />
                      <div className={`relative flex h-full items-center justify-center rounded-2xl border ${seasonalTheme.colors.accent} p-4 ${
                        theme === 'dark'
                          ? 'bg-card/30 shadow-glow'
                          : 'bg-white/80 shadow-md'
                      }`}>
                        <div className={`text-center ${theme === 'dark' ? 'text-foreground' : 'text-gray-900'}`}>
                          <p className="text-lg font-semibold">Festival Ad</p>
                          <p className="text-sm text-muted-foreground">
                            {seasonalTheme.keyname === 'christmas' && 'Red theme, santa art, event-specific CTA.'}
                            {seasonalTheme.keyname === 'thanksgiving' && 'Amber theme, harvest art, thanksgiving CTA.'}
                            {seasonalTheme.keyname === 'newyear' && 'Gold theme, celebration art, new year CTA.'}
                            {seasonalTheme.keyname === 'default' && 'Premium theme, quality art, collection CTA.'}
                          </p>
                          <button
                            onClick={() => setSelectedCategory(seasonalTheme.category || "All")}
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
              onClose={() => setCheckoutOpen(false)}
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
       <div className="w-16 h-16 border-4 border-flame-orange border-t-transparent rounded-full animate-spin" />
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













