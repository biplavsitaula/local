"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { IPaymentCheckbox } from "@/interface/IPaymentCheckout";
import { X, ArrowLeft, User, Phone, MapPin, Package, CreditCard, Check, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ordersService, CheckoutPayload } from "@/services/orders.service";
import Image from "next/image";

const CheckoutModal = ({ open, onClose }: IPaymentCheckbox) => {
  const { t, language } = useLanguage();
  const { items, total, totalItems, clear: clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "online">("cod");
  const [selectedGateway, setSelectedGateway] = useState<"esewa" | "khalti" | "card" | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
  });
  const [paid, setPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResponse, setOrderResponse] = useState<{
    message?: string;
    status?: string;
    billNumber?: string;
    statusInfo?: {
      status: string;
      message: string;
      buttonText: string;
      showSuccess: boolean;
      showReject: boolean;
    };
  } | null>(null);

  if (!open) return null;

  const handleClose = () => {
    setPaid(false);
    setSelectedPayment("cod");
    setSelectedGateway(null);
    setFormData({ fullName: "", phoneNumber: "", deliveryAddress: "" });
    setError(null);
    setOrderResponse(null);
    onClose();
  };

  const handlePayment = async () => {
    if (selectedPayment === "online" && !selectedGateway) {
      return; // Require gateway selection for online payment
    }
    if (!formData.fullName || !formData.phoneNumber || !formData.deliveryAddress) {
      return; // Require all fields
    }
    if (items.length === 0) {
      setError(language === "en" ? "Your cart is empty" : "तपाईंको कार्ट खाली छ");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare checkout payload
      const payload: CheckoutPayload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: selectedPayment,
        items: items.map(item => ({
          productId: String(item?.product?.id),
          quantity: item?.quantity || 0,
        })),
      };

      // Add payment gateway if online payment
      if (selectedPayment === "online" && selectedGateway) {
        payload.paymentGateway = selectedGateway;
      }

      // Call checkout API
      const response = await ordersService.checkout(payload);

      if (response.success) {
        setPaid(true);
        // Store response data for display
        const responseData = response.data;
        // Check for status at top level (from API response) or in data
        const apiResponse = response as any;
        setOrderResponse({
          message: responseData?.statusInfo?.message || response.message,
          status: responseData?.orderStatus || responseData?.order?.status || responseData?.statusInfo?.status || apiResponse?.status,
          billNumber: responseData?.billNumber || responseData?.order?.billNumber,
          statusInfo: responseData?.statusInfo,
        });
        // Clear the cart after successful checkout
        clearCart();
        // Close modal after showing success message (increased timeout to show message)
        setTimeout(() => {
          handleClose();
        }, 5000);
      } else {
        setError(response?.message || (language === "en" ? "Checkout failed" : "चेकआउट असफल भयो"));
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err?.message || (language === "en" ? "Something went wrong. Please try again." : "केही गलत भयो। कृपया पुन: प्रयास गर्नुहोस्।"));
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = total;
  const deliveryFee = total >= 2000 ? 0 : 500;
  const finalTotal = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-background/80 backdrop-blur-sm p-2 sm:p-4 overflow-auto">
      <div className="relative w-full max-w-6xl rounded-xl md:rounded-2xl border border-border bg-card shadow-2xl my-2 md:my-8 max-h-[98vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Continue Shopping Link */}
        <Link
          href="/"
          onClick={handleClose}
          className="absolute left-2 top-2 sm:left-4 sm:top-4 z-10 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-primary-text hover:text-secondary-text transition-colors cursor-pointer border border-ternary-text hover:border-primary-text px-2 py-1 sm:px-2 sm:p-2 rounded-lg"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{t("continue")}</span>
        </Link>

        <div className="grid md:grid-cols-2 gap-0 mt-10 sm:mt-12">
          {/* Left: Order Summary */}
          <div className="p-4 sm:p-6 md:p-8 pb-6 sm:pb-8 md:pb-10 border-b md:border-b-0 md:border-r border-border bg-muted/20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary-text mb-4 sm:mb-6">
              {t("orderSummary")}
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {items.map((item) => (
                <div key={item?.product?.id} className="flex gap-2 sm:gap-4">
                  <img
                    src={item?.product?.image}
                    alt={item?.product?.name}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base line-clamp-2">
                      {language === "en" ? item?.product?.name : item?.product?.nameNe || item?.product?.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                      Rs. {(item?.product?.price || 0).toLocaleString()} x {item?.quantity || 0}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-primary-text">
                      Rs. {((item?.product?.price || 0) * (item?.quantity || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-border pt-3 sm:pt-4 space-y-2">
              <div className="flex justify-between text-sm sm:text-base text-foreground">
                <span>{t("subtotal")}</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base text-foreground">
                <span>{t("delivery")}</span>
                <span className={deliveryFee === 0 ? "text-green-500 font-semibold" : ""}>
                  {deliveryFee === 0 ? t("free") : `Rs. ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-base sm:text-lg font-semibold text-primary-text">{t("total")}</span>
                <span className="text-xl sm:text-2xl font-bold text-primary-text">
                  Rs. {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Delivery & Payment */}
          <div className="p-4 sm:p-6 md:p-8 pb-6 sm:pb-8 md:pb-10">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary-text mb-4 sm:mb-6">
              {t("deliveryPayment")}
            </h2>

            {/* Form Fields */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-flame-orange" />
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t("enterName")}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg sm:rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-flame-orange" />
                  {t("phoneNumber")}
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder={t("enterPhone")}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg sm:rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20"
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-flame-orange" />
                  {t("deliveryAddress")}
                </label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder={t("enterAddress")}
                  rows={3}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg sm:rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-border focus:ring-2 focus:ring-primary-border/20 resize-none"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-display font-semibold text-foreground mb-3 sm:mb-4">
                {t("paymentTitle")}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Cash on Delivery */}
                <button
                  onClick={() => {
                    setSelectedPayment("cod");
                    setSelectedGateway(null);
                  }}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer text-left ${
                    selectedPayment === "cod"
                      ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                      : "border-border bg-card hover:border-flame-orange/50"
                  }`}
                >
                  <Package className={`w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 ${selectedPayment === "cod" ? "text-text-inverse" : "text-flame-orange"}`} />
                  <div className="font-semibold mb-0.5 sm:mb-1 text-xs sm:text-sm">{t("cod")}</div>
                  <div className={`text-xs ${selectedPayment === "cod" ? "text-text-inverse/80" : "text-muted-foreground"}`}>
                    {t("payWhenReceive")}
                  </div>
                </button>

                {/* Pay Online */}
                <button
                  onClick={() => setSelectedPayment("online")}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer text-left ${
                    selectedPayment === "online"
                      ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                      : "border-border bg-card hover:border-flame-orange/50"
                  }`}
                >
                  <CreditCard className={`w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 ${selectedPayment === "online" ? "text-text-inverse" : "text-flame-orange"}`} />
                  <div className="font-semibold mb-0.5 sm:mb-1 text-xs sm:text-sm">{t("online")}</div>
                  <div className={`text-xs ${selectedPayment === "online" ? "text-text-inverse/80" : "text-muted-foreground"}`}>
                    {t("esewaKhaltiCard")}
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Gateway Selection (if online selected) */}
            {selectedPayment === "online" && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-display font-semibold text-foreground mb-3 sm:mb-4">
                  {t("selectPaymentGateway")}
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedGateway("esewa")}
                    className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer text-center text-xs sm:text-sm ${
                      selectedGateway === "esewa"
                        ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                        : "border-border bg-card hover:border-flame-orange/50"
                    }`}
                  >
                    {t("esewa")}
                  </button>
                  <button
                    onClick={() => setSelectedGateway("khalti")}
                    className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer text-center text-xs sm:text-sm ${
                      selectedGateway === "khalti"
                        ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                        : "border-border bg-card hover:border-flame-orange/50"
                    }`}
                  >
                    {t("khalti")}
                  </button>
                  <button
                    onClick={() => setSelectedGateway("card")}
                    className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer text-center text-xs sm:text-sm ${
                      selectedGateway === "card"
                        ? "border-flame-orange bg-primary-gradient text-text-inverse shadow-lg"
                        : "border-border bg-card hover:border-flame-orange/50"
                    }`}
                  >
                    {t("card")}
                  </button>
                </div>
                
                {/* QR Code Display based on selected gateway */}
                {selectedGateway === "esewa" && (
                  <div className="flex justify-center mt-3 sm:mt-4">
                    <Image src="/assets/esewaqr.png" alt="eSewa QR Code" width={120} height={120} className="sm:w-[150px] sm:h-[150px] rounded-lg" />
                  </div>
                )}
                {selectedGateway === "khalti" && (
                  <div className="flex justify-center mt-3 sm:mt-4">
                    <Image src="/assets/khaltiqr.png" alt="Khalti QR Code" width={120} height={120} className="sm:w-[150px] sm:h-[150px] rounded-lg" />
                  </div>
                )}
                {selectedGateway === "card" && (
                  <div className="flex justify-center mt-3 sm:mt-4">
                    <Image src="/assets/cardqr.png" alt="Card QR Code" width={120} height={120} className="sm:w-[150px] sm:h-[150px] rounded-lg" />
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl border border-red-500/30 bg-red-500/10 p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-red-500">
                    {language === "en" ? "Error" : "त्रुटि"}
                  </p>
                  <p className="text-xs sm:text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {paid && orderResponse && (
              <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl border border-green-500/30 bg-green-500/10 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="text-base sm:text-lg font-semibold text-green-500">{t("success")}</p>
                </div>
                {orderResponse.message && (
                  <p className="text-sm sm:text-base text-foreground font-medium">
                    {orderResponse.message}
                  </p>
                )}
                {orderResponse.billNumber && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {language === "en" ? "Order Number" : "अर्डर नम्बर"}: <span className="font-semibold text-foreground">{orderResponse.billNumber}</span>
                  </p>
                )}
                {orderResponse.statusInfo?.buttonText && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                      orderResponse.status === "pending" 
                        ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30"
                        : orderResponse.status === "accepted"
                        ? "bg-green-500/20 text-green-600 border border-green-500/30"
                        : "bg-red-500/20 text-red-600 border border-red-500/30"
                    }`}>
                      {orderResponse.statusInfo.buttonText}
                    </span>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
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
                disabled={isProcessing || !formData.fullName || !formData.phoneNumber || !formData.deliveryAddress || (selectedPayment === "online" && !selectedGateway) || items.length === 0}
                className="w-full rounded-lg sm:rounded-xl bg-primary-gradient px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold text-text-inverse transition-all hover:shadow-primary-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-xs sm:text-sm">{language === "en" ? "Processing..." : "प्रशोधन गर्दै..."}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t("placeOrder")}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
