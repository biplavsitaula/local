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
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-ternary-text/20">
              <FileText className="w-8 h-8 text-ternary-text" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-ternary-text mb-4">
            {t("termsConditions" )}
          </h1>
          <p className="text-muted-foreground">
            {t("lastUpdated" )}
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold text-ternary-text mb-3">
                {section.number}. {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-card rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-foreground text-center leading-relaxed">
            {t("termsAcknowledgment" )}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPageContent;

