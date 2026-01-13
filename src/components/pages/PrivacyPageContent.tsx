"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Eye, Lock, Database, Bell, Users } from "lucide-react";

const PrivacyPageContent = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckout = () => {};

  const sections = [
    {
      icon: Database,
      title: t("infoWeCollect" ),
      content: t("infoWeCollectDesc" ),
    },
    {
      icon: Eye,
      title: t("howWeUseInfo" ),
      content: t("howWeUseInfoDesc" ),
    },
    {
      icon: Lock,
      title: t("dataSecurity" ),
      content: t("dataSecurityDesc" ),
    },
    {
      icon: Users,
      title: t("infoSharing" ),
      content: t("infoSharingDesc" ),
    },
    {
      icon: Bell,
      title: t("yourRights" ),
      content: t("yourRightsDesc" ),
    },
    {
      icon: Shield,
      title: t("cookiesPolicy" ),
      content: t("cookiesPolicyDesc" ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} hideSearch />
      
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-full bg-ternary-text/20">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-ternary-text" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-ternary-text mb-3 sm:mb-4">
            {t("privacyPolicy" )}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("lastUpdated" )}
          </p>
        </div>

        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-border">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("privacyIntro" )}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-ternary-text/20 shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-ternary-text" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-ternary-text mb-2 sm:mb-3">{section.title}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-golden/20">
          <h3 className="text-base sm:text-lg font-semibold text-ternary-text mb-2 sm:mb-3">
            {t("customerService" )}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            {t("privacyContactDesc" )}
          </p>
          <p className="text-sm sm:text-base text-foreground">
            {t('privacyEmail')}<br />
            {t('privacyPhone')}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPageContent;

