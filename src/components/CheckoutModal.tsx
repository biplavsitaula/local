"use client";

import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { IPaymentCheckbox } from "@/interface/IPaymentCheckout";
import { X, ArrowLeft, User, Phone, MapPin, Package, CreditCard, Check, Loader2, AlertCircle, Mail } from "lucide-react";
import Link from "next/link";
import { ordersService, CheckoutPayload } from "@/services/orders.service";
import Image from "next/image";
import { Product } from "@/types";

const DEFAULT_IMAGE = "/assets/liquor1.jpeg";

// Helper function to get valid image URL
const getValidImageUrl = (product: Product | null | undefined): string => {
  if (!product) return DEFAULT_IMAGE;
  
  const imageUrl = product.image || product.imageUrl;
  
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return DEFAULT_IMAGE;
  }
  
  const trimmedUrl = imageUrl.trim();
  
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('/') || trimmedUrl.startsWith('data:')) {
    return trimmedUrl;
  }
  
  return DEFAULT_IMAGE;
};

// Check if URL is external (needs unoptimized)
const isExternalUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
};

// Storage key for tracked orders
const TRACKED_ORDERS_KEY = 'flame_tracked_orders';

// Helper to store order for tracking
const storeTrackedOrder = (billNumber: string, email: string, status: string) => {
  try {
    const stored = localStorage.getItem(TRACKED_ORDERS_KEY);
    const orders = stored ? JSON.parse(stored) : [];
    // Add new order if not already tracked
    const existingIndex = orders.findIndex((o: any) => o.billNumber === billNumber);
    if (existingIndex === -1) {
      orders.push({
        billNumber,
        email,
        status,
        createdAt: new Date().toISOString(),
        notified: false,
      });
    } else {
      orders[existingIndex].status = status;
    }
    // Keep only last 10 orders
    const trimmedOrders = orders.slice(-10);
    localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify(trimmedOrders));
  } catch (e) {
    console.error('Error storing tracked order:', e);
  }
};

