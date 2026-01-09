import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types";
import { ShoppingCart, Zap, Plus, Minus, Eye, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ProductDetailModal from "@/components/features/product/ProductDetailModal";
import { productsService, Product as ApiProduct } from "@/services/products.service";




interface ProductCardProps {
product: Product;
onBuyNow: (product: Product) => void;
onViewDetails: (product: Product) => void;
}




interface ProductGridProps {
 searchQuery: string;
 selectedCategory: string;
 onCheckout?: () => void;
 limit?: number;
}




const ProductCard: React.FC<ProductCardProps> = ({
product,
onBuyNow,
onViewDetails,
}) => {
const { language, t } = useLanguage();
const { addToCart } = useCart();
const [quantity, setQuantity] = useState(1);




const handleAddToCart = () => {
  addToCart(product, quantity);
  toast.success(
    language === "en"
      ? `${quantity}x ${product.name} added to cart!`
      : `${quantity}x ${product.nameNe} कार्टमा थपियो!`
  );
  setQuantity(1);
};




const handleBuyNow = () => {
  addToCart(product, quantity);
  onBuyNow(product);
};




return (
  <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
    {/* Badges */}
    <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
      {product.tag && (
        <span className="rounded-full bg-flame-gradient px-3 py-1 text-xs font-bold text-card">
          {product.tag}
        </span>
      )}
    </div>




    {/* Image - Square */}
    <div
      className="relative w-full overflow-hidden bg-muted cursor-pointer"
      style={{ paddingBottom: "100%" }}
    >
      <img
        onClick={() => onViewDetails(product)}
        src={product.image}
        alt={product.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
    </div>




    {/* Content */}
    <div className="p-4">
      <p className="text-xs text-muted-foreground capitalize">
        {product.category}
      </p>
      <h3 className="mt-1 line-clamp-1 font-cinzel text-lg font-bold text-golden">
        {language === "en" ? product.name : product.nameNe}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {product.volume} • {product.alcohol}
      </p>




      {/* Price */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xl font-bold text-primary">
          Rs. {product.price.toLocaleString()}
        </span>
      </div>




      {/* Quantity Selector */}
      {product.stock && product.stock > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-foreground">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-foreground hover:bg-muted cursor-pointer"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      )}




      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-transparent py-2.5 font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">{t("addToCart")}</span>
        </button>
        <button
          onClick={handleBuyNow}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-flame-gradient py-2.5 font-medium text-card transition-all hover:shadow-lg hover:shadow-flame-orange/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">{t("buy")}</span>
        </button>
      </div>
    </div>
  </div>
);
};




const ProductGrid: React.FC<ProductGridProps> = ({
 searchQuery,
 selectedCategory,
 onCheckout,
 limit,
}) => {
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [products, setProducts] = useState<Product[]>([]);
 const [loading, setLoading] = useState(true);
 const [loadingMore, setLoadingMore] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [page, setPage] = useState(1);
 const [hasMore, setHasMore] = useState(true);
 const [totalProducts, setTotalProducts] = useState(0);
 const ITEMS_PER_PAGE = 10;


 // Map API product to internal Product type
 const mapApiProductToProduct = (apiProduct: any): Product => {
   // Handle API response structure: type instead of category, image instead of imageUrl
   const categoryValue = apiProduct?.type || apiProduct?.category || '';
   // Keep original category name from API (capitalized)
   const category = categoryValue || 'Other';


   return {
     id: apiProduct?._id || apiProduct?.id || '',
     name: apiProduct?.name || '',
     nameNe: apiProduct?.nameNe || apiProduct?.name || '', // Use name as fallback if nameNe not available
     category,
     price: apiProduct?.finalPrice || apiProduct?.price || 0,
     originalPrice: apiProduct?.discountPercent ? apiProduct?.price : undefined,
     image: apiProduct?.image || apiProduct?.imageUrl || '',
     description: apiProduct?.description || `Premium ${categoryValue || 'Beverage'} - ${apiProduct?.name || 'Product'}`,
     volume: apiProduct?.volume || '750ml',
     alcoholContent: apiProduct?.alcoholPercentage ? `${apiProduct?.alcoholPercentage}%` : '40%',
     alcohol: apiProduct?.alcoholPercentage ? `${apiProduct?.alcoholPercentage}%` : '40%',
     inStock: (apiProduct?.stock || 0) > 0,
     isNew: false,
     stock: apiProduct?.stock || 0,
     rating: apiProduct?.rating || 0,
     tag: apiProduct?.discountPercent ? `${apiProduct?.discountPercent}% OFF` : apiProduct?.tag,
   } as Product;
 };


 // Fetch products from API
 const fetchProducts = async (pageNum: number, append: boolean = false) => {
   try {
     if (append) {
       setLoadingMore(true);
     } else {
       setLoading(true);
     }
     setError(null);
    
     const response = await productsService.getAll({
       page: pageNum,
       limit: ITEMS_PER_PAGE
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
       // Fallback: if no pagination info, check if we got fewer items than requested
       setHasMore(mappedProducts.length === ITEMS_PER_PAGE);
     }
   } catch (err: any) {
     setError(err?.message || 'Failed to fetch products');
     if (!append) {
       setProducts([]);
     }
   } finally {
     setLoading(false);
     setLoadingMore(false);
   }
 };


 // Initial fetch
 useEffect(() => {
   setPage(1);
   setProducts([]);
   fetchProducts(1, false);
 }, []);


 // Handle load more
 const handleLoadMore = () => {
   const nextPage = page + 1;
   setPage(nextPage);
   fetchProducts(nextPage, true);
 };


 const filteredProducts = useMemo(() => {
   const filtered = products.filter((product) => {
     const matchesSearch =
       product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (product?.nameNe && product?.nameNe?.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (product?.description && product?.description?.toLowerCase().includes(searchQuery.toLowerCase()));
     
     // Match category case-insensitively
     const matchesCategory =
       !selectedCategory ||
       selectedCategory === "All" ||
       selectedCategory === "" ||
       product?.category?.toLowerCase() === selectedCategory.toLowerCase();
     
     return matchesSearch && matchesCategory;
   });
  
   // Apply limit if specified (for homepage)
   return limit ? filtered.slice(0, limit) : filtered;
 }, [products, searchQuery, selectedCategory, limit]);




const handleBuyNow = (product: Product) => {
  if (onCheckout) {
    onCheckout();
  }
};




const handleViewDetails = (product: Product) => {
  setSelectedProduct(product);
};




return (
  <>
    <section className="container mx-auto px-4">
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




      {/* Products Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id || `product-${index}`}
                product={product}
                onBuyNow={handleBuyNow}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
         
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No products found matching your criteria.
              </p>
            </div>
          )}


          {/* Load More Button - only show if not using limit prop and there are more products */}
          {!limit && hasMore && filteredProducts.length > 0 && (
            <div className="flex justify-center mt-8">
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
          {!limit && !hasMore && products.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Showing all {products.length} products
              </p>
            </div>
          )}
        </>
      )}
    </section>
    {selectedProduct && (
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    )}
  </>
);
};




export default ProductGrid;









