"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { productsService, BrandData } from "@/services/products.service";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount: number;
}

// Brand color palette for dynamic assignment
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

// Get color for a brand based on index
const getBrandColor = (index: number) => {
  return colorPalette[index % colorPalette.length];
};

// Generate slug from brand name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export default function BrandCarousel() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await productsService.getBrands();
        const brandsData = response.data || [];
        
        // Map API response to Brand interface
        const mappedBrands: Brand[] = brandsData.map((brand: BrandData, index: number) => ({
          id: brand._id || `brand-${index}`,
          name: brand.name,
          slug: generateSlug(brand.name),
          logo: brand.logo,
          productCount: brand.productCount,
        }));
        
        setBrands(mappedBrands);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Calculate items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(3);
      } else if (window.innerWidth < 768) {
        setItemsPerPage(4);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(8);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const totalPages = Math.ceil(brands.length / itemsPerPage);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Get current page brands
  const currentBrands = brands.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(nextPage, 5000);
    return () => clearInterval(interval);
  }, [nextPage, totalPages]);

  return (
    <section className="container mx-auto px-4">
      <div
        className={`relative rounded-2xl p-4 sm:p-6 ${
          theme === "dark"
            ? "bg-card/50 border border-border/50"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-display font-bold text-color-secondary`}
          >
            Brands
          </h2>
          <Link
            href="/brand"
            className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-colors  border-2 p-1.5 sm:p-2 border-primary-text hover:border-ternary-text rounded-lg sm:rounded-xl ${
              theme === "dark"
                ? "text-muted-foreground hover:text-flame-orange"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            View All
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div> */}

        {/* Brands Grid */}
        <div className="relative">
          {/* Navigation Arrows - Desktop Only */}
          {!loading && totalPages > 1 && (
            <>
              <button
                onClick={prevPage}
                className={`absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full shadow-lg transition-all hidden sm:flex items-center justify-center border-2 p-1.5 sm:p-2 border-primary-text hover:border-ternary-text rounded-lg sm:rounded-xl hover:bg-text-hover ${
                  theme === "dark"
                    ? "border-primary-text hover:text-ternary-text"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                aria-label="Previous brands"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 border-primary-text hover:text-ternary-text" />
              </button>
              <button
                onClick={nextPage}
                className={`absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full shadow-lg transition-all hidden sm:flex items-center justify-center border-2 p-1.5 sm:p-2 border-primary-text hover:border-ternary-text rounded-lg sm:rounded-xl hover:bg-text-hover ${
                  theme === "dark"
                    ? "border-primary-text hover:text-ternary-text"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                aria-label="Next brands"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary-text" />
              </button>
            </>
          )}

          {/* Brands Container */}
          <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap sm:flex-nowrap overflow-hidden px-2 sm:px-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : brands.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No brands available
              </div>
            ) : (
              currentBrands.map((brand, index) => {
                const colorIndex = currentPage * itemsPerPage + index;
                const colors = getBrandColor(colorIndex);
                const hasLogo = brand.logo && brand.logo.length > 0;
                return (
                  <Link
                    key={brand.id}
                    href={`/products?brand=${encodeURIComponent(brand.name)}`}
                    className="group flex flex-col items-center gap-2 transition-transform hover:scale-105"
                  >
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${
                        theme === "dark"
                          ? "border-border/50 group-hover:border-flame-orange/50"
                          : "border-gray-200 group-hover:border-orange-300"
                      } ${hasLogo ? (theme === "dark" ? "bg-card" : "bg-white") : colors.bg}`}
                    >
                      {hasLogo ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={brand.logo!}
                            alt={brand.name}
                            fill
                            className="object-cover"
                            unoptimized={brand.logo!.startsWith('data:')}
                          />
                        </div>
                      ) : (
                        <span
                          className={`text-xs sm:text-sm md:text-base font-bold text-center leading-tight px-1 ${colors.text}`}
                        >
                          {brand.name}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-xs md:text-sm text-center max-w-[90px] sm:max-w-[100px] truncate ${
                      theme === "dark" ? "text-muted-foreground" : "text-gray-500"
                    }`}>
                      {brand.name}
                    </span>
                    {brand.productCount > 0 && (
                      <span className={`text-[10px] sm:text-xs -mt-1 ${
                        theme === "dark" ? "text-muted-foreground/70" : "text-gray-400"
                      }`}>
                        {brand.productCount} {brand.productCount === 1 ? "item" : "items"}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination Dots */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 sm:mt-6">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                  currentPage === index
                    ? theme === "dark"
                      ? "bg-flame-orange w-4 sm:w-6"
                      : "bg-orange-500 w-4 sm:w-6"
                    : theme === "dark"
                    ? "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

