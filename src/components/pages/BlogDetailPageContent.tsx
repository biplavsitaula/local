"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Blog, blogService } from '@/services/blog.service';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

/* ───────────── Skeleton Loading ───────────── */
const BlogDetailSkeleton: React.FC = () => (
    <div className="min-h-screen bg-[#0b1120] text-white">
        <Header searchQuery="" onSearchChange={() => { }} hideSearch={true} />
        <main className="max-w-3xl mx-auto px-4 py-8">
            {/* Back link skeleton */}
            <div className="h-4 w-32 bg-white/5 rounded mb-6 animate-pulse" />

            {/* Image skeleton */}
            <div className="w-full aspect-[16/9] bg-white/5 rounded-xl mb-8 animate-pulse" />

            {/* Title skeleton */}
            <div className="h-8 w-3/4 bg-white/5 rounded mb-4 animate-pulse" />

            {/* Author & date skeleton */}
            <div className="flex items-center gap-6 mb-6">
                <div className="h-4 w-36 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-3 mb-8">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
            </div>

            {/* Ingredients card skeleton */}
            <div className="border border-white/10 rounded-xl p-6 mb-6">
                <div className="h-6 w-32 bg-white/5 rounded mb-5 animate-pulse" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Instructions card skeleton */}
            <div className="border border-white/10 rounded-xl p-6">
                <div className="h-6 w-32 bg-white/5 rounded mb-5 animate-pulse" />
                <div className="space-y-3">
                    <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                </div>
            </div>
        </main>
        <Footer />
    </div>
);

const BlogDetailPageContent: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await blogService.getById(id as string);
                setBlog(response.data);
            } catch (err: any) {
                setError(err?.message || 'Failed to load blog details');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    /* ── Loading state ── */
    if (loading) {
        return <BlogDetailSkeleton />;
    }

    /* ── Error state ── */
    if (error || !blog) {
        return (
            <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center p-4">
                <div className="text-[#f97316] text-6xl mb-6">!</div>
                <h2 className="text-2xl font-bold text-white mb-2">{error || "Blog not found"}</h2>
                <button onClick={() => router.back()} className="mt-6 flex items-center gap-2 text-[#f97316] hover:underline uppercase tracking-widest text-xs font-bold">
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    /* ── Derived data ── */
    const authorName = typeof blog.authorId === 'object' ? blog.authorId.fullName : 'Anonymous';
    const formattedDate = blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString("en-CA") // YYYY-MM-DD format
        : "Unknown Date";

    return (
        <div className="min-h-screen bg-[#0b1120] text-white">
            <Header searchQuery="" onSearchChange={() => { }} hideSearch={true} />

            <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
                {/* Back link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Recipes
                </Link>

                {/* Hero image – contained in a rounded card */}
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-8 border border-white/10">
                    <Image
                        src={blog.image || "/assets/image_not_found.png"}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-white">
                    {blog.title}
                </h1>

                {/* Author & Date */}
                <div className="flex items-center gap-5 text-sm text-gray-400 mb-6">
                    <span className="flex items-center gap-1.5">
                        <User size={14} className="text-gray-500" />
                        Mixologist {authorName}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-500" />
                        {formattedDate}
                    </span>
                </div>

                {/* Description / instructions intro */}
                <p className="text-gray-300 leading-relaxed mb-8 text-[15px]">
                    {blog.instructions.split('\n').filter(p => p.trim())[0] || blog.instructions}
                </p>

                {/* ── Ingredients Card ── */}
                <div className="border border-white/10 rounded-xl p-6 mb-6 bg-[#0f1629]">
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-5 text-white">
                        <span className="text-[#f97316]">🧪</span> Ingredients
                    </h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                        {blog.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] flex-shrink-0" />
                                {ing}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Instructions Card ── */}
                <div className="border border-white/10 rounded-xl p-6 bg-[#0f1629]">
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-5 text-white">
                        <span className="text-[#f97316]">📋</span> Instructions
                    </h2>
                    <div className="text-sm text-gray-300 leading-relaxed space-y-4">
                        {blog.instructions.split('\n').filter(p => p.trim()).map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2">
                        {blog.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-gray-400 hover:text-[#f97316] hover:border-[#f97316]/30 transition-colors cursor-pointer"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogDetailPageContent;
