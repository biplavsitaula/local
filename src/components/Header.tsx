import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
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

const Header: React.FC<IHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onCheckout,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } =
    useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      {/* Promo Banner */}
      <div className="gradient-gold text-primary-foreground text-center py-2 px-4 text-sm font-medium">
        <span className="hidden sm:inline">
          {t("freeDelivery")} | {t("hourDelivery")}
        </span>
        <span className="sm:hidden">{t("freeDelivery")}</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame-red via-flame-orange to-flame-yellow flex items-center justify-center">
              <Flame className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold hidden sm:block flame-text">
              Flame Beverage
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-medium text-foreground hover:text-flame-orange transition-colors"
            >
              {t("allProducts")}
            </Link>
            <Link
              href="/#categories"
              className="text-sm font-medium text-foreground hover:text-flame-orange transition-colors"
            >
              {t("categories")}
            </Link>
            <Link
              href="/offers"
              className="text-sm font-medium text-foreground hover:text-flame-orange transition-colors"
            >
              {t("offers")}
            </Link>
          </nav>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50 focus:border-flame-orange"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Login Button */}
            <Link href="/login">
              <Button
                variant="outline"
                className="hidden sm:flex items-center gap-2 text-foreground border-border hover:bg-secondary/80"
              >
                <User className="w-4 h-4" />
                {t("login")}
              </Button>
            </Link>

            {/* Language Toggle */}
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 text-foreground border-border hover:bg-secondary/80"
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
              className="text-foreground hover:text-flame-orange hover:bg-secondary/80"
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
                  className="bg-gradient-to-r from-flame-orange to-flame-red text-white hover:shadow-lg hover:shadow-flame-orange/30 flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("myCart")}</span>
                  {totalItems > 0 && (
                    <span className="w-5 h-5 bg-white text-flame-orange text-xs font-bold rounded-full flex items-center justify-center">
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
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-20 object-cover rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm truncate">
                                {language === "en"
                                  ? item.product.name
                                  : item.product.nameNe}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {item.product.volume}
                              </p>
                              <p className="text-flame-orange font-semibold mt-1">
                                Rs. {item.product.price.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 border-border"
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      item.quantity - 1
                                    )
                                  }
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm font-medium w-6 text-center text-foreground">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 border-border"
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      item.quantity + 1
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
                                    removeFromCart(item.product.id)
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
                          className="w-full bg-gradient-to-r from-flame-red via-flame-orange to-flame-yellow text-primary-foreground font-semibold"
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
              className="md:hidden text-foreground"
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
          <div className="lg:hidden pb-4 border-t border-border/40 pt-4">
            <nav className="flex flex-col gap-3">
              <Link
                href="/products"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-foreground hover:text-flame-orange transition-colors py-2"
              >
                {t("allProducts")}
              </Link>
              <Link
                href="/#categories"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-foreground hover:text-flame-orange transition-colors py-2"
              >
                {t("categories")}
              </Link>
              <Link
                href="/offers"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-foreground hover:text-flame-orange transition-colors py-2"
              >
                {t("offers")}
              </Link>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-foreground hover:text-flame-orange transition-colors py-2 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                {t("login")}
              </Link>
            </nav>
          </div>
        )}

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
