"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { getCurrentLanguageTranslations } from "@/helpers/languageHelper";
import AnimatedLogo from "@/components/AnimatedLogo";

export default function NotFound() {
  const router = useRouter();
  // Use translations helper directly to avoid LanguageProvider dependency during SSR
  const translations = typeof window !== 'undefined' 
    ? getCurrentLanguageTranslations() 
    : getCurrentLanguageTranslations(); // getCurrentLanguageTranslations handles SSR internally
  const t = (key: string) => translations[key as keyof typeof translations] || key;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background with galaxy effect */}
      <div className="absolute inset-0 galaxy-bg bg-background/95 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="glass-dark rounded-2xl p-8 text-center border border-border-primary-accent shadow-2xl">
          {/* Icon */ }
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="">
                {/* <AlertTriangle className="w-10 h-10 text-primary-foreground" /> */}
                <AnimatedLogo width={80} height={60} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-display font-bold mb-2 text-primary-gradient">
            404
          </h1>

          <h2 className="text-2xl font-display font-semibold mb-4 text-color-secondary">
            {t('pageNotFound' as any)}
          </h2>

          {/* Message */}
          <p className="text-lg font-medium mb-8 text-color-muted">
            {t('pageNotFoundMessage' as any)}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 btn-outline-custom py-6 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('goBack' as any)}
            </Button>
            <Button
              asChild
              variant="default"
              className="flex-1 btn-primary-custom font-semibold py-6 text-lg"
            >
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                {t('goHome' as any)}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

