"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RotateCcw, Package, Clock, AlertTriangle, CheckCircle, XCircle, Phone } from "lucide-react";

const ReturnPolicyPageContent = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckout = () => {};

  const sections = [
    {
      icon: <Clock className="w-5 h-5 text-flame-orange" />,
      title: t("returnWindow"),
      content: t("returnWindowDesc"),
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: t("eligibleForReturn"),
      content: t("eligibleForReturnDesc"),
    },
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      title: t("notEligibleForReturn"),
      content: t("notEligibleForReturnDesc"),
    },
    {
      icon: <Package className="w-5 h-5 text-flame-orange" />,
      title: t("returnProcess"),
      content: t("returnProcessDesc"),
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-flame-orange" />,
      title: t("refundPolicy"),
      content: t("refundPolicyDesc"),
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      title: t("importantNotes"),
      content: t("importantNotesDesc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} hideSearch />
      
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-full bg-primary-gradient">
              <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary-gradient mb-3 sm:mb-4">
            {t("returnPolicy")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("returnPolicyLastUpdated")}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border mb-6">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("returnPolicyIntro")}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                {section.icon}
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-color-secondary">
                  {section.title}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-color-primary">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Phone className="w-5 h-5 text-flame-orange" />
            <h3 className="text-lg font-semibold text-color-secondary">
              {t("needHelpWithReturn")}
            </h3>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">
            {t("needHelpWithReturnDesc")}
          </p>
        </div>

        {/* Legal Notice */}
        <div className="mt-6 p-4 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm sm:text-base text-foreground text-center leading-relaxed">
            {t("returnPolicyAcknowledgment")}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicyPageContent;
