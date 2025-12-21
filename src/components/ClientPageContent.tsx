"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import AgeDeniedScreen from "@/components/features/age-verification/AgeDeniedScreen";
import AgeVerificationModal from "@/components/features/age-verification/AgeVerificationModal";
import CategorySection from "@/components/CategorySection";
import CheckoutModal from "@/components/CheckoutModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/features/product/ProductGrid";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AgeStatus } from "@/types";
import { useSeasonalTheme } from "@/hooks/useSeasonalTheme";
import { useTheme } from "@/contexts/ThemeContext";

function PageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showSeasonalSection, setShowSeasonalSection] = useState(true);
  const { theme: seasonalTheme } = useSeasonalTheme();
  const { theme } = useTheme();

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
                <ProductGrid
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  onCheckout={() => setCheckoutOpen(true)}
                />
                <CategorySection
                  selected={selectedCategory}
                  onSelect={(value: string) =>
                    setSelectedCategory(
                      selectedCategory === value ? "All" : value
                    )
                  }
                />
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
                      className={`absolute top-4 right-4 z-10 p-2 rounded-full border transition-colors ${
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
                          {seasonalTheme.tags.map((tag, index) => (
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
                              className="mt-3 rounded-full gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground"
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
    </div>
  );
}

export function ClientPageContent() {
  // Initialize from sessionStorage immediately to avoid showing modal on navigation
  const [ageStatus, setAgeStatus] = useState<AgeStatus>(() => {
    // Only check sessionStorage in browser (not during SSR)
    if (typeof window !== "undefined") {
      const verified = sessionStorage.getItem("age-verified");
      if (verified === "true") {
        return "verified";
      }
    }
    return "pending";
  });

  const handleAgeVerified = () => {
    sessionStorage.setItem("age-verified", "true");
    setAgeStatus("verified");
  };

  const handleAgeDenied = () => {
    setAgeStatus("denied");
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          {ageStatus === "pending" && (
            <AgeVerificationModal
              onVerified={handleAgeVerified}
              onDenied={handleAgeDenied}
            />
          )}

          {ageStatus === "denied" && <AgeDeniedScreen />}

          {ageStatus === "verified" && <PageContent />}
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

