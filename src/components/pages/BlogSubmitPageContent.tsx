"use client";

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogService } from '@/services/blog.service';
import { X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

const BlogSubmitPageContent: React.FC = () => {
    const { t } = useLanguage();
    const router = useRouter();
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
                tags: []
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
        <div className="min-h-screen bg-[#0d0d12] text-white p-4 md:p-12 font-sans flex flex-col items-center">
            {/* Top Header */}
            <div className="w-full max-w-[1000px] flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🍹</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif tracking-wide">
                            Blog
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Discover & share liquor-mixing recipes
                    </p>
                </div>
                <Link href="/blog">
                    <button className="flex items-center gap-2 bg-[#ff7b42] hover:bg-[#e66a35] text-black px-4 md:px-5 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </Link>
            </div>

            {/* Main Form Container */}
            <div className="w-full max-w-[1000px] bg-[#16161e] border border-white/5 rounded-xl p-6 md:p-8 shadow-2xl">
                <h2 className="text-lg md:text-xl font-bold mb-8 text-white">
                    Create Recipe
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1: Title & Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Title *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Classic Mojito"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3.5 focus:outline-none focus:border-white/30 transition-colors text-sm text-gray-200 placeholder:text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Author Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="Your name"
                                value={formData.authorName}
                                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3.5 focus:outline-none focus:border-white/30 transition-colors text-sm text-gray-200 placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Row 2: Short Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">Short Description *</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Brief description of the cocktail..."
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3.5 focus:outline-none focus:border-white/30 transition-colors text-sm text-gray-200 placeholder:text-gray-600 resize-none"
                        />
                    </div>

                    {/* Row 3: Full Instructions */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">Full Instructions *</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="Step-by-step mixing instructions..."
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3.5 focus:outline-none focus:border-white/30 transition-colors text-sm text-gray-200 placeholder:text-gray-600 resize-none"
                        />
                    </div>

                    {/* Row 4: Ingredients & Image */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Ingredients *</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="e.g., 2 oz White Rum"
                                    value={currentIngredient}
                                    onChange={(e) => setCurrentIngredient(e.target.value)}
                                    className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3.5 focus:outline-none focus:border-white/30 transition-colors text-sm text-gray-200 placeholder:text-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddIngredient}
                                    className="bg-[#ffaa66] hover:bg-[#ff994d] text-black px-6 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Render added ingredients */}
                            {ingredients.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-[#1a1a24] border border-white/5 rounded px-3 py-2 text-sm text-gray-300">
                                            <span>{ing}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveIngredient(idx)}
                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Image (Upload or URL)</label>
                            
                            {imagePreview && (
                                <div className="relative w-full h-32 rounded-lg border border-white/10 overflow-hidden bg-[#050505] mb-2 flex items-center justify-center">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                                        onClick={handleRemoveImage}
                                    >
                                        <X size={14} className="text-white" />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 z-10">
                                    <ImageIcon size={16} />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={imagePreview?.startsWith('data:') ? '' : formData.image}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image: e.target.value });
                                        setImagePreview(e.target.value || null);
                                    }}
                                    disabled={Boolean(imagePreview?.startsWith('data:'))}
                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg pl-10 pr-4 py-3.5 focus:outline-none focus:border-white/30 transition-colors text-sm text-gray-200 placeholder:text-gray-600 disabled:opacity-50"
                                />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="bg-[#1a1a24] border border-white/10 hover:border-white/30 text-gray-300 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 min-w-[52px]"
                                    title="Upload image from computer"
                                >
                                    {uploadingImage ? (
                                        <Loader2 size={18} className="animate-spin text-[#ff7b42]" />
                                    ) : (
                                        <Upload size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-between pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#ff7b42] hover:bg-[#e66a35] text-black px-8 py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? 'Publishing...' : 'Publish Recipe'}
                        </button>
                        <Link href="/blog">
                            <button className="flex items-center gap-2 bg-[#ff7b42] hover:bg-[#e66a35] text-black px-4 md:px-5 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer">
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
