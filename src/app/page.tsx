import { Metadata } from "next";
import { ClientPageContent } from "@/components/ClientPageContent";
import { OrganizationJsonLd, LocalBusinessJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home | Premium Spirits & Beverages",
  description: "Shop premium whisky, wine, vodka, rum, gin, and more at Flame Beverage. Nepal's trusted online liquor store with fast delivery in Kathmandu Valley. Quality spirits at great prices.",
  keywords: ["premium spirits Nepal", "online liquor store", "whisky delivery", "wine shop Kathmandu", "buy alcohol online Nepal"],
  openGraph: {
    title: "Flame Beverage | Premium Spirits & Beverages in Nepal",
    description: "Shop premium whisky, wine, vodka, rum, gin, and more. Nepal's trusted online liquor store with fast delivery.",
    url: "/",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <>
      <OrganizationJsonLd />
      <LocalBusinessJsonLd />
      <WebsiteJsonLd />
      <ClientPageContent />
    </>
  );
}
