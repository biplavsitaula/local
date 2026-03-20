"use client";

import React, { useState, useEffect } from 'react';
import { Blog, blogService } from '@/services/blog.service';
import { Loader2, Check, X, Trash2, Eye, Filter, Search, Clock } from 'lucide-react';
import { toast } from 'sonner';

const AdminBlogList: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');

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
        </div>
    );
};

export default AdminBlogList;
