"use client";

import React from "react";
import { FavoriteProduct } from "@/services/customer-dashboard.service";
import { Star } from "lucide-react";
import Image from "next/image";

interface RecommendedProductsProps {
    products: FavoriteProduct[];
}

const DEFAULT_IMAGE = "/assets/image_not_found.png";

export function RecommendedProducts({ products }: RecommendedProductsProps) {
    if (!products || products.length === 0) return null;

    return (
        <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Recommended For You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 3).map((product) => {
                    const imgUrl = product.imageUrl || DEFAULT_IMAGE;
                    const isExternal = imgUrl.startsWith("http");

                    return (
                        <div
                            key={product._id}
                            className="group rounded-xl overflow-hidden border border-white/5 bg-bg-secondary transition-all duration-300 hover:border-flame-orange/30 hover:shadow-xl hover:shadow-flame-orange/5 cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative w-full overflow-hidden bg-white/5" style={{ paddingBottom: "100%" }}>
                                <Image
                                    src={imgUrl}
                                    alt={product.name || "Product"}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    unoptimized={isExternal}
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <p className="text-xs text-color-muted capitalize">{product.category}</p>
                                <h3 className="mt-1 line-clamp-1 font-display text-base font-bold text-color-tertiary">
                                    {product.name}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-3.5 w-3.5 ${i < Math.round(product.rating || 0)
                                                    ? "fill-flame-gold text-flame-gold"
                                                    : "text-white/20"
                                                }`}
                                        />
                                    ))}
                                    {product.reviewCount > 0 && (
                                        <span className="text-xs text-white/40 ml-1">
                                            ({product.reviewCount})
                                        </span>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-lg font-bold text-color-accent">
                                        Rs. {(product.finalPrice || product.price || 0).toLocaleString()}
                                    </span>
                                    {product.finalPrice && product.price > product.finalPrice && (
                                        <span className="text-sm text-color-muted line-through">
                                            Rs. {product.price.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
