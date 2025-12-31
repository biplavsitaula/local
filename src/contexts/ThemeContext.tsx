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
  // Initialize theme from localStorage immediately (script in layout handles initial class)
  const [theme, setThemeState] = useState<Theme>(() => {
    // On client, read from localStorage; on server, use default
    if (typeof window !== "undefined") {
      return getThemeFromStorage();
    }
    return DEFAULT_THEME;
  });
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after initial render
  useEffect(() => {
    setMounted(true);
    // Sync with what was set by the blocking script
    const storedTheme = getThemeFromStorage();
    setThemeState(storedTheme);
  }, []);

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

  // Apply theme to document whenever theme changes (only after mount to avoid hydration issues)
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

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
