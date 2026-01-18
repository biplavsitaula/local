"use client";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic } from "lucide-react";
import { IAgeVerificationModalProps } from "@/interface/IAgeVerificationModalProps";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";

const AgeVerificationModal: React.FC<IAgeVerificationModalProps> = ({
  onVerified,
  onDenied,
}) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark background */}
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />

      {/* Modal with glowing orange border */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="relative rounded-2xl bg-modal p-8 md:p-12 text-center border-2 border-color-primary shadow-[0_0_40px_rgba(255,140,0,0.3)]">
          {/* Logo with flame animation from bottom to top */}
          <div className="flex justify-center mb-4">
            <AnimatedLogo width={120} height={80} />
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 text-gradient-primary">
            {t("flameBeverage")}
          </h1>

          {/* Tagline with microphone icons */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Mic className="w-4 h-4 text-color-accent" />
            <span className="text-sm text-color-secondary font-light">
              {t("premiumLiquorStore")}
            </span>
            <Mic className="w-4 h-4 text-color-accent" />
          </div>

          {/* Age Verification Heading */}
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-gradient-primary">
            {t("ageVerificationRequired")}
          </h2>

          {/* Message */}
          <p className="text-lg md:text-xl font-medium text-color-secondary mb-4">
            {t("ageDeniedMessage")}
          </p>
          
          {/* Question */}
          <p className="text-base md:text-lg font-medium text-color-tertiary mb-10">
            {t("ageQuestion")}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={onVerified}
              className="flex-1 bg-gradient-btn-primary text-black font-bold py-6 text-lg hover:opacity-90 transition-opacity border-0 rounded-xl shadow-lg cursor-pointer"
            >
              {t("ageYes")}
            </button>
            <button
              onClick={onDenied}
              className="flex-1 bg-black/50 border-2 border-color-secondary text-color-primary font-bold py-6 text-lg hover:bg-gray-800 rounded-xl cursor-pointer"
            >
              {t("ageNo")}
            </button>
          </div>

          {/* Legal Disclaimer */}
          <p className="text-xs text-color-muted leading-relaxed">
            {t("siteAgreement")}{" "}
            <Link href="/terms" className="text-color-accent hover:underline">
              {t("termsConditions")}
            </Link>{" "}
            {t("and")}{" "}
            <Link href="/privacy" className="text-color-accent hover:underline">
              {t("privacyPolicy")}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
