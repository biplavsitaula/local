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
      setError(err.message || (language === "en" ? "Registration failed. Please try again." : "दर्ता असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          {/* Logo and Title */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {/* <div className="p-3 rounded-full bg-primary-gradient">
                <Flame className="w-8 h-8 text-white" />
              </div> */}
            <Image src="/assets/flame-dark-logo.png" alt="Flame Beverage logo" width={100} height={80} />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Flame Beverage
            </h1>
            <p className="text-muted-foreground">
              {t('createAccount')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button 
              onClick={onSwitchToLogin}
              className="flex-1 py-3 px-4 rounded-lg bg-card border border-border text-foreground font-medium text-center hover:bg-muted transition-colors"
            >
              {t('login')}
            </button>
            <button className="flex-1 py-3 px-4 rounded-lg bg-primary-gradient text-text-inverse font-medium">
              {language === "en" ? "Register" : "दर्ता"}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t('enterFullName')}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('emailAddress' as any)}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('enterEmail' as any)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('phoneNumber')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <div className="flex">
                  <span className="px-3 py-3 bg-muted border border-r-0 border-border rounded-l-lg text-foreground text-sm">+977</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('phonePlaceholder')}
                    className="flex-1 pl-4 pr-4 py-3 bg-background border border-border rounded-r-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('password' as any)}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('enterPassword' as any)}
                  className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                className="mt-1 w-4 h-4 rounded border-border text-primary-text focus:ring-primary-border"
                required
              />
              <label htmlFor="terms-modal" className="text-sm text-muted-foreground">
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
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-primary-gradient text-text-inverse font-semibold flex items-center justify-center gap-2 hover:shadow-primary-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Flame className="w-5 h-5" />
              )}
              {isLoading 
                ? t('creatingAccount')
                : t('createAccountButton')
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
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
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <span className="text-xl">G</span>
              <span className="font-medium">{t('google' as any)}</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <span className="text-xl">f</span>
              <span className="font-medium">{t('facebook' as any)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;





