"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "dark";

/**
 * Gets the current theme from localStorage
 * @returns The current theme ("light" or "dark")
 */
const getThemeFromStorage = (): Theme => {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const storedTheme = localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return DEFAULT_THEME;
};

/**
 * Sets the theme in localStorage
 * @param theme - The theme to store ("light" or "dark")
 */
const setThemeInStorage = (theme: Theme) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, theme);
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage on mount
    return getThemeFromStorage();
  });

  // Update theme when localStorage changes (e.g., from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const storedTheme = getThemeFromStorage();
        setThemeState(storedTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setThemeInStorage(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
