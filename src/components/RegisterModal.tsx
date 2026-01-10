"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, Mail, Lock, Eye, EyeOff, User, Phone, Loader2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ open, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const { language, t } = useLanguage();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  if (!open) return null;

  const handleClose = () => {
    setError(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(language === "en" ? "Passwords do not match" : "पासवर्डहरू मेल खाँदैनन्");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError(language === "en" ? "Password must be at least 6 characters" : "पासवर्ड कम्तिमा ६ वर्णको हुनुपर्छ");
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        mobile: formData.phone,
        role: 'user',
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
                        (language === "en" ? "Registration failed. Please try again." : "दर्ता असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।");
      setError(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-background/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-card rounded-xl sm:rounded-2xl border border-border shadow-2xl my-2 sm:my-8 max-h-[98vh] overflow-y-auto">
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
                src="/assets/flame-dark-logo.png" 
                alt="Flame Beverage logo" 
                width={80} 
                height={64}
                className="sm:w-[100px] sm:h-[80px]"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-1 sm:mb-2">
              Flame Beverage
            </h1>
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
            <button className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-primary-gradient text-text-inverse font-medium text-sm sm:text-base">
              {language === "en" ? "Register" : "दर्ता"}
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
                {t('emailAddress' as any)}
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('enterEmail' as any)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
              </div>
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('phonePlaceholder')}
                    className="flex-1 pl-3 sm:pl-4 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-r-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                {t('password' as any)}
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('enterPassword' as any)}
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
              className="w-full py-2.5 sm:py-3 px-4 rounded-lg bg-primary-gradient text-text-inverse text-sm sm:text-base font-semibold flex items-center justify-center gap-2 hover:shadow-primary-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              {isLoading 
                ? t('creatingAccount')
                : t('createAccountButton')
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('orContinueWith' as any)}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors text-sm sm:text-base cursor-pointer">
              <span className="text-lg sm:text-xl">G</span>
              <span className="font-medium">{t('google' as any)}</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors text-sm sm:text-base cursor-pointer">
              <span className="text-lg sm:text-xl">f</span>
              <span className="font-medium">{t('facebook' as any)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;





