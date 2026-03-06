"use client";

import React, { useEffect, useState } from "react";
import {
    customerDashboardService,
    DashboardOrder,
    DashboardOrderItem,
} from "@/services/customer-dashboard.service";
import {
    Loader2,
    AlertCircle,
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    Package,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Filter,
} from "lucide-react";
import Image from "next/image";

const DEFAULT_IMAGE = "/assets/image_not_found.png";

// ─── Status Config ──────────────────────────────────────────────
const STATUS_TABS = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "refunded", label: "Refunded" },
    { key: "rejected", label: "Rejected" },
] as const;

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    accepted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    processing: "bg-flame-orange/15 text-flame-orange border-flame-orange/30",
    shipped: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
    refunded: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

const statusIcons: Record<string, React.ElementType> = {
    pending: Clock,
    accepted: CheckCircle2,
    processing: RotateCcw,
    shipped: Truck,
    delivered: CheckCircle2,
    completed: CheckCircle2,
    cancelled: XCircle,
    refunded: RotateCcw,
    rejected: XCircle,
};

const paymentMethodLabels: Record<string, string> = {
    cod: "Cash on Delivery",
    online: "Online Payment",
    qr: "QR Payment",
    card: "Card Payment",
};

const paymentStatusColors: Record<string, string> = {
    paid: "text-emerald-400",
    pending: "text-yellow-400",
    failed: "text-red-400",
    refunded: "text-purple-400",
};

// ─── Order Detail Row ───────────────────────────────────────────
function OrderDetailRow({ order }: { order: DashboardOrder }) {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusClass = (status: string) =>
        statusColors[status.toLowerCase()] || "bg-gray-500/15 text-gray-400 border-gray-500/30";

    const StatusIcon = statusIcons[order.status.toLowerCase()] || Package;

    return (
        <div
            className="border border-white/[0.06] rounded-xl overflow-hidden transition-all duration-200"
            style={{ background: "hsl(220 20% 10%)" }}
        >
            {/* Order Summary Row */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
                {/* Status Icon */}
                <div
                    className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${getStatusClass(
                        order.status
                    )}`}
                >
                    <StatusIcon className="h-5 w-5" />
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                            #{order.billNumber}
                        </span>
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusClass(
                                order.status
                            )}`}
                        >
                            {order.status}
                        </span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                        {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                    </p>
                </div>

                {/* Items Preview */}
                <div className="hidden sm:flex -space-x-2 shrink-0">
                    {order.items.slice(0, 3).map((item, idx) => {
                        const imgUrl = item.productId?.imageUrl || DEFAULT_IMAGE;
                        const isExternal = imgUrl.startsWith("http");
                        return (
                            <div
                                key={idx}
                                className="h-8 w-8 rounded-full border-2 border-[hsl(220,20%,10%)] overflow-hidden bg-white/10 shrink-0"
                            >
                                <Image
                                    src={imgUrl}
                                    alt={item.name || "Product"}
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full"
                                    unoptimized={isExternal}
                                />
                            </div>
                        );
                    })}
                    {order.items.length > 3 && (
                        <div className="h-8 w-8 rounded-full border-2 border-[hsl(220,20%,10%)] bg-white/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-medium text-white/60">
                                +{order.items.length - 3}
                            </span>
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-white">
                        Rs. {order.totalAmount.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-white/30 mt-0.5">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Expand Arrow */}
                <div className="shrink-0 text-white/30">
                    {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </div>
            </button>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-white/[0.06] px-5 py-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                    {/* Order Meta */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Payment</p>
                            <p className="text-xs text-white/70">
                                {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                            </p>
                        </div>
                        {order.paymentGateway && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Gateway</p>
                                <p className="text-xs text-white/70 capitalize">{order.paymentGateway}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Payment Status</p>
                            <p className={`text-xs font-medium capitalize ${paymentStatusColors[order.paymentStatus] || "text-white/70"}`}>
                                {order.paymentStatus}
                            </p>
                        </div>
                        {order.customer?.location && (
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Delivery</p>
                                <p className="text-xs text-white/70">{order.customer.location}</p>
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Items</p>
                        <div className="space-y-2">
                            {order.items.map((item, idx) => {
                                const imgUrl = item.productId?.imageUrl || DEFAULT_IMAGE;
                                const isExternal = imgUrl.startsWith("http");
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03]"
                                    >
                                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
                                            <Image
                                                src={imgUrl}
                                                alt={item.name || "Product"}
                                                width={40}
                                                height={40}
                                                className="object-cover w-full h-full"
                                                unoptimized={isExternal}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-white/40">
                                                Rs. {item.price.toLocaleString()} × {item.quantity}
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold text-white shrink-0">
                                            Rs. {item.total.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-white/[0.06] pt-3 space-y-1.5">
                        {order.subtotal !== undefined && (
                            <div className="flex justify-between text-xs">
                                <span className="text-white/40">Subtotal</span>
                                <span className="text-white/70">Rs. {order.subtotal.toLocaleString()}</span>
                            </div>
                        )}
                        {order.deliveryFee !== undefined && (
                            <div className="flex justify-between text-xs">
                                <span className="text-white/40">Delivery Fee</span>
                                <span className={order.deliveryFee === 0 ? "text-emerald-400 font-medium" : "text-white/70"}>
                                    {order.deliveryFee === 0 ? "Free" : `Rs. ${order.deliveryFee.toLocaleString()}`}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-bold pt-1">
                            <span className="text-white/60">Total</span>
                            <span className="text-white">Rs. {order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function MyOrdersPage() {
    const [orders, setOrders] = useState<DashboardOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await customerDashboardService.getRecentOrders(50);
                setOrders(res.data || []);
            } catch (err: any) {
                setError(err?.message || "Failed to load orders");
                console.error("Orders fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders =
        activeTab === "all"
            ? orders
            : orders.filter((o) => o.status.toLowerCase() === activeTab);

    // Count per status for tab badges
    const statusCounts = orders.reduce((acc, o) => {
        const s = o.status.toLowerCase();
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
                    <p className="text-muted-foreground">Loading your orders...</p>
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
                            Error loading orders
                        </p>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-flame-orange/15 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-flame-orange" />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-bold text-foreground">
                            My Orders
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {orders.length} total order{orders.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div
                className="rounded-xl p-1 overflow-x-auto"
                style={{
                    background: "hsl(220 20% 8%)",
                    border: "1px solid hsl(0 0% 100% / 0.06)",
                }}
            >
                <div className="flex gap-1 min-w-max">
                    {STATUS_TABS.map((tab) => {
                        const count = tab.key === "all" ? orders.length : statusCounts[tab.key] || 0;
                        if (tab.key !== "all" && count === 0) return null;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${isActive
                                        ? "bg-flame-orange/15 text-flame-orange"
                                        : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                                    }`}
                            >
                                <Filter className="h-3 w-3" />
                                {tab.label}
                                <span
                                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive
                                            ? "bg-flame-orange/20 text-flame-orange"
                                            : "bg-white/[0.06] text-white/30"
                                        }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div
                    className="rounded-2xl p-12 text-center"
                    style={{
                        background: "hsl(220 20% 8%)",
                        border: "1px solid hsl(0 0% 100% / 0.06)",
                    }}
                >
                    <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40 text-sm">
                        {activeTab === "all"
                            ? "No orders yet. Start shopping to see your orders here!"
                            : `No ${activeTab} orders found.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((order) => (
                        <OrderDetailRow key={order._id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
