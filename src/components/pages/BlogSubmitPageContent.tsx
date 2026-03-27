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
        image: '',
        timeTaken: '',
        difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
        totalCalories: '',
        servings: '',
        mixologistTips: ''
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
                authorName: formData.authorName,
                instructions: formData.shortDescription + '\n\n' + formData.instructions,
                ingredients: finalIngredients,
                image: formData.image,
                category: 'Cocktail', // Default since UI doesn't explicitly have it
                tags: [],
                authorId: user?._id,
                timeTaken: formData.timeTaken,
                difficulty: formData.difficulty,
                totalCalories: formData.totalCalories ? parseInt(formData.totalCalories) : undefined,
                servings: formData.servings ? parseInt(formData.servings) : undefined,
                mixologistTips: formData.mixologistTips
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
            <div className="w-full max-w-[1000px] flex items-start justify-between mb-12">
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
                    <button className="flex items-center gap-2 bg-gradient-to-br from-primary via-flame-orange to-flame-red text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-primary/20">
                        <X size={20} />
                        Cancel
                    </button>
                </Link>
            </div>

            {/* Main Form Container */}
            <div className="w-full max-w-[1000px] bg-card-purple border border-white/5 rounded-[1.5rem] p-8 md:p-12 shadow-2xl shadow-black/40">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-10">
                    Create Recipe
                </h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Row 1: Title & Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-400">Title *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Classic Mojito"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-400">Author Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="Your name"
                                value={formData.authorName}
                                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Row 2: Short Description */}
                    <div className="space-y-3">
                        <label className="block text-xs font-semibold text-gray-400">Short Description *</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Brief description of the cocktail..."
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700 resize-none"
                        />
                    </div>

                    {/* Row 3: Full Instructions */}
                    <div className="space-y-3">
                        <label className="block text-xs font-semibold text-gray-400">Full Instructions *</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="Step-by-step mixing instructions..."
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700 resize-none"
                        />
                    </div>

                    {/* Row 4: Additional Stats (Time, Difficulty, Calories, Servings) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-400">Time Taken</label>
                            <input
                                type="text"
                                placeholder="e.g., 5-10 minutes"
                                value={formData.timeTaken}
                                onChange={(e) => setFormData({ ...formData, timeTaken: e.target.value })}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-400">Difficulty</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-primary/50 transition-all text-base text-white appearance-none cursor-pointer"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-400">Total Calories</label>
                            <input
                                type="number"
                                placeholder="e.g., 180"
                                value={formData.totalCalories}
                                onChange={(e) => setFormData({ ...formData, totalCalories: e.target.value })}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-400">Servings</label>
                            <input
                                type="number"
                                placeholder="e.g., 1"
                                value={formData.servings}
                                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Row 5: Mixologist Tips */}
                    <div className="space-y-3">
                        <label className="block text-xs font-semibold text-gray-400">Mixologist Tips</label>
                        <textarea
                            rows={3}
                            placeholder="Pro tips for the perfect drink..."
                            value={formData.mixologistTips}
                            onChange={(e) => setFormData({ ...formData, mixologistTips: e.target.value })}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700 resize-none"
                        />
                    </div>

                    {/* Row 4: Ingredients & Image URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-400">Ingredients *</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="e.g., 2 oz White Rum"
                                    value={currentIngredient}
                                    onChange={(e) => setCurrentIngredient(e.target.value)}
                                    className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddIngredient}
                                    className="bg-primary/80 hover:bg-primary text-black px-5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/10 cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Render added ingredients */}
                            {ingredients.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300">
                                            <span>{ing}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveIngredient(idx)}
                                                className="text-gray-600 hover:text-red-400 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-400">Image URL (optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600">
                                    <ImageIcon size={18} />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={imagePreview?.startsWith('data:') ? '' : formData.image}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image: e.target.value });
                                        setImagePreview(e.target.value || null);
                                    }}
                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-12 pr-5 py-3 focus:outline-none focus:border-primary/50 transition-all text-base text-white placeholder:text-gray-700"
                                />
                            </div>

                            {/* Image Preview if available */}
                            {imagePreview && (
                                <div className="mt-4 relative group w-full h-32 rounded-xl border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all"
                                        onClick={handleRemoveImage}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex  justify-between flex-col sm:flex-row gap-4 sm:gap-6 pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto sm:min-w-[200px] bg-gradient-to-br from-primary via-flame-orange to-flame-red text-white py-2 px-4 rounded-xl font-black text-sm tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center min-h-[56px]"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Publishing...</span>
                                </div>
                            ) : 'Publish Recipe'}
                        </button>
                        <Link href="/blog" className="w-full sm:w-auto">
                            <button className="w-full sm:min-w-[160px] bg-gradient-to-br from-primary via-flame-orange to-flame-red text-white py-2 px-4 rounded-xl font-black text-sm tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2 min-h-[56px]">
                                Cancel
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogSubmitPageContent;
