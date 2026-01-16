"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle, 
  MessageSquare, Building2, Facebook, Instagram, Twitter 
} from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

const ContactUsPageContent = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleCheckout = () => {};

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    try {
      setIsSubmitting(true);

      const serviceId = "service_3hnx9qr";
      const templateId = "template_uw796lo";
      const publicKey = "5qzm3CpcCNMoXN2Y0";

      await emailjs.send(
        serviceId,
        templateId,
        {
          email: "hasinadhungel11@gmail.com",
          to_name: "Flame Beverage Support",
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject || "Contact Form Submission",
          message: `
            Name: ${formData.name}
            Email: ${formData.email}
            Phone: ${formData.phone || "Not provided"}
            Subject: ${formData.subject || "General Inquiry"}

            Message:
            ${formData.message}
          `,
          reply_to: formData.email,
        },
        publicKey
      );

      setIsSubmitted(true);
      toast.success(t("messageSentSuccess"));

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        setIsSubmitted(false);
      }, 3000);
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast.error(t("messageFailedToSend"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t("ourLocation"),
      content: t("kathmanduNepal"),
      subContent: t("thamelAddress"),
    },
    {
      icon: Phone,
      title: t("phoneNumber"),
      content: "+977 9800000000",
      link: "tel:+9779800000000",
    },
    {
      icon: Mail,
      title: t("emailAddress"),
      content: "info@flamebeverage.com",
      link: "mailto:info@flamebeverage.com",
    },
    {
      icon: Clock,
      title: t("businessHours"),
      content: t("sunToFri"),
      subContent: t("saturday"),
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-background" : "bg-gray-50"
      }`}
    >
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCheckout={handleCheckout}
        hideSearch
      />

      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4">
            <div
              className={`p-3 sm:p-4 rounded-full ${
                theme === "dark"
                  ? "bg-flame-gradient"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              }`}
            >
              <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-4 ${
              theme === "dark" ? "text-ternary-text" : "text-gray-900"
            }`}
          >
            {t("getInTouch")}
          </h1>
          <p
            className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto ${
              theme === "dark" ? "text-muted-foreground" : "text-gray-600"
            }`}
          >
            {t("contactPageSubtitle")}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className={`p-4 sm:p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                theme === "dark"
                  ? "bg-card border-border hover:border-flame-orange/50"
                  : "bg-white border-gray-200 hover:border-orange-300 shadow-sm"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  theme === "dark"
                    ? "bg-flame-orange/20"
                    : "bg-orange-100"
                }`}
              >
                <info.icon
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-flame-orange" : "text-orange-600"
                  }`}
                />
              </div>
              <h3
                className={`font-semibold mb-2 ${
                  theme === "dark" ? "text-foreground" : "text-gray-900"
                }`}
              >
                {info.title}
              </h3>
              {info.link ? (
                <a
                  href={info.link}
                  className={`text-sm hover:underline ${
                    theme === "dark"
                      ? "text-flame-orange"
                      : "text-orange-600"
                  }`}
                >
                  {info.content}
                </a>
              ) : (
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-muted-foreground" : "text-gray-600"
                  }`}
                >
                  {info.content}
                </p>
              )}
              {info.subContent && (
                <p
                  className={`text-xs mt-1 ${
                    theme === "dark" ? "text-muted-foreground/70" : "text-gray-500"
                  }`}
                >
                  {info.subContent}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Main Content: Form + Map */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Form */}
          <div
            className={`p-6 sm:p-8 rounded-xl border ${
              theme === "dark"
                ? "bg-card border-border"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <Send
                className={`w-6 h-6 ${
                  theme === "dark" ? "text-flame-orange" : "text-orange-600"
                }`}
              />
              <h2
                className={`text-xl sm:text-2xl font-display font-bold ${
                  theme === "dark" ? "text-ternary-text" : "text-gray-900"
                }`}
              >
                {t("sendUsMessage")}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    {t("fullName")} *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t("yourName")}
                    required
                    disabled={isSubmitting || isSubmitted}
                    className={
                      theme === "dark"
                        ? "bg-secondary/50 border-border"
                        : "bg-gray-50 border-gray-200"
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    {t("emailAddress")} *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t("yourEmail")}
                    required
                    disabled={isSubmitting || isSubmitted}
                    className={
                      theme === "dark"
                        ? "bg-secondary/50 border-border"
                        : "bg-gray-50 border-gray-200"
                    }
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    {t("phoneNumber")}
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+977 98XXXXXXXX"
                    disabled={isSubmitting || isSubmitted}
                    className={
                      theme === "dark"
                        ? "bg-secondary/50 border-border"
                        : "bg-gray-50 border-gray-200"
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    {t("subject")}
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    disabled={isSubmitting || isSubmitted}
                    className={`w-full h-10 px-3 rounded-md border text-sm ${
                      theme === "dark"
                        ? "bg-secondary/50 border-border text-foreground"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  >
                    <option value="">{t("selectSubject")}</option>
                    <option value="general">{t("generalInquiry")}</option>
                    <option value="order">{t("orderRelated")}</option>
                    <option value="feedback">{t("feedback")}</option>
                    <option value="partnership">{t("businessPartnership")}</option>
                    <option value="other">{t("other")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-foreground" : "text-gray-700"
                  }`}
                >
                  {t("yourMessage")} *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t("writeMessageHere")}
                  required
                  disabled={isSubmitting || isSubmitted}
                  rows={5}
                  className={`w-full px-3 py-2 rounded-md border text-sm resize-none ${
                    theme === "dark"
                      ? "bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className={`w-full py-6 text-base font-semibold ${
                  theme === "dark"
                    ? "bg-flame-gradient hover:opacity-90"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("sending")}
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {t("messageSent")}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {t("sendMessage")}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Map Section */}
          <div className="space-y-6">
            {/* Google Map */}
            <div
              className={`rounded-xl overflow-hidden border ${
                theme === "dark" ? "border-border" : "border-gray-200 shadow-sm"
              }`}
            >
              <div className="relative w-full h-[300px] sm:h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.2714895036095!2d85.30836807546954!3d27.71527087617759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb18fcb77fd4bd%3A0x58099b1deffed9d7!2sThamel%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1705000000000!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Flame Beverage Location"
                  className="absolute inset-0"
                />
              </div>
            </div>

            {/* Additional Info Card */}
            <div
              className={`p-6 rounded-xl border ${
                theme === "dark"
                  ? "bg-card border-border"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Building2
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-flame-orange" : "text-orange-600"
                  }`}
                />
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  {t("visitOurStore")}
                </h3>
              </div>
              <p
                className={`text-sm mb-4 ${
                  theme === "dark" ? "text-muted-foreground" : "text-gray-600"
                }`}
              >
                {t("visitStoreDesc")}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-foreground" : "text-gray-700"
                  }`}
                >
                  {t("followUs")}
                </span>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className={`p-2 rounded-full transition-colors ${
                      theme === "dark"
                        ? "bg-secondary hover:bg-flame-orange/20 text-muted-foreground hover:text-flame-orange"
                        : "bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600"
                    }`}
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className={`p-2 rounded-full transition-colors ${
                      theme === "dark"
                        ? "bg-secondary hover:bg-flame-orange/20 text-muted-foreground hover:text-flame-orange"
                        : "bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600"
                    }`}
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className={`p-2 rounded-full transition-colors ${
                      theme === "dark"
                        ? "bg-secondary hover:bg-flame-orange/20 text-muted-foreground hover:text-flame-orange"
                        : "bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600"
                    }`}
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUsPageContent;
