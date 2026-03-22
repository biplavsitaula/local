"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/services/blog.service";
import { Calendar, User, ArrowRight } from "lucide-react";

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
      <div className="group relative flex flex-col h-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card-purple transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            className="object-cover object-top transition-all duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_IMAGE;
            }}
          />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 flex-grow">
          <h3 className="line-clamp-2 font-display text-lg sm:text-lg md:text-xl font-bold text-color-tertiary transition-colors duration-300">
            {blog.title}
          </h3>

          <p className="text-sm text-color-muted line-clamp-2 leading-relaxed font-light text-justify flex-grow">
            {blog.instructions}
          </p>

          <div className="mt-4 flex items-center justify-between text-xs sm:text-xs text-color-muted font-medium">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-color-muted" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-color-muted" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex mt-4 pt-4 border-t border-border">
            <div className="inline-flex items-center gap-1 text-sm font-bold text-color-accent hover:text-primary transition-colors">
              Read More <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
