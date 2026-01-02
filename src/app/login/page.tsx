"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Flame, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { language } = useLanguage();
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      // Navigation is handled by the auth context
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
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
            {language === "en" ? "Welcome back! Please login to continue" : "फिर्ता स्वागत छ! कृपया जारी राख्न लगइन गर्नुहोस्"}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button className="flex-1 py-3 px-4 rounded-lg bg-primary-gradient text-text-inverse font-medium">
              {language === "en" ? "Login" : "लगइन"}
            </button>
            <Link href="/register" className="flex-1 py-3 px-4 rounded-lg bg-card border border-border text-foreground font-medium text-center hover:bg-muted transition-colors">
              {language === "en" ? "Register" : "दर्ता"}
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Email Address" : "इमेल ठेगाना"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={language === "en" ? "Enter your email" : "तपाईंको इमेल प्रविष्ट गर्नुहोस्"}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Password" : "पासवर्ड"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={language === "en" ? "Enter your password" : "तपाईंको पासवर्ड प्रविष्ट गर्नुहोस्"}
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link href="#" className="text-sm text-primary-text hover:text-secondary-text">
                {language === "en" ? "Forgot Password?" : "पासवर्ड बिर्सनुभयो?"}
              </Link>
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
                ? (language === "en" ? "Logging in..." : "लगइन हुँदैछ...") 
                : (language === "en" ? "Login" : "लगइन")
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
                {language === "en" ? "OR CONTINUE WITH" : "वा जारी राख्नुहोस्"}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <span className="text-xl">G</span>
              <span className="font-medium">{language === "en" ? "Google" : "गुगल"}</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <span className="text-xl">f</span>
              <span className="font-medium">{language === "en" ? "Facebook" : "फेसबुक"}</span>
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            ← {language === "en" ? "Back to Home" : "घर फर्कनुहोस्"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


