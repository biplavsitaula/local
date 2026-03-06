"use client";

import React from "react";
import { DashboardStats } from "@/services/customer-dashboard.service";
import { Trophy } from "lucide-react";

interface WelcomeBannerProps {
    userName: string;
    stats: DashboardStats;
    loyaltyPoints: number;
}

export function WelcomeBanner({ userName, stats, loyaltyPoints }: WelcomeBannerProps) {
    const firstName = userName?.split(" ")[0] || "User";

    return (
        <div className="customer-welcome-banner relative overflow-hidden rounded-2xl p-6 sm:p-8"
            style={{
                background: "linear-gradient(135deg, hsl(220 20% 10%) 0%, hsl(15 60% 15%) 50%, hsl(220 20% 10%) 100%)",
            }}
        >
            {/* Decorative ember dots */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(2px 2px at 20% 30%, hsl(25 95% 53% / 0.6), transparent),
            radial-gradient(2px 2px at 70% 60%, hsl(45 93% 47% / 0.5), transparent),
            radial-gradient(1.5px 1.5px at 40% 80%, hsl(0 72% 51% / 0.4), transparent),
            radial-gradient(1.5px 1.5px at 85% 20%, hsl(25 95% 53% / 0.5), transparent)`,
                    backgroundSize: "200px 100px",
                }}
            />

            <div className="relative z-10">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Welcome back, {firstName}!
                </h1>
                <p className="mt-2 text-white/60 text-sm sm:text-base">
                    You have <span className="text-flame-orange font-semibold">{loyaltyPoints.toLocaleString()}</span> points available to redeem.
                </p>

                {/* Tier Status */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-flame-gold" />
                        <span className="text-white/80 text-sm">
                            <span className="font-semibold text-flame-gold">{stats.membershipTier}</span> Tier Status
                        </span>
                    </div>

                    {/* Tier Progress Bar */}
                    <div className="flex items-center gap-3 flex-1 max-w-xs">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${Math.min(stats.tierProgress, 100)}%`,
                                    background: "linear-gradient(90deg, hsl(25 95% 53%), hsl(45 93% 47%))",
                                }}
                            />
                        </div>
                        <span className="text-xs text-white/50 tabular-nums shrink-0">
                            {stats.tierProgress}% to next tier
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
