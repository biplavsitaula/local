"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Eye, Lock, Database, Bell, Users } from "lucide-react";

const PrivacyPolicy = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckout = () => {};

  const sections = [
    {
      icon: Database,
      title: t("infoWeCollect"),
      content: t("infoWeCollectDesc"),
    },
    {
      icon: Eye,
      title: t("howWeUseInfo"),
      content: t("howWeUseInfoDesc"),
    },
    {
      icon: Lock,
      title: t("dataSecurity"),
      content: t("dataSecurityDesc"),
    },
    {
      icon: Users,
      title: t("infoSharing"),
      content: t("infoSharingDesc"),
    },
    {
      icon: Bell,
      title: t("yourRights"),
      content: t("yourRightsDesc"),
    },
    {
      icon: Shield,
      title: t("cookiesPolicy"),
      content: t("cookiesPolicyDesc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} />
      
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-ternary-text/20">
              <Shield className="w-8 h-8 text-ternary-text" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-ternary-text mb-4">
            {t("privacyPolicy")}
          </h1>
          <p className="text-muted-foreground">
            {t("lastUpdated")}
          </p>
        </div>

        <div className="mb-8 p-6 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground leading-relaxed">
            {t("privacyIntro")}
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-ternary-text/20 shrink-0">
                    <Icon className="w-5 h-5 text-ternary-text" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-ternary-text mb-3">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-card rounded-xl border border-golden/20">
          <h3 className="text-lg font-semibold text-ternary-text mb-3">
            {t("customerService")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("privacyContactDesc")}
          </p>
          <p className="text-foreground">
            {t('privacyEmail')}<br />
            {t('privacyPhone')}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

