"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/services/blog.service";
import { Calendar, User, ArrowRight, Clock, ChefHat } from "lucide-react";

const DEFAULT_IMAGE = "/assets/image_not_found.png";

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const [imgSrc, setImgSrc] = React.useState(blog.image || DEFAULT_IMAGE);
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
            src={imgSrc}
            alt={blog.title}
            fill
            className="object-cover object-top transition-all duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => {
              setImgSrc(DEFAULT_IMAGE);
            }}
          />

          {/* Stats Overlay (Left) */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-2 z-10">
            {blog.difficulty && (
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                <ChefHat size={12} className="text-primary" />
                <span>{blog.difficulty}</span>
              </div>
            )}
            {blog.timeTaken && (
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                <Clock size={12} className="text-primary" />
                <span>{blog.timeTaken}</span>
              </div>
            )}
          </div>

          {/* Category Overlay (Right) */}
          {blog.category && (
            <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 shadow-lg z-10">
              {blog.category}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col gap-2.5 flex-grow">
          <h3 className="line-clamp-2 font-display text-base sm:text-lg font-bold text-color-tertiary transition-colors duration-300">
            {blog.title}
          </h3>

          <p className="text-xs sm:text-sm text-color-muted line-clamp-2 leading-relaxed font-light text-justify flex-grow">
            {blog.instructions}
          </p>

          <div className="mt-3 flex items-center justify-between text-[10px] sm:text-xs text-color-muted font-medium">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-color-muted" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-color-muted" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex mt-3 pt-3 border-t border-border">
            <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-color-accent hover:text-primary transition-colors">
              Read More <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
