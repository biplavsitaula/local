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
  | "back"
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
  | "card"
  | "cod"
  | "deliveryAddress"
  | "deliveryPayment"
  | "enterAddress"
  | "enterName"
  | "enterPhone"
  | "esewa"
  | "esewaKhaltiCard"
  | "fullName"
  | "khalti"
  | "online"
  | "orderSummary"
  | "payWhenReceive"
  | "phoneNumber"
  | "placeOrder"
  | "selectPaymentGateway"
  | "subtotal"
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
  | "continue"
  | "allProducts"
  | "searchPlaceholder"
  | "newest"
  | "lowToHigh"
  | "highToLow"
  | "quantity"
  | "inStock"
  | "outOfStock"
  | "volume"
  | "alcoholContent"
  | "origin"
  | "description"
  | "buyNow"
  | "categories"
  | "offers"
  | "login"
  | "home"
  | "aboutUs"
  | "termsConditions"
  | "privacyPolicy"
  | "lastUpdated"
  | "privacyIntro"
  | "infoWeCollect"
  | "infoWeCollectDesc"
  | "howWeUseInfo"
  | "howWeUseInfoDesc"
  | "dataSecurity"
  | "dataSecurityDesc"
  | "infoSharing"
  | "infoSharingDesc"
  | "yourRights"
  | "yourRightsDesc"
  | "cookiesPolicy"
  | "cookiesPolicyDesc"
  | "privacyContactDesc"
  | "acceptanceOfTerms"
  | "acceptanceOfTermsDesc"
  | "ageRequirement"
  | "ageRequirementDesc"
  | "productsAndPricing"
  | "productsAndPricingDesc"
  | "ordersAndPayment"
  | "ordersAndPaymentDesc"
  | "deliveryPolicy"
  | "deliveryPolicyDesc"
  | "returnAndRefund"
  | "returnAndRefundDesc"
  | "responsibleDrinking"
  | "responsibleDrinkingDesc"
  | "limitationOfLiability"
  | "limitationOfLiabilityDesc"
  | "termsAcknowledgment"
  | "aboutFlameBeverage"
  | "aboutIntro"
  | "yearsExperience"
  | "happyCustomers"
  | "products"
  | "support"
  | "ourStory"
  | "ourStoryDesc1"
  | "ourStoryDesc2"
  | "whyChooseUs"
  | "authenticProducts"
  | "wideSelection"
  | "fastReliableDelivery"
  | "competitivePrices"
  | "expertSupport"
  | "securePayment"
  | "address"
  | "phone"
  | "email"
  | "specialOffers"
  | "freeDeliveryTitle"
  | "freeDeliveryDesc"
  | "expressDelivery"
  | "expressDeliveryDesc"
  | "bulkDiscountTitle"
  | "bulkDiscountDesc"
  | "festivalSpecial"
  | "festivalSpecialDesc"
  | "productsOnSale"
  | "noProductsOnSale"
  | "items"
  | "processPayment"
  | "browseCategories"
  | "noProductsInCategory"
  | "categoryWhisky"
  | "categoryVodka"
  | "categoryRum"
  | "categoryBeer"
  | "categoryWine"
  | "categoryGin"
  | "categoryTequila"
  | "categoryCognac"
  | "categoryChampagne"
  | "loadingProducts"
  | "errorLoadingProducts"
  | "retry"
  | "noProductsFound"
  | "tryRefreshing"
  | "welcomeBack"
  | "emailAddress"
  | "enterEmail"
  | "password"
  | "enterPassword"
  | "forgotPassword"
  | "loggingIn"
  | "orContinueWith"
  | "google"
  | "facebook"
  | "backToHome"
  | "createAccount"
  | "enterFullName"
  | "phonePlaceholder"
  | "confirmPassword"
  | "confirmPasswordPlaceholder"
  | "iAgreeTo"
  | "termsOfService"
  | "and"
  | "creatingAccount"
  | "createAccountButton"
  | "discoverCollection"
  | "filters"
  | "allCategories"
  | "allPrices"
  | "under1000"
  | "price1000to3000"
  | "price3000to5000"
  | "price5000to10000"
  | "above10000"
  | "category"
  | "priceRange"
  | "sortBy"
  | "clearAllFilters"
  | "all"
  | "showingProducts"
  | "productsCount"
  | "tryAdjustingFilters"
  | "privacyEmail"
  | "privacyPhone"
  | "pageNotFound"
  | "pageNotFoundMessage"
  | "goBack"
  | "goHome"
  | "error"
  | "processing"
  | "orderNumber"
  | "orderUpdateMessage"
  | "phoneValidation"
  | "checkoutFailed"
  | "somethingWentWrong"
  | "recentArrivals"
  | "viewAll"
  | "mostRecommended"
  | "noRecentArrivals"
  | "noRecentArrivalsSearch"
  | "noRecommendedProducts"
  | "noRecommendedProductsSearch"
  | "festivalAd"
  | "premiumLiquorStore"
  | "flameBeverage"
  | "forgotPasswordTitle"
  | "forgotPasswordDesc"
  | "resetLinkSent"
  | "resetLinkSentDesc"
  | "backToLogin"
  | "sendResetLink"
  | "sending"
  | "resetLinkFailed"
  | "register"
  | "role"
  | "selectRole"
  | "roleUser"
  | "roleAdmin"
  | "roleSuperAdmin"
  | "passwordsDoNotMatch"
  | "passwordMinLength"
  | "registrationFailed"
  | "ageVerificationRequired"
  | "siteAgreement"
  | "cartIsEmpty";

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

