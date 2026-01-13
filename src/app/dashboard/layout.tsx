import { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { AdminLayoutWrapper } from "@/components/features/admin/AdminLayoutWrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Flame Beverage Admin Dashboard - View your orders, track deliveries, and manage your account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers requireAgeVerification={false}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </Providers>
  );
}
