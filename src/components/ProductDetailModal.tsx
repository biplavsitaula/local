"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { X, Plus, Minus, MapPin, Wine, Percent, ShieldCheck, Truck, RotateCcw, ShoppingCart, ChevronRight, ArrowRight } from 'lucide-react';
import ProductActionButtons from '@/components/ui/ProductActionButtons';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { productsService } from '@/services/products.service';
import { ApiProduct } from '@/types/apiProduct';

const DEFAULT_IMAGE = "/assets/image_not_found.png";

const getValidImageUrl = (product: Product): string => {
  const imageUrl = product?.image || product?.imageUrl || DEFAULT_IMAGE;
  if (!imageUrl || imageUrl === '') return DEFAULT_IMAGE;
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return DEFAULT_IMAGE;
};

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  relatedProducts?: Product[]; // Added to support the new section
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
  onAddToCart,
  relatedProducts = [] // Mock data or props
}) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recentArrivals, setRecentArrivals] = useState<Product[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);


  const filteredRecentArrivals = recentArrivals;

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
          // search: searchQuery || undefined,
        });

        let products = (response.data || []) as unknown as ApiProduct[];

        // If no products with createdAt, try updatedAt
        if (products.length === 0) {
          const altResponse = await productsService.getAll({
            sortBy: 'updatedAt',
            sortOrder: 'desc',
            limit: 20,
            // search: searchQuery || undefined,
          });
          products = (altResponse.data || []) as unknown as ApiProduct[];
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
        const mappedProducts = sortedProducts.slice(0, 4).map(mapApiProductToProduct);
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

  const handleAddToCart = () => {
    addToCart(product, quantity);
    if (onAddToCart) {
      onAddToCart(product, quantity);
    } else {
      toast.success(
        language === 'en' ? 'Added to Cart!' : 'कार्टमा थपियो!',
        { description: `${quantity}x ${language === 'en' ? product?.name : product?.nameNe}` }
      );
    }
  };

  const handleBuyNow = () => {
    onClose();
    onBuyNow(product, quantity);

  };

  console.log(relatedProducts, 'relatedProductsrelatedProducts')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-5xl max-h-[98vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 rounded-xl sm:rounded-2xl border border-border bg-card shadow-2xl scrollbar-hide">

        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted/80 text-foreground backdrop-blur-md transition-colors hover:bg-muted cursor-pointer"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">

            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-muted border border-border">
                <Image
                  src={getValidImageUrl(product)}
                  alt={product?.name || 'Product'}
                  className="h-full w-full object-contain p-4"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={getValidImageUrl(product).startsWith('data:') || getValidImageUrl(product).startsWith('http')}
                />
                <span className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 rounded-full bg-primary/10 border border-primary/20 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest">
                  Premium Selection
                </span>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-border bg-muted/30 overflow-hidden opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                    <Image src={getValidImageUrl(product)} alt="thumb" width={64} height={64} className="object-contain p-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex text-amber-500 text-[10px] sm:text-xs">★★★★★</div>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-tighter">128 Reviews</span>
              </div>

              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-primary font-bold">{product?.category}</p>
              <h2 className="mt-1 font-display text-xl sm:text-3xl md:text-4xl font-bold text-tertiary-text leading-tight">
                {language === 'en' ? product?.name : product?.nameNe}
              </h2>

              <div className="mt-3 sm:mt-4 flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  Rs. {((product?.price || 0) * quantity).toLocaleString()}
                </span>
                {product?.originalPrice && (
                  <span className="text-base sm:text-lg text-muted-foreground line-through italic">
                    Rs. {((product?.originalPrice || 0) * quantity).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Product Info Grid */}
              <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
                <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center border border-border/50">
                  <Wine className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <p className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground uppercase">{t('volume')}</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground">{product?.volume}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center border border-border/50">
                  <Percent className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <p className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground uppercase">{t('alcoholContent')}</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground">{product?.alcoholContent || product?.alcohol}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center border border-border/50">
                  <MapPin className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <p className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground uppercase">{t('origin')}</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">{product?.origin || 'Imported'}</p>
                </div>
              </div>

              {/* Quantity & Actions */}
              {product.inStock !== false && (
                <div className="mt-6 sm:mt-8 space-y-4">
                  <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-between xs:justify-start rounded-lg border border-border bg-card overflow-hidden h-11 sm:h-12">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full hover:bg-muted text-foreground transition-colors"><Minus size={14} /></button>
                      <span className="w-8 sm:w-10 text-center font-bold text-sm sm:text-base">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="px-4 h-full hover:bg-muted text-foreground transition-colors"><Plus size={14} /></button>
                    </div>
                    <div className="flex-1">
                      <ProductActionButtons onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} size="md" />
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-x-4 gap-y-3 pt-5 sm:pt-6 border-t border-border">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  <ShieldCheck size={14} className="text-green-500 flex-shrink-0" /> <span>Authentic Product</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  <Truck size={14} className="text-blue-500 flex-shrink-0" /> <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  <RotateCcw size={14} className="text-red-500 flex-shrink-0" /> <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs Section */}
          <div className="mt-8 sm:mt-12 border-t border-border pt-6 sm:pt-8">
            <div className="flex gap-4 sm:gap-8 border-b border-border mb-6 overflow-x-auto no-scrollbar">
              {['description', 'specifications', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-base sm:text-lg font-bold mb-3">A Masterpiece of Blending</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {language === 'en' ? product?.description : product?.descriptionNe || product?.description}
                </p>
              </div>
            </div>
          </div>

          {/* NEW: Related Products Section */}
          <div className="mt-12 sm:mt-16 border-t border-border pt-8 sm:pt-10">
            <div className="flex items-center justify-between mb-6 sm:mb-8 px-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">You Might Also Like</h3>
              <Link
                href="/products"
                className="view-all-link gap-1 sm:gap-2 text-xs sm:text-sm p-1.5 sm:p-2 rounded-lg sm:rounded-xl"
              >
                {t("viewAll")}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRecentArrivals.map((product, index) => (
                <ProductCard
                  key={product.id || `recent-${index}`}
                  product={product}
                  onBuyNow={handleBuyNow}
                  onViewDetails={setSelectedProduct}
                  hidePreviewIcon
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;


// "use client";

// import React, { useState } from 'react';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { useCart } from '@/contexts/CartContext';
// import { Product } from '@/types';
// import { X, Plus, Minus, MapPin, Wine, Percent, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
// import ProductActionButtons from '@/components/ui/ProductActionButtons';
// import { toast } from 'sonner';
// import Image from 'next/image';

// const DEFAULT_IMAGE = "/assets/image_not_found.png";

// const getValidImageUrl = (product: Product): string => {
//   const imageUrl = product?.image || product?.imageUrl || DEFAULT_IMAGE;
//   if (!imageUrl || imageUrl === '') return DEFAULT_IMAGE;
//   if (imageUrl.startsWith('/') || imageUrl.startsWith('data:') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//     return imageUrl;
//   }
//   return DEFAULT_IMAGE;
// };

// interface ProductDetailModalProps {
//   product: Product;
//   onClose: () => void;
//   onBuyNow: (product: Product, quantity?: number) => void;
//   onAddToCart?: (product: Product, quantity: number) => void;
// }

// const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onBuyNow, onAddToCart }) => {
//   const { language, t } = useLanguage();
//   const { addToCart } = useCart();
//   const [quantity, setQuantity] = useState(1);
//   const [activeTab, setActiveTab] = useState('description');

//   const handleAddToCart = () => {
//     addToCart(product, quantity);
//     if (onAddToCart) {
//       onAddToCart(product, quantity);
//     } else {
//       toast.success(
//         language === 'en' ? 'Added to Cart!' : 'कार्टमा थपियो!',
//         { description: `${quantity}x ${language === 'en' ? product?.name : product?.nameNe}` }
//       );
//     }
//   };

//   const handleBuyNow = () => {
//     onClose();
//     onBuyNow(product, quantity);
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 sm:p-4 overflow-hidden">
//       <div className="relative w-full max-w-5xl max-h-[98vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 rounded-xl sm:rounded-2xl border border-border bg-card shadow-2xl scrollbar-hide">

//         {/* Sticky Close Button for easier access on mobile */}
//         <button
//           onClick={onClose}
//           className="absolute right-3 top-3 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted/80 text-foreground backdrop-blur-md transition-colors hover:bg-muted cursor-pointer"
//         >
//           <X className="h-4 w-4 sm:h-5 sm:w-5" />
//         </button>

//         <div className="p-4 sm:p-6 md:p-8">
//           <div className="grid gap-6 md:gap-8 lg:grid-cols-2">

//             {/* Image Section */}
//             <div className="space-y-4">
//               <div className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-muted border border-border">
//                 <Image
//                   src={getValidImageUrl(product)}
//                   alt={product?.name || 'Product'}
//                   className="h-full w-full object-contain p-4"
//                   fill
//                   priority
//                   sizes="(max-width: 768px) 100vw, 50vw"
//                   unoptimized={getValidImageUrl(product).startsWith('data:') || getValidImageUrl(product).startsWith('http')}
//                 />
//                 <span className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 rounded-full bg-primary/10 border border-primary/20 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest">
//                   Premium Selection
//                 </span>
//               </div>

//               {/* Thumbnails - Hidden on very small screens or made scrollable */}
//               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-border bg-muted/30 overflow-hidden opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
//                     <Image src={getValidImageUrl(product)} alt="thumb" width={64} height={64} className="object-contain p-2" />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Details Section */}
//             <div className="flex flex-col">
//               <div className="flex items-center gap-2 mb-1">
//                 <div className="flex text-amber-500 text-[10px] sm:text-xs">★★★★★</div>
//                 <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-tighter">128 Reviews</span>
//               </div>

//               <p className="text-[10px] sm:text-xs uppercase tracking-widest text-primary font-bold">{product?.category}</p>
//               <h2 className="mt-1 font-display text-xl sm:text-3xl md:text-4xl font-bold text-tertiary-text leading-tight">
//                 {language === 'en' ? product?.name : product?.nameNe}
//               </h2>

//               <div className="mt-3 sm:mt-4 flex items-baseline gap-2 sm:gap-3 flex-wrap">
//                 <span className="text-2xl sm:text-3xl font-bold text-primary">
//                   Rs. {((product?.price || 0) * quantity).toLocaleString()}
//                 </span>
//                 {product?.originalPrice && (
//                   <span className="text-base sm:text-lg text-muted-foreground line-through italic">
//                     Rs. {((product?.originalPrice || 0) * quantity).toLocaleString()}
//                   </span>
//                 )}
//               </div>

//               {/* Product Info Grid - Responsive column count */}
//               <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
//                 <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center border border-border/50">
//                   <Wine className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                   <p className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground uppercase">{t('volume')}</p>
//                   <p className="text-xs sm:text-sm font-bold text-foreground">{product?.volume}</p>
//                 </div>
//                 <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center border border-border/50">
//                   <Percent className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                   <p className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground uppercase">{t('alcoholContent')}</p>
//                   <p className="text-xs sm:text-sm font-bold text-foreground">{product?.alcoholContent || product?.alcohol}</p>
//                 </div>
//                 <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center border border-border/50">
//                   <MapPin className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                   <p className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground uppercase">{t('origin')}</p>
//                   <p className="text-xs sm:text-sm font-bold text-foreground truncate">{product?.origin || 'Imported'}</p>
//                 </div>
//               </div>

//               {/* Quantity & Actions - Stacked on small mobile */}
//               {/* <div className="mt-6 sm:mt-8 space-y-4">
//                 <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4">
//                   <div className="flex items-center justify-between xs:justify-start rounded-lg border border-border bg-card overflow-hidden h-11 sm:h-12">
//                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full hover:bg-muted text-foreground transition-colors"><Minus size={14} /></button>
//                     <span className="w-8 sm:w-10 text-center font-bold text-sm sm:text-base">{quantity}</span>
//                     <button onClick={() => setQuantity(quantity + 1)} className="px-4 h-full hover:bg-muted text-foreground transition-colors"><Plus size={14} /></button>
//                   </div>
//                   <div className="flex-1">
//                     <ProductActionButtons onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} size="md" />
//                   </div>
//                 </div>
//               </div> */}
//               {/* Quantity & Actions */}
//               {product.inStock !== false && (
//                 <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
//                   <div className="flex items-center gap-2 sm:gap-4">
//                     <span className="text-sm sm:text-base font-medium text-foreground">{t('quantity')}:</span>
//                     <div className="flex items-center rounded-lg border border-border">
//                       <button
//                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                         className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
//                       >
//                         <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                       </button>
//                       <span className="w-8 sm:w-12 text-center text-sm sm:text-base font-medium text-foreground">{quantity}</span>
//                       <button
//                         onClick={() => setQuantity(quantity + 1)}
//                         className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
//                       >
//                         <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                       </button>
//                     </div>
//                   </div>

//                   <ProductActionButtons
//                     onAddToCart={handleAddToCart}
//                     onBuyNow={handleBuyNow}
//                     size="md"
//                   />
//                 </div>
//               )}

//               {/* Trust Badges - Flex wrapping for all screens */}
//               <div className="mt-6 sm:mt-8 flex flex-wrap gap-x-4 gap-y-3 pt-5 sm:pt-6 border-t border-border">
//                 <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
//                   <ShieldCheck size={14} className="text-green-500 flex-shrink-0" /> <span>Authentic Product</span>
//                 </div>
//                 <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
//                   <Truck size={14} className="text-blue-500 flex-shrink-0" /> <span>Free Delivery</span>
//                 </div>
//                 <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
//                   <RotateCcw size={14} className="text-red-500 flex-shrink-0" /> <span>Easy Returns</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Tabs Section - Optimized spacing */}
//           <div className="mt-8 sm:mt-12 border-t border-border pt-6 sm:pt-8">
//             <div className="flex gap-4 sm:gap-8 border-b border-border mb-6 overflow-x-auto no-scrollbar">
//               {['description', 'specifications', 'shipping'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`pb-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>

//             <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
//               <div className="lg:col-span-2">
//                 <h3 className="text-base sm:text-lg font-bold mb-3">A Masterpiece of Blending</h3>
//                 <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
//                   {language === 'en' ? product?.description : product?.descriptionNe || product?.description}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div >
//     </div >
//   );
// };

// export default ProductDetailModal;



// "use client";

// import React, { useState } from 'react';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { useCart } from '@/contexts/CartContext';
// import { Product } from '@/types';
// import { X, Plus, Minus, MapPin, Wine, Percent } from 'lucide-react';
// import ProductActionButtons from '@/components/ui/ProductActionButtons';
// import { toast } from 'sonner';
// import Image from 'next/image';

// const DEFAULT_IMAGE = "/assets/image_not_found.png";

// // Helper function to validate and get a valid image URL
// const getValidImageUrl = (product: Product): string => {
//   const imageUrl = product?.image || product?.imageUrl || DEFAULT_IMAGE;

//   // Check if it's a valid URL format
//   if (!imageUrl || imageUrl === '') {
//     return DEFAULT_IMAGE;
//   }

//   // Allow relative paths, data URLs, and valid http/https URLs
//   if (imageUrl.startsWith('/') || imageUrl.startsWith('data:') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//     return imageUrl;
//   }

//   return DEFAULT_IMAGE;
// };

// interface ProductDetailModalProps {
//   product: Product;
//   onClose: () => void;
//   onBuyNow: (product: Product, quantity?: number) => void;
//   onAddToCart?: (product: Product, quantity: number) => void;
// }

// const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onBuyNow, onAddToCart }) => {
//   const { language, t } = useLanguage();
//   const { addToCart } = useCart();
//   const [quantity, setQuantity] = useState(1);

//   const handleAddToCart = () => {
//     addToCart(product, quantity);
//     if (onAddToCart) {
//       onAddToCart(product, quantity);
//     } else {
//       toast.success(
//         language === 'en' ? 'Added to Cart!' : 'कार्टमा थपियो!',
//         {
//           description: `${quantity}x ${language === 'en' ? product?.name : product?.nameNe}`,
//         }
//       );
//     }
//   };

//   const handleBuyNow = () => {
//     // Buy Now goes directly to checkout without adding to cart
//     onClose(); // Close the product detail modal first
//     onBuyNow(product, quantity); // Then open checkout modal
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
//       <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto animate-in fade-in-0 zoom-in-95 rounded-2xl border border-border bg-card shadow-2xl">
//         <button
//           onClick={onClose}
//           className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80 cursor-pointer"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <div className="grid gap-6 p-6 md:grid-cols-2">
//           {/* Image */}
//           <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
//             <Image
//               src={getValidImageUrl(product)}
//               alt={product?.name || 'Product'}
//               className="h-full w-full object-cover"
//               fill
//               sizes="(max-width: 768px) 100vw, 50vw"
//               unoptimized={getValidImageUrl(product).startsWith('data:') || getValidImageUrl(product).startsWith('http')}
//               onError={(e) => {
//                 const target = e.target as HTMLImageElement;
//                 target.src = DEFAULT_IMAGE;
//               }}
//             />
//             {product.isNew && (
//               <span className="absolute left-4 top-4 rounded-full bg-primary-gradient px-4 py-1.5 text-sm font-bold text-text-inverse">
//                 NEW
//               </span>
//             )}
//             {product.originalPrice && (
//               <span className="absolute left-4 top-14 rounded-full bg-destructive px-4 py-1.5 text-sm font-bold text-destructive-foreground">
//                 -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
//               </span>
//             )}
//           </div>

//           {/* Details */}
//           <div className="flex flex-col">
//             <p className="text-xs sm:text-sm uppercase tracking-wide text-muted-foreground">{product?.category}</p>
//             <h2 className="mt-2 font-display text-xl sm:text-2xl md:text-3xl font-bold text-tertiary-text">
//               {language === 'en' ? product?.name : product?.nameNe}
//             </h2>

//             {/* Price */}
//             <div className="mt-3 sm:mt-4">
//               <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
//                 <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
//                   Rs. {((product?.price || 0) * quantity).toLocaleString()}
//                 </span>
//                 {product?.originalPrice && (
//                   <span className="text-sm sm:text-base md:text-lg text-muted-foreground line-through">
//                     Rs. {((product?.originalPrice || 0) * quantity).toLocaleString()}
//                   </span>
//                 )}
//               </div>
//               {quantity > 1 && (
//                 <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
//                   (Rs. {(product?.price || 0).toLocaleString()} × {quantity})
//                 </p>
//               )}
//             </div>

//             {/* Status */}
//             <div className="mt-3 sm:mt-4">
//               {product.inStock !== false ? (
//                 <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-green-500/20 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-green-500">
//                   <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" />
//                   {t('inStock')}
//                 </span>
//               ) : (
//                 <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-destructive/20 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-destructive">
//                   <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-destructive" />
//                   {t('outOfStock')}
//                 </span>
//               )}
//             </div>

//             {/* Product Info */}
//             <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
//               <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center">
//                 <Wine className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                 <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{t('volume')}</p>
//                 <p className="text-xs sm:text-sm font-medium text-foreground">{product?.volume}</p>
//               </div>
//               <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center">
//                 <Percent className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                 <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{t('alcoholContent')}</p>
//                 <p className="text-xs sm:text-sm font-medium text-foreground">{product?.alcoholContent || product?.alcohol}</p>
//               </div>
//               <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center">
//                 <MapPin className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                 <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{t('origin')}</p>
//                 <p className="text-xs sm:text-sm font-medium text-foreground">{product?.origin || ''}</p>
//               </div>
//             </div>

//             {/* Description */}
//             <div className="mt-4 sm:mt-6">
//               <h3 className="text-sm sm:text-base font-semibold text-foreground">{t('description')}</h3>
//               <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-muted-foreground">
//                 {language === 'en' ? product?.description : product?.descriptionNe || product?.description}
//               </p>
//             </div>

//             {/* Quantity & Actions */}
//             {product.inStock !== false && (
//               <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
//                 <div className="flex items-center gap-2 sm:gap-4">
//                   <span className="text-sm sm:text-base font-medium text-foreground">{t('quantity')}:</span>
//                   <div className="flex items-center rounded-lg border border-border">
//                     <button
//                       onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                       className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
//                     >
//                       <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                     </button>
//                     <span className="w-8 sm:w-12 text-center text-sm sm:text-base font-medium text-foreground">{quantity}</span>
//                     <button
//                       onClick={() => setQuantity(quantity + 1)}
//                       className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
//                     >
//                       <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                     </button>
//                   </div>
//                 </div>

//                 <ProductActionButtons
//                   onAddToCart={handleAddToCart}
//                   onBuyNow={handleBuyNow}
//                   size="md"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetailModal;


