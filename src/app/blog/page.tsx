import { Metadata } from "next";
import BlogPageContent from "@/components/pages/BlogPageContent";
import { Providers } from "@/components/Providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mixology Blog | Flame Beverage",
  description: "Discover premium spirits recipes, cocktail tips, and community-shared mixology blogs at Flame Beverage. Explore the best ways to enjoy your favorite liquors.",
  keywords: [
    "mixology blog",
    "cocktail recipes Nepal",
    "liquor mixes",
    "whiskey recipes",
    "gin cocktail ideas",
    "spirits community",
    "Flame Beverage blog",
  ],
  openGraph: {
    title: "Mixology Blog | Flame Beverage",
    description: "Discover premium spirits recipes and cocktail tips shared by our community.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <Providers>
      <BlogPageContent />
    </Providers>
  );
}
