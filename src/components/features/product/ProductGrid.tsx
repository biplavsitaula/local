import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types";
import { ShoppingCart, Zap, Plus, Minus, Eye } from "lucide-react";
import { toast } from "sonner";
import ProductDetailModal from "@/components/features/product/ProductDetailModal";
import { products } from "@/data/products";

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

interface ProductGridProps {
  searchQuery: string;
  selectedCategory: string;
  onCheckout?: () => void;
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
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
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
