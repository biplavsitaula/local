import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the terms and conditions for using Flame Beverage. Important information about age requirements, ordering, delivery, and our policies.",
  openGraph: {
    title: "Terms & Conditions | Flame Beverage",
    description: "Read the terms and conditions for using Flame Beverage services.",
    url: "/terms",
    type: "website",
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
