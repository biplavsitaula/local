"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { productsService, BrandData } from "@/services/products.service";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Brand color palette for brands without logos
const colorPalette = [
  { bg: "bg-blue-600", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-green-600", text: "text-white" },
  { bg: "bg-amber-600", text: "text-white" },
  { bg: "bg-red-600", text: "text-white" },
  { bg: "bg-purple-600", text: "text-white" },
  { bg: "bg-indigo-600", text: "text-white" },
  { bg: "bg-pink-600", text: "text-white" },
  { bg: "bg-cyan-600", text: "text-white" },
  { bg: "bg-orange-600", text: "text-white" },
  { bg: "bg-slate-700", text: "text-amber-400" },
  { bg: "bg-emerald-600", text: "text-white" },
];

const getBrandColor = (index: number) => {
  return colorPalette[index % colorPalette.length];
};

export default function BrandPageContent() {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await productsService.getBrands();
        setBrands(response.data || []);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = brands.reduce(
    (sum, brand) => sum + (brand.productCount || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header searchQuery="" onSearchChange={() => {}} hideSearch />

      {/* Page Title Section */}
      <div className="border-b bg-card/50 border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-gradient">
                All Brands
              </h1>
              <p className="text-sm mt-1 text-muted-foreground">
                {brands.length} brands
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-flame-orange" />
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery ? "No brands found" : "No brands available"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-flame-orange hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredBrands.map((brand, index) => {
              const colors = getBrandColor(index);
              const hasLogo = brand.logo && brand.logo.length > 0;

              return (
                <Link
                  key={brand._id || `brand-${index}`}
                  href={`/products?brand=${encodeURIComponent(brand.name)}`}
                  className="group relative rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg bg-card border border-border hover:border-flame-orange/50"
                >
                  {/* Brand Logo/Image Section */}
                  <div
                    className={`relative h-40 sm:h-48 flex items-center justify-center overflow-hidden border-b border-border ${
                      hasLogo ? "bg-card" : colors.bg
                    }`}
                  >
                    {hasLogo ? (
                      <div className="relative w-full h-full p-4">
                        <Image
                          src={brand.logo!}
                          alt={brand.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          unoptimized={brand.logo!.startsWith("data:")}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-3xl sm:text-4xl font-bold ${colors.text}`}
                      >
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Brand Info */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-flame-orange transition-colors text-foreground">
                      {brand.name}
                    </h3>

                    {brand.description ? (
                      <p className="text-sm line-clamp-2 text-muted-foreground">
                        {brand.description}
                      </p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground/60">
                        Explore {brand.name} products
                      </p>
                    )}

                    {/* View Products Link */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-center border-border">
                      <span className="text-sm font-medium btn-outline-to-primary-custom px-4 py-2 rounded-lg transition-all">
                        View Products →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

