"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Flame, Users, Award, MapPin, Phone, Mail } from "lucide-react";

const AboutUs = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { value: "10+", label: t("yearsExperience") },
    { value: "5000+", label: t("happyCustomers") },
    { value: "500+", label: t("products") },
    { value: "24/7", label: t("support") },
  ];

  const handleCheckout = () => {};

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onCheckout={handleCheckout} />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary-gradient">
              <Flame className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-ternary-text mb-4">
            {t("aboutFlameBeverage")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("aboutIntro")}
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

        {/* Our Story */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-display font-bold text-ternary-text mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              {t("ourStory")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("ourStoryDesc1")}
            </p>
            <p className="text-muted-foreground">
              {t("ourStoryDesc2")}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-ternary-text mb-4 flex items-center gap-2">
              <Award className="w-6 h-6" />
              {t("whyChooseUs")}
            </h2>
            <ul className="space-y-3">
              {[
                t("authenticProducts"),
                t("wideSelection"),
                t("fastReliableDelivery"),
                t("competitivePrices"),
                t("expertSupport"),
                t("securePayment"),
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-golden" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-xl p-8 border border-border">
          <h2 className="text-2xl font-display font-bold text-ternary-text mb-6 text-center">
            {t("customerService")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary-btn/20">
                <MapPin className="w-6 h-6 text-secondary-text" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {t("address")}
                </div>
                <div className="text-muted-foreground text-sm">Kathmandu, Nepal</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary-btn/20">
                <Phone className="w-6 h-6 text-primary-text" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {t("phone")}
                </div>
                <div className="text-muted-foreground text-sm">+977-1-4XXXXXX</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-ternary-btn/20">
                <Mail className="w-6 h-6 text-ternary-text" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {t("email")}
                </div>
                <div className="text-muted-foreground text-sm">info@flamebeverage.com</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;

