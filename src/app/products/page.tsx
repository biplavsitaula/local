"use client";

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { products, categories } from '@/data/products';
import { Product } from '@/types';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, Flame, Sun, Moon, Globe, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import CheckoutModal from '@/components/CheckoutModal';
import Footer from '@/components/Footer';
import Link from 'next/link';

const Products: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { addToCart, totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.nameNe && p.nameNe.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'lowToHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'highToLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const handleBuyNow = (product: Product) => {
    setCheckoutOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('newest');
    setPriceRange([0, 100000]);
  };

  const hasActiveFilters = searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 100000;

  return (
    <div className="min-h-screen bg-background">
      {/* Galaxy Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="stars absolute inset-0 opacity-40"></div>
      </div>

      {/* Simple Header for Products Page */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-gradient">
                <Flame className="h-6 w-6 text-card" />
              </div>
              <span className="hidden font-display text-xl font-bold text-ternary-text sm:block">Flame Beverage</span>
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setLanguage(language === 'en' ? 'np' : 'en')} className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'नेपाली' : 'English'}</span>
              </button>
              <button onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted cursor-pointer">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <Link href="/" className="flex items-center gap-2 rounded-lg bg-primary-gradient px-4 py-2 font-medium text-text-inverse transition-all hover:shadow-primary-lg">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-xs font-bold text-primary">{totalItems}</span>}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-display text-ternary-text mb-2">
              {t('allProducts')}
            </h1>
            <p className="text-muted-foreground">
              Discover our premium collection of spirits and beverages
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 bg-card/80 backdrop-blur-sm border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-card/80 border border-border rounded-xl text-foreground cursor-pointer"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 bg-primary-btn rounded-full"></span>
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="appearance-none pl-4 pr-10 py-3 bg-card/80 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-border cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                    {language === 'en' ? cat.name : cat.nameNe}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Price Range */}
              <div className="relative">
                <select
                  value={`${priceRange[0]}-${priceRange[1]}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-').map(Number);
                    setPriceRange([min, max]);
                  }}
                  className="appearance-none pl-4 pr-10 py-3 bg-card/80 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-border cursor-pointer"
                >
                  <option value="0-100000">All Prices</option>
                  <option value="0-1000">Under Rs. 1,000</option>
                  <option value="1000-3000">Rs. 1,000 - 3,000</option>
                  <option value="3000-5000">Rs. 3,000 - 5,000</option>
                  <option value="5000-10000">Rs. 5,000 - 10,000</option>
                  <option value="10000-100000">Above Rs. 10,000</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-card/80 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-border cursor-pointer"
                >
                  <option value="newest">{t('newest')}</option>
                  <option value="lowToHigh">{t('lowToHigh')}</option>
                  <option value="highToLow">{t('highToLow')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="flex items-center bg-card/80 border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-primary-btn text-text-inverse' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-primary-btn text-text-inverse' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 text-primary-text hover:text-ternary-text transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-6 space-y-4">
              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                    {language === 'en' ? cat.name : cat.nameNe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Price Range</label>
                <select
                  value={`${priceRange[0]}-${priceRange[1]}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-').map(Number);
                    setPriceRange([min, max]);
                  }}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground"
                >
                  <option value="0-100000">All Prices</option>
                  <option value="0-1000">Under Rs. 1,000</option>
                  <option value="1000-3000">Rs. 1,000 - 3,000</option>
                  <option value="3000-5000">Rs. 3,000 - 5,000</option>
                  <option value="5000-10000">Rs. 5,000 - 10,000</option>
                  <option value="10000-100000">Above Rs. 10,000</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground"
                >
                  <option value="newest">{t('newest')}</option>
                  <option value="lowToHigh">{t('lowToHigh')}</option>
                  <option value="highToLow">{t('highToLow')}</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-3 text-primary-text border border-primary-border rounded-xl hover:bg-primary-btn/10 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                !selectedCategory
                  ? 'bg-primary-gradient text-text-inverse'
                  : 'bg-card/80 border border-border text-foreground hover:border-border-primary-accent'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-primary-gradient text-text-inverse'
                    : 'bg-card/80 border border-border text-foreground hover:border-border-primary-accent'
                }`}
              >
                <span>{cat.icon}</span>
                {language === 'en' ? cat.name : cat.nameNe}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onBuyNow={handleBuyNow}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍷</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary-gradient text-text-inverse rounded-xl hover:shadow-primary-lg transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Product Detail Modal */}
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

export default Products;

