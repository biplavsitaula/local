import React from "react";
import { Product } from "@/types";
import { Loader2, AlertCircle } from "lucide-react";
import ProductDetailModal from "@/components/features/product/ProductDetailModal";
import ProductCard from "@/components/ProductCard";
import { useProductGrid } from "./hooks/useProductGrid";




interface ProductGridProps {
 searchQuery: string;
 selectedCategory: string;
 onCheckout?: () => void;
 limit?: number;
}




const ProductGrid: React.FC<ProductGridProps> = ({
 searchQuery,
 selectedCategory,
 onCheckout,
 limit,
}) => {
 const {
   selectedProduct,
   setSelectedProduct,
   filteredProducts,
   loading,
   loadingMore,
   error,
   hasMore,
   totalProducts,
   products,
   handleLoadMore,
   handleViewDetails,
 } = useProductGrid({
   searchQuery,
   selectedCategory,
   limit,
 });




const handleBuyNow = (product: Product, quantity?: number) => {
  if (onCheckout) {
    onCheckout();
  }
};




return (
  <>
    <section className="container mx-auto px-4">
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-base md:text-sm text-muted-foreground">Loading products...</p>
        </div>
      )}




      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Error loading products</h3>
          <p className="text-base md:text-sm text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-base md:text-sm bg-primary-gradient text-text-inverse rounded-xl hover:shadow-primary-lg transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}




      {/* Products Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <p className="text-base md:text-sm text-muted-foreground">
                No products found matching your criteria.
              </p>
            </div>
          )}


          {/* Load More Button - only show if not using limit prop, no category selected, and there are more products */}
          {!limit && hasMore && filteredProducts.length > 0 && (!selectedCategory || selectedCategory === 'All' || selectedCategory === '') && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 text-base md:text-sm bg-flame-gradient text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-flame-orange/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <span className="text-base md:text-sm opacity-80">
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
              <p className="text-base md:text-sm text-muted-foreground">
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









