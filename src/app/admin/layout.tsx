import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin - Flame Beverage",
  },
  description: "Flame Beverage Admin Dashboard - Manage products, orders, inventory, and analytics.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
