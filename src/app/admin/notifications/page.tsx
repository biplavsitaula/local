"use client";


import { useState, useEffect, useCallback } from 'react';
import { Bell, CreditCard, ShoppingCart, AlertTriangle, Shield, Info, Check, Loader2, AlertCircle, Trash2, Settings, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notificationsService, Notification } from '@/services/notifications.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';


// API notification types
type ApiNotificationType = 'New Payment' | 'New Order' | 'Low Stock Alert' | 'Super Admin Update' | 'System Update';
type FilterType = 'all' | 'payment' | 'order' | 'low-stock' | 'super-admin' | 'system';


// Map API types to filter types
const apiTypeToFilterType: Record<string, FilterType> = {
 'New Payment': 'payment',
 'New Order': 'order',
 'Low Stock Alert': 'low-stock',
 'Super Admin Update': 'super-admin',
 'System Update': 'system',
};


// Config for each filter type
const typeConfig: Record<FilterType, { icon: typeof Bell; color: string; label: string; apiTypes: string[] }> = {
 all: { icon: Bell, color: 'text-muted-foreground', label: 'All', apiTypes: [] },
 payment: { icon: CreditCard, color: 'text-green-500', label: 'Payments', apiTypes: ['New Payment'] },
 order: { icon: ShoppingCart, color: 'text-flame-orange', label: 'Orders', apiTypes: ['New Order'] },
 'low-stock': { icon: AlertTriangle, color: 'text-yellow-500', label: 'Low Stock', apiTypes: ['Low Stock Alert'] },
 'super-admin': { icon: Shield, color: 'text-red-500', label: 'Admin', apiTypes: ['Super Admin Update'] },
 system: { icon: Settings, color: 'text-blue-500', label: 'System', apiTypes: ['System Update'] },
};


// Get icon config for a notification based on its API type
const getNotificationConfig = (apiType: string) => {
 const filterType = apiTypeToFilterType[apiType] || 'system';
 return typeConfig[filterType] || typeConfig.system;
};


