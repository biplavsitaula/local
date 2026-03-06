"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/services/auth.service";
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    Wine,
    MapPin,
    Settings,
    LogOut,
    X,
} from "lucide-react";

interface CustomerSidebarProps {
    user: User | null;
    onClose: () => void;
}

const navItems = [
    { label: "Dashboard", href: "/my-account", icon: LayoutDashboard },
    { label: "Recent Orders", href: "/my-account/orders", icon: ShoppingBag },
    { label: "Favourites", href: "/my-account/favourites", icon: Heart },
    { label: "My Cellar", href: "/my-account/cellar", icon: Wine },
    { label: "Addresses", href: "/my-account/addresses", icon: MapPin },
    { label: "Account Settings", href: "/my-account/settings", icon: Settings },
];

export function CustomerSidebar({ user, onClose }: CustomerSidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const isActive = (href: string) => {
        if (href === "/my-account") return pathname === "/my-account";
        return pathname.startsWith(href);
    };

    return (
        <aside className="customer-sidebar flex flex-col h-screen w-[260px] bg-[hsl(220,20%,8%)] border-r border-white/10">
            {/* Close button (mobile) */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
                <X className="h-5 w-5" />
            </button>

            {/* User Profile */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-flame-orange to-flame-red flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {getInitials(user?.fullName)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                            {user?.fullName || "User"}
                        </p>
                        <p className="text-white/40 text-xs truncate">
                            {user?.email || ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                    ? "bg-flame-orange/15 text-flame-orange"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-flame-orange" : "text-white/40 group-hover:text-white/70"
                                }`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="p-3 border-t border-white/10">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                    <LogOut className="h-[18px] w-[18px]" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
