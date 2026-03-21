"use client";

import React, { useState, useEffect } from 'react';
import { Blog, blogService } from '@/services/blog.service';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Check, X, Trash2, Eye, Filter, Search, Clock, Edit, Image as ImageIcon, Upload, Plus, AlertCircle, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AdminBlogList: React.FC = () => {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [sortKey, setSortKey] = useState<'title' | 'category' | 'createdAt'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
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
        image: '',
        authorName: ''
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
            let data = response.data || [];
            
            // Local Sorting
            data = data.sort((a: any, b: any) => {
                const dir = sortDir === 'asc' ? 1 : -1;
                if (sortKey === 'title') return dir * (a.title || '').localeCompare(b.title || '');
                if (sortKey === 'category') return dir * (a.category || '').localeCompare(b.category || '');
                if (sortKey === 'createdAt') return dir * (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                return 0;
            });

            setBlogs(data);
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
    }, [statusFilter, searchQuery, sortKey, sortDir]);

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
        setModalMode('edit');
        setEditingBlog(blog);
        setFormData({
            title: blog.title || '',
            category: blog.category || 'Cocktail',
            instructions: blog.instructions || '',
            image: blog.image || '',
            authorName: blog.authorName || ''
        });
        setIngredients(blog.ingredients || []);
        setCurrentIngredient('');
        setImagePreview(blog.image || null);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setModalMode('add');
        setEditingBlog(null);
        setFormData({
            title: '',
            category: 'Cocktail',
            instructions: '',
            image: '',
            authorName: ''
        });
        setIngredients([]);
        setCurrentIngredient('');
        setImagePreview(null);
        setIsModalOpen(true);
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

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                category: formData.category || 'Cocktail',
                instructions: formData.instructions,
                ingredients: finalIngredients,
                image: formData.image,
                authorName: formData.authorName,
                authorId: user?._id || user?.id
            };
            
            if (modalMode === 'edit' && editingBlog?._id) {
                await blogService.update(editingBlog._id, payload);
                toast.success("Blog updated successfully!");
            } else {
                await blogService.create(payload);
                toast.success("Blog created successfully!");
            }
            
            setIsModalOpen(false);
            fetchBlogs();
        } catch (err: any) {
            toast.error(err?.message || `Failed to ${modalMode} blog`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleSort = (key: typeof sortKey) => {
        if (key === sortKey) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Blog Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage and moderate blog posts and recipes.</p>
                </div>
                
                <Button 
                    onClick={handleAddClick}
                    className="bg-primary hover:bg-primary/90 text-white gap-2 w-full sm:w-auto"
                >
                    <Plus size={18} />
                    Create Recipe
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by title or category..."
                        className="pl-10 bg-secondary/50 border-border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    <select 
                        className="flex-1 sm:flex-none bg-secondary/50 border border-border rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground min-w-[140px] appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading blogs...</p>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-xl border border-border/50 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-0">
                            <thead>
                                <tr className="border-b border-border/50 bg-secondary/30">
                                    <th className="p-4 text-sm font-semibold text-foreground">
                                        <button onClick={() => handleSort('title')} className="flex items-center gap-2 hover:text-primary transition-colors">
                                            Composition Title
                                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                                        </button>
                                    </th>
                                    <th className="p-4 text-sm font-semibold text-foreground hidden lg:table-cell">Contributor</th>
                                    <th className="p-4 text-sm font-semibold text-foreground hidden sm:table-cell">
                                        <button onClick={() => handleSort('category')} className="flex items-center gap-2 hover:text-primary transition-colors">
                                            Genre
                                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                                        </button>
                                    </th>
                                    <th className="p-4 text-sm font-semibold text-foreground">Current Status</th>
                                    <th className="p-4 text-sm font-semibold text-foreground hidden md:table-cell">
                                        <button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 hover:text-primary transition-colors">
                                            Date Added
                                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                                        </button>
                                    </th>
                                    <th className="p-4 text-sm font-semibold text-foreground text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {blogs.length > 0 ? blogs.map(blog => {
                                    const author = blog.authorName || (typeof blog.authorId === 'object' ? blog.authorId.fullName : 'Unknown Contributor');
                                    return (
                                        <tr key={blog._id} className="hover:bg-muted/30 transition-colors group border-b border-border/30">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0 border border-border/50">
                                                        <img 
                                                            src={blog.image || "/assets/image_not_found.png"} 
                                                            alt="" 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <span className="font-medium text-foreground">{blog.title}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-muted-foreground hidden lg:table-cell">{author}</td>
                                            <td className="p-4 hidden sm:table-cell">
                                                <span className="bg-secondary/50 px-2 py-1 rounded-full text-[10px] font-medium text-foreground capitalize border border-border/50">
                                                    {blog.category}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {blog.isApproved ? (
                                                    <span className="text-[10px] px-2 py-1 rounded-full bg-success/20 text-success font-medium">
                                                        Approved
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] px-2 py-1 rounded-full bg-warning/20 text-warning font-medium">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-muted-foreground text-xs hidden md:table-cell">
                                                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <a href={`/blog/${blog._id}`} target="_blank" rel="noopener noreferrer" 
                                                       className="p-2 hover:bg-secondary/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                                       title="View Blog">
                                                        <Eye size={18} />
                                                    </a>
                                                    <button onClick={() => handleEditClick(blog)} 
                                                            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                                            title="Edit Blog">
                                                        <Edit size={18} />
                                                    </button>
                                                    {!blog.isApproved ? (
                                                        <button onClick={() => handleApprove(blog._id!, true)} 
                                                                className="p-2 hover:bg-success/10 rounded-lg transition-colors text-success"
                                                                title="Approve Blog">
                                                            <Check size={18} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleApprove(blog._id!, false)} 
                                                                className="p-2 hover:bg-warning/10 rounded-lg transition-colors text-warning"
                                                                title="Reject Blog">
                                                            <X size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(blog._id!)} 
                                                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                                                            title="Delete Blog">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No blogs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl glass-card">
                        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-bold text-foreground tracking-tight">{modalMode === 'edit' ? 'Edit Recipe' : 'Create Recipe'}</h2>
                                <p className="text-xs text-muted-foreground mt-1">{modalMode === 'edit' ? 'Update composition details' : 'Add new composition'}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-muted-foreground">
                                <X size={16} />
                            </Button>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="p-4 md:p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Title *</label>
                                    <Input 
                                        type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="bg-secondary/30 border-border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Author Name</label>
                                    <Input 
                                        type="text" value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})}
                                        className="bg-secondary/30 border-border"
                                        placeholder="Enter author name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Category</label>
                                    <Input 
                                        type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                        className="bg-secondary/30 border-border"
                                        placeholder="e.g. Cocktail, Mocktail"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-2">Full Instructions *</label>
                                <textarea 
                                    required rows={6} value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}
                                    className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-sm text-foreground resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-start">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Ingredients</label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="text" value={currentIngredient} onChange={e => setCurrentIngredient(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                                            className="bg-secondary/30 border-border"
                                            placeholder="Add ingredient..."
                                        />
                                        <Button type="button" onClick={handleAddIngredient} variant="secondary">Add</Button>
                                    </div>
                                    {ingredients.length > 0 && (
                                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {ingredients.map((ing, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-secondary/30 border border-border/50 rounded px-3 py-2 text-sm text-muted-foreground group">
                                                    <span>{ing}</span>
                                                    <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Image</label>
                                    {imagePreview && (
                                        <div className="relative w-full h-32 rounded-lg border border-border overflow-hidden bg-secondary/30 mb-3 flex items-center justify-center group">
                                            <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                                            <button type="button" className="absolute top-2 right-2 p-1.5 bg-destructive/80 hover:bg-destructive rounded-md transition-colors opacity-0 group-hover:opacity-100" onClick={handleRemoveImage}>
                                                <X size={14} className="text-white" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex gap-2 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground"><ImageIcon size={16} /></div>
                                        <Input 
                                            type="url" placeholder="Image URL..." value={imagePreview?.startsWith('data:') ? '' : formData.image}
                                            onChange={e => { setFormData({...formData, image: e.target.value}); setImagePreview(e.target.value || null); }}
                                            disabled={Boolean(imagePreview?.startsWith('data:'))}
                                            className="pl-10 bg-secondary/30 border-border"
                                        />
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                        <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} variant="outline" size="icon" className="min-w-[40px]">
                                            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-background pb-2">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editLoading} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                                    {editLoading ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : (modalMode === 'edit' ? 'Save Changes' : 'Create Recipe')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogList;
