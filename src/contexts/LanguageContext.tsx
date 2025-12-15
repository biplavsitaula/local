import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "np";

type CopyKey =
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

type Copy = Record<Language, Record<CopyKey, string>>;

const copy: Copy = {
  en: {
    ageTitle: "Are you 18 or older?",
    ageSubtitle: "You must confirm your age to enter Flame Beverage.",
    ageWarning: "This website contains alcohol. You must be 18+ to access.",
    ageQuestion: "Are you 18 years or older?",
    ageYes: "Yes, I am 18+",
    ageNo: "No, I am under 18",
    ageDenied: "Access Denied",
    ageDeniedMessage: "You must be 18 or older to access this website.",
    underage: "Sorry, you must be 18+ to continue.",
    recent: "Recent drops",
    categories: "Explore categories",
    search: "Search bottles",
    filter: "Filter by category",
    add: "Add to cart",
    addToCart: "Add to cart",
    buy: "Buy now",
    cart: "My cart",
    myCart: "My cart",
    cartEmpty: "Your cart is empty.",
    cartTotal: "Total",
    checkout: "Checkout",
    empty: "Your cart is empty.",
    delivery: "1-hour delivery",
    hourDelivery: "1-hour delivery",
    freeDelivery: "Free delivery on orders 2000+",
    bulkDiscount: "12 bottle bundle offer",
    eventOffer: "Seasonal event offers",
    discount: "12 bottle bundle offer",
    fast: "Fast delivery windows",
    free: "Free delivery on 2000+",
    festival: "Seasonal spotlight",
    paymentTitle: "Choose payment method",
    cod: "Pay cash on delivery",
    online: "Pay online",
    success: "Payment successful! Your order is on its way.",
    details: "Product details",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    heroTitle: "Flame Beverage",
    heroSubtitle: "Curated spirits with galaxy flair. Bold, bright, blazing.",
    shopNow: "Shop Now",
    viewCollection: "View Collection",
    quickAdd: "Quick add",
    quickLinks: "Quick Links",
    customerService: "Customer Service",
    newsletter: "Newsletter",
    copyright: "© 2024 Flame Beverage. All rights reserved.",
    drinkResponsibly: "Drink responsibly",
    moreDetails: "View details",
    qty: "Qty",
    total: "Total",
    continue: "Continue shopping",
  },
  np: {
    ageTitle: "के तपाईं १८ वर्ष वा सोभन्दा माथि हुनुहुन्छ?",
    ageSubtitle: "Flame Beverage प्रवेश गर्न उमेर पुष्टि गर्नुहोस्।",
    ageWarning: "यस वेबसाइटमा मदिरा छ। प्रवेश गर्न १८+ हुनुपर्छ।",
    ageQuestion: "के तपाईं १८ वर्ष वा सोभन्दा माथि हुनुहुन्छ?",
    ageYes: "हो, म १८+ हुँ",
    ageNo: "होइन, म १८ मुनि हुँ",
    ageDenied: "प्रवेश अस्वीकृत",
    ageDeniedMessage: "यस वेबसाइटमा प्रवेश गर्न तपाईं १८ वर्ष वा सोभन्दा माथि हुनुपर्छ।",
    underage: "माफ गर्नुहोस्, १८+ हुनुपर्छ।",
    recent: "हालसालैका संग्रह",
    categories: "श्रेणीहरू हेर्नुहोस्",
    search: "बोतल खोज्नुहोस्",
    filter: "श्रेणी छान्नुहोस्",
    add: "कार्टमा राख्नुहोस्",
    addToCart: "कार्टमा राख्नुहोस्",
    buy: "अब खरिद गर्नुहोस्",
    cart: "मेरो कार्ट",
    myCart: "मेरो कार्ट",
    cartEmpty: "तपाईंको कार्ट खाली छ।",
    cartTotal: "जम्मा",
    checkout: "चेकआउट",
    empty: "तपाईंको कार्ट खाली छ।",
    delivery: "१ घण्टा डेलिभरी",
    hourDelivery: "१ घण्टा डेलिभरी",
    freeDelivery: "२०००+ अर्डरमा निःशुल्क डेलिभरी",
    bulkDiscount: "१२ बोतल बन्डल अफर",
    eventOffer: "मौसमी इभेन्ट अफर",
    discount: "१२ बोतल बन्डल अफर",
    fast: "छिटो डेलिभरी समय",
    free: "२०००+ मा निःशुल्क डेलिभरी",
    festival: "मौसमी विशेष",
    paymentTitle: "भुक्तानी विधि छान्नुहोस्",
    cod: "डेलिभरीमा नगद",
    online: "अनलाइन भुक्तानी",
    success: "भुक्तानी सफल! अर्डर बाटोमा छ।",
    details: "प्रोडक्ट विवरण",
    language: "भाषा",
    theme: "थिम",
    light: "लाइट",
    dark: "डार्क",
    heroTitle: "Flame Beverage",
    heroSubtitle: "ग्यालेक्सी शैलीका पेय। दमदार, चम्किला, प्रज्वलित।",
    shopNow: "अहिले किन्नुहोस्",
    viewCollection: "संग्रह हेर्नुहोस्",
    quickAdd: "छिटो राख्नुहोस्",
    quickLinks: "छिटो लिंकहरू",
    customerService: "ग्राहक सेवा",
    newsletter: "समाचार पत्र",
    copyright: "© २०२४ Flame Beverage। सर्वाधिकार सुरक्षित।",
    drinkResponsibly: "जिम्मेवारीपूर्वक पिउनुहोस्",
    moreDetails: "विवरण हेर्नुहोस्",
    qty: "परिमाण",
    total: "जम्मा",
    continue: "किनमेल जारी राख्नुहोस्",
  },
};

type ContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  copy: Record<CopyKey, string>;
  t: (key: CopyKey) => string;
};

const LanguageContext = createContext<ContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");
  const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "np" : "en"));
  const currentCopy = copy[language];
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
