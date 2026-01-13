import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Special Offers & Deals",
  description: "Discover amazing deals and discounts on premium spirits at Flame Beverage. Save on whisky, vodka, rum, wine, and more. Limited time offers available!",
  keywords: [
    "liquor deals Nepal",
    "whisky discount",
    "vodka offers",
    "wine sale",
    "beer promotion",
    "alcohol discounts",
    "special offers spirits",
    "Flame Beverage deals",
  ],
  openGraph: {
    title: "Special Offers & Deals | Flame Beverage",
    description: "Discover amazing deals and discounts on premium spirits. Save on whisky, vodka, rum, wine, and more!",
    url: "/offers",
    type: "website",
  },
  alternates: {
    canonical: "/offers",
  },
};

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