export default function NotificationsPage() {
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [selectedType, setSelectedType] = useState<FilterType>('all');
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [showFilters, setShowFilters] = useState(false);
 const [filters, setFilters] = useState({
   readStatus: '',
   dateRange: '',
   search: '',
 });


 const fetchNotifications = useCallback(async () => {
   try {
     setLoading(true);
     setError(null);
    
     const notificationsRes = await notificationsService.getAll();


     // API returns: { success, message, data: [...], pagination, unreadCount }
     // The data is an array directly at response.data
     const responseData = notificationsRes.data;
     let notificationsList: Notification[] = [];
     let unread = 0;


     if (Array.isArray(responseData)) {
       // Response.data is the array directly
       notificationsList = responseData;
       // unreadCount is at the root level of the response
       unread = notificationsRes.unreadCount || 0;
     } else if (responseData && typeof responseData === 'object') {
       // Wrapped format: { notifications: [...], unreadCount: n }
       const wrapped = responseData as any;
       notificationsList = wrapped.notifications || [];
       unread = wrapped.unreadCount || 0;
     }


     setNotifications(notificationsList);
     setUnreadCount(unread);
   } catch (err: any) {
     setError(err.message || 'Failed to load notifications');
     console.error('Notifications error:', err);
   } finally {
     setLoading(false);
   }
 }, []);


 useEffect(() => {
   fetchNotifications();
 }, [fetchNotifications]);


 const handleMarkAsRead = async (id: string) => {
   try {
     await notificationsService.markAsRead(id);
     // Update local state
     setNotifications(prev =>
       prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n)
     );
     setUnreadCount(prev => Math.max(0, prev - 1));
     toast.success('Notification marked as read');
   } catch (err: any) {
     toast.error(err.message || 'Failed to mark notification as read');
   }
 };


 const handleMarkAllAsRead = async () => {
   try {
     await notificationsService.markAllAsRead();
     // Update local state
     setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
     setUnreadCount(0);
     toast.success('All notifications marked as read');
   } catch (err: any) {
     toast.error(err.message || 'Failed to mark all as read');
   }
 };


 const handleDelete = async (id: string, e: React.MouseEvent) => {
   e.stopPropagation();
   try {
     await notificationsService.delete(id);
     // Update local state
     const notification = notifications.find(n => n._id === id || n.id === id);
     setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
     if (notification && !notification.isRead) {
       setUnreadCount(prev => Math.max(0, prev - 1));
     }
     toast.success('Notification deleted');
   } catch (err: any) {
     toast.error(err.message || 'Failed to delete notification');
   }
 };


 // Filter notifications by selected type
 const filterByType = (type: FilterType): Notification[] => {
   if (type === 'all') return notifications;
   const config = typeConfig[type];
   if (!config) return notifications;
   return notifications.filter((n) => config.apiTypes.includes(n.type));
 };

 // Apply additional filters
 const applyFilters = (notificationsList: Notification[]): Notification[] => {
   let filtered = [...notificationsList];

   // Read status filter
   if (filters.readStatus) {
     if (filters.readStatus === 'read') {
       filtered = filtered.filter(n => n.isRead);
     } else if (filters.readStatus === 'unread') {
       filtered = filtered.filter(n => !n.isRead);
     }
   }

   // Search filter
   if (filters.search) {
     const query = filters.search.toLowerCase();
     filtered = filtered.filter(n => 
       (n.title || '').toLowerCase().includes(query) ||
       (n.message || '').toLowerCase().includes(query) ||
       (n.type || '').toLowerCase().includes(query)
     );
   }

   // Date range filter (last 7 days, 30 days, etc.)
   if (filters.dateRange) {
     const now = new Date();
     let cutoffDate = new Date();
     if (filters.dateRange === '7d') {
       cutoffDate.setDate(now.getDate() - 7);
     } else if (filters.dateRange === '30d') {
       cutoffDate.setDate(now.getDate() - 30);
     } else if (filters.dateRange === '90d') {
       cutoffDate.setDate(now.getDate() - 90);
     }
     filtered = filtered.filter(n => {
       const notificationDate = new Date(n.createdAt);
       return notificationDate >= cutoffDate;
     });
   }

   return filtered;
 };

 const clearFilters = () => {
   setFilters({
     readStatus: '',
     dateRange: '',
     search: '',
   });
 };

 const hasActiveFilters = filters.readStatus || filters.dateRange || filters.search;


 // Count notifications by type
 const getTypeCount = (type: FilterType): number => {
   if (type === 'all') return notifications.length;
   const config = typeConfig[type];
   if (!config) return 0;
   return notifications.filter((n) => config.apiTypes.includes(n.type)).length;
 };


 // Count unread by type
 const getUnreadByType = (type: FilterType): number => {
   const filtered = filterByType(type);
   return filtered.filter(n => !n.isRead).length;
 };


 const formatDate = (dateStr: string) => {
   const date = new Date(dateStr);
   const now = new Date();
   const diff = now.getTime() - date.getTime();
   const hours = Math.floor(diff / (1000 * 60 * 60));
   const days = Math.floor(hours / 24);
  
   if (hours < 1) return 'Just now';
   if (hours < 24) return `${hours}h ago`;
   if (days === 1) return 'Yesterday';
   if (days < 7) return `${days}d ago`;
   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 };


 const filteredNotifications = applyFilters(filterByType(selectedType));


 if (loading) {
   return (
     <div className="flex items-center justify-center min-h-[400px]">
       <div className="flex flex-col items-center gap-4">
         <Loader2 className="h-8 w-8 animate-spin text-flame-orange" />
         <p className="text-muted-foreground">Loading notifications...</p>
       </div>
     </div>
   );
 }


 if (error) {
   return (
     <div className="flex items-center justify-center min-h-[400px]">
       <div className="flex flex-col items-center gap-4 text-center">
         <AlertCircle className="h-8 w-8 text-destructive" />
         <div>
           <p className="text-lg font-semibold text-foreground mb-2">Error loading notifications</p>
           <p className="text-muted-foreground">{error}</p>
         </div>
         <Button onClick={fetchNotifications} variant="outline">
           Try Again
         </Button>
       </div>
     </div>
   );
 }


 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between opacity-0 animate-fade-in">
       <div>
         <h1 className="text-3xl font-display font-bold text-foreground">Notifications</h1>
         <p className="text-muted-foreground mt-1">
           Manage and view all your notifications ({notifications.length} total, {unreadCount} unread)
         </p>
       </div>
       <div className="flex items-center gap-2">
         {unreadCount > 0 && (
           <Button
             variant="outline"
             onClick={handleMarkAllAsRead}
             className="gap-2 border-flame-orange/50 text-flame-orange hover:bg-flame-orange/10"
           >
             <Check className="h-4 w-4" />
             Mark all read ({unreadCount})
           </Button>
         )}
         <Button
           onClick={() => setShowFilters(!showFilters)}
           variant="outline"
           className="gap-2 border-border"
         >
           <Filter className="h-4 w-4" />
           Filters
           {hasActiveFilters && (
             <span className="ml-1 h-2 w-2 bg-flame-orange rounded-full" />
           )}
         </Button>
       </div>
     </div>

     {/* Filter Panel */}
     {showFilters && (
       <div className="glass-card rounded-xl p-4 border border-border/50 space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: '50ms' }}>
         <div className="flex items-center justify-between mb-2">
           <h3 className="text-sm font-semibold text-foreground">Filter Notifications</h3>
           <div className="flex items-center gap-2">
             {hasActiveFilters && (
               <Button
                 onClick={clearFilters}
                 variant="ghost"
                 size="sm"
                 className="text-xs h-7"
               >
                 Clear All
               </Button>
             )}
             <Button
               onClick={() => setShowFilters(false)}
               variant="ghost"
               size="sm"
               className="h-7 w-7 p-0"
             >
               <X className="h-4 w-4" />
             </Button>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Read Status Filter */}
           <div className="space-y-2">
             <label className="text-xs font-medium text-foreground">Read Status</label>
             <Select
               value={filters.readStatus || 'all'}
               onValueChange={(value) => setFilters({ ...filters, readStatus: value === 'all' ? '' : value })}
             >
               <SelectTrigger className="bg-secondary/50 border-border">
                 <SelectValue placeholder="All notifications" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All notifications</SelectItem>
                 <SelectItem value="unread">Unread only</SelectItem>
                 <SelectItem value="read">Read only</SelectItem>
               </SelectContent>
             </Select>
           </div>

           {/* Date Range Filter */}
           <div className="space-y-2">
             <label className="text-xs font-medium text-foreground">Date Range</label>
             <Select
               value={filters.dateRange || 'all'}
               onValueChange={(value) => setFilters({ ...filters, dateRange: value === 'all' ? '' : value })}
             >
               <SelectTrigger className="bg-secondary/50 border-border">
                 <SelectValue placeholder="All time" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All time</SelectItem>
                 <SelectItem value="7d">Last 7 days</SelectItem>
                 <SelectItem value="30d">Last 30 days</SelectItem>
                 <SelectItem value="90d">Last 90 days</SelectItem>
               </SelectContent>
             </Select>
           </div>

           {/* Search Filter */}
           <div className="space-y-2">
             <label className="text-xs font-medium text-foreground">Search</label>
             <Input
               placeholder="Search notifications..."
               value={filters.search}
               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
               className="bg-secondary/50 border-border"
             />
           </div>
         </div>
       </div>
     )}


     <div className="glass-card rounded-xl border border-border/50 overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
       <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as FilterType)} className="w-full">
         <div className="p-4 border-b border-border/50">
           <TabsList className="w-full grid grid-cols-6 bg-secondary/50">
             <TabsTrigger value="all" className="text-sm gap-1" title="All Notifications">
               <Bell className="h-4 w-4" />
               <span className="hidden sm:inline">All</span>
               {getTypeCount('all') > 0 && (
                 <span className="ml-1 text-xs bg-secondary px-1.5 py-0.5 rounded-full">
                   {getTypeCount('all')}
                 </span>
               )}
             </TabsTrigger>
             <TabsTrigger value="payment" className="text-sm gap-1" title="Payments">
               <CreditCard className="h-4 w-4" />
               {getUnreadByType('payment') > 0 && (
                 <span className="w-2 h-2 bg-green-500 rounded-full" />
               )}
             </TabsTrigger>
             <TabsTrigger value="order" className="text-sm gap-1" title="Orders">
               <ShoppingCart className="h-4 w-4" />
               {getUnreadByType('order') > 0 && (
                 <span className="w-2 h-2 bg-flame-orange rounded-full" />
               )}
             </TabsTrigger>
             <TabsTrigger value="low-stock" className="text-sm gap-1" title="Low Stock Alerts">
               <AlertTriangle className="h-4 w-4" />
               {getUnreadByType('low-stock') > 0 && (
                 <span className="w-2 h-2 bg-yellow-500 rounded-full" />
               )}
             </TabsTrigger>
             <TabsTrigger value="super-admin" className="text-sm gap-1" title="Super Admin Updates">
               <Shield className="h-4 w-4" />
               {getUnreadByType('super-admin') > 0 && (
                 <span className="w-2 h-2 bg-red-500 rounded-full" />
               )}
             </TabsTrigger>
             <TabsTrigger value="system" className="text-sm gap-1" title="System Updates">
               <Settings className="h-4 w-4" />
               {getUnreadByType('system') > 0 && (
                 <span className="w-2 h-2 bg-blue-500 rounded-full" />
               )}
             </TabsTrigger>
           </TabsList>
         </div>


         <TabsContent value={selectedType} className="m-0">
           <ScrollArea className="h-[calc(100vh-300px)]">
             {filteredNotifications.length === 0 ? (
               <div className="p-12 text-center text-muted-foreground">
                 <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                 <p className="text-lg font-medium">No notifications</p>
                 <p className="text-sm mt-2">
                   {selectedType === 'all'
                     ? "You're all caught up!"
                     : `No ${typeConfig[selectedType]?.label || selectedType} notifications`}
                 </p>
               </div>
             ) : (
               <div className="divide-y divide-border/50">
                 {filteredNotifications.map((notification) => {
                   const config = getNotificationConfig(notification.type);
                   const Icon = config.icon;
                   const notificationId = notification._id || notification.id || '';
                   const isUnread = !notification.isRead;
                  
                   return (
                     <div
                       key={notificationId}
                       className={cn(
                         "p-4 hover:bg-secondary/50 cursor-pointer transition-colors",
                         isUnread && "bg-secondary/30"
                       )}
                       onClick={() => isUnread && handleMarkAsRead(notificationId)}
                     >
                       <div className="flex gap-4">
                         <div className={cn("mt-0.5 flex-shrink-0", config.color)}>
                           <Icon className="h-5 w-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between gap-2">
                             <div className="flex items-center gap-2">
                               <p className={cn(
                                 "text-sm font-semibold text-foreground",
                                 isUnread && "text-flame-orange"
                               )}>
                                 {notification.title}
                               </p>
                               <span className={cn(
                                 "text-xs px-2 py-0.5 rounded-full",
                                 config.color,
                                 "bg-secondary/50"
                               )}>
                                 {notification.type}
                               </span>
                             </div>
                             <div className="flex items-center gap-2">
                               {isUnread && (
                                 <span className="w-2 h-2 bg-flame-orange rounded-full flex-shrink-0" />
                               )}
                               <button
                                 onClick={(e) => handleDelete(notificationId, e)}
                                 className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                 title="Delete notification"
                               >
                                 <Trash2 className="h-4 w-4 text-destructive" />
                               </button>
                             </div>
                           </div>
                           <p className="text-sm text-muted-foreground mt-1">
                             {notification.message}
                           </p>
                           <div className="flex items-center gap-4 mt-2">
                             <p className="text-xs text-muted-foreground/70">
                               {formatDate(notification.createdAt)}
                             </p>
                             {(notification as any).priority && (
                               <span className={cn(
                                 "text-xs px-2 py-0.5 rounded-full",
                                 (notification as any).priority === 'high' && "bg-red-500/20 text-red-500",
                                 (notification as any).priority === 'medium' && "bg-yellow-500/20 text-yellow-500",
                                 (notification as any).priority === 'low' && "bg-blue-500/20 text-blue-500",
                               )}>
                                 {(notification as any).priority} priority
                               </span>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </ScrollArea>
         </TabsContent>
       </Tabs>
     </div>
   </div>
 );
}









