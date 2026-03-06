import { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { CustomerDashboardLayout } from "@/components/features/customer-dashboard/CustomerDashboardLayout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "My Account - Flame Beverage",
    description: "Manage your account, view orders, track loyalty points, and explore your favorites.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function MyAccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers requireAgeVerification={false}>
            <CustomerDashboardLayout>{children}</CustomerDashboardLayout>
        </Providers>
    );
}
