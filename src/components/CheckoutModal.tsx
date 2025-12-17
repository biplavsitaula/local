"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { IPaymentCheckbox } from "@/interface/IPaymentCheckout";
import { X } from "lucide-react";

const CheckoutModal = ({ open, onClose }: IPaymentCheckbox) => {
  const { t, language } = useLanguage();
  const { items, total, totalItems } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "online">("cod");
  const [paid, setPaid] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setPaid(false);
    setSelectedPayment("cod");
    onClose();
  };

  const handlePayment = () => {
    setPaid(true);
    // Here you would typically process the payment
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl p-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-flame-orange">
            {t("checkout")}
          </h2>
          <button
            onClick={handleClose}
            className="text-sm font-medium text-flame-orange hover:text-flame-red underline underline-offset-4 transition-colors"
          >
            {t("continue")}
          </button>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-display font-semibold text-foreground mb-4">
            {t("paymentTitle")}
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedPayment("cod")}
              className={`w-full rounded-xl px-6 py-4 text-left font-semibold transition-all ${
                selectedPayment === "cod"
                  ? "bg-gradient-to-r from-flame-orange to-flame-red text-white shadow-lg"
                  : "bg-card border border-border text-foreground hover:border-flame-orange/50"
              }`}
            >
              {t("cod")}
            </button>
            <button
              onClick={() => setSelectedPayment("online")}
              className={`w-full rounded-xl px-6 py-4 text-left font-semibold transition-all ${
                selectedPayment === "online"
                  ? "bg-gradient-to-r from-flame-orange to-flame-red text-white shadow-lg"
                  : "bg-card border border-border text-foreground hover:border-flame-orange/50"
              }`}
            >
              {t("online")}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-foreground font-medium">{t("total")}</span>
            <span className="text-xl font-bold text-foreground">
              Rs. {total.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("items")}: {totalItems}
          </p>
        </div>

        {/* Success Message */}
        {paid && (
          <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-lg font-semibold text-green-500">{t("success")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "en"
                ? "You'll get updates for delivery windows. Thank you!"
                : "तपाईंले डेलिभरी समयको लागि अपडेटहरू प्राप्त गर्नुहुनेछ। धन्यवाद!"}
            </p>
          </div>
        )}

        {/* Process Payment Button */}
        {!paid && (
          <button
            onClick={handlePayment}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-flame-orange to-flame-red px-6 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-flame-orange/30"
          >
            {t("processPayment")}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
