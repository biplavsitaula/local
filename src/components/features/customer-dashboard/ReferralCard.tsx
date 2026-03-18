"use client";

import React, { useState, useEffect } from "react";
import { Gift, Loader2, CheckCircle2, Copy, Check, AlertCircle, X } from "lucide-react";
import { referralService, ReferralReward } from "@/services/referral.service";
import { customerDashboardService } from "@/services/customer-dashboard.service";
import { ReferralModal } from "./ReferralModal";

type CardState = "idle" | "loading" | "success" | "error";

export function ReferralCard() {
    const [state, setState] = useState<CardState>("idle");
    const [reward, setReward] = useState<ReferralReward | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Check if user already has a claimed reward on mount
    useEffect(() => {
        const checkExistingRewards = async () => {
            try {
                const res = await referralService.getRewards();
                const activeReward = res.data?.find(
                    (r) => r.status === "active" && new Date(r.expiresAt) > new Date()
                );
                if (activeReward) {
                    setReward({
                        type: activeReward.type,
                        value: activeReward.value,
                        rewardCode: activeReward.rewardCode,
                        expiresAt: activeReward.expiresAt,
                        appliesTo: activeReward.appliesTo,
                        status: activeReward.status,
                    });
                    setState("success");
                }
            } catch {
                // Silently fail — just show the default card
            }
        };
        checkExistingRewards();
    }, []);

    // Clear error message after 10 seconds
    useEffect(() => {
        if (state === "error") {
            const timer = setTimeout(() => {
                setState("idle");
                setErrorMsg("");
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    const handleClaim = async () => {
        setState("loading");
        setErrorMsg("");
        try {
            const dashboard = await customerDashboardService.getDashboard();
            const userId = dashboard.data.userId._id;
            const res = await referralService.claimReward(userId);
            setReward(res.reward);
            setState("success");
        } catch (err: any) {
            setErrorMsg(err?.message || "Unable to claim reward. Please try again.");
            setState("error");
        }
    };

    const handleCopyCode = async () => {
        if (!reward?.rewardCode) return;
        try {
            await navigator.clipboard.writeText(reward.rewardCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = reward.rewardCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatExpiry = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (!isVisible) return null;

    // ─── Success State: Show claimed reward ─────────────────────
    if (state === "success" && reward) {
        return (
            <>
                <div
                    className="relative overflow-hidden rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[180px]"
                    style={{
                        background: "linear-gradient(135deg, hsl(150 40% 8%) 0%, hsl(160 50% 14%) 50%, hsl(150 40% 8%) 100%)",
                        border: "1px solid hsl(160 50% 25% / 0.5)",
                    }}
                >
                    {/* Decorative glow */}
                    <div
                        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
                        style={{
                            background: "radial-gradient(circle, hsl(150 80% 45% / 0.6), transparent 70%)",
                        }}
                    />

                    {/* Close button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-4 right-4 p-1 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            <span className="text-xs uppercase tracking-widest text-white/50 font-medium">
                                Reward Claimed
                            </span>
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
                            {reward.value}% off your next purchase!
                        </h3>
                        <p className="text-white/40 text-xs mt-1">
                            Expires {formatExpiry(reward.expiresAt)}
                        </p>
                    </div>

                    {/* Reward code with copy button */}
                    <div className="relative z-10 mt-4">
                        <div
                            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg"
                            style={{
                                background: "hsl(160 30% 15% / 0.8)",
                                border: "1px solid hsl(160 50% 30% / 0.4)",
                            }}
                        >
                            <span className="font-mono text-sm font-bold tracking-wider text-emerald-300">
                                {reward.rewardCode}
                            </span>
                            <button
                                onClick={handleCopyCode}
                                className="p-1 rounded transition-all duration-200 hover:bg-white/10 cursor-pointer"
                                title="Copy code"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-emerald-400" />
                                ) : (
                                    <Copy className="h-4 w-4 text-white/50 hover:text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <ReferralModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </>
        );
    }

    // ─── Default / Loading / Error State ─────────────────────────
    return (
        <div
            className="relative overflow-hidden rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[180px]"
            style={{
                background: "linear-gradient(135deg, hsl(260 40% 12%) 0%, hsl(270 50% 18%) 50%, hsl(260 40% 12%) 100%)",
                border: "1px solid hsl(270 40% 25% / 0.5)",
            }}
        >
            {/* Decorative glow */}
            <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
                style={{
                    background: "radial-gradient(circle, hsl(25 95% 53% / 0.6), transparent 70%)",
                }}
            />

            {/* Close button */}
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Gift className="h-5 w-5 text-flame-orange" />
                    <span className="text-[11px] uppercase tracking-widest text-[#a39ba8] font-semibold">
                        Referral Reward
                    </span>
                </div>
                <h5 className="font-display text-xl sm:text-[24px] font-bold text-white leading-tight mb-2">
                    Get 10% off your next purchase!
                </h5>
                <p className="text-[#888192] text-sm">
                    Refer a friend &amp; both of you enjoy the rewards.
                </p>
            </div>

            <div className="relative z-10 mt-6 flex flex-col items-end gap-2 w-full">
                {/* Actions */}
                <div className="flex items-stretch gap-3 shrink-0 self-start">
                    <button
                        onClick={handleClaim}
                        disabled={state === "loading"}
                        className="w-[140px] h-[48px] rounded-xl text-sm font-semibold text-white cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-flame-orange/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex flex-col items-center justify-center leading-tight"
                        style={{
                            background: "linear-gradient(135deg, hsl(15 85% 55%), hsl(10 80% 50%))",
                            boxShadow: "0 4px 15px rgba(230, 80, 50, 0.2)",
                        }}
                    >
                        {state === "loading" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Claim Reward</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-[140px] h-[48px] rounded-xl text-sm font-semibold text-[#e88151] bg-[#231a31] hover:bg-[#2a1f3a] transition-colors border border-white/5 cursor-pointer flex flex-col items-center justify-center leading-tight"
                    >
                        <span>Refer a Friend</span>
                    </button>
                </div>

                {/* Error message */}
                {state === "error" && errorMsg && (
                    <div className="flex items-center gap-1.5 text-[#e25c5c] text-[11px] font-medium animate-in fade-in slide-in-from-top-1 duration-300 w-full justify-start whitespace-nowrap">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="leading-none">{errorMsg}</span>
                    </div>
                )}
            </div>

            <ReferralModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