const CheckoutModal = ({ open, onClose, buyNowItem }: IPaymentCheckbox) => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { items: cartItems, total: cartTotal, totalItems, clear: clearCart } = useCart();
  
  // Use buyNowItem if provided, otherwise use cart items
  const items = useMemo(() => {
    if (buyNowItem) {
      return [{ product: buyNowItem.product, quantity: buyNowItem.quantity }];
    }
    return cartItems;
  }, [buyNowItem, cartItems]);
  
  const total = useMemo(() => {
    if (buyNowItem) {
      return (buyNowItem.product.price || 0) * buyNowItem.quantity;
    }
    return cartTotal;
  }, [buyNowItem, cartTotal]);
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "online">("cod");
  const [selectedGateway, setSelectedGateway] = useState<"esewa" | "khalti" | "card" | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
    email: "",
  });
  const [paid, setPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
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
    setFormData({ fullName: "", phoneNumber: "", deliveryAddress: "", email: "" });
    setError(null);
    setPhoneError(null);
    setEmailError(null);
    setOrderResponse(null);
    onClose();
  };

  const handlePayment = async () => {
    if (selectedPayment === "online" && !selectedGateway) {
      return; // Require gateway selection for online payment
    }
    if (!formData.fullName || !formData.phoneNumber || !formData.deliveryAddress || !formData.email) {
      return; // Require all fields
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError(t("invalidEmail"));
      return;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setPhoneError(t("phoneValidation"));
      return;
    }
    if (items.length === 0) {
      setError(t("cartIsEmpty"));
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
        email: formData.email,
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
        const orderBillNumber = responseData?.billNumber || responseData?.order?.billNumber;
        const orderStatus = responseData?.orderStatus || responseData?.order?.status || responseData?.statusInfo?.status || apiResponse?.status || 'pending';
        
        setOrderResponse({
          message: responseData?.statusInfo?.message || response.message,
          status: orderStatus,
          billNumber: orderBillNumber,
          statusInfo: responseData?.statusInfo,
        });

        // If user is logged in and checkout email matches logged-in email, store order for tracking
        if (isAuthenticated && user?.email && orderBillNumber) {
          const checkoutEmailLower = formData.email.toLowerCase();
          const userEmailLower = user.email.toLowerCase();
          if (checkoutEmailLower === userEmailLower) {
            storeTrackedOrder(orderBillNumber, formData.email, orderStatus);
          }
        }

        // Clear the cart after successful checkout (only if not using buyNowItem)
        if (!buyNowItem) {
          clearCart();
        }
        // Close modal after showing success message (increased timeout to show message)
        setTimeout(() => {
          handleClose();
        }, 5000);
      } else {
        setError(response?.message || t("checkoutFailed"));
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err?.message || t("somethingWentWrong"));
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
          className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-color-default transition-colors hover:bg-muted/80 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Continue Shopping Link */}
        <Link
          href="/"
          onClick={handleClose}
          className="absolute left-2 top-2 sm:left-4 sm:top-4 z-10 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-color-accent hover:text-color-tertiary transition-colors cursor-pointer border border-color-tertiary hover:border-color-primary px-2 py-1 sm:px-2 sm:p-2 rounded-lg"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{t("continue")}</span>
        </Link>

        <div className="grid md:grid-cols-2 gap-0 mt-10 sm:mt-12">
          {/* Left: Order Summary */}
          <div className="p-4 sm:p-6 md:p-8 pb-6 sm:pb-8 md:pb-10 border-b md:border-b-0 md:border-r border-color-default bg-muted/20">
            <h2 className="text-lg sm:text-2xl font-display font-bold text-primary-gradient mb-4 sm:mb-6">
              {t("orderSummary")}
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {items.map((item) => (
                <div key={item?.product?.id} className="flex gap-2 sm:gap-4">
                  <Image
                    src={getValidImageUrl(item?.product)}
                    alt={item?.product?.name || 'Product'}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg shrink-0"
                    width={84}
                    height={80}
                    unoptimized={isExternalUrl(getValidImageUrl(item?.product))}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_IMAGE;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-color-default mb-1 text-base sm:text-base line-clamp-2">
                      {language === "en" ? item?.product?.name : item?.product?.nameNe || item?.product?.name}
                    </h4>
                    <p className="text-sm sm:text-sm text-color-muted mb-1 sm:mb-2">
                      Rs. {(item?.product?.price || 0).toLocaleString()} x {item?.quantity || 0}
                    </p>
                    <p className="text-lg sm:text-lg font-bold text-primary-gradient">
                      Rs. {((item?.product?.price || 0) * (item?.quantity || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-color-default pt-3 sm:pt-4 space-y-2">
              <div className="flex justify-between text-base sm:text-base text-color-default">
                <span>{t("subtotal")}</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base sm:text-base text-color-default">
                <span>{t("delivery")}</span>
                <span className={deliveryFee === 0 ? "text-green-500 font-semibold" : ""}>
                  {deliveryFee === 0 ? t("free") : `Rs. ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-color-default">
                <span className="text-lg sm:text-lg font-semibold text-primary-gradient">{t("total")}</span>
                <span className="text-xl sm:text-2xl font-bold text-primary-gradient">
                  Rs. {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Delivery & Payment */}
          <div className="p-4 sm:p-6 md:p-8 pb-6 sm:pb-8 md:pb-10">
            <h2 className="text-lg sm:text-2xl font-display font-bold text-primary-gradient mb-4 sm:mb-6">
              {t("deliveryPayment")}
            </h2>

            {/* Form Fields */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-sm font-medium text-color-default mb-1.5 sm:mb-2">
                  <User className="w-4 h-4 sm:w-4 sm:h-4 text-color-accent" />
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t("enterName")}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-base bg-background border border-color-default rounded-lg sm:rounded-xl text-color-default placeholder:text-color-muted focus:outline-none focus:border-color-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-sm font-medium text-color-default mb-1.5 sm:mb-2">
                  <Phone className="w-4 h-4 sm:w-4 sm:h-4 text-color-accent" />
                  {t("phoneNumber")}
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, phoneNumber: value });
                    setPhoneError(null);
                  }}
                  placeholder={t("enterPhone")}
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-base bg-background border rounded-lg sm:rounded-xl text-color-default placeholder:text-color-muted focus:outline-none focus:ring-2 ${
                    phoneError 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-color-default focus:border-color-primary focus:ring-primary/20"
                  }`}
                />
                {phoneError && (
                  <p className="mt-1.5 text-sm sm:text-sm text-red-500">{phoneError}</p>
                )}
              </div>
              {/* Email Address */}
              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-sm font-medium text-color-default mb-1.5 sm:mb-2">
                  <Mail className="w-4 h-4 sm:w-4 sm:h-4 text-color-accent" />
                  {t("emailAddress")}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setEmailError(null);
                  }}
                  placeholder={t("enterEmail")}
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-base bg-background border rounded-lg sm:rounded-xl text-color-default placeholder:text-color-muted focus:outline-none focus:ring-2 ${
                    emailError 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-color-default focus:border-color-primary focus:ring-primary/20"
                  }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-sm sm:text-sm text-red-500">{emailError}</p>
                )}
              </div>

              {/* Delivery Address */}
              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-sm font-medium text-color-default mb-1.5 sm:mb-2">
                  <MapPin className="w-4 h-4 sm:w-4 sm:h-4 text-color-accent" />
                  {t("deliveryAddress")}
                </label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder={t("enterAddress")}
                  rows={3}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-base bg-background border border-color-default rounded-lg sm:rounded-xl text-color-default placeholder:text-color-muted focus:outline-none focus:border-color-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-lg font-display font-semibold text-color-default mb-2 sm:mb-3">
                {t("paymentTitle")}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Cash on Delivery */}
                <button
                  onClick={() => {
                    setSelectedPayment("cod");
                    setSelectedGateway(null);
                  }}
                  className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedPayment === "cod"
                      ? "border-color-primary btn-primary-custom shadow-md"
                      : "border-color-default bg-card hover:border-color-primary/50"
                  }`}
                >
                  <Package className={`w-5 h-5 sm:w-5 sm:h-5 shrink-0 ${selectedPayment === "cod" ? "text-color-inverse" : "text-color-accent"}`} />
                  <span className="font-medium text-sm sm:text-sm">{t("cod")}</span>
                </button>

                {/* Pay Online */}
                <button
                  onClick={() => setSelectedPayment("online")}
                  className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedPayment === "online"
                      ? "border-color-primary btn-primary-custom shadow-md"
                      : "border-color-default bg-card hover:border-color-primary/50"
                  }`}
                >
                  <CreditCard className={`w-5 h-5 sm:w-5 sm:h-5 shrink-0 ${selectedPayment === "online" ? "text-color-inverse" : "text-color-accent"}`} />
                  <span className="font-medium text-sm sm:text-sm">{t("online")}</span>
                </button>
              </div>
            </div>

            {/* Payment Gateway Selection (if online selected) */}
            {selectedPayment === "online" && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-lg font-display font-semibold text-color-default mb-3 sm:mb-4">
                  {t("selectPaymentGateway")}
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedGateway("esewa")}
                    className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer text-center text-sm sm:text-sm ${
                      selectedGateway === "esewa"
                        ? "border-color-primary btn-primary-custom shadow-lg"
                        : "border-color-default bg-card hover:border-color-primary/50"
                    }`}
                  >
                    {t("esewa")}
                  </button>
                  <button
                    onClick={() => setSelectedGateway("khalti")}
                    className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer text-center text-sm sm:text-sm ${
                      selectedGateway === "khalti"
                        ? "border-color-primary btn-primary-custom shadow-lg"
                        : "border-color-default bg-card hover:border-color-primary/50"
                    }`}
                  >
                    {t("khalti")}
                  </button>
                  <button
                    onClick={() => setSelectedGateway("card")}
                    className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer text-center text-sm sm:text-sm ${
                      selectedGateway === "card"
                        ? "border-color-primary btn-primary-custom shadow-lg"
                        : "border-color-default bg-card hover:border-color-primary/50"
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
                <AlertCircle className="w-5 h-5 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm sm:text-sm font-semibold text-red-500">
                    {t("error")}
                  </p>
                  <p className="text-sm sm:text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {paid && orderResponse && (
              <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl border border-green-500/30 bg-green-500/10 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="text-lg sm:text-lg font-semibold text-green-500">{t("success")}</p>
                </div>
                {orderResponse.message && (
                  <p className="text-base sm:text-base text-color-default font-medium">
                    {orderResponse.message}
                  </p>
                )}
                {orderResponse.billNumber && (
                  <p className="text-sm sm:text-sm text-color-muted">
                    {t("orderNumber")}: <span className="font-semibold text-color-default">{orderResponse.billNumber}</span>
                  </p>
                )}
                {orderResponse.statusInfo?.buttonText && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm sm:text-sm font-medium ${
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
                <p className="text-sm sm:text-sm text-color-muted mt-2">
                  {t("orderUpdateMessage")}
                </p>
              </div>
            )}

            {/* Place Order Button */}
            {!paid && (
              <button
                onClick={handlePayment}
                disabled={
                  isProcessing || 
                  !formData.fullName || 
                  !formData.phoneNumber || 
                  formData.phoneNumber.length !== 10 || 
                  !formData.deliveryAddress || 
                  !formData.email ||
                  (selectedPayment === "online" && !selectedGateway) || 
                  items.length === 0
                }
                className="w-full rounded-lg sm:rounded-xl btn-primary-custom px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-base font-semibold transition-all hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 sm:w-5 sm:h-5 animate-spin text-color-inverse" />
                    <span className="text-sm sm:text-sm text-color-inverse">{t("processing")}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 text-color-inverse" />
                    <span className="text-color-inverse">{t("placeOrder")}</span>
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
