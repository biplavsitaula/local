"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Flame, Users, Award, MapPin, Phone, Mail } from "lucide-react";

const AboutPageContent = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { value: "10+", label: t("yearsExperience" ) },
    { value: "5000+", label: t("happyCustomers" ) },
    { value: "500+", label: t("products" ) },
    { value: "24/7", label: t("support" ) },
  ];

  const handleCheckout = () => {};

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} hideSearch />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary-gradient">
              <Flame className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-ternary-text mb-4">
            {t("aboutFlameBeverage" )}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("aboutIntro" )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 text-center border border-border hover:border-golden transition-colors"
            >
              <div className="text-3xl md:text-4xl font-bold text-ternary-text mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-card rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-primary-text" />
              <h2 className="text-2xl font-display font-bold text-ternary-text">
                {t("ourMission" )}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {t("missionDesc" )}
            </p>
          </div>
          <div className="bg-card rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-primary-text" />
              <h2 className="text-2xl font-display font-bold text-ternary-text">
                {t("ourVision" )}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {t("visionDesc" )}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-xl p-8 border border-border">
          <h2 className="text-2xl font-display font-bold text-ternary-text mb-6 text-center">
            {t("contactUs" )}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 justify-center">
              <MapPin className="w-6 h-6 text-primary-text" />
              <span className="text-muted-foreground">{t("address" )}</span>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <Phone className="w-6 h-6 text-primary-text" />
              <span className="text-muted-foreground">+977 9800000000</span>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <Mail className="w-6 h-6 text-primary-text" />
              <span className="text-muted-foreground">info@flamebeverage.com</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPageContent;

