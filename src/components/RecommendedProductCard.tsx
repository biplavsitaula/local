"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/types";
import Image from "next/image";

const DEFAULT_IMAGE = "/assets/image_not_found.png";

const getValidImageUrl = (product: Product | null | undefined): string => {
    if (!product) return DEFAULT_IMAGE;

    const imageUrl = product.image || product.imageUrl;

    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
        return DEFAULT_IMAGE;
    }

    return imageUrl.trim();
};

const isExternalUrl = (url: string): boolean => {
    return (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("data:")
    );
};

interface ProductCardProps {
    product: Product;
    onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onViewDetails,
}) => {
    const { language } = useLanguage();
    const imageUrl = getValidImageUrl(product);

    return (
        <div
            onClick={() => onViewDetails(product)}
            className="group relative flex flex-col h-full cursor-pointer bg-black overflow-hidden"
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={product?.name || "Product"}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized={isExternalUrl(imageUrl)}
                    priority
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                {/* Out of Stock indicator */}
                {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                        <span className="border border-white/40 px-4 py-1 text-[10px] uppercase tracking-[0.3em] text-white">
                            Out of stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center">
                <h3 className="font-serif text-xl md:text-2xl lg:text-3xl text-white font-medium tracking-tight leading-tight">
                    {language === "en" ? product?.name : product?.nameNe}
                </h3>

                {/* Sub-details */}
                <div className="mt-2 flex flex-col items-center gap-1 opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                        {product?.volume} • {product?.alcoholContent || product?.alcohol}
                    </p>

                    <p className="text-sm font-light text-white/90">
                        Rs. {product?.price?.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;