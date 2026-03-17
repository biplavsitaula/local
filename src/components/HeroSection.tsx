"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { featureImagesService, FeatureImage } from "@/services/feature-images.service";
import AnimatedStats from "@/components/AnimatedStats";

const HeroSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  const heroStats = [
    { value: "10+", label: t("yearsExperience") },
    { value: "5000+", label: t("happyCustomers") },
    { value: "500+", label: t("products") },
    { value: "24/7", label: t("support") },
  ];
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

  // --- Loading state: show a skeleton of the hero ---
  if (loading) {
    return (
      <section className="relative pt-8 pb-4 sm:pt-6 sm:pb-6 overflow-hidden transition-colors bg-card animate-pulse min-h-[65vh] sm:min-h-[75vh] md:min-h-[90vh]">
        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center justify-center h-full mt-24 sm:mt-32">
          <div className="max-w-4xl w-full mx-auto space-y-8 flex flex-col items-center">
            {/* Badge Skeleton */}
            <div className="h-8 w-48 bg-muted rounded-full"></div>

            {/* Title Skeleton */}
            <div className="space-y-4 w-full max-w-2xl flex flex-col items-center">
              <div className="h-12 sm:h-16 w-3/4 bg-muted rounded-lg"></div>
              <div className="h-12 sm:h-16 w-1/2 bg-muted rounded-lg"></div>
            </div>

            {/* Subtitle Skeleton */}
            <div className="h-6 w-2/3 max-w-xl bg-muted rounded"></div>

            {/* CTA Buttons Skeleton */}
            <div className="flex flex-row w-full gap-2 sm:gap-4 justify-center items-center pt-4">
              <div className="h-14 flex-1 sm:w-[200px] bg-muted rounded-lg"></div>
              <div className="h-14 flex-1 sm:w-[200px] bg-muted rounded-lg"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 sm:pt-12 w-full max-w-xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-16 bg-muted rounded"></div>
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-16 bg-muted rounded"></div>
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-16 bg-muted rounded"></div>
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
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
            <div className="flex flex-row w-full gap-2 sm:gap-4 justify-center items-center pt-4">
              <Link href="/products" className="flex-1 sm:w-auto">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full sm:w-auto btn-primary-custom font-semibold px-2 sm:px-8 py-4 sm:py-6 text-[10px] sm:text-base md:text-lg group"
                >
                  <span className="truncate leading-tight whitespace-normal">{language === 'en' ? 'Explore Collection' : 'संग्रह अन्वेषण'}</span>
                  <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform shrink-0" />
                </Button>
              </Link>
              <Link href="/categories" className="flex-1 sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto btn-default-custom px-2 sm:px-8 py-4 sm:py-6 text-[10px] sm:text-base md:text-lg border-color-primary"
                >
                  <span className="truncate leading-tight whitespace-normal">{language === 'en' ? 'Categories' : 'कोटिहरू'}</span>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <AnimatedStats stats={heroStats} variant="hero-gradient" />
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>
    );
  }

  // --- Cinematic carousel: slides available ---
  return (
    <section className="relative min-h-[65vh] sm:min-h-[75vh] md:min-h-[90vh] w-full flex items-center bg-black overflow-hidden">
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
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
              className="object-cover object-top sm:object-center transition-transform duration-[10000ms] ease-linear"
              style={{ transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)' }}
              priority={index === 0}
            />
            {/* Dark overlay — stronger on mobile so text/dots stay readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 sm:bg-none sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent backdrop-blur-[1px]" />
          </div>
        ))}
      </div>

      {/* Content - Left Aligned */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-0">
        <div className="max-w-3xl space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 shadow-md px-4 py-2 rounded-full backdrop-blur-md border border-amber-500/30 bg-black/40 text-white">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs md:text-sm font-medium tracking-wider">
              {language === 'en' ? `Premium Collection ${currentYear}` : `प्रिमियम संग्रह ${currentYear}`}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-serif font-bold leading-[1.1]">
            <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              {language === 'en' ? 'Premium Spirits' : 'प्रिमियम स्पिरिट्स'}
            </span>
            <br />
            <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              {language === 'en' ? '& Fine Beverages' : '& उत्कृष्ट पेय पदार्थ'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg max-w-xl text-gray-300 font-light leading-relaxed">
            {language === 'en'
              ? 'Discover our exclusive collection of world class liquors'
              : 'विश्व स्तरीय मदिराको हाम्रो विशेष संग्रह पत्ता लगाउनुहोस्।'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row w-full sm:w-auto gap-2 sm:gap-4 justify-center sm:justify-start items-center pt-2 sm:pt-4">
            <Link href="/products" className="flex-1 sm:flex-none sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold px-2 py-3 sm:px-8 sm:py-5 md:px-10 md:py-6 text-[10px] sm:text-sm md:text-base rounded-lg shadow-lg shadow-orange-900/20 transition-all group border-none"
              >
                <span className="truncate leading-tight whitespace-normal">{language === 'en' ? 'Explore Collection' : 'संग्रह अन्वेषण'}</span>
                <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform shrink-0" />
              </Button>
            </Link>
            <Link href="/categories" className="flex-1 sm:flex-none sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border border-orange-500 bg-transparent backdrop-blur-sm text-white hover:bg-orange-500 hover:text-white font-bold px-2 py-3 sm:px-8 sm:py-5 md:px-10 md:py-6 rounded-lg tracking-widest text-[10px] sm:text-sm md:text-base transition-all hover:border-yellow-300"
              >
                <span className="truncate leading-tight whitespace-normal">{language === 'en' ? 'Categories' : 'कोटिहरू'}</span>
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <AnimatedStats stats={heroStats} variant="hero-dark" />
        </div>
      </div>

      {/* Slide Progress Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-row items-center gap-3">
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