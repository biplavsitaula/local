"use client";

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogService } from '@/services/blog.service';
import { X, Image as ImageIcon, Upload, Loader2, Martini } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

const BlogSubmitPageContent: React.FC = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Ingredients state array
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [currentIngredient, setCurrentIngredient] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        authorName: '',
        shortDescription: '',
        instructions: '',
        image: ''
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploadingImage(true);

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setFormData(prev => ({ ...prev, image: base64String }));
                setUploadingImage(false);
            };
            reader.onerror = () => {
                toast.error('Failed to read image file');
                setUploadingImage(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            toast.error('Failed to process image');
            setUploadingImage(false);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddIngredient = () => {
        if (currentIngredient.trim()) {
            setIngredients([...ingredients, currentIngredient.trim()]);
            setCurrentIngredient('');
        }
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.shortDescription || !formData.instructions) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // If they typed an ingredient but didn't hit Add, include it
        const finalIngredients = [...ingredients];
        if (currentIngredient.trim()) {
            finalIngredients.push(currentIngredient.trim());
        }

        if (finalIngredients.length === 0) {
            toast.error("Please add at least one ingredient.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                title: formData.title,
                instructions: formData.shortDescription + '\n\n' + formData.instructions,
                ingredients: finalIngredients,
                image: formData.image,
                category: 'Cocktail', // Default since UI doesn't explicitly have it
                tags: [],
                authorId: user?._id
            };

            await blogService.create(payload);
            toast.success("Blog submitted successfully!");
            router.push('/blog');
        } catch (err: any) {
            toast.error(err?.message || "Failed to submit blog. Please check if you are logged in.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-12 font-sans flex flex-col items-center">
            {/* Top Header */}
            <div className="w-full max-w-[1000px] flex items-center justify-between mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Martini className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                            {t("blog")}
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg font-light">
                        Discover & share liquor-mixing recipes
                    </p>
                </div>
                <Link href="/blog">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md">
                        <X size={20} />
                    </button>
                </Link>
            </div>

            {/* Main Form Container */}
            <div className="w-full max-w-[1000px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-8 w-1.5 bg-gradient-to-b from-primary to-flame-red rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
                        Create Recipe
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Row 1: Title & Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-4">Title *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Classic Mojito"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-base text-white placeholder:text-gray-700"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-4">Author Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="Your name"
                                value={formData.authorName}
                                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-base text-white placeholder:text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Row 2: Short Description */}
                    <div className="space-y-3">
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-4">Short Description *</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Brief description of the cocktail..."
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-base text-white placeholder:text-gray-700 resize-none min-h-[120px]"
                        />
                    </div>

                    {/* Row 3: Full Instructions */}
                    <div className="space-y-3">
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-4">Full Instructions *</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="Step-by-step mixing instructions..."
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-base text-white placeholder:text-gray-700 resize-none min-h-[200px]"
                        />
                    </div>

                    {/* Row 4: Ingredients & Image */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-4">Ingredients *</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="e.g., 2 oz White Rum"
                                    value={currentIngredient}
                                    onChange={(e) => setCurrentIngredient(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddIngredient}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Render added ingredients */}
                            {ingredients.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {ingredients.map((ing, idx) => (
                                        <div key={idx} className="group flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 transition-all hover:border-primary/30 hover:bg-primary/5">
                                            <span>{ing}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveIngredient(idx)}
                                                className="text-gray-600 hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 ml-4">Image (Upload or URL)</label>
                            
                            {imagePreview && (
                                <div className="relative group w-full h-48 rounded-2xl border border-white/10 overflow-hidden bg-black/40 mb-4 flex items-center justify-center">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all hover:scale-110"
                                            onClick={handleRemoveImage}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!imagePreview && (
                                <div 
                                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                                    className={`w-full h-48 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-4 transition-all group mb-4 ${uploadingImage ? 'cursor-wait' : 'cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02]'}`}
                                >
                                    <div className={`p-4 bg-white/5 rounded-2xl transition-colors ${!uploadingImage && 'group-hover:bg-primary/10'}`}>
                                        {uploadingImage ? (
                                            <Loader2 size={24} className="animate-spin text-primary" />
                                        ) : (
                                            <Upload size={24} className="text-gray-500 group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 group-hover:text-gray-400">
                                        {uploadingImage ? 'Processing image...' : 'Click to upload or drag image'}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 relative">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-500 z-10 transition-colors group-focus-within:text-primary">
                                    <ImageIcon size={18} />
                                </div>
                                <input
                                    type="url"
                                    placeholder="Or paste image URL here..."
                                    value={imagePreview?.startsWith('data:') ? '' : formData.image}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image: e.target.value });
                                        setImagePreview(e.target.value || null);
                                    }}
                                    disabled={Boolean(imagePreview?.startsWith('data:'))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700 disabled:opacity-50"
                                />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
                        <Link href="/blog" className="order-2 sm:order-1">
                            <button className="text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors py-2 px-4">
                                Cancel & Return
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-br from-primary via-flame-orange to-flame-red text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Publishing...</span>
                                </div>
                            ) : 'Publish Recipe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogSubmitPageContent;
