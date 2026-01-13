import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Flame Beverage - Nepal's trusted online liquor store. Over 10 years of experience, 5000+ happy customers, and a commitment to quality service.",
  keywords: [
    "about Flame Beverage",
    "liquor store Nepal",
    "online alcohol delivery",
    "trusted spirits dealer",
    "beverage company Nepal",
  ],
  openGraph: {
    title: "About Us | Flame Beverage",
    description: "Learn about Flame Beverage - Nepal's trusted online liquor store with over 10 years of experience.",
    url: "/about",
    type: "website",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
