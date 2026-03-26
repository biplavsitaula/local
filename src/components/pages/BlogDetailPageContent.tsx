"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Blog, blogService } from '@/services/blog.service';
import {
    ArrowLeft, Calendar, User, Clock, ChefHat, Users, Flame,
    ChevronDown, ChevronLeft, ChevronRight, Copy, Share2, Bookmark, Printer, Wine
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

/* ───────────── Accordion Item ───────────── */
interface AccordionItemProps {
    index: number;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ index, title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-border rounded-lg overflow-hidden transition-colors hover:border-primary/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer bg-card hover:bg-muted/30 transition-colors"
            >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex-shrink-0">
                    {index}
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground">{title}</span>
                <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-3.5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ───────────── Skeleton Loading ───────────── */
const BlogDetailSkeleton: React.FC = () => (
    <div className="min-h-screen bg-background text-foreground">
        <Header searchQuery="" onSearchChange={() => { }} hideSearch={true} />
        <main className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb skeleton */}
            <div className="h-4 w-64 bg-muted rounded mb-6 animate-pulse" />

            {/* Hero two-column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="aspect-[3/4] max-h-[540px] bg-muted rounded-xl animate-pulse" />
                <div className="flex flex-col gap-4 py-4">
                    <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="flex gap-3 mt-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Ingredients skeleton */}
            <div className="h-6 w-32 bg-muted rounded mb-4 animate-pulse" />
            <div className="space-y-3 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
                ))}
            </div>

            {/* Instructions skeleton */}
            <div className="h-6 w-32 bg-muted rounded mb-4 animate-pulse" />
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
                ))}
            </div>
        </main>
        <Footer />
    </div>
);

/* ───────────── Related Recipe Card ───────────── */
interface RelatedCardProps {
    blog: Blog;
}

