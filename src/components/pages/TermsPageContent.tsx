"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const TermsPageContent = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckout = () => {};

  const sections = [
    {
      number: "1",
      title: t("acceptanceOfTerms" ),
      content: t("acceptanceOfTermsDesc" ),
    },
    {
      number: "2",
      title: t("ageRequirement" ),
      content: t("ageRequirementDesc" ),
    },
    {
      number: "3",
      title: t("productsAndPricing" ),
      content: t("productsAndPricingDesc" ),
    },
    {
      number: "4",
      title: t("ordersAndPayment" ),
      content: t("ordersAndPaymentDesc" ),
    },
    {
      number: "5",
      title: t("deliveryPolicy" ),
      content: t("deliveryPolicyDesc" ),
    },
    {
      number: "6",
      title: t("returnAndRefund" ),
      content: t("returnAndRefundDesc" ),
    },
    {
      number: "7",
      title: t("responsibleDrinking" ),
      content: t("responsibleDrinkingDesc" ),
    },
    {
      number: "8",
      title: t("limitationOfLiability" ),
      content: t("limitationOfLiabilityDesc" ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} hideSearch />
      
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-full bg-primary-gradient">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary-gradient mb-3 sm:mb-4">
            {t("termsConditions" )}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("lastUpdated" )}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-color-secondary mb-2 sm:mb-3">
                {section.number}. {section.title}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm sm:text-base text-foreground text-center leading-relaxed">
            {t("termsAcknowledgment" )}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPageContent;

