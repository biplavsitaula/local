"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/services/blog.service";
import { Calendar, User } from "lucide-react";

const DEFAULT_IMAGE = "/assets/image_not_found.png";

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const imageUrl = blog.image || DEFAULT_IMAGE;
  const authorName = typeof blog.authorId === "object" ? blog.authorId.fullName : "Anonymous";
  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown Date";

  return (
    <Link href={`/blog/${blog._id}`}>
      <div className="group relative flex flex-col h-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(255,80,80,0.15)] bg-[#0d0d0d]">
        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_IMAGE;
            }}
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3 flex-grow bg-[#0d0d0d]">
          <h3 className="text-xl font-bold text-white transition-colors duration-300">
            {blog.title}
          </h3>

          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed font-light">
            {blog.instructions}
          </p>

          <div className="mt-4 flex items-center justify-between text-[12px] text-gray-500 font-medium">
             <div className="flex items-center gap-2">
              <User size={14} className="text-gray-500" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-500" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="inline-flex items-center gap-1 text-sm font-bold text-[#f97316] hover:text-[#ea580c] transition-colors">
              Read More <span className="text-lg">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
