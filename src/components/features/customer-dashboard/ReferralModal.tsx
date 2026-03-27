"use client";

import React, { useState } from "react";
import { X, Gift, Users, Star, Copy, Send, Check } from "lucide-react";
import { referralService } from "@/services/referral.service";

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    referralCode?: string;
}

export function ReferralModal({ isOpen, onClose, referralCode = "SPIRITS2026" }: ReferralModalProps) {
    const [friendName, setFriendName] = useState("");
    const [friendEmail, setFriendEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = referralCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!friendName || !friendEmail) return;

        setIsLoading(true);
        setStatus("idle");
        setErrorMsg("");

        try {
            await referralService.sendReferralInvite({ friendName, friendEmail });
            setStatus("success");
            
            // Dispatch a custom event to notify listeners (e.g. MyAccountPage) to update their state
            window.dispatchEvent(new CustomEvent("referralSuccess"));
            
            setFriendName("");
            setFriendEmail("");
            setTimeout(() => {
                setStatus("idle");
            }, 3000);
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err?.message || "Failed to send invitation. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div 
                className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                style={{
                    background: "#0f0b15",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer border border-white/5"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="px-6 pt-10 pb-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-[0_0_30px_rgba(255,100,50,0.3)]" style={{ background: "linear-gradient(135deg, hsl(35 95% 55%), hsl(15 90% 50%))" }}>
                        <Gift className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-2 tracking-wide" style={{ color: "#d1b480" }}>Flame Beverage</h2>
                    <p className="text-white/60 text-sm">
                        Create your account to get started
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-8 space-y-5">
                    
                    {/* Direct Invite form */}
                    <form onSubmit={handleSendInvite} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-white/80 mb-1.5">
                                Friend's Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter friend's full name"
                                value={friendName}
                                onChange={(e) => setFriendName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#16121e] border border-white/5 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-flame-orange/50 focus:border-flame-orange/50 transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-white/80 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="friend@flamebeverage.com"
                                value={friendEmail}
                                onChange={(e) => setFriendEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#16121e] border border-white/5 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-flame-orange/50 focus:border-flame-orange/50 transition-all text-sm"
                            />
                        </div>
                        
                        {status === "success" && (
                            <div className="text-xs text-emerald-400 text-center py-1">
                                Invitation sent successfully!
                            </div>
                        )}
                        {status === "error" && (
                            <div className="text-xs text-red-400 text-center py-1">
                                {errorMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl text-white font-semibold shadow-[0_4px_15px_rgba(255,100,50,0.3)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            style={{ backgroundImage: "linear-gradient(to right, hsl(15 90% 55%), hsl(35 95% 55%))" }}
                        >
                            <Send className="h-4 w-4" />
                            {isLoading ? "Sending..." : "Send Invitation"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
