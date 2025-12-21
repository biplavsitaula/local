import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Flame } from "lucide-react";

const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden galaxy-bg">
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
          <div className="inline-flex items-center gap-2 shadow-sm shadow-flame-gold px-4 py-2 rounded-full bg-secondary/50 border border-flame-gold text-flame-gold backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-flame-yellow" />
            <span className="text-sm font-medium">Premium Collection 2024</span>
          </div>

          {/* Flame Transition Effect */}
          <div className="relative flex items-center justify-center py-1 pointer-events-none">
            {/* Central Glowing Flame Circle */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer Glow Ring - Yellow Background Glow (different timing) */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-yellow/30 via-flame-orange/20 to-flame-red/15 blur-2xl animate-glow-pulse-outer"
                style={{ animationDuration: "2.5s" }}
              />
              
              {/* Middle Glow Ring */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-orange/30 via-flame-red/20 to-flame-yellow/20 blur-xl animate-glow-pulse"
                style={{ animationDelay: "0.2s", animationDuration: "2.8s" }}
              />
              
              {/* Inner Glow Ring */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-flame-orange/50 via-flame-red/40 to-flame-yellow/30 blur-lg animate-glow-pulse"
                style={{ animationDelay: "0.4s", animationDuration: "3s" }}
              />
              
              {/* Inner Flame Circle (different animation) */}
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-flame-orange via-flame-red to-flame-yellow flex items-center justify-center shadow-2xl animate-flame-pulse transition-all duration-300">
                <Flame className="w-8 h-8 text-primary-foreground drop-shadow-2xl transition-transform duration-300" />
              </div>

              {/* Floating Ember Particles */}
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
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
            <span className="flame-text">{t("heroTitle")}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              variant="default"
              className="gradient-gold text-primary-foreground font-semibold px-8 py-6 text-lg hover:opacity-90 transition-all group border-0"
            >
              {t("shopNow")}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 text-foreground hover:bg-card/10 px-8 py-6 text-lg"
            >
              {t("viewCollection")}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-12 max-w-xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold flame-text">500+</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold flame-text">1hr</p>
              <p className="text-sm text-muted-foreground">Delivery</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold flame-text">10k+</p>
              <p className="text-sm text-muted-foreground">Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
