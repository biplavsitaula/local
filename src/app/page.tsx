"use client";

import React, { useState, useEffect } from "react";
import AgeDeniedScreen from "@/components/AgeDeniedScreen";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import CategorySection from "@/components/CategorySection";
import CheckoutModal from "@/components/CheckoutModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import PromoBanner from "@/components/PromoBanner";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

type AgeStatus = "pending" | "verified" | "denied";

const Index: React.FC = () => {
  const [ageStatus, setAgeStatus] = useState<AgeStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Check sessionStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (sessionStorage.getItem("age-verified") === "true") {
      setAgeStatus("verified");
    }
  }, []);

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

          {ageStatus === "verified" && (
            <div className="min-h-screen bg-gradient-to-b from-[#0b0a13] via-[#120d1f] to-[#0b0a13] text-amber-100">
              <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCheckout={() => setCheckoutOpen(true)}
              />
              <main className="flex flex-col gap-12 py-10">
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
                <section className="mx-auto max-w-6xl grid gap-3 px-4 md:grid-cols-4 md:px-8">
                  <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/30 to-orange-500/20 p-4 text-amber-50 shadow-amber-500/20 shadow-lg">
                    <p className="text-lg font-semibold">1-hour delivery</p>
                    <p className="text-sm text-amber-100/80">
                      Track to your door in lightning speed.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-[#0f0c19] p-4 text-amber-50 shadow-amber-500/10 shadow-lg">
                    <p className="text-lg font-semibold">
                      12 bottle bundle offer
                    </p>
                    <p className="text-sm text-amber-100/80">
                      Stock up & save across categories.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-[#0f0c19] p-4 text-amber-50 shadow-amber-500/10 shadow-lg">
                    <p className="text-lg font-semibold">
                      Fast delivery windows
                    </p>
                    <p className="text-sm text-amber-100/80">
                      Predictable time windows with alerts.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-orange-500/30 to-red-500/30 p-4 text-amber-50 shadow-amber-500/20 shadow-lg">
                    <p className="text-lg font-semibold">
                      Free delivery on 2000+
                    </p>
                    <p className="text-sm text-amber-100/80">
                      Visible at top, hides on scroll.
                    </p>
                  </div>
                </section>
                <section className="mx-auto max-w-6xl relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#1c0f1f] via-[#1a0c18] to-[#240f1f] p-8 shadow-amber-500/20 shadow-2xl px-4 md:px-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(255,80,80,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,200,120,0.25),transparent_40%)]" />
                  <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
                    <div className="space-y-3">
                      <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">
                        Seasonal spotlight
                      </p>
                      <h3 className="text-3xl font-semibold text-amber-50">
                        Crimson Christmas
                      </h3>
                      <p className="text-amber-200/80">
                        Santa-approved hampers, mulled wine kits, sparkling
                        sets. Red-and-gold theme, limited-time artful packaging.
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-amber-100">
                        <span className="rounded-full bg-black/30 px-3 py-1">
                          🎅 Santa drops
                        </span>
                        <span className="rounded-full bg-black/30 px-3 py-1">
                          🎁 Gifting ready
                        </span>
                        <span className="rounded-full bg-black/30 px-3 py-1">
                          🕯️ Warm spices
                        </span>
                      </div>
                    </div>
                    <div className="relative h-56">
                      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(255,120,80,0.35),transparent_50%)] blur-2xl" />
                      <div className="relative flex h-full items-center justify-center rounded-2xl border border-amber-500/30 bg-black/30 p-4 shadow-amber-500/20 shadow-xl">
                        <div className="text-center text-amber-50">
                          <p className="text-lg font-semibold">Festival Ad</p>
                          <p className="text-sm text-amber-200/80">
                            Red theme, santa art, event-specific CTA.
                          </p>
                          <button
                            onClick={() => setSelectedCategory("Wine")}
                            className="mt-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-black"
                          >
                            Explore festive picks
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <PromoBanner />
              </main>
              <Footer />
              <CheckoutModal
                open={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
              />
            </div>
          )}
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default Index;
