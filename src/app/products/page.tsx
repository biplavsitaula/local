import { Metadata } from "next";
import ProductsPageContent from "@/components/pages/ProductsPageContent";
import { Providers } from "@/components/Providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our complete collection of premium spirits including whisky, vodka, rum, gin, wine, and more. Quality beverages with fast delivery in Kathmandu Valley.",
  keywords: [
    "buy whisky online Nepal",
    "vodka Nepal",
    "rum delivery Kathmandu",
    "gin online",
    "wine shop Nepal",
    "premium spirits",
    "beer delivery",
    "alcohol online Nepal",
  ],
  openGraph: {
    title: "All Products | Flame Beverage",
    description: "Browse our complete collection of premium spirits. Quality beverages with fast delivery in Kathmandu Valley.",
    url: "/products",
    type: "website",
  },
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsPage() {
  return (
    <Providers>
      <ProductsPageContent />
    </Providers>
  );
}
