"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

