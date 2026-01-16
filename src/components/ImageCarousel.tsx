"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { featureImagesService, FeatureImage } from "@/services/feature-images.service";

interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

// Default slides (fallback when API returns no data)
const defaultSlides: CarouselSlide[] = [
  {
    id: "default-1",
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1400&h=500&fit=crop&q=80",
    title: "Premium Whiskey Collection",
    subtitle: "Discover the finest aged spirits from around the world",
    ctaText: "Shop Now",
    ctaLink: "/products?category=whiskey",
  },
  {
    id: "default-2",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1400&h=500&fit=crop&q=80",
    title: "Exclusive Wine Selection",
    subtitle: "Handpicked wines from renowned vineyards",
    ctaText: "Explore Wines",
    ctaLink: "/products?category=wine",
  },
  {
    id: "default-3",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=1400&h=500&fit=crop&q=80",
    title: "Craft Beer Festival",
    subtitle: "Limited edition brews and artisanal favorites",
    ctaText: "View Collection",
    ctaLink: "/products?category=beer",
  },
  {
    id: "default-4",
    image: "https://images.unsplash.com/photo-1574610604430-04733b64acaf?w=1400&h=500&fit=crop&q=80",
    title: "Special Offers",
    subtitle: "Up to 30% off on selected premium spirits",
    ctaText: "Shop Deals",
    ctaLink: "/offers",
  },
];

export default function ImageCarousel() {
  const { theme } = useTheme();
  const [slides, setSlides] = useState<CarouselSlide[]>(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fetch feature images from API
  useEffect(() => {
    const fetchFeatureImages = async () => {
      try {
        setLoading(true);
        const response = await featureImagesService.getAll();
        const images = response.data || [];
        
        // Filter only active images and sort by order
        const activeImages = images
          .filter((img: FeatureImage) => img.isActive !== false)
          .sort((a: FeatureImage, b: FeatureImage) => (a.order || 0) - (b.order || 0));
        
        if (activeImages.length > 0) {
          const mappedSlides: CarouselSlide[] = activeImages.map((img: FeatureImage) => ({
            id: img._id || img.id || `slide-${Math.random()}`,
            image: img.imageUrl,
            title: img.name,
            subtitle: img.description || "",
            ctaText: img.tag,
            ctaLink: img.ctaLink,
          }));
          setSlides(mappedSlides);
        }
        // If no images from API, keep using defaultSlides
      } catch (error) {
        console.error("Failed to fetch feature images:", error);
        // Keep using defaultSlides on error
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureImages();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleImageError = (slideId: string) => {
    setImageErrors((prev) => new Set(prev).add(slideId));
  };

  // Don't render if no slides available
  if (slides.length === 0) {
    return null;
  }

  // Show loading skeleton
  if (loading) {
    return (
      <section className="container mx-auto px-4 mt-4">
        <div
          className={`relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden ${
            theme === "dark"
              ? "bg-secondary/30 animate-pulse"
              : "bg-gray-200 animate-pulse"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`w-8 h-8 animate-spin ${theme === "dark" ? "text-flame-orange" : "text-orange-500"}`} />
          </div>
        </div>
      </section>
    );
  }

  // Fallback gradient backgrounds for each slide
  const fallbackGradients = [
    "from-amber-900 via-orange-800 to-yellow-700",
    "from-purple-900 via-pink-800 to-rose-700",
    "from-emerald-900 via-teal-800 to-cyan-700",
    "from-blue-900 via-indigo-800 to-violet-700",
  ];

  return (
    <section className="container mx-auto px-4 mt-4">
      <div
        className={`relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden ${
          theme === "dark"
            ? "shadow-[0_0_40px_rgba(255,107,0,0.15)]"
            : "shadow-xl"
        }`}
      >
        {/* Slides Container */}
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative w-full h-full flex-shrink-0"
            >
              {/* Background Image or Fallback */}
              {!imageErrors.has(slide.id) ? (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  onError={() => handleImageError(slide.id)}
                />
              ) : (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${fallbackGradients[index % fallbackGradients.length]}`}
                />
              )}

              {/* Overlay Gradient */}
              <div
                className={`absolute inset-0 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-black/70 via-black/40 to-transparent"
                    : "bg-gradient-to-r from-black/60 via-black/30 to-transparent"
                }`}
              />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 sm:px-10 md:px-16 max-w-xl">
                  <p
                    className={`text-xs sm:text-sm uppercase tracking-[0.2em] mb-2 sm:mb-3 ${
                      theme === "dark"
                        ? "text-flame-orange"
                        : "text-orange-400"
                    }`}
                  >
                    Featured
                  </p>
                  <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-2 sm:mb-4 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white/80 mb-4 sm:mb-6 line-clamp-2">
                    {slide.subtitle}
                  </p>
                  {slide.ctaText && (
                    <a
                      href={slide.ctaLink}
                      className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-gradient-to-r from-flame-orange to-orange-500 text-white hover:shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:scale-105"
                          : "bg-orange-500 text-white hover:bg-orange-600 hover:scale-105"
                      }`}
                    >
                      {slide.ctaText}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Decorative Elements */}
              <div
                className={`absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1 rounded-full text-xs font-medium ${
                  theme === "dark"
                    ? "bg-white/10 text-white/80 backdrop-blur-sm"
                    : "bg-black/20 text-white backdrop-blur-sm"
                }`}
              >
                {index + 1} / {slides.length}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => {
            prevSlide();
            setIsAutoPlaying(false);
            setTimeout(() => setIsAutoPlaying(true), 5000);
          }}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full transition-all duration-300 ${
            theme === "dark"
              ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              : "bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm"
          }`}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={() => {
            nextSlide();
            setIsAutoPlaying(false);
            setTimeout(() => setIsAutoPlaying(true), 5000);
          }}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full transition-all duration-300 ${
            theme === "dark"
              ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              : "bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm"
          }`}
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? theme === "dark"
                    ? "w-8 h-2 bg-flame-orange"
                    : "w-8 h-2 bg-orange-500"
                  : theme === "dark"
                  ? "w-2 h-2 bg-white/40 hover:bg-white/60"
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className={`h-full transition-all duration-300 ${
              theme === "dark" ? "bg-flame-orange" : "bg-orange-500"
            }`}
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

