"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { authService } from "@/services/auth.service";
import { Mail, Loader2, X, CheckCircle } from "lucide-react";
import Image from "next/image";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const ForgotPasswordModal = ({ open, onClose, onSwitchToLogin }: ForgotPasswordModalProps) => {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setEmail("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to send reset link. Please try again.");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.response?.message || 
                          err?.message || 
                          "Failed to send reset link. Please try again.";
      setError(errorMessage);
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
              {t("forgotPasswordTitle")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("forgotPasswordDesc")}
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div className="text-center">
                  <p className="text-sm sm:text-base font-medium text-foreground mb-2">
                    {t("resetLinkSent")}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("resetLinkSentDesc").replace("{email}", email)}
                  </p>
                </div>
              </div>
              <button
                onClick={onSwitchToLogin}
                className="w-full py-2.5 sm:py-3 px-4 rounded-lg bg-primary-gradient text-text-inverse text-sm sm:text-base font-semibold"
              >
                {t("backToLogin")}
              </button>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                    {t('emailAddress' as any)}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('enterEmail' as any)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                      required
                    />
                  </div>
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
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  {isLoading ? t("sending") : t("sendResetLink")}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-4 text-center">
                <button
                  onClick={onSwitchToLogin}
                  className="text-xs sm:text-sm text-primary-text hover:text-secondary-text"
                >
                  {t("backToLogin")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;


















