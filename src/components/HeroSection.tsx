"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { featureImagesService, FeatureImage } from "@/services/feature-images.service";

const HeroSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  // --- Carousel & Data Logic ---
  const [slides, setSlides] = useState<FeatureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchFeatureImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await featureImagesService.getAll();
      const activeImages = (response.data || [])
        .filter((img: FeatureImage) => img.isActive !== false)
        .sort((a: FeatureImage, b: FeatureImage) => (a.order || 0) - (b.order || 0));
      // const activeImages = []
      setSlides(activeImages);
    } catch (error) {
      console.error("Failed to fetch feature images:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatureImages();
  }, [fetchFeatureImages]);

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [nextSlide, slides.length]);

  // --- Loading state: show a minimal spinner ---
  if (loading) {
    return (
      <section className="relative min-h-[90vh] w-full flex items-center justify-center bg-black overflow-hidden">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </section>
    );
  }

  // --- Galaxy fallback: no slides available ---
  if (slides.length === 0) {
    return (
      <section className="relative pt-8 pb-4 sm:pt-6 sm:pb-6 overflow-hidden transition-colors galaxy-bg">
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 shadow-md px-4 py-2 rounded-full backdrop-blur-sm transition-colors border bg-secondary/50 border-color-primary text-color-white">
              <Sparkles className="w-4 h-4 text-color-accent" />
              <span className="text-sm font-medium">
                {language === 'en' ? `Premium Collection ${currentYear}` : `प्रिमियम संग्रह ${currentYear}`}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight text-primary-gradient">
              {language === 'en' ? 'Premium Spirits' : 'प्रिमियम स्पिरिट्स'}{' '}
              <span className="font-sans">&amp;</span>{' '}
              {language === 'en' ? 'Fine Beverages' : 'उत्कृष्ट पेय पदार्थ'}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
              {t("heroSubtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
              <Link href="/products">
                <Button
                  size="lg"
                  variant="default"
                  className="btn-primary-custom font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg group"
                >
                  {language === 'en' ? 'Explore Collection' : 'संग्रह अन्वेषण'}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-default-custom px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg border-color-primary"
                >
                  {language === 'en' ? 'Categories' : 'कोटिहरू'}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 sm:pt-12 max-w-xl mx-auto">
              <div className="text-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-gradient">500+</p>
                <p className="text-xs sm:text-sm text-color-muted">Products</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-gradient">1hr</p>
                <p className="text-xs sm:text-sm text-color-muted">Delivery</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-gradient">10k+</p>
                <p className="text-xs sm:text-sm text-color-muted">Customers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>
    );
  }

  // --- Cinematic carousel: slides available ---
  return (
    <section className="relative min-h-[90vh] w-full flex items-center bg-black overflow-hidden">
      {/* Background carousel images */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide._id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.name || "Hero Background"}
              fill
              className="object-cover transition-transform duration-[10000ms] ease-linear"
              style={{ transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)' }}
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent backdrop-blur-[1px]" />
          </div>
        ))}
      </div>

      {/* Content - Left Aligned */}
      <div className="relative z-20 container mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl space-y-8 animate-fade-in text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 shadow-md px-4 py-2 rounded-full backdrop-blur-md border border-amber-500/30 bg-black/40 text-white">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs md:text-sm font-medium tracking-wider">
              {language === 'en' ? `Premium Collection ${currentYear}` : `प्रिमियम संग्रह ${currentYear}`}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl md:text-6xl lg:text-6xl font-serif font-bold leading-[1.1]">
            <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              {language === 'en' ? 'Premium Spirits' : 'प्रिमियम स्पिरिट्स'}
            </span>
            <br />
            <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              {language === 'en' ? '& Fine Beverages' : '& उत्कृष्ट पेय पदार्थ'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl max-w-xl text-gray-300 font-light leading-relaxed">
            {language === 'en'
              ? 'Discover our exclusive collection of world class liquors'
              : 'विश्व स्तरीय मदिराको हाम्रो विशेष संग्रह पत्ता लगाउनुहोस्।'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-start items-center pt-4">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 text-sm sm:text-base rounded-lg shadow-lg shadow-orange-900/20 transition-all group border-none"
              >
                {language === 'en' ? 'Explore Collection' : 'संग्रह अन्वेषण'}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            {/* <Link href="/categories" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/20 bg-transparent backdrop-blur-sm text-white hover:bg-white hover:text-black font-bold px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 rounded-none uppercase tracking-widest text-xs transition-all"
              >
                {language === 'en' ? 'Categories' : 'कोटिहरू'}
              </Button>
            </Link> */}
            <Link href="/categories">
              <Button
                size="lg"
                variant="outline"
                className="btn-default-custom px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg border-color-primary"
              >
                {language === 'en' ? 'Categories' : 'कोटिहरू'}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-6 sm:gap-12 pt-12 border-t border-white/10 w-fit">
            <div className="text-left">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500">500+</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500">Products</p>
            </div>
            <div className="text-left">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500">1hr</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Delivery</p>
            </div>
            <div className="text-left">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500">10k+</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Progress Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-row items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 transition-all duration-700 rounded-full ${i === currentSlide ? "w-12 bg-amber-500" : "w-3 bg-white/20 hover:bg-white/40"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;