"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Flame, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Register = () => {
  const { language } = useLanguage();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-flame-red to-flame-orange">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Flame Beverage
          </h1>
          <p className="text-muted-foreground">
            {language === "en" ? "Create your account to get started" : "सुरु गर्न आफ्नो खाता सिर्जना गर्नुहोस्"}
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Link href="/login" className="flex-1 py-3 px-4 rounded-lg bg-card border border-border text-foreground font-medium text-center hover:bg-muted transition-colors">
              {language === "en" ? "Login" : "लगइन"}
            </Link>
            <button className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-flame-orange to-flame-red text-white font-medium">
              {language === "en" ? "Register" : "दर्ता"}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Full Name" : "पूरा नाम"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={language === "en" ? "Enter your full name" : "तपाईंको पूरा नाम प्रविष्ट गर्नुहोस्"}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-flame-orange focus:ring-2 focus:ring-flame-orange/20"
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-flame-orange focus:ring-2 focus:ring-flame-orange/20"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Phone Number" : "फोन नम्बर"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <div className="flex">
                  <span className="px-3 py-3 bg-muted border border-r-0 border-border rounded-l-lg text-foreground">+977</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={language === "en" ? "98XXXXXXXX" : "९८XXXXXXXX"}
                    className="flex-1 pl-4 pr-4 py-3 bg-background border border-border rounded-r-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-flame-orange focus:ring-2 focus:ring-flame-orange/20"
                    required
                  />
                </div>
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
                  className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-flame-orange focus:ring-2 focus:ring-flame-orange/20"
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
                {language === "en" ? "Confirm Password" : "पासवर्ड पुष्टि गर्नुहोस्"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={language === "en" ? "Confirm your password" : "तपाईंको पासवर्ड पुष्टि गर्नुहोस्"}
                  className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-flame-orange focus:ring-2 focus:ring-flame-orange/20"
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
                className="mt-1 w-4 h-4 rounded border-border text-flame-orange focus:ring-flame-orange"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                {language === "en" ? (
                  <>
                    I agree to the{" "}
                    <Link href="/terms" className="text-flame-orange hover:text-flame-red">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-flame-orange hover:text-flame-red">
                      Privacy Policy
                    </Link>
                  </>
                ) : (
                  <>
                    म{" "}
                    <Link href="/terms" className="text-flame-orange hover:text-flame-red">
                      सेवा सर्तहरू
                    </Link>{" "}
                    र{" "}
                    <Link href="/privacy" className="text-flame-orange hover:text-flame-red">
                      गोपनीयता नीति
                    </Link>{" "}
                    सँग सहमत छु
                  </>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-flame-orange to-flame-red text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-flame-orange/30 transition-all"
            >
              <Flame className="w-5 h-5" />
              {language === "en" ? "Create Account" : "खाता सिर्जना गर्नुहोस्"}
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

export default Register;

