"use client";

import React, { useState, useEffect } from 'react';
import { Blog, blogService } from '@/services/blog.service';
import { Loader2, Check, X, Trash2, Eye, Filter, Search, Clock, Edit, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

const AdminBlogList: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [currentIngredient, setCurrentIngredient] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        instructions: '',
        image: ''
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (statusFilter !== 'all') {
                filters.isApproved = statusFilter === 'approved';
            }
            if (searchQuery) {
                filters.search = searchQuery;
            }
            
            const response = await blogService.getAll(filters);
            setBlogs(response.data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBlogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [statusFilter, searchQuery]);

    const handleApprove = async (id: string, approve: boolean) => {
        try {
            await blogService.approve(id, approve);
            toast.success(`Blog ${approve ? "approved" : "rejected"} successfully`);
            fetchBlogs();
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            await blogService.delete(id);
            toast.success("Blog deleted successfully");
            fetchBlogs();
        } catch (error: any) {
            toast.error(error.message || "Delete failed");
        }
    };

    const handleEditClick = (blog: Blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title || '',
            category: blog.category || 'Cocktail',
            instructions: blog.instructions || '',
            image: blog.image || ''
        });
        setIngredients(blog.ingredients || []);
        setCurrentIngredient('');
        setImagePreview(blog.image || null);
        setIsEditModalOpen(true);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
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
            reader.readAsDataURL(file);
        } catch (err) {
            toast.error('Failed to process image');
            setUploadingImage(false);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
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

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlog?._id) return;

        if (!formData.title || !formData.instructions) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const finalIngredients = [...ingredients];
        if (currentIngredient.trim()) {
            finalIngredients.push(currentIngredient.trim());
        }

        setEditLoading(true);
        try {
            const payload = {
                title: formData.title,
                category: formData.category,
                instructions: formData.instructions,
                ingredients: finalIngredients,
                image: formData.image
            };
            await blogService.update(editingBlog._id, payload);
            toast.success("Blog updated successfully!");
            setIsEditModalOpen(false);
            fetchBlogs();
        } catch (err: any) {
            toast.error(err?.message || "Failed to update blog");
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">MANAGE MIXOLOGY</h1>
                    <p className="text-gray-500 text-sm font-light mt-1 uppercase tracking-widest">Recipe Moderation & Control</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by title or category..."
                            className="bg-[#0a0a0a] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary w-full md:w-72 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="bg-[#0a0a0a] border border-white/5 rounded-xl py-3 px-6 text-sm focus:outline-none focus:border-primary font-bold uppercase tracking-widest text-gray-400 appearance-none cursor-pointer pr-10"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")'}}
                    >
                        <option value="all">Status: All</option>
                        <option value="pending">Status: Pending</option>
                        <option value="approved">Status: Approved</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-[#0a0a0a]/50 border border-white/5 rounded-[2rem]">
                    <Loader2 className="animate-spin text-primary mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">Scanning Archive...</p>
                </div>
            ) : (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-white/[0.02] border-b border-white/5 text-gray-500 uppercase text-[10px] font-black tracking-[0.3em]">
                                <tr>
                                    <th className="px-8 py-6">Composition Title</th>
                                    <th className="px-8 py-6">Contributor</th>
                                    <th className="px-8 py-6">Genre</th>
                                    <th className="px-8 py-6">Current Status</th>
                                    <th className="px-8 py-6">Date Added</th>
                                    <th className="px-8 py-6 text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {blogs.length > 0 ? blogs.map(blog => {
                                    const author = typeof blog.authorId === 'object' ? blog.authorId.fullName : 'Unknown Contributor';
                                    return (
                                        <tr key={blog._id} className="hover:bg-white/[0.01] transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/5">
                                                        <img 
                                                            src={blog.image || "/assets/image_not_found.png"} 
                                                            alt="" 
                                                            className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    </div>
                                                    <span className="font-bold text-white tracking-tight text-base">{blog.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-gray-400 font-light">{author}</td>
                                            <td className="px-8 py-6">
                                                <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-primary transition-colors">{blog.category}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {blog.isApproved ? (
                                                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> Approved
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" /> Pending review
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-gray-600 text-xs">
                                                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <a href={`/blog/${blog._id}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all">
                                                        <Eye size={18} />
                                                    </a>
                                                    <button onClick={() => handleEditClick(blog)} className="w-10 h-10 rounded-xl bg-blue-900/10 border border-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
                                                        <Edit size={18} />
                                                    </button>
                                                    {!blog.isApproved ? (
                                                        <button onClick={() => handleApprove(blog._id!, true)} className="w-10 h-10 rounded-xl bg-green-900/10 border border-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all cursor-pointer">
                                                            <Check size={18} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleApprove(blog._id!, false)} className="w-10 h-10 rounded-xl bg-amber-900/10 border border-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all cursor-pointer">
                                                            <X size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(blog._id!)} className="w-10 h-10 rounded-xl bg-red-900/10 border border-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-32 text-center">
                                            <div className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">No Data in Archive</div>
                                            <button onClick={() => {setStatusFilter('all'); setSearchQuery('');}} className="text-primary hover:underline text-[10px] font-black uppercase tracking-widest">Clear Constraints</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#16161e] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-[#16161e] border-b border-white/10 p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Edit Recipe</h2>
                                <p className="text-xs text-gray-500 mt-1">Update composition detials</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-2">Title *</label>
                                    <input 
                                        type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm text-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-2">Category</label>
                                    <input 
                                        type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm text-gray-200"
                                        placeholder="e.g. Cocktail, Mocktail"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-2">Full Instructions *</label>
                                <textarea 
                                    required rows={6} value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}
                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm text-gray-200 resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-2">Ingredients</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" value={currentIngredient} onChange={e => setCurrentIngredient(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                                            className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm text-gray-200"
                                            placeholder="Add ingredient..."
                                        />
                                        <button type="button" onClick={handleAddIngredient} className="bg-white/10 hover:bg-white/20 px-4 rounded-lg font-medium text-sm transition-colors text-white">Add</button>
                                    </div>
                                    {ingredients.length > 0 && (
                                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {ingredients.map((ing, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-[#0a0a0f] border border-white/5 rounded px-3 py-2 text-sm text-gray-300 group">
                                                    <span>{ing}</span>
                                                    <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-2">Image</label>
                                    {imagePreview && (
                                        <div className="relative w-full h-32 rounded-lg border border-white/10 overflow-hidden bg-[#0a0a0f] mb-3 flex items-center justify-center group">
                                            <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                                            <button type="button" className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-md transition-colors opacity-0 group-hover:opacity-100" onClick={handleRemoveImage}>
                                                <X size={14} className="text-white" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex gap-2 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500"><ImageIcon size={16} /></div>
                                        <input 
                                            type="url" placeholder="Image URL..." value={imagePreview?.startsWith('data:') ? '' : formData.image}
                                            onChange={e => { setFormData({...formData, image: e.target.value}); setImagePreview(e.target.value || null); }}
                                            disabled={Boolean(imagePreview?.startsWith('data:'))}
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm text-gray-200 disabled:opacity-50"
                                        />
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 px-4 rounded-lg flex items-center justify-center transition-colors min-w-[50px]">
                                            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#16161e] pb-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-lg font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editLoading} className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                                    {editLoading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogList;
