import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Flame Beverage account to access exclusive deals, track orders, and enjoy a personalized shopping experience.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Login | Flame Beverage",
    description: "Sign in to your Flame Beverage account to access exclusive deals and track orders.",
    url: "/login",
    type: "website",
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
