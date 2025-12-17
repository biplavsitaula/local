"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  Language,
  CopyKey,
  getLanguageFromStorage,
  setLanguageInStorage,
  getTranslations,
} from "@/helpers/languageHelper";

type ContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  copy: Record<CopyKey, string>;
  t: (key: CopyKey) => string;
};

const LanguageContext = createContext<ContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize from localStorage on mount
    return getLanguageFromStorage();
  });

  // Update language when localStorage changes (e.g., from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedLang = getLanguageFromStorage();
      setLanguageState(storedLang);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setLanguageInStorage(lang);
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "np" : "en";
    setLanguage(newLang);
  };

  const currentCopy = getTranslations(language);
  const t = (key: CopyKey) => currentCopy[key];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, copy: currentCopy, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
