"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { IPaymentCheckbox } from "@/interface/IPaymentCheckout";
import { X, ArrowLeft, User, Phone, MapPin, Package, CreditCard, Check } from "lucide-react";
import Link from "next/link";

const CheckoutModal = ({ open, onClose }: IPaymentCheckbox) => {
  const { t, language } = useLanguage();
  const { items, total, totalItems } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "online">("cod");
  const [selectedGateway, setSelectedGateway] = useState<"esewa" | "khalti" | "card" | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
  });
  const [paid, setPaid] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setPaid(false);
    setSelectedPayment("cod");
    setSelectedGateway(null);
    setFormData({ fullName: "", phoneNumber: "", deliveryAddress: "" });
    onClose();
  };

  const handlePayment = () => {
    if (selectedPayment === "online" && !selectedGateway) {
      return; // Require gateway selection for online payment
    }
    if (!formData.fullName || !formData.phoneNumber || !formData.deliveryAddress) {
      return; // Require all fields
    }
    setPaid(true);
    // Here you would typically process the payment
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const subtotal = total;
  const deliveryFee = total >= 2000 ? 0 : 500;
  const finalTotal = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-auto">
      <div className="relative w-full max-w-6xl rounded-2xl border border-border bg-card shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Continue Shopping Link */}
        <Link
          href="/"
          onClick={handleClose}
          className="absolute left-6 top-6 flex items-center gap-2 text-sm font-medium text-primary-text hover:text-secondary-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("continue")}
        </Link>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Order Summary */}
          <div className="p-6 md:p-8 border-r border-border bg-muted/20">
            <h2 className="text-2xl font-display font-bold text-primary-text mb-6">
              {t("orderSummary")}
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">
                      {language === "en" ? item.product.name : item.product.nameNe || item.product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Rs. {item.product.price.toLocaleString()} x {item.quantity}
                    </p>
                    <p className="text-lg font-bold text-primary-text">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-foreground">
                <span>{t("subtotal")}</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>{t("delivery")}</span>
                <span className={deliveryFee === 0 ? "text-green-500 font-semibold" : ""}>
                  {deliveryFee === 0 ? t("free") : `Rs. ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-lg font-semibold text-primary-text">{t("total")}</span>
                <span className="text-2xl font-bold text-primary-text">
                  Rs. {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Delivery & Payment */}
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-display font-bold text-primary-text mb-6">
              {t("deliveryPayment")}
            </h2>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="w-4 h-4 text-flame-orange" />
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t("enterName")}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Phone className="w-4 h-4 text-flame-orange" />
                  {t("phoneNumber")}
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder={t("enterPhone")}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <MapPin className="w-4 h-4 text-flame-orange" />
                  {t("deliveryAddress")}
                </label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder={t("enterAddress")}
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20 resize-none"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                {t("paymentTitle")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Cash on Delivery */}
                <button
                  onClick={() => {
                    setSelectedPayment("cod");
                    setSelectedGateway(null);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    selectedPayment === "cod"
                      ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                      : "border-border bg-card hover:border-flame-orange/50"
                  }`}
                >
                  <Package className={`w-6 h-6 mb-2 ${selectedPayment === "cod" ? "text-text-inverse" : "text-flame-orange"}`} />
                  <div className="font-semibold mb-1">{t("cod")}</div>
                  <div className={`text-xs ${selectedPayment === "cod" ? "text-text-inverse/80" : "text-muted-foreground"}`}>
                    {t("payWhenReceive")}
                  </div>
                </button>

                {/* Pay Online */}
                <button
                  onClick={() => setSelectedPayment("online")}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    selectedPayment === "online"
                      ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                      : "border-border bg-card hover:border-flame-orange/50"
                  }`}
                >
                  <CreditCard className={`w-6 h-6 mb-2 ${selectedPayment === "online" ? "text-text-inverse" : "text-flame-orange"}`} />
                  <div className="font-semibold mb-1">{t("online")}</div>
                  <div className={`text-xs ${selectedPayment === "online" ? "text-text-inverse/80" : "text-muted-foreground"}`}>
                    {t("esewaKhaltiCard")}
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Gateway Selection (if online selected) */}
            {selectedPayment === "online" && (
              <div className="mb-6">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                  {t("selectPaymentGateway")}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedGateway("esewa")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                      selectedGateway === "esewa"
                        ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                        : "border-border bg-card hover:border-flame-orange/50"
                    }`}
                  >
                    {t("esewa")}
                  </button>
                  <button
                    onClick={() => setSelectedGateway("khalti")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                      selectedGateway === "khalti"
                        ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                        : "border-border bg-card hover:border-flame-orange/50"
                    }`}
                  >
                    {t("khalti")}
                  </button>
                  <button
                    onClick={() => setSelectedGateway("card")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                      selectedGateway === "card"
                        ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                        : "border-border bg-card hover:border-flame-orange/50"
                    }`}
                  >
                    {t("card")}
                  </button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {paid && (
              <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                <p className="text-lg font-semibold text-green-500">{t("success")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === "en"
                    ? "You'll get updates for delivery windows. Thank you!"
                    : "तपाईंले डेलिभरी समयको लागि अपडेटहरू प्राप्त गर्नुहुनेछ। धन्यवाद!"}
                </p>
              </div>
            )}

            {/* Place Order Button */}
            {!paid && (
              <button
                onClick={handlePayment}
                disabled={!formData.fullName || !formData.phoneNumber || !formData.deliveryAddress || (selectedPayment === "online" && !selectedGateway)}
                className="w-full rounded-xl bg-primary-gradient px-6 py-4 font-semibold text-text-inverse transition-all hover:shadow-primary-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {t("placeOrder")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
