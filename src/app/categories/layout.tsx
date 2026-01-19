import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore our diverse categories of premium spirits - Whisky, Vodka, Rum, Gin, Wine, Beer, Tequila, and more. Find your favorite beverages at Flame Beverage.",
  keywords: [
    "whisky category",
    "vodka selection",
    "rum varieties",
    "gin collection",
    "wine types",
    "beer brands",
    "tequila Nepal",
    "cognac brandy",
    "liquor categories",
  ],
  openGraph: {
    title: "Browse by Category | Flame Beverage",
    description: "Explore our diverse categories of premium spirits - Whisky, Vodka, Rum, Gin, Wine, Beer, Tequila, and more.",
    url: "/categories",
    type: "website",
  },
  alternates: {
    canonical: "/categories",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}




























































