const RelatedRecipeCard: React.FC<RelatedCardProps> = ({ blog }) => {
    const imageUrl = blog.image || "/assets/image_not_found.png";
    const authorName = typeof blog.authorId === "object" ? blog.authorId.fullName : "Anonymous";

    return (
        <Link href={`/blog/${blog._id}`} className="block flex-shrink-0 w-[220px] sm:w-[240px]">
            <div className="group relative flex flex-col h-[280px] cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <div className="relative h-[140px] w-full overflow-hidden bg-muted flex-shrink-0">
                    <Image
                        src={imageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        sizes="240px"
                    />
                    {blog.category && (
                        <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full border border-border">
                            {blog.category}
                        </span>
                    )}
                </div>
                <div className="p-3 flex flex-col gap-1.5 flex-grow overflow-hidden">
                    <h4 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {blog.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {blog.instructions}
                    </p>
                    <div className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <User size={11} />
                        <span className="truncate">{authorName}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

/* ═══════════════════════════════════════════════ */
/*              MAIN COMPONENT                     */
/* ═══════════════════════════════════════════════ */
const BlogDetailPageContent: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Related recipes
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Copy link feedback
    const [copied, setCopied] = useState(false);

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

    // Fetch related recipes once we have the blog
    useEffect(() => {
        const fetchRelated = async () => {
            if (!blog || !blog.category || !blog._id) return;
            try {
                setRelatedLoading(true);
                const response = await blogService.getRelated(blog.category, blog._id, 8);
                // Filter out the current blog from related results
                const filtered = response.data.filter(b => b._id !== blog._id);
                setRelatedBlogs(filtered);
            } catch {
                // Silently fail — related recipes are non-critical
            } finally {
                setRelatedLoading(false);
            }
        };
        fetchRelated();
    }, [blog]);

    /* ── Scroll helpers for Related Recipes ── */
    const scroll = useCallback((direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const scrollAmount = 260;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }, []);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: blog?.title || 'Recipe',
                url: window.location.href,
            }).catch(() => { });
        }
    };

    const handlePrint = () => {
        if (typeof window !== 'undefined') window.print();
    };

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
        ? new Date(blog.createdAt).toLocaleDateString("en-CA")
        : "Unknown Date";

    // Parse instructions into steps
    const instructionSteps = blog.instructions
        .split('\n')
        .filter(p => p.trim())
        .map(step => {
            // Try to extract a title from numbered steps like "1. Title: description"
            const match = step.match(/^(\d+[\.\)]\s*)?(.+?)(?::\s*(.+))?$/);
            if (match && match[3]) {
                return { title: match[2].trim(), detail: match[3].trim() };
            }
            // Truncate long text for the title
            const words = step.replace(/^\d+[\.\)]\s*/, '').split(' ');
            const title = words.slice(0, 5).join(' ') + (words.length > 5 ? '…' : '');
            return { title, detail: step.replace(/^\d+[\.\)]\s*/, '') };
        });

    const stats = [
        { icon: <Clock size={16} />, label: 'Prep Time', value: '5 Min' },
        { icon: <ChefHat size={16} />, label: 'Difficulty', value: 'Easy' },
        { icon: <Users size={16} />, label: 'Servings', value: '1 Drink' },
        { icon: <Flame size={16} />, label: 'Calories', value: '180 kcal' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header searchQuery="" onSearchChange={() => { }} hideSearch={true} />

            <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 pb-24">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-foreground transition-colors">Cocktail Recipes</Link>
                    <span>/</span>
                    <span className="text-foreground truncate max-w-[200px]">{blog.title}</span>
                </nav>

                {/* ═══════ TWO-COLUMN LAYOUT: Image Left, Content Right ═══════ */}
                <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 lg:gap-10 mb-12 lg:mb-16">
                    {/* Left — Sticky Image */}
                    <div className="lg:self-start lg:sticky lg:top-8">
                        <div className="relative w-full aspect-[3/4] max-h-[600px] rounded-xl overflow-hidden border border-border">
                            <Image
                                src={blog.image || "/assets/image_not_found.png"}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 45vw"
                            />
                        </div>
                    </div>

                    {/* Right — All Content */}
                    <div className="flex flex-col gap-6">
                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-display font-bold tracking-tight text-foreground leading-tight">
                            {blog.title}
                        </h1>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed text-[15px]">
                            {blog.instructions.split('\n').filter(p => p.trim())[0] || blog.instructions}
                        </p>

                        {/* Author & Date */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <User size={14} className="text-muted-foreground" />
                                Mixologist {authorName}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-muted-foreground" />
                                {formattedDate}
                            </span>
                        </div>

                        {/* Social / Action icons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyLink}
                                title={copied ? 'Copied!' : 'Copy link'}
                                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer"
                            >
                                <Copy size={15} className={copied ? 'text-primary' : 'text-muted-foreground'} />
                            </button>
                            <button
                                onClick={handleShare}
                                title="Share"
                                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer"
                            >
                                <Share2 size={15} className="text-muted-foreground" />
                            </button>
                            <button
                                title="Bookmark"
                                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer"
                            >
                                <Bookmark size={15} className="text-muted-foreground" />
                            </button>
                            <button
                                onClick={handlePrint}
                                title="Print"
                                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer"
                            >
                                <Printer size={15} className="text-muted-foreground" />
                            </button>
                        </div>

                        {/* Recipe Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-border bg-card text-center"
                                >
                                    <span className="text-primary">{stat.icon}</span>
                                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                                    <span className="text-sm font-bold text-foreground">{stat.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* ── INGREDIENTS ── */}
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                                    Ingredients
                                </h2>
                                <span className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
                                    oz / ml
                                </span>
                            </div>
                            <div className="space-y-2.5">
                                {blog.ingredients.map((ing, i) => (
                                    <AccordionItem key={i} index={i + 1} title={ing} defaultOpen={i === 0}>
                                        <p>{ing}</p>
                                    </AccordionItem>
                                ))}
                            </div>
                        </div>

                        {/* ── INSTRUCTIONS ── */}
                        <div className="mt-2">
                            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4">
                                Instructions
                            </h2>
                            <div className="space-y-2.5">
                                {instructionSteps.map((step, i) => (
                                    <AccordionItem key={i} index={i + 1} title={step.title} defaultOpen={i === 0}>
                                        <p>{step.detail}</p>
                                    </AccordionItem>
                                ))}
                            </div>
                        </div>

                        {/* ── RECOMMENDED GLASSWARE ── */}
                        <div className="mt-2">
                            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-3">
                                Recommended Glassware
                            </h2>
                            <div className="inline-flex items-center gap-3 border border-border rounded-xl bg-card px-5 py-3.5 hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                    <Wine size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Guide to Cocktail Glassware</p>
                                    <p className="text-xs text-muted-foreground">Find the perfect glass for your drink →</p>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
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
                    </div>
                </section>

                {/* ═══════ RELATED RECIPES ═══════ */}
                {(relatedBlogs.length > 0 || relatedLoading) && (
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                                Related Recipes
                            </h2>
                            {relatedBlogs.length > 4 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => scroll('left')}
                                        className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer"
                                        aria-label="Scroll left"
                                    >
                                        <ChevronLeft size={16} className="text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={() => scroll('right')}
                                        className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer"
                                        aria-label="Scroll right"
                                    >
                                        <ChevronRight size={16} className="text-muted-foreground" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {relatedLoading ? (
                            <div className="flex gap-4 overflow-hidden">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex-shrink-0 w-[240px] rounded-xl border border-border bg-card animate-pulse">
                                        <div className="aspect-[4/3] bg-muted rounded-t-xl" />
                                        <div className="p-3 space-y-2">
                                            <div className="h-4 w-3/4 bg-muted rounded" />
                                            <div className="h-3 w-full bg-muted rounded" />
                                            <div className="h-3 w-2/3 bg-muted rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                ref={scrollContainerRef}
                                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                                style={{ scrollbarWidth: 'thin' }}
                            >
                                {relatedBlogs.map(b => (
                                    <div key={b._id} className="snap-start">
                                        <RelatedRecipeCard blog={b} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogDetailPageContent;
