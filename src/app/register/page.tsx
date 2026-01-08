"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Flame, Mail, Lock, Eye, EyeOff, User, Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const { language, t } = useLanguage();
  const router = useRouter();
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
        role: 'user', // Default role
      });
      // Navigation is handled by the auth context
    } catch (err: any) {
      setError(err.message || (language === "en" ? "Registration failed. Please try again." : "दर्ता असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary-gradient">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Flame Beverage
          </h1>
          <p className="text-muted-foreground">
            {t('createAccount')}
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Link href="/login" className="flex-1 py-3 px-4 rounded-lg bg-card border border-border text-foreground font-medium text-center hover:bg-muted transition-colors">
              {t('login')}
            </Link>
            <button className="flex-1 py-3 px-4 rounded-lg bg-primary-gradient text-text-inverse font-medium">
              {language === "en" ? "Register" : "दर्ता"}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('enterEmail')}
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
                  <span className="px-3 py-3 bg-muted border border-r-0 border-border rounded-l-lg text-foreground">+977</span>
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
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('enterPassword')}
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
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-border text-primary-text focus:ring-primary-border"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
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
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <span className="text-xl">G</span>
              <span className="font-medium">{t('google')}</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <span className="text-xl">f</span>
              <span className="font-medium">{t('facebook')}</span>
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6 p- border border-primary-text hover:border-ternary-text w-50 mx-auto">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors ">
            ← {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;


