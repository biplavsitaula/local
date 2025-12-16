import en from "@/locales/en.json";
import np from "@/locales/np.json";

export type Language = "en" | "np";

export type CopyKey =
  | "ageTitle"
  | "ageSubtitle"
  | "ageWarning"
  | "ageQuestion"
  | "ageYes"
  | "ageNo"
  | "ageDenied"
  | "ageDeniedMessage"
  | "underage"
  | "recent"
  | "categories"
  | "search"
  | "filter"
  | "add"
  | "addToCart"
  | "buy"
  | "cart"
  | "myCart"
  | "cartEmpty"
  | "cartTotal"
  | "checkout"
  | "empty"
  | "delivery"
  | "hourDelivery"
  | "freeDelivery"
  | "bulkDiscount"
  | "eventOffer"
  | "discount"
  | "fast"
  | "free"
  | "festival"
  | "paymentTitle"
  | "cod"
  | "online"
  | "success"
  | "details"
  | "language"
  | "theme"
  | "light"
  | "dark"
  | "heroTitle"
  | "heroSubtitle"
  | "shopNow"
  | "viewCollection"
  | "quickAdd"
  | "quickLinks"
  | "customerService"
  | "newsletter"
  | "copyright"
  | "drinkResponsibly"
  | "moreDetails"
  | "qty"
  | "total"
  | "continue";

type Translations = Record<CopyKey, string>;

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

