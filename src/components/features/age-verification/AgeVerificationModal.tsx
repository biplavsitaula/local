"use client";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Flame, Mic } from "lucide-react";
import { IAgeVerificationModalProps } from "@/interface/IAgeVerificationModalProps";
import Link from "next/link";

const AgeVerificationModal: React.FC<IAgeVerificationModalProps> = ({
  onVerified,
  onDenied,
}) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark background */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

      {/* Modal with glowing orange border */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="relative rounded-2xl bg-black/90 p-8 md:p-12 text-center border-2 border-flame-orange shadow-[0_0_40px_rgba(255,140,0,0.3)]">
          {/* Logo with flame animation from bottom to top */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-flame-orange via-flame-orange to-flame-yellow flex items-center justify-center shadow-[0_0_30px_rgba(255,140,0,0.5)] relative overflow-hidden">
                {/* Animated flame from bottom to top */}
                <div className="absolute inset-0 bg-gradient-to-t from-flame-orange via-flame-yellow to-transparent animate-flame-rise opacity-80" />
                <Flame className="w-12 h-12 text-black relative z-10" />
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,140,0,0.5)]">
            Flame Beverage
          </h1>

          {/* Tagline with microphone icons */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Mic className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-300 font-light">
              Premium Liquor Store
            </span>
            <Mic className="w-4 h-4 text-orange-500" />
          </div>

          {/* Age Verification Heading */}
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
            Age Verification Required
          </h2>

          {/* Question */}
          <p className="text-lg md:text-xl font-medium text-gray-300 mb-10">
            {t("ageQuestion")}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={onVerified}
              className="flex-1 bg-gradient-to-r from-flame-orange via-flame-yellow to-flame-orange text-black font-bold py-6 text-lg hover:opacity-90 transition-opacity border-0 rounded-xl shadow-lg cursor-pointer"
            >
              {t("ageYes")}
            </button>
            <button
              onClick={onDenied}
              className="flex-1 bg-black/50 border-2 border-gray-700 text-white font-bold py-6 text-lg hover:bg-gray-800 rounded-xl cursor-pointer"
            >
              {t("ageNo")}
            </button>
          </div>

          {/* Legal Disclaimer */}
          <p className="text-xs text-gray-500 leading-relaxed">
            By entering this site, you agree to our{" "}
            <Link href="/terms" className="text-flame-orange hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-flame-orange hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
