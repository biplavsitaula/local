"use client";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Flame, Wine, AlertTriangle } from "lucide-react";
import { IAgeVerificationModalProps } from "@/interface/IAgeVerificationModalProps";

const AgeVerificationModal: React.FC<IAgeVerificationModalProps> = ({
  onVerified,
  onDenied,
}) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background with galaxy effect */}
      <div className="absolute inset-0 galaxy-bg bg-background/95 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="glass-dark rounded-2xl p-8 text-center border border-flame-orange/20 shadow-2xl">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-flame-red via-flame-orange to-flame-yellow flex items-center justify-center animate-pulse-glow">
                <Flame className="w-10 h-10 text-primary-foreground" />
              </div>
              <Wine className="absolute -bottom-1 -right-1 w-8 h-8 text-flame-gold animate-float" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-display font-bold text-foreground mb-2 flame-text">
            Flame Beverage
          </h2>

          <h3 className="text-xl font-display font-semibold text-foreground mb-4">
            {t("ageTitle")}
          </h3>

          {/* Warning */}
          <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
            <AlertTriangle className="w-5 h-5 text-flame-orange" />
            <p className="text-sm">{t("ageWarning")}</p>
          </div>

          {/* Question */}
          <p className="text-lg font-medium text-foreground mb-8">
            {t("ageQuestion")}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onVerified}
              variant="default"
              className="flex-1 bg-flame-gradient text-primary-foreground font-semibold py-6 text-lg hover:opacity-90 transition-opacity border-0"
            >
              {t("ageYes")}
            </Button>
            <Button
              onClick={onDenied}
              variant="outline"
              className="flex-1 border-flame-orange/50 text-foreground hover:bg-flame-orange/10 py-6 text-lg"
            >
              {t("ageNo")}
            </Button>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-xs text-muted-foreground">
            {t("drinkResponsibly")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
