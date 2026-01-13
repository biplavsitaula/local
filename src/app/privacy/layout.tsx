import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Flame Beverage protects your privacy and handles your personal data. Our commitment to data security and transparency.",
  openGraph: {
    title: "Privacy Policy | Flame Beverage",
    description: "Learn how Flame Beverage protects your privacy and handles your personal data.",
    url: "/privacy",
    type: "website",
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
