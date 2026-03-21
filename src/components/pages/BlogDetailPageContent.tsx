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
    <div className="min-h-screen bg-background text-foreground">
        <Header searchQuery="" onSearchChange={() => { }} hideSearch={true} />
        <main className="max-w-3xl mx-auto px-4 py-8">
            {/* Back link skeleton */}
            <div className="h-4 w-32 bg-muted rounded mb-6 animate-pulse" />

            {/* Image skeleton */}
            <div className="w-full aspect-[16/9] bg-muted rounded-xl mb-8 animate-pulse" />

            {/* Title skeleton */}
            <div className="h-8 w-3/4 bg-muted rounded mb-4 animate-pulse" />

            {/* Author & date skeleton */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6">
                <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-3 mb-8">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>

            {/* Ingredients card skeleton */}
            <div className="border border-border rounded-xl p-6 mb-6 bg-card">
                <div className="h-6 w-32 bg-muted rounded mb-5 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Instructions card skeleton */}
            <div className="border border-border rounded-xl p-6 bg-card">
                <div className="h-6 w-32 bg-muted rounded mb-5 animate-pulse" />
                <div className="space-y-3">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
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
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="text-primary text-6xl mb-6">!</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{error || "Blog not found"}</h2>
                <button onClick={() => router.back()} className="mt-6 flex items-center gap-2 text-primary hover:underline uppercase tracking-widest text-xs font-bold">
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
        <div className="min-h-screen bg-background text-foreground">
            <Header searchQuery="" onSearchChange={() => { }} hideSearch={true} />

            <main className="max-w-3xl mx-auto px-4 py-6 md:py-8 pb-24">
                {/* Back link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Recipes
                </Link>

                {/* Hero image – contained in a rounded card */}
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-8 border border-border">
                    <Image
                        src={blog.image || "/assets/image_not_found.png"}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">
                    {blog.title}
                </h1>

                {/* Author & Date */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5">
                        <User size={14} className="text-muted-foreground" />
                        Mixologist {authorName}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-muted-foreground" />
                        {formattedDate}
                    </span>
                </div>

                {/* Description / instructions intro */}
                <p className="text-muted-foreground leading-relaxed mb-8 text-[15px]">
                    {blog.instructions.split('\n').filter(p => p.trim())[0] || blog.instructions}
                </p>

                {/* ── Ingredients Card ── */}
                <div className="border border-border rounded-xl p-4 sm:p-6 mb-6 bg-card">
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-5 text-foreground">
                        <span className="text-primary">🧪</span> Ingredients
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        {blog.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                {ing}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Instructions Card ── */}
                <div className="border border-border rounded-xl p-4 sm:p-6 bg-card">
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-5 text-foreground">
                        <span className="text-primary">📋</span> Instructions
                    </h2>
                    <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
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
                                className="bg-muted border border-border px-4 py-1.5 rounded-full text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
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
