"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Blog, blogService } from '@/services/blog.service';
import { Loader2, ArrowLeft, Calendar, User, Tag, Share2, Printer, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="mt-4 text-gray-500 uppercase tracking-widest text-[10px] font-bold transition-all animate-pulse">Brewing your story...</p>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
                <div className="text-primary text-6xl mb-6">!</div>
                <h2 className="text-2xl font-bold text-white mb-2">{error || "Blog not found"}</h2>
                <button onClick={() => router.back()} className="mt-6 flex items-center gap-2 text-primary hover:underline uppercase tracking-widest text-xs font-bold">
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    const authorName = typeof blog.authorId === 'object' ? blog.authorId.fullName : 'Anonymous';
    const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    }) : "Unknown Date";

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white">
            <Header searchQuery="" onSearchChange={() => {}} hideSearch={true} />

            <article className="pb-24">
                {/* Hero Header */}
                <div className="relative w-full h-[60vh] md:h-[75vh] min-h-[400px] overflow-hidden">
                    <Image 
                        src={blog.image || "/assets/image_not_found.png"} 
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                    
                    <div className="absolute inset-0 flex items-end">
                        <div className="container mx-auto px-4 pb-12 md:pb-20">
                            <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px] font-bold mb-8 group">
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Back to Mixology
                            </Link>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className="bg-primary/90 text-white text-[10px] font-bold uppercase tracking-[0.3em] px-5 py-2.5 rounded-full backdrop-blur-md shadow-2xl border border-white/10">
                                    {blog.category}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/50 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
                                    <Clock size={12} className="text-primary/70" />
                                    <span>5-10 MIN PREP</span>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-8xl font-display font-black leading-[1.1] max-w-5xl tracking-tighter italic text-white drop-shadow-2xl">
                                {blog.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 -translate-y-12 md:-translate-y-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-5 mb-12 pb-12 border-b border-white/5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary/20 italic">
                                    {authorName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Crafted By</p>
                                    <h4 className="font-bold text-white text-xl tracking-tight">{authorName}</h4>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <h5 className="text-[11px] uppercase tracking-[0.4em] text-primary font-black mb-8 flex items-center gap-4">
                                        <div className="w-6 h-px bg-primary/30" /> INGREDIENTS
                                    </h5>
                                    <ul className="space-y-6">
                                        {blog.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-start gap-4 group">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary group-hover:scale-125 transition-all shadow-[0_0_10px_rgba(255,80,80,0.5)] opacity-0 group-hover:opacity-100" />
                                                <span className="text-gray-400 font-light tracking-wide text-base group-hover:text-white transition-colors">{ing}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-10 border-t border-white/5">
                                     <div className="flex items-center justify-between">
                                        <div className="flex gap-3">
                                            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all cursor-pointer group">
                                                <Share2 size={18} className="group-hover:scale-110" />
                                            </button>
                                            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all cursor-pointer group">
                                                <Printer size={18} className="group-hover:scale-110" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{formattedDate}</p>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Instructions */}
                        <div className="lg:col-span-8 ps-0 lg:ps-8">
                            <div className="mb-16">
                                <h2 className="text-[11px] uppercase tracking-[0.6em] text-primary/70 font-black mb-14 flex items-center gap-6">
                                    <div className="h-px w-12 bg-primary/30" /> THE METHOD
                                </h2>
                                <div className="space-y-12">
                                    {blog.instructions.split('\n').filter(p => p.trim()).map((para, i) => (
                                        <div key={i} className="relative group pl-12 md:pl-16">
                                            <div className="absolute left-0 top-0 text-5xl md:text-7xl font-black text-white/5 select-none transition-all group-hover:text-primary/10 group-hover:-translate-y-2 italic">
                                                {i < 9 ? `0${i+1}` : i+1}
                                            </div>
                                            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light group-hover:text-gray-200 transition-colors">
                                                {para}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tags Section */}
                            <div className="mt-24 pt-10 border-t border-white/5 flex flex-wrap gap-3">
                                {blog.tags.map((tag, i) => (
                                    <span key={i} className="bg-white/5 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:bg-primary/20 hover:text-primary hover:border-primary/20 border border-transparent transition-all cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
};

export default BlogDetailPageContent;
