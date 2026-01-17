import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
 SheetTrigger,
} from "@/components/ui/sheet";
import {
  Flame,
  Search,
  ShoppingCart,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Minus,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { IHeaderProps } from "@/interface/IHeaderProps";
import OfferBanner from "@/components/OfferBanner";
import Image from "next/image";


const Header: React.FC<IHeaderProps> = ({
 searchQuery,
 onSearchChange,
 onCheckout,
 onLoginClick,
 hideSearch = false,
}) => {
 const { language, setLanguage, t } = useLanguage();
 const { theme, toggleTheme } = useTheme();
 const { items, totalItems, totalPrice, updateQuantity, removeFromCart } =
   useCart();
 const { openLoginModal } = useAuthModal();
 const pathname = usePathname();
 
 // Use global auth modal if no onLoginClick provided
 const handleLoginClick = onLoginClick || openLoginModal;
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [isCartOpen, setIsCartOpen] = useState(false);
 const [showPromoBanner, setShowPromoBanner] = useState(true);
 const bannerStateRef = useRef(true);


 useEffect(() => {
   // Hysteresis thresholds to prevent flickering feedback loop
   // When banner is shown: hide it when scroll > HIDE_THRESHOLD
   // When banner is hidden: show it when scroll < SHOW_THRESHOLD
   const HIDE_THRESHOLD = 80;
   const SHOW_THRESHOLD = 20;
   // Cooldown period after state change (matches CSS transition duration + buffer)
   const STATE_CHANGE_COOLDOWN = 350;
  
   let ticking = false;
   let rafId: number | null = null;
   let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
   let isResizing = false;
   let lastStateChangeTime = 0;


   const updateBanner = () => {
     // Skip updates during resize to prevent flickering
     if (isResizing) {
       ticking = false;
       rafId = null;
       return;
     }


     // Skip updates during cooldown period after state change
     // This prevents flickering caused by layout shifts during animation
     const now = Date.now();
     if (now - lastStateChangeTime < STATE_CHANGE_COOLDOWN) {
       ticking = false;
       rafId = null;
       return;
     }


     const scrollY = window?.scrollY || window?.pageYOffset;
     const isCurrentlyShown = bannerStateRef.current;
    
     let shouldShow = isCurrentlyShown;
    
     // Apply hysteresis: different thresholds for showing vs hiding
     if (isCurrentlyShown && scrollY > HIDE_THRESHOLD) {
       shouldShow = false;
     } else if (!isCurrentlyShown && scrollY < SHOW_THRESHOLD) {
       shouldShow = true;
     }
    
     // Only update state if it actually changed
     if (shouldShow !== bannerStateRef.current) {
       bannerStateRef.current = shouldShow;
       lastStateChangeTime = now; // Record when state changed for cooldown
       setShowPromoBanner(shouldShow);
     }
    
     ticking = false;
     rafId = null;
   };


   const handleScroll = () => {
     // Don't process scroll events during resize
     if (!ticking && !isResizing) {
       rafId = window.requestAnimationFrame(updateBanner);
       ticking = true;
     }
   };


   const handleResize = () => {
     // Mark as resizing to pause scroll handling
     isResizing = true;
    
     // Cancel any pending scroll updates
     if (rafId !== null) {
       window.cancelAnimationFrame(rafId);
       rafId = null;
       ticking = false;
     }
    
     // Clear previous resize timeout
     if (resizeTimeout) {
       clearTimeout(resizeTimeout);
     }
    
     // Wait for resize to settle before resuming scroll behavior
     resizeTimeout = setTimeout(() => {
       isResizing = false;
       // Re-evaluate banner state after resize settles
       updateBanner();
     }, 200);
   };


   // Set initial state
   updateBanner();


   // Add event listeners
   window.addEventListener('scroll', handleScroll, { passive: true });
   window.addEventListener('resize', handleResize, { passive: true });


   // Cleanup
   return () => {
     window.removeEventListener('scroll', handleScroll);
     window.removeEventListener('resize', handleResize);
     if (rafId !== null) {
       window.cancelAnimationFrame(rafId);
     }
     if (resizeTimeout) {
       clearTimeout(resizeTimeout);
     }
   };
 }, []);


 return (
  <header className={`sticky top-0 z-40 w-full border-b transition-colors ${
    theme === 'dark'
      ? 'border-border/40 bg-background'
      : 'border-border/60 bg-white/95 shadow-sm backdrop-blur-xl'
  }`}>
    {/* Offer Banner */}
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-out"
      style={{
        gridTemplateRows: showPromoBanner ? '1fr' : '0fr',
      }}
    >
      <div className="overflow-hidden">
        <OfferBanner show={showPromoBanner} />
      </div>
    </div>


     <div className="container mx-auto px-4">
       <div className="flex h-16 items-center justify-between gap-4">
         {/* Logo */}
         {/* <Link href="/" className="flex items-center gap-2 shrink-0">
           <div className="w-10 h-10 rounded-full bg-flame-gradient flex items-center justify-center shadow-md">
             <Flame className="w-6 h-6 text-primary-foreground" />
           </div>
           <span className={`text-xl font-display font-bold hidden sm:block ${
             theme === 'dark' ? 'flame-text' : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
           }`}>
             Flame Beverage
           </span>
         </Link> */}
         <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 hover:opacity-90 transition-opacity">
           <Image 
             src="/assets/flameMainLogo.png" 
             alt="Flame Beverage logo" 
             width={180} 
             height={48}
             className="h-8 w-auto sm:h-10 md:h-12 object-contain"
             priority
           />
         </Link>

         {/* Search - Desktop (moved before navigation) */}
         {!hideSearch && (
           <div className="hidden md:flex flex-1 max-w-xl relative">
             <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
               theme === 'dark' ? 'text-muted-foreground' : 'text-gray-400'
             }`} />
             <Input
               type="text"
               placeholder={t("search")}
               value={searchQuery}
               onChange={(e) => onSearchChange(e.target.value)}
               className={`pl-10 transition-colors ${
                 theme === 'dark'
                   ? 'bg-secondary/50 border-border/50 focus:border-primary-border'
                   : 'bg-gray-50 border-gray-200 focus:border-orange-400 focus:bg-white'
               }`}
             />
           </div>
         )}

         {/* Navigation Links - Desktop & Tablet */}
         <nav className="hidden md:flex items-center gap-4 lg:gap-6">
           <Link
             href="/products"
             className={`text-sm font-medium transition-colors ${
               pathname === '/products'
                 ? theme === 'dark'
                   ? 'text-primary-text font-semibold'
                   : 'text-orange-600 font-semibold'
                 : theme === 'dark'
                   ? 'text-foreground hover:text-primary-text'
                   : 'text-gray-700 hover:text-orange-600'
             }`}
           >
             {t("allProducts")}
           </Link>
           <Link
             href="/categories"
             className={`text-sm font-medium transition-colors ${
               pathname === '/categories'
                 ? theme === 'dark'
                   ? 'text-primary-text font-semibold'
                   : 'text-orange-600 font-semibold'
                 : theme === 'dark'
                   ? 'text-foreground hover:text-primary-text'
                   : 'text-gray-700 hover:text-orange-600'
             }`}
           >
             {t("categories")}
           </Link>
           <Link
             href="/offers"
             className={`text-sm font-medium transition-colors ${
               pathname === '/offers'
                 ? theme === 'dark'
                   ? 'text-primary-text font-semibold'
                   : 'text-orange-600 font-semibold'
                 : theme === 'dark'
                   ? 'text-foreground hover:text-primary-text'
                   : 'text-gray-700 hover:text-orange-600'
             }`}
           >
             {t("offers")}
           </Link>
         </nav>

        {/* Actions */}
        <div className={`flex items-center gap-2 ${hideSearch ? 'ml-auto' : ''}`}>
          {/* Login Button */}
          <Button
            variant="outline"
            onClick={handleLoginClick}
            className={`hidden sm:flex items-center gap-2 transition-colors ${
              theme === 'dark'
                ? 'text-foreground border-border hover:bg-secondary/80'
                : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
            }`}
          >
            <User className="w-4 h-4" />
            {t("login")}
          </Button>


           {/* Language Toggle */}
           <Button
             variant="outline"
             className={`hidden sm:flex items-center gap-2 transition-colors ${
               theme === 'dark'
                 ? 'text-foreground border-border hover:bg-secondary/80'
                 : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
             }`}
             onClick={() => setLanguage(language === "en" ? "np" : "en")}
           >
             <Globe className="w-4 h-4" />
             <span>{language === "en" ? "नेपाली" : "English"}</span>
           </Button>


           {/* Theme Toggle */}
           <Button
             variant="ghost"
             size="icon"
             onClick={toggleTheme}
             className={`transition-colors ${
               theme === 'dark'
                 ? 'text-foreground hover:text-primary-text hover:bg-secondary/80'
                 : 'text-gray-700 hover:text-orange-600 hover:bg-gray-100'
             }`}
           >
             {theme === "dark" ? (
               <Sun className="w-5 h-5" />
             ) : (
               <Moon className="w-5 h-5" />
             )}
             <span className="sr-only">Theme</span>
           </Button>


           {/* Cart */}
           <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
             <SheetTrigger asChild>
               <Button
                 className="bg-primary-gradient text-text-inverse hover:shadow-primary-lg flex items-center gap-2"
               >
                 <ShoppingCart className="w-4 h-4" />
                 <span className="hidden sm:inline">{t("myCart")}</span>
                 {totalItems > 0 && (
                   <span className="w-5 h-5 bg-white text-primary-text text-xs font-bold rounded-full flex items-center justify-center">
                     {totalItems}
                   </span>
                 )}
               </Button>
             </SheetTrigger>
             <SheetContent className="w-full sm:max-w-md bg-card border-border">
               <SheetHeader>
                 <SheetTitle className="text-foreground font-display">
                   {t("myCart")}
                 </SheetTitle>
               </SheetHeader>
               <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
                 {items.length === 0 ? (
                   <div className="flex-1 flex items-center justify-center text-muted-foreground">
                     <p>{t("cartEmpty")}</p>
                   </div>
                 ) : (
                   <>
                     <div className="flex-1 overflow-auto space-y-4 pr-2">
                       {items.map((item) => (
                         <div
                           key={item.product.id}
                           className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                         >
                           <Image
                             src={item.product.image || "/assets/liquor1.jpeg"}
                             alt={item.product.name}
                             className="w-16 h-20 object-cover rounded-md"
                             width={64}
                             height={80}
                           />
                           <div className="flex-1 min-w-0">
                             <h4 className="font-medium text-foreground text-sm truncate">
                               {language === "en"
                                 ? item?.product?.name
                                 : item?.product?.nameNe}
                             </h4>
                             <p className="text-xs text-muted-foreground">
                               {item?.product?.volume}
                             </p>
                             <p className="text-primary-text font-semibold mt-1">
                               Rs. {item?.product?.price?.toLocaleString()}
                             </p>
                             <div className="flex items-center gap-2 mt-2">
                               <Button
                                 variant="outline"
                                 size="icon"
                                 className="h-7 w-7 border-border"
                                 onClick={() =>
                                   updateQuantity(
                                     item?.product?.id,
                                     (item?.quantity || 0) - 1
                                   )
                                 }
                               >
                                 <Minus className="w-3 h-3" />
                               </Button>
                               <span className="text-sm font-medium w-6 text-center text-foreground">
                                 {item?.quantity}
                               </span>
                               <Button
                                 variant="outline"
                                 size="icon"
                                 className="h-7 w-7 border-border"
                                 onClick={() =>
                                   updateQuantity(
                                     item?.product?.id,
                                     (item?.quantity || 0) + 1
                                   )
                                 }
                               >
                                 <Plus className="w-3 h-3" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-7 w-7 text-destructive hover:text-destructive ml-auto"
                                 onClick={() =>
                                   removeFromCart(item?.product?.id)
                                 }
                               >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                     <div className="border-t border-border pt-4 mt-4">
                       <div className="flex justify-between items-center mb-4">
                         <span className="text-lg font-medium text-foreground">
                           {t("cartTotal")}
                         </span>
                         <span className="text-xl font-bold flame-text">
                           Rs. {totalPrice.toLocaleString()}
                         </span>
                       </div>
                       <Button
                         className="w-full bg-primary-gradient text-text-inverse font-semibold"
                         onClick={() => {
                           setIsCartOpen(false);
                           onCheckout?.();
                         }}
                       >
                         {t("checkout")}
                       </Button>
                     </div>
                   </>
                 )}
               </div>
             </SheetContent>
           </Sheet>


           {/* Mobile Menu */}
           <Button
             variant="ghost"
             size="icon"
             className={`md:hidden transition-colors ${
               theme === 'dark'
                 ? 'text-foreground hover:bg-secondary/80'
                 : 'text-gray-700 hover:bg-gray-100'
             }`}
             onClick={() => setIsMenuOpen(!isMenuOpen)}
           >
             {isMenuOpen ? (
               <X className="w-5 h-5" />
             ) : (
               <Menu className="w-5 h-5" />
             )}
           </Button>
         </div>
       </div>


       {/* Mobile Menu */}
       {isMenuOpen && (
         <div className={`md:hidden pb-4 border-t pt-4 transition-colors ${
           theme === 'dark' ? 'border-border/40' : 'border-gray-200'
         }`}>
           <nav className="flex flex-col gap-3">
             <Link
               href="/products"
               onClick={() => setIsMenuOpen(false)}
               className={`text-sm font-medium transition-colors py-2 ${
                 pathname === '/products'
                   ? theme === 'dark'
                     ? 'text-primary-text font-semibold'
                     : 'text-orange-600 font-semibold'
                   : theme === 'dark'
                     ? 'text-foreground hover:text-primary-text'
                     : 'text-gray-700 hover:text-orange-600'
               }`}
             >
               {t("allProducts")}
             </Link>
             <Link
               href="/categories"
               onClick={() => setIsMenuOpen(false)}
               className={`text-sm font-medium transition-colors py-2 ${
                 pathname === '/categories'
                   ? theme === 'dark'
                     ? 'text-primary-text font-semibold'
                     : 'text-orange-600 font-semibold'
                   : theme === 'dark'
                     ? 'text-foreground hover:text-primary-text'
                     : 'text-gray-700 hover:text-orange-600'
               }`}
             >
               {t("categories")}
             </Link>
             <Link
               href="/offers"
               onClick={() => setIsMenuOpen(false)}
               className={`text-sm font-medium transition-colors py-2 ${
                 pathname === '/offers'
                   ? theme === 'dark'
                     ? 'text-primary-text font-semibold'
                     : 'text-orange-600 font-semibold'
                   : theme === 'dark'
                     ? 'text-foreground hover:text-primary-text'
                     : 'text-gray-700 hover:text-orange-600'
               }`}
             >
               {t("offers")}
             </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLoginClick();
              }}
              className={`text-sm font-medium transition-colors py-2 flex items-center gap-2 text-left ${
                theme === 'dark'
                  ? 'text-foreground hover:text-primary-text'
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              <User className="w-4 h-4" />
              {t("login")}
            </button>
           </nav>
         </div>
       )}


       {/* Mobile Search */}
       {!hideSearch && (
         <div className="md:hidden pb-4">
           <div className="relative">
             <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
               theme === 'dark' ? 'text-muted-foreground' : 'text-gray-400'
             }`} />
             <Input
               type="text"
               placeholder={t("search")}
               value={searchQuery}
               onChange={(e) => onSearchChange(e.target.value)}
               className={`pl-10 transition-colors ${
                 theme === 'dark'
                   ? 'bg-secondary/50 border-border/50'
                   : 'bg-gray-50 border-gray-200 focus:border-orange-400 focus:bg-white'
               }`}
             />
           </div>
         </div>
       )}
     </div>
   </header>
 );
};


export default Header;
