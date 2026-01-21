"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, Mail, Lock, Eye, EyeOff, User, Phone, Loader2, X, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeroTitle from "./HeroTitle";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  isAdminContext?: boolean; // When true, shows all role options
}

const RegisterModal = ({ open, onClose, onSwitchToLogin, isAdminContext = false }: RegisterModalProps) => {
  const { language, t } = useLanguage();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user" as "user" | "admin" | "super_admin",
    agreeToTerms: false,
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Ensure we're on the client before using createPortal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  const handleClose = () => {
    setError(null);
    setPhoneError(null);
    setEmailError(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "user",
      agreeToTerms: false,
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhoneError(null);
    setEmailError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError(t("invalidEmail"));
      return;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError(t("phoneValidation"));
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError(t("passwordMinLength"));
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        mobile: formData.phone,
        role: formData.role as "user" | "admin" | "super_admin",
      });
      handleClose();
      // Navigation is handled by the auth context
    } catch (err: any) {
      // Extract API response message if available
      // Try multiple possible error structures
      const apiMessage = err?.response?.data?.message || 
                        err?.response?.data?.error ||
                        err?.response?.message || 
                        err?.message || 
                        err?.toString() ||
                        t("registrationFailed");
      setError(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-start sm:items-center justify-center bg-background/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-card rounded-xl sm:rounded-2xl border border-border shadow-2xl my-2 sm:my-8 max-h-[98vh] overflow-y-auto z-[99999]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/90 backdrop-blur-sm text-foreground transition-colors hover:bg-muted cursor-pointer shadow-lg"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-4 sm:p-6 md:p-8 pb-6 sm:pb-8 md:pb-10">
          {/* Logo and Title */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Image 
                src="/assets/flame200.png" 
                alt="Flame Beverage logo" 
                width={80} 
                height={64}
                className="sm:w-[100px] sm:h-[80px]"
              />
            </div>
            {/* <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-1 sm:mb-2">
              {t("flameBeverage")}
            </h1> */}
            <HeroTitle text={t("flameBeverage")} size="sm" />

            <p className="text-sm sm:text-base text-muted-foreground">
              {t('createAccount')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6">
            <button 
              onClick={onSwitchToLogin}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-card border border-border text-foreground font-medium text-center text-sm sm:text-base hover:bg-muted transition-colors cursor-pointer"
            >
              {t('login')}
            </button>
            <button className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-primary-gradient font-medium text-sm sm:text-base">
              {t("register")}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                {t('fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t('enterFullName')}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setEmailError(null);
                  }}
                  placeholder={t('enterEmail')}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20 ${emailError ? 'border-red-500' : 'border-border'}`}
                  required
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                {t('phoneNumber')}
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <div className="flex">
                  <span className="px-2.5 sm:px-3 py-2.5 sm:py-3 bg-muted border border-r-0 border-border rounded-l-lg text-foreground text-xs sm:text-sm">+977</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData({ ...formData, phone: value });
                      setPhoneError(null);
                    }}
                    placeholder={t('phonePlaceholder')}
                    className={`flex-1 pl-3 sm:pl-4 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background border rounded-r-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                      phoneError 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                        : "border-border focus:border-primary-border focus:ring-primary-border/20"
                    }`}
                    required
                  />
                </div>
              </div>
              {phoneError && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-500">{phoneError}</p>
              )}
            </div>

            {/* Role - Only show all options in admin context */}
            {isAdminContext && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  {t("role")}
                </label>
                <div className="relative">
                  <Shield className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground z-10" />
                  <Select
                    value={formData.role}
                    onValueChange={(value: "user" | "admin" | "super_admin") => 
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20">
                      <SelectValue placeholder={t("selectRole")} />
                    </SelectTrigger>
                    <SelectContent className="z-[999999]">
                      <SelectItem value="user">
                        {t("roleUser")}
                      </SelectItem>
                      <SelectItem value="admin">
                        {t("roleAdmin")}
                      </SelectItem>
                      <SelectItem value="super_admin">
                        {t("roleSuperAdmin")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('enterPassword')}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms-modal"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-0.5 sm:mt-1 w-4 h-4 rounded border-border text-primary-text focus:ring-primary-border shrink-0"
                required
              />
              <label htmlFor="terms-modal" className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t('iAgreeTo')}{" "}
                <Link href="/terms" className="text-primary-text hover:text-secondary-text">
                  {t('termsOfService')}
                </Link>{" "}
                {t('and')}{" "}
                <Link href="/privacy" className="text-primary-text hover:text-secondary-text">
                  {t('privacyPolicy')}
                </Link>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 px-4 rounded-lg btn-secondary-custom text-text-inverse text-sm sm:text-base font-semibold flex items-center justify-center gap-2 hover:shadow-primary-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                // <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                <></>
              )}
              {isLoading 
                ? t('creatingAccount')
                : t('createAccountButton')
              }
            </button>
          </form>

          {/* Divider */}
          {/* <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div> */}

          {/* Social Login */}
          {/* <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors text-sm sm:text-base cursor-pointer">
              <span className="text-lg sm:text-xl">G</span>
              <span className="font-medium">{t('google')}</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors text-sm sm:text-base cursor-pointer">
              <span className="text-lg sm:text-xl">f</span>
              <span className="font-medium">{t('facebook')}</span>
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );

  // Use createPortal to render modal at document body level
  return createPortal(modalContent, document.body);
};

export default RegisterModal;





