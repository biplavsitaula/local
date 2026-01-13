import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <section className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden transition-colors ${
      theme === 'dark' ? 'galaxy-bg' : 'bg-gradient-to-b from-orange-50/30 via-yellow-50/20 to-orange-50/30'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-flame-orange/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flame-red/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-flame-yellow/5 rounded-full blur-3xl" />
      </div>


      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 shadow-sm px-4 py-2 rounded-full backdrop-blur-sm transition-colors ${
            theme === 'dark'
              ? 'shadow-flame-gold bg-secondary/50 border border-flame-gold text-flame-gold'
              : 'shadow-orange-200 bg-white/80 border border-orange-300 text-orange-600'
          }`}>
            <Sparkles className={`w-4 h-4 ${theme === 'dark' ? 'text-flame-yellow' : 'text-orange-500'}`} />
            <span className="text-sm font-medium">Premium Collection 2024</span>
          </div>

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

          <div className="flex justify-center items-center">
            <AnimatedLogo width={180} height={48} />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
            <span className="flame-text">{t("heroTitle")}</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            {t("heroSubtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
            <Link href="/products">
              <Button
                size="lg"
                variant="default"
                className="gradient-gold text-primary-foreground font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg hover:opacity-90 transition-all group border-0"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button
                size="lg"
                variant="outline"
                className={`px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg transition-colors ${
                  theme === 'dark'
                    ? 'border-border/50 text-foreground hover:bg-card/10'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                Categories
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 sm:pt-12 max-w-xl mx-auto">
            <div className="text-center">
              <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                theme === 'dark' ? 'flame-text' : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
              }`}>500+</p>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'}`}>Products</p>
            </div>
            <div className="text-center">
              <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                theme === 'dark' ? 'flame-text' : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
              }`}>1hr</p>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'}`}>Delivery</p>
            </div>
            <div className="text-center">
              <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                theme === 'dark' ? 'flame-text' : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
              }`}>10k+</p>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'}`}>Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${
        theme === 'dark' ? 'from-background' : 'from-gray-50'
      } to-transparent`} />
    </section>
  );
};

export default HeroSection;
