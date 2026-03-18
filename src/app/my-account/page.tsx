"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    customerDashboardService,
    CustomerDashboard,
} from "@/services/customer-dashboard.service";
import { WelcomeBanner } from "@/components/features/customer-dashboard/WelcomeBanner";
import { ReferralCard } from "@/components/features/customer-dashboard/ReferralCard";
import { RecentOrdersTable } from "@/components/features/customer-dashboard/RecentOrdersTable";
import { RecommendedProducts } from "@/components/features/customer-dashboard/RecommendedProducts";
import { Loader2, AlertCircle } from "lucide-react";

export default function MyAccountPage() {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async (silent = false) => {
            try {
                if (!silent) setLoading(true);
                if (!silent) setError(null);
                const res = await customerDashboardService.getDashboard();
                setDashboard(res.data);
            } catch (err: any) {
                if (!silent) setError(err?.message || "Failed to load dashboard data");
                console.error("Dashboard error:", err);
            } finally {
                if (!silent) setLoading(false);
            }
        };

        fetchDashboard();

        const handleReferralSuccess = () => {
            fetchDashboard(true);
        };
        window.addEventListener("referralSuccess", handleReferralSuccess);

        return () => {
            window.removeEventListener("referralSuccess", handleReferralSuccess);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
                    <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <div>
                        <p className="text-lg font-semibold text-foreground mb-2">
                            Error loading dashboard
                        </p>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const stats = dashboard?.stats || {
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        membershipTier: "Bronze",
        tierProgress: 0,
    };

    return (
        <div className="space-y-6">
            {/* Row 1: Welcome Banner + Referral Card */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <WelcomeBanner
                        userName={user?.fullName || dashboard?.userId?.fullName || "User"}
                        stats={stats}
                        loyaltyPoints={dashboard?.loyaltyPoints || 0}
                    />
                </div>
                <div className="lg:col-span-2">
                    <ReferralCard />
                </div>
            </div>

            {/* Row 2: Recent Orders */}
            <RecentOrdersTable orders={dashboard?.recentOrders || []} />

            {/* Row 3: Recommended Products */}
            <RecommendedProducts products={dashboard?.favoriteProducts || []} />
        </div>
    );
}
