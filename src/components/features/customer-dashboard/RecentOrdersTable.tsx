"use client";

import React from "react";
import { DashboardOrder } from "@/services/customer-dashboard.service";
import { Eye } from "lucide-react";
import Image from "next/image";

interface RecentOrdersTableProps {
    orders: DashboardOrder[];
}

const statusColors: Record<string, string> = {
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    processing: "bg-flame-orange/15 text-flame-orange border-flame-orange/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    shipped: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

const DEFAULT_IMAGE = "/assets/image_not_found.png";

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getStatusClass = (status: string) => {
        return statusColors[status.toLowerCase()] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
    };

    return (
        <div className="rounded-2xl overflow-hidden"
            style={{
                background: "hsl(220 20% 8%)",
                border: "1px solid hsl(0 0% 100% / 0.08)",
            }}
        >
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/8">
                            <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                                Order ID
                            </th>
                            <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                                Date
                            </th>
                            <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                                Items
                            </th>
                            <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                                Total
                            </th>
                            <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                                Status
                            </th>
                            <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-12 text-center text-white/40 text-sm">
                                    No orders yet. Start shopping to see your orders here!
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr
                                    key={order._id}
                                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                                >
                                    {/* Order ID */}
                                    <td className="px-5 py-4">
                                        <span className="text-sm font-medium text-white">
                                            #{order.billNumber}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-5 py-4">
                                        <span className="text-sm text-white/60">
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </td>

                                    {/* Items - Product Thumbnails */}
                                    <td className="px-5 py-4">
                                        <div className="flex -space-x-2">
                                            {order.items.slice(0, 3).map((item, idx) => {
                                                const imgUrl = item.productId?.imageUrl || DEFAULT_IMAGE;
                                                const isExternal = imgUrl.startsWith("http");
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="h-8 w-8 rounded-full border-2 border-[hsl(220,20%,8%)] overflow-hidden bg-white/10 shrink-0"
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
                                                <div className="h-8 w-8 rounded-full border-2 border-[hsl(220,20%,8%)] bg-white/10 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-medium text-white/60">
                                                        +{order.items.length - 3}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Total */}
                                    <td className="px-5 py-4">
                                        <span className="text-sm font-semibold text-white">
                                            Rs. {order.totalAmount.toLocaleString()}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(
                                                order.status
                                            )}`}
                                        >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>

                                    {/* Action */}
                                    <td className="px-5 py-4">
                                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
