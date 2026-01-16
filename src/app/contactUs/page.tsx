import { Metadata } from "next";
import ContactUsPageContent from "@/components/pages/ContactUsPageContent";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Contact Us | Flame Beverage",
  description: "Get in touch with Flame Beverage. Contact us for inquiries, feedback, or business partnerships. Visit our store in Thamel, Kathmandu.",
  keywords: [
    "contact Flame Beverage",
    "Flame Beverage Kathmandu",
    "beverage store Nepal",
    "Thamel liquor store",
    "contact us",
  ],
  openGraph: {
    title: "Contact Us | Flame Beverage",
    description: "Get in touch with Flame Beverage. We're here to help with your inquiries.",
    url: "/contactUs",
    type: "website",
  },
};

export default function ContactUsPage() {
  return (
    <Providers>
      <ContactUsPageContent />
    </Providers>
  );
}
