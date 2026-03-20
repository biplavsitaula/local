"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogService } from '@/services/blog.service';
import { Flame, Plus, X, Loader2, ArrowLeft, Image as ImageIcon, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { toast } from 'sonner';

const BlogSubmitPageContent: React.FC = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        title: '',
        category: 'Cocktail',
        ingredients: [''],
        instructions: '',
        image: '',
        tags: ''
    });

    const categories = ['Cocktail', 'Mocktail', 'Whiskey Mix', 'Gin Mix', 'Vodka Mix', 'Others'];

    const handleAddIngredient = () => {
        setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
    };

    const handleIngredientChange = (index: number, value: string) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = value;
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleRemoveIngredient = (index: number) => {
        if (formData.ingredients.length === 1) return;
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Basic validation
        if (!formData.title || formData.ingredients.some(ing => !ing.trim()) || !formData.instructions) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                ingredients: formData.ingredients.filter(ing => ing.trim() !== '')
            };

            await blogService.create(payload);
            toast.success("Blog submitted successfully! It will be visible after admin approval.");
            router.push('/blog');
        } catch (err: any) {
            setError(err?.message || "Failed to submit blog. Please check if you are logged in.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Header searchQuery="" onSearchChange={() => {}} hideSearch={true} />

            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px] font-bold mb-6 group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Blog
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter italic mb-4">
                            SHARE YOUR <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">MIXOLOGY</span>
                        </h1>
                        <p className="text-gray-500 font-light text-lg">
                            Contribute your unique spirits recipes to the Flame community.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-white/40 mb-4">RECIPE TITLE *</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Enter a catchy name for your mix..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-primary/50 transition-all text-xl font-bold placeholder:font-light"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-white/40 mb-4">CATEGORY</label>
                                <div className="relative">
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-primary/50 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat} className="bg-[#111]">{cat}</option>)}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl">
                            <label className="block text-[11px] uppercase tracking-[0.4em] text-primary font-black mb-10 flex items-center gap-4">
                                <div className="w-8 h-px bg-primary/30" /> INGREDIENTS *
                            </label>
                            <div className="space-y-5">
                                {formData.ingredients.map((ing, i) => (
                                    <div key={i} className="flex gap-4 items-center group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/20 italic group-focus-within:text-primary group-focus-within:border-primary/20 transition-all">0{i+1}</div>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="e.g. 60ml London Dry Gin"
                                            value={ing}
                                            onChange={(e) => handleIngredientChange(i, e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-primary/30 transition-all text-base font-light"
                                        />
                                        {formData.ingredients.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveIngredient(i)}
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-600 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button 
                                type="button" 
                                onClick={handleAddIngredient}
                                className="mt-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-all cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center group-hover:border-white transition-all">
                                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                                </div>
                                Add Another Ingredient
                            </button>
                        </div>

                        {/* Instructions */}
                        <div>
                            <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-white/40 mb-6">PREPARATION METHOD *</label>
                            <textarea 
                                required
                                rows={10}
                                placeholder="Describe the steps to prepare your mixology... (e.g. Fill a shaker with ice, add spirits...)"
                                value={formData.instructions}
                                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-[3rem] p-10 focus:outline-none focus:border-primary/50 transition-all text-gray-300 font-light leading-relaxed text-xl"
                            ></textarea>
                            <p className="mt-5 text-[10px] text-gray-600 uppercase tracking-widest italic font-medium">Tip: Use line breaks for separate steps to make it easier to read.</p>
                        </div>

                        {/* Optional Fields: Image & Tags */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-white/40 mb-4 flex items-center gap-2">
                                    <ImageIcon size={12} /> IMAGE URL
                                </label>
                                <input 
                                    type="url"
                                    placeholder="https://example.com/drink-photo.jpg"
                                    value={formData.image}
                                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-primary/50 transition-all text-sm font-light"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-white/40 mb-4">TAGS (COMMA SEPARATED)</label>
                                <input 
                                    type="text"
                                    placeholder="classic, summer, refreshing, spicy..."
                                    value={formData.tags}
                                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-primary/50 transition-all text-sm font-light"
                                />
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-8 rounded-[2rem] bg-primary/10 border border-primary/20 text-primary text-sm font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-4">
                                <span className="text-2xl">!</span>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-12 flex flex-col md:flex-row gap-8 items-center border-t border-white/5">
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full md:w-auto flex items-center justify-center gap-5 bg-gradient-to-r from-primary to-orange-600 px-14 py-7 rounded-[2rem] text-white font-black text-sm uppercase tracking-[0.4em] hover:scale-[1.03] active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,80,80,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>SUBMIT RECIPE <Send size={22} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" /></>
                                )}
                            </button>
                            <div className="max-w-xs md:text-left text-center">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">
                                    FLAME COMMUNITY GUIDELINES
                                </p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                                    Submissions are reviewed for quality and appropriateness before going public.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogSubmitPageContent;
