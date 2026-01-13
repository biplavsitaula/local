import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Flame Beverage today! Create your account to access premium spirits, exclusive offers, and fast delivery in Kathmandu Valley. Must be 21+ years.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Create Account | Flame Beverage",
    description: "Join Flame Beverage today! Create your account to access premium spirits and exclusive offers.",
    url: "/register",
    type: "website",
  },
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
