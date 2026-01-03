"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background with galaxy effect */}
      <div className="absolute inset-0 galaxy-bg bg-background/95 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="glass-dark rounded-2xl p-8 text-center border border-border-primary-accent shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-flame-gradient flex items-center justify-center animate-pulse-glow">
                <AlertTriangle className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-display font-bold text-foreground mb-2 flame-text">
            404
          </h1>

          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
            {t('pageNotFound' as any)}
          </h2>

          {/* Message */}
          <p className="text-lg font-medium text-foreground mb-8 text-muted-foreground">
            {t('pageNotFoundMessage' as any)}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 border-primary-border/50 text-foreground hover:bg-primary-btn/10 py-6 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('goBack' as any)}
            </Button>
            <Button
              asChild
              variant="default"
              className="flex-1 bg-primary-gradient text-text-inverse font-semibold py-6 text-lg hover:opacity-90 transition-opacity border-0"
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

