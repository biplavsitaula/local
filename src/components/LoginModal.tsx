"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, Mail, Lock, Eye, EyeOff, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ForgotPasswordModal from "./ForgotPasswordModal";
import HeroTitle from "./HeroTitle";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  redirectUrl?: string;
}

const LoginModal = ({ open, onClose, onSwitchToRegister, redirectUrl }: LoginModalProps) => {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Ensure we're on the client before using createPortal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  const handleClose = () => {
    setError(null);
    setEmailError(null);
    setFormData({ email: "", password: "" });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError(t("invalidEmail"));
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      handleClose();
      // After successful login, redirect based on redirectUrl
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      // If no redirectUrl, AuthContext handles the redirect
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
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
            {/* <h1 className="text-xl sm:text-2xl font-display font-bold bg-gradient-to-r from-flame-yellow via-flame-orange to-flame-red bg-clip-text text-transparent mb-1 sm:mb-2">
              {t("flameBeverage")}
            </h1> */}
            <HeroTitle text={t("flameBeverage")} size="sm" />
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('welcomeBack')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6">
            <button 
            // className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-primary-gradient text-text-inverse font-medium text-sm sm:text-base"
            className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg btn-primary-custom text-text-inverse font-medium text-sm sm:text-base"
            >
              {t('login')}
            </button>
            <button 
              onClick={onSwitchToRegister}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-card border border-border text-foreground font-medium text-center text-sm sm:text-base hover:bg-muted transition-colors cursor-pointer"
            >
              {t("register")}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs sm:text-sm text-primary-text hover:text-secondary-text"
              >
                {t('forgotPassword')}
              </button>
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
                // <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                // <Image src="/assets/flame200.png" alt="Flame Beverage logo" width={20} height={20} />
                <></>
              )}
              {isLoading 
                ? t('loggingIn')
                : t('login')
              }
            </button>
          </form>

        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSwitchToLogin={() => {
          setShowForgotPassword(false);
          // Optionally focus back on login form
        }}
      />
    </div>
  );

  // Use createPortal to render modal at document body level
  return createPortal(modalContent, document.body);
};

export default LoginModal;

