import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import HeroTitle from "@/components/HeroTitle";

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <section className={`relative pt-8 pb-4 sm:pt-6 sm:pb-6 overflow-hidden transition-colors ${
      theme === 'dark' ? 'galaxy-bg' : 'bg-gradient-to-b from-orange-50/30 via-yellow-50/20 to-orange-50/30'
    }`}>
      {/* Animated Background Elements */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flame-orange/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flame-red/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-flame-yellow/5 rounded-full blur-3xl" />
      </div> */}


      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 shadow-sm px-4 py-2 rounded-full backdrop-blur-sm transition-colors bg-secondary/50 border border-color-primary text-color-tertiary">
            <Sparkles className="w-4 h-4 text-color-accent" />
            <span className="text-sm font-medium">Premium Collection 2024</span>
          </div>
          {/* <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
            <span className="bg-gradient-to-b from-red-600 via-orange-500 to-amber-400 bg-clip-text text-transparent">Premium Spirits & Fine</span>
            <br />
            <span className="bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-300 bg-clip-text text-transparent">Beverages</span>
          </h1> */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight text-primary-gradient"> Premium Spirits & Fine Beverages</h1>

          {/* Flame Transition Effect */}
          {/* <div className="relative flex items-center justify-center py-1 pointer-events-none">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-yellow/30 via-flame-orange/20 to-flame-red/15 blur-2xl animate-glow-pulse-outer"
                style={{ animationDuration: "2.5s" }}
              />
              
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-orange/30 via-flame-red/20 to-flame-yellow/20 blur-xl animate-glow-pulse"
                style={{ animationDelay: "0.2s", animationDuration: "2.8s" }}
              />
              
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-orange/50 via-flame-red/40 to-flame-yellow/30 blur-lg animate-glow-pulse"
                style={{ animationDelay: "0.4s", animationDuration: "3s" }}
              />
              
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-flame-orange via-flame-red to-flame-yellow flex items-center justify-center shadow-2xl animate-flame-pulse transition-all duration-300">
                <Flame className="w-8 h-8 text-primary-foreground drop-shadow-2xl transition-transform duration-300" />
              </div>

              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ember-float"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2.5 + (i % 4) * 0.5}s`,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-flame-orange to-flame-red blur-sm"
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-40px)`,
                      opacity: 0.5 + (i % 3) * 0.15,
                    }}
                  />
                </div>
              ))}
            </div>
          </div> */}

          {/* <div className="flex justify-center items-center">
            <AnimatedLogo width={80} height={60} />
          </div> */}

          {/* Main Title */}
          {/* <HeroTitle text={t("heroTitle")} size="md" /> */}

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
                Explore Collection
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button
                size="lg"
                variant="outline"
                className="btn-outline-custom px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg"
              >
                Categories
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
      <div className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t ${
        theme === 'dark' ? 'from-background' : 'from-gray-50'
      } to-transparent`} />
    </section>
  );
};

export default HeroSection;
