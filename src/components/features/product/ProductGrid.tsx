import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ProductDetailModal from '@/components/features/product/ProductDetailModal';
import { products } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

interface ProductGridProps {
  searchQuery: string;
  selectedCategory: string;
  onCheckout?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(
      language === 'en' 
        ? `${product.name} added to cart!` 
        : `${product.nameNe} कार्टमा थपियो!`
    );
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        className="group relative bg-card rounded-xl border border-border/50 overflow-hidden card-glow cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Hollow Frame Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden p-4">
          {/* Hollow Frame Border */}
          <div className="absolute inset-4 border-2 border-flame-orange/30 rounded-lg pointer-events-none" />
          <div className="absolute inset-6 border border-flame-orange/20 rounded-md pointer-events-none" />
          
          {/* Transparent Background Pattern */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, hsl(var(--secondary)/0.3) 25%, transparent 25%),
                linear-gradient(-45deg, hsl(var(--secondary)/0.3) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, hsl(var(--secondary)/0.3) 75%),
                linear-gradient(-45deg, transparent 75%, hsl(var(--secondary)/0.3) 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
            }}
          />
          
          {/* Bottle Image with mix-blend for transparency effect */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
              style={{ 
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                mixBlendMode: 'multiply'
              }}
              loading="lazy"
            />
          </div>
          
          {/* Corner Accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-flame-orange/50 rounded-tl" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-flame-orange/50 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-flame-orange/50 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-flame-orange/50 rounded-br" />
          
          {/* Quick Add Button */}
          <Button
            size="icon"
            onClick={handleAddToCart}
            className="absolute bottom-6 right-6 z-20 bg-flame-orange hover:bg-flame-red text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          >
            <Plus className="w-5 h-5" />
          </Button>

          {/* Category Badge */}
          <div className="absolute top-5 left-5 z-20">
            <span className="px-3 py-1 text-xs font-medium bg-background/90 backdrop-blur-sm rounded-full text-foreground capitalize border border-border/50">
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Name */}
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-flame-orange transition-colors">
            {language === 'en' ? product.name : product.nameNe}
          </h3>

          {/* Details */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{product.volume}</span>
            <span>•</span>
            <span>{product.alcohol}</span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-lg font-bold flame-text">
              Rs. {product.price.toLocaleString()}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddToCart}
              className="border-flame-orange/50 hover:bg-flame-orange/10 text-foreground"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {t('addToCart')}
            </Button>
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ searchQuery, selectedCategory, onCheckout }) => {
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
