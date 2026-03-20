import { Metadata } from "next";
import BlogSubmitPageContent from "@/components/pages/BlogSubmitPageContent";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Submit Your Mixology | Flame Beverage",
  description: "Share your own spirits recipes and cocktail mixes with the Flame Beverage community. Submit your mixology blog today.",
};

export default function BlogSubmitPage() {
  return (
    <Providers>
      <BlogSubmitPageContent />
    </Providers>
  );
}
