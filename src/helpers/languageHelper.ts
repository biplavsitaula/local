import en from "@/locales/en.json";
import np from "@/locales/np.json";

export type Language = "en" | "np";

// Automatically derive CopyKey from the English translations JSON
// This means any key added to en.json will automatically be available as a valid translation key
export type CopyKey = keyof typeof en;

type Translations = typeof en;

const languageMap: Record<Language, Translations> = {
  en,
  np,
};

const STORAGE_KEY = "lang";
const DEFAULT_LANGUAGE: Language = "en";

/**
 * Gets the current language from localStorage
 * @returns The current language code ("en" or "np")
 */
export const getLanguageFromStorage = (): Language => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const storedLang = localStorage.getItem(STORAGE_KEY);
  if (storedLang === "en" || storedLang === "np") {
    return storedLang;
  }

  return DEFAULT_LANGUAGE;
};

/**
 * Sets the language in localStorage
 * @param lang - The language code to store ("en" or "np")
 */
export const setLanguageInStorage = (lang: Language): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, lang);
};

/**
 * Gets the translations for the current language based on localStorage
 * @returns The translations object for the current language
 */
export const getCurrentLanguageTranslations = (): Translations => {
  const lang = getLanguageFromStorage();
  return languageMap[lang];
};

/**
 * Gets translations for a specific language
 * @param lang - The language code ("en" or "np")
 * @returns The translations object for the specified language
 */
export const getTranslations = (lang: Language): Translations => {
  return languageMap[lang];
};

