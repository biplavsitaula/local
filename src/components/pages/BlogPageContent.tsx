"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Blog, blogService, BlogFilters } from '@/services/blog.service';
import { Search, Loader2, Plus, X, Martini } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const ITEMS_PER_PAGE = 9;

const BlogPageContent: React.FC = () => {
    const { t } = useLanguage();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Mixology Categories
    const categories = ['all', 'Cocktail', 'Mocktail', 'Whiskey Mix', 'Gin Mix', 'Vodka Mix', 'Others'];

    const fetchBlogs = useCallback(async (pageNum: number, append: boolean = false) => {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);

            const filters: BlogFilters = {
                page: pageNum,
                limit: ITEMS_PER_PAGE,
                search: searchQuery || undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                isApproved: true // Only show approved blogs to public
            };

            const response = await blogService.getAll(filters);

            if (append) {
                setBlogs(prev => [...prev, ...response.data]);
            } else {
                setBlogs(response.data);
            }

            const pagination = response.pagination;
            if (pagination) {
                setHasMore(pageNum < pagination.pages);
            } else {
                setHasMore(response.data.length === ITEMS_PER_PAGE);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch blogs');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchQuery, selectedCategory]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchBlogs(1, false);
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, fetchBlogs]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchBlogs(nextPage, true);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Header searchQuery="" onSearchChange={() => { }} />

            <main className="container mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Martini className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                                {t("blog")}
                            </h1>
                        </div>
                        <p className="text-gray-400 text-lg font-light">
                            Discover & share liquor-mixing recipes
                        </p>
                    </div>

                    <Link href="/blog/submit">
                        <button className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg shadow-orange-500/20 cursor-pointer">
                            <Plus size={20} />
                            Create Recipe
                        </button>
                    </Link>
                </div>

                {/* Search & Categories (Subtle) */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search classic and modern mixes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-light text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar scroll-smooth">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer border ${selectedCategory === cat
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading && page === 1 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white/5 rounded-3xl aspect-[4/5]" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                        <div className="text-primary text-4xl mb-6 font-bold">!</div>
                        <p className="text-white text-xl mb-4 font-bold tracking-tight">{error}</p>
                        <button onClick={() => fetchBlogs(1)} className="text-primary hover:underline font-semibold uppercase tracking-widest text-xs">Try Refreshing</button>
                    </div>
                ) : blogs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {blogs.map(blog => (
                                <BlogCard key={blog._id} blog={blog} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-20 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-16 py-5 border border-white/10 rounded-2xl text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white/5 hover:text-white transition-all disabled:opacity-50 cursor-pointer flex items-center gap-4 mx-auto group"
                                >
                                    {loadingMore ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>DISCOVER MORE <Plus size={16} className="group-hover:rotate-90 transition-transform" /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-40 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                        <div className="mb-6 text-7xl opacity-10 italic font-black tracking-tighter uppercase">No Mixes Found</div>
                        <p className="text-gray-500 font-light mb-10 max-w-md mx-auto leading-relaxed">We couldn't find any blogs matching your criteria. Try adjusting your search or category filters.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                            className="bg-white/10 px-10 py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogPageContent;
