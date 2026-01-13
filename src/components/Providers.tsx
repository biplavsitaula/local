"use client";

import { ReactNode, useState, useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import AgeVerificationModal from "@/components/features/age-verification/AgeVerificationModal";
import AgeDeniedScreen from "@/components/features/age-verification/AgeDeniedScreen";
import { AgeStatus } from "@/types";

interface ProvidersProps {
  children: ReactNode;
  requireAgeVerification?: boolean;
}

export function Providers({ children, requireAgeVerification = true }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const [ageStatus, setAgeStatus] = useState<AgeStatus>("pending");

  useEffect(() => {
    setMounted(true);
    // Check if age was already verified
    const verified = localStorage.getItem("ageVerified");
    if (verified === "true") {
      setAgeStatus("verified");
    }
  }, []);

  const handleAgeVerified = () => {
    localStorage.setItem("ageVerified", "true");
    setAgeStatus("verified");
  };

  const handleAgeDenied = () => {
    setAgeStatus("denied");
  };

  // Don't render anything until mounted to prevent flicker
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-flame-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <AuthModalProvider>
              {requireAgeVerification && ageStatus === "pending" && (
                <AgeVerificationModal
                  onVerified={handleAgeVerified}
                  onDenied={handleAgeDenied}
                />
              )}

              {requireAgeVerification && ageStatus === "denied" && (
                <AgeDeniedScreen onBack={() => setAgeStatus("pending")} />
              )}

              {(!requireAgeVerification || ageStatus === "verified") && children}
            </AuthModalProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

