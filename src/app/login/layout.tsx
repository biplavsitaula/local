"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}

