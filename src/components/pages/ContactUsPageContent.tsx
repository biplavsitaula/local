"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle, 
  MessageSquare, Building2, Facebook, Instagram, Twitter,
  Star, ThumbsUp
} from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

const ContactUsPageContent = () => {
  const { language, t } = useLanguage();
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

  // Feedback state
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    email: "",
    rating: 0,
    feedbackType: "",
    feedback: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);

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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackData.name || !feedbackData.email || !feedbackData.feedback || feedbackData.rating === 0) {
      toast.error(language === 'en' ? 'Please fill all required fields and select a rating' : 'कृपया सबै आवश्यक फिल्डहरू भर्नुहोस् र रेटिङ छान्नुहोस्');
      return;
    }

    try {
      setFeedbackSubmitting(true);

      const serviceId = "service_3hnx9qr";
      const templateId = "template_uw796lo";
      const publicKey = "5qzm3CpcCNMoXN2Y0";

      await emailjs.send(
        serviceId,
        templateId,
        {
          email: "hasinadhungel11@gmail.com",
          to_name: "Flame Beverage Support",
          from_name: feedbackData.name,
          from_email: feedbackData.email,
          subject: `Customer Feedback - ${feedbackData.feedbackType || 'General'} (${feedbackData.rating}/5 Stars)`,
          message: `
            ⭐ CUSTOMER FEEDBACK ⭐
            
            Name: ${feedbackData.name}
            Email: ${feedbackData.email}
            Rating: ${'★'.repeat(feedbackData.rating)}${'☆'.repeat(5 - feedbackData.rating)} (${feedbackData.rating}/5)
            Feedback Type: ${feedbackData.feedbackType || 'General'}

            Feedback:
            ${feedbackData.feedback}
          `,
          reply_to: feedbackData.email,
        },
        publicKey
      );

      setFeedbackSubmitted(true);
      toast.success(language === 'en' ? 'Thank you for your feedback!' : 'तपाईंको प्रतिक्रियाको लागि धन्यवाद!');

      // Reset form after 3 seconds
      setTimeout(() => {
        setFeedbackData({ name: "", email: "", rating: 0, feedbackType: "", feedback: "" });
        setFeedbackSubmitted(false);
      }, 3000);
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      toast.error(language === 'en' ? 'Failed to submit feedback. Please try again.' : 'प्रतिक्रिया पेश गर्न असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।');
    } finally {
      setFeedbackSubmitting(false);
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
    <div className="min-h-screen bg-background">
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
            <div className="p-3 sm:p-4 rounded-full bg-primary-gradient">
              <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-gradient mb-3 sm:mb-4">
            {t("getInTouch")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto text-muted-foreground">
            {t("contactPageSubtitle")}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="p-4 sm:p-6 rounded-xl border transition-all hover:scale-[1.02] bg-card border-border hover:border-flame-orange/50"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-flame-orange/20">
                <info.icon className="w-6 h-6 text-color-secondary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">
                {info.title}
              </h3>
              {info.link ? (
                <a
                  href={info.link}
                  className="text-sm hover:underline text-flame-orange"
                >
                  {info.content}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {info.content}
                </p>
              )}
              {info.subContent && (
                <p className="text-xs mt-1 text-muted-foreground/70">
                  {info.subContent}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Main Content: Form + Map */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Form */}
          <div className="p-6 sm:p-8 rounded-xl border bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <Send className="w-6 h-6 text-color-secondary" />
              <h2 className="text-xl sm:text-2xl font-display font-bold text-color-secondary">
                {t("sendUsMessage")}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
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
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
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
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t("phoneNumber")}
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+977 98XXXXXXXX"
                    disabled={isSubmitting || isSubmitted}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t("subject")}
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    disabled={isSubmitting || isSubmitted}
                    className="w-full h-10 px-3 rounded-md border text-sm bg-secondary/50 border-border text-foreground"
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
                <label className="block text-sm font-medium mb-2 text-foreground">
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
                  className="w-full px-3 py-2 rounded-md border text-sm resize-none bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full py-6 text-base font-semibold btn-primary-custom text-white"
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
            <div className="rounded-xl overflow-hidden border border-border">
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
            <div className="p-6 rounded-xl border bg-card border-border">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-color-secondary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {t("visitOurStore")}
                </h3>
              </div>
              <p className="text-sm mb-4 text-muted-foreground">
                {t("visitStoreDesc")}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <span className="text-sm font-medium text-foreground">
                  {t("followUs")}
                </span>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="p-2 rounded-full transition-colors bg-secondary hover:bg-flame-orange/20 text-muted-foreground hover:text-flame-orange"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-full transition-colors bg-secondary hover:bg-flame-orange/20 text-muted-foreground hover:text-flame-orange"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-full transition-colors bg-secondary hover:bg-flame-orange/20 text-muted-foreground hover:text-flame-orange"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-12 sm:mt-16">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-flame-orange/20">
                <ThumbsUp className="w-6 h-6 sm:w-8 sm:h-8 text-color-secondary" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-primary-gradient mb-2">
              {language === 'en' ? 'Share Your Feedback' : 'आफ्नो प्रतिक्रिया साझा गर्नुहोस्'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              {language === 'en' 
                ? 'We value your opinion! Help us improve by sharing your experience.'
                : 'हामी तपाईंको विचारलाई मूल्यवान मान्छौं! आफ्नो अनुभव साझा गरेर हामीलाई सुधार गर्न मद्दत गर्नुहोस्।'}
            </p>
          </div>

          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-xl border bg-card border-border">
            <form onSubmit={handleFeedbackSubmit} className="space-y-5">
              {/* Name and Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t("fullName")} *
                  </label>
                  <Input
                    type="text"
                    value={feedbackData.name}
                    onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                    placeholder={t("yourName")}
                    required
                    disabled={feedbackSubmitting || feedbackSubmitted}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {t("emailAddress")} *
                  </label>
                  <Input
                    type="email"
                    value={feedbackData.email}
                    onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                    placeholder={t("yourEmail")}
                    required
                    disabled={feedbackSubmitting || feedbackSubmitted}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-3 text-foreground">
                  {language === 'en' ? 'Your Rating' : 'तपाईंको रेटिङ'} *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      disabled={feedbackSubmitting || feedbackSubmitted}
                      className="p-1 transition-transform hover:scale-110 disabled:opacity-50 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                          star <= (hoveredRating || feedbackData.rating)
                            ? 'fill-flame-orange text-flame-orange'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-muted-foreground">
                    {feedbackData.rating > 0 && (
                      <>
                        {feedbackData.rating}/5 
                        {feedbackData.rating === 5 && (language === 'en' ? ' - Excellent!' : ' - उत्कृष्ट!')}
                        {feedbackData.rating === 4 && (language === 'en' ? ' - Great!' : ' - राम्रो!')}
                        {feedbackData.rating === 3 && (language === 'en' ? ' - Good' : ' - ठीक छ')}
                        {feedbackData.rating === 2 && (language === 'en' ? ' - Fair' : ' - औसत')}
                        {feedbackData.rating === 1 && (language === 'en' ? ' - Poor' : ' - कमजोर')}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {language === 'en' ? 'Feedback Type' : 'प्रतिक्रिया प्रकार'}
                </label>
                <select
                  value={feedbackData.feedbackType}
                  onChange={(e) => setFeedbackData({ ...feedbackData, feedbackType: e.target.value })}
                  disabled={feedbackSubmitting || feedbackSubmitted}
                  className="w-full h-10 px-3 rounded-md border text-sm bg-secondary/50 border-border text-foreground"
                >
                  <option value="">{language === 'en' ? 'Select type' : 'प्रकार छान्नुहोस्'}</option>
                  <option value="product">{language === 'en' ? 'Product Quality' : 'उत्पादन गुणस्तर'}</option>
                  <option value="delivery">{language === 'en' ? 'Delivery Experience' : 'डेलिभरी अनुभव'}</option>
                  <option value="service">{language === 'en' ? 'Customer Service' : 'ग्राहक सेवा'}</option>
                  <option value="website">{language === 'en' ? 'Website Experience' : 'वेबसाइट अनुभव'}</option>
                  <option value="suggestion">{language === 'en' ? 'Suggestion' : 'सुझाव'}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {language === 'en' ? 'Your Feedback' : 'तपाईंको प्रतिक्रिया'} *
                </label>
                <textarea
                  value={feedbackData.feedback}
                  onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                  placeholder={language === 'en' ? 'Tell us about your experience...' : 'आफ्नो अनुभवको बारेमा बताउनुहोस्...'}
                  required
                  disabled={feedbackSubmitting || feedbackSubmitted}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border text-sm resize-none bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={feedbackSubmitting || feedbackSubmitted}
                className="w-full py-6 text-base font-semibold btn-primary-custom text-white"
              >
                {feedbackSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {language === 'en' ? 'Submitting...' : 'पेश गर्दै...'}
                  </>
                ) : feedbackSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Thank You!' : 'धन्यवाद!'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Submit Feedback' : 'प्रतिक्रिया पेश गर्नुहोस्'}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUsPageContent;
