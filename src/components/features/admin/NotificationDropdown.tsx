"use client";


import { useState, useEffect, useCallback } from 'react';
import { Bell, CreditCard, ShoppingCart, AlertTriangle, Shield, Settings, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationsService, Notification } from '@/services/notifications.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';


// Filter types for tabs
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


export function NotificationDropdown() {
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [loading, setLoading] = useState(true);
 const [isOpen, setIsOpen] = useState(false);


 const fetchNotifications = useCallback(async () => {
   try {
     setLoading(true);
     const response = await notificationsService.getAll();
    
     const responseData = response.data;
     let notificationsList: Notification[] = [];
     let unread = 0;


     if (Array.isArray(responseData)) {
       notificationsList = responseData;
       unread = response.unreadCount || 0;
     } else if (responseData && typeof responseData === 'object') {
       const wrapped = responseData as any;
       notificationsList = wrapped.notifications || [];
       unread = wrapped.unreadCount || 0;
     }

     // Deduplicate notifications based on ID and message
     const seen = new Set<string>();
     const uniqueNotifications = notificationsList.filter((n) => {
       const id = n._id || n.id || '';
       const uniqueKey = `${id}-${n.message}`;
       if (seen.has(uniqueKey)) return false;
       seen.add(uniqueKey);
       return true;
     });

     setNotifications(uniqueNotifications);
     setUnreadCount(unread);
   } catch (err) {
     console.error('Failed to fetch notifications:', err);
   } finally {
     setLoading(false);
   }
 }, []);


 // Fetch notifications when dropdown opens
 useEffect(() => {
   if (isOpen) {
     fetchNotifications();
   }
 }, [isOpen, fetchNotifications]);


 // Initial fetch for unread count
 useEffect(() => {
   fetchNotifications();
 }, [fetchNotifications]);


 const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
   e.stopPropagation();
   try {
     await notificationsService.markAsRead(id);
     setNotifications(prev =>
       prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n)
     );
     setUnreadCount(prev => Math.max(0, prev - 1));
   } catch (err: any) {
     toast.error(err.message || 'Failed to mark notification as read');
   }
 };


 const handleMarkAllAsRead = async (e: React.MouseEvent) => {
   e.stopPropagation();
   try {
     await notificationsService.markAllAsRead();
     setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
     setUnreadCount(0);
     toast.success('All notifications marked as read');
   } catch (err: any) {
     toast.error(err.message || 'Failed to mark all as read');
   }
 };


 const filterByType = (type: FilterType): Notification[] => {
   if (type === 'all') return notifications;
   const config = typeConfig[type];
   if (!config) return notifications;
   return notifications.filter((n) => config.apiTypes.includes(n.type));
 };


 const formatTime = (dateStr: string) => {
   const date = new Date(dateStr);
   const now = new Date();
   const diff = now.getTime() - date.getTime();
   
   // Handle invalid dates
   if (isNaN(date.getTime()) || diff < 0) {
     return 'Just now';
   }
   
   const seconds = Math.floor(diff / 1000);
   const minutes = Math.floor(seconds / 60);
   const hours = Math.floor(minutes / 60);
   const days = Math.floor(hours / 24);
  
   if (seconds < 60) return 'Just now';
   if (minutes < 60) return `${minutes}m ago`;
   if (hours < 24) return `${hours}h ago`;
   if (days === 1) return 'Yesterday';
   if (days < 7) return `${days}d ago`;
   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
 };


 return (
   <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
     <DropdownMenuTrigger asChild>
       <Button variant="ghost" size="icon" className="relative">
         <Bell className="h-5 w-5" />
         {unreadCount > 0 && (
           <span className="absolute -top-1 -right-1 w-5 h-5 bg-flame-red rounded-full text-xs flex items-center justify-center text-white font-medium">
             {unreadCount > 99 ? '99+' : unreadCount}
           </span>
         )}
       </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="end" className="w-[420px] p-0 bg-card border-border">
       <div className="flex items-center justify-between p-4 border-b border-border">
         <h3 className="font-semibold text-foreground">Notifications</h3>
         {unreadCount > 0 && (
           <Button
             variant="ghost"
             size="sm"
             onClick={handleMarkAllAsRead}
             className="text-xs text-flame-orange hover:text-flame-orange h-auto p-1"
           >
             <Check className="h-3 w-3 mr-1" />
             Mark all read
           </Button>
         )}
       </div>


       {loading ? (
         <div className="flex items-center justify-center p-8">
           <Loader2 className="h-6 w-6 animate-spin text-flame-orange" />
         </div>
       ) : (
         <Tabs defaultValue="all" className="w-full">
           <TabsList className="w-full grid grid-cols-6 bg-secondary/50 rounded-none">
             <TabsTrigger value="all" className="text-xs" title="All Notifications">All</TabsTrigger>
             <TabsTrigger value="payment" className="text-xs" title="Payments">
               <CreditCard className="h-3 w-3" />
             </TabsTrigger>
             <TabsTrigger value="order" className="text-xs" title="Orders">
               <ShoppingCart className="h-3 w-3" />
             </TabsTrigger>
             <TabsTrigger value="low-stock" className="text-xs" title="Low Stock Alerts">
               <AlertTriangle className="h-3 w-3" />
             </TabsTrigger>
             <TabsTrigger value="super-admin" className="text-xs" title="Super Admin Updates">
               <Shield className="h-3 w-3" />
             </TabsTrigger>
             <TabsTrigger value="system" className="text-xs" title="System Updates">
               <Settings className="h-3 w-3" />
             </TabsTrigger>
           </TabsList>


           {(['all', 'payment', 'order', 'low-stock', 'super-admin', 'system'] as const).map((tab) => (
             <TabsContent key={tab} value={tab} className="m-0">
               <ScrollArea className="h-[300px]">
                 {filterByType(tab).length === 0 ? (
                   <div className="p-8 text-center text-muted-foreground">
                     <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                     <p className="text-sm">No {tab === 'all' ? '' : typeConfig[tab]?.label.toLowerCase()} notifications</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-border">
                     {filterByType(tab).slice(0, 10).map((notification) => {
                       const config = getNotificationConfig(notification.type);
                       const Icon = config.icon;
                       const notificationId = notification._id || notification.id || '';
                       const isUnread = !notification.isRead;
                      
                       return (
                         <div
                           key={notificationId}
                           className={cn(
                             "p-3 hover:bg-secondary/50 cursor-pointer transition-colors",
                             isUnread && "bg-secondary/30"
                           )}
                           onClick={(e) => isUnread && handleMarkAsRead(notificationId, e)}
                         >
                           <div className="flex gap-3">
                             <div className={cn("mt-0.5", config.color)}>
                               <Icon className="h-4 w-4" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between gap-2">
                                 <p className={cn(
                                   "text-sm font-medium text-foreground truncate",
                                   isUnread && "text-flame-orange"
                                 )}>
                                   {notification.title}
                                 </p>
                                 {isUnread && (
                                   <span className="w-2 h-2 bg-flame-orange rounded-full flex-shrink-0" />
                                 )}
                               </div>
                               <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                 {notification.message}
                               </p>
                               <div className="flex items-center gap-2 mt-1">
                                 <p className="text-xs text-muted-foreground/70">
                                   {formatTime(notification.createdAt)}
                                 </p>
                                 {notification.priority && (
                                   <span className={cn(
                                     "text-[10px] px-1.5 py-0.5 rounded-full",
                                     notification.priority === 'high' && "bg-red-500/20 text-red-500",
                                     notification.priority === 'medium' && "bg-yellow-500/20 text-yellow-500",
                                     notification.priority === 'low' && "bg-blue-500/20 text-blue-500",
                                   )}>
                                     {notification.priority}
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
           ))}
         </Tabs>
       )}


       <div className="p-2 border-t border-border">
         <Link href="/admin/notifications" onClick={() => setIsOpen(false)}>
           <Button variant="ghost" className="w-full text-sm text-flame-orange hover:text-flame-orange hover:bg-flame-orange/10">
             View all notifications
           </Button>
         </Link>
       </div>
     </DropdownMenuContent>
   </DropdownMenu>
 );
}



