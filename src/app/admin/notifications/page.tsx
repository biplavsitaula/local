"use client";

import { useState } from 'react';
import { Bell, CreditCard, ShoppingCart, AlertTriangle, Shield, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrderStore } from '@/hooks/useOrderStore';
import { NotificationType } from '@/types/notification';
import { cn } from '@/lib/utils';

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; label: string }> = {
  payment: { icon: CreditCard, color: 'text-green-500', label: 'Payments' },
  order: { icon: ShoppingCart, color: 'text-flame-orange', label: 'Orders' },
  'low-stock': { icon: AlertTriangle, color: 'text-yellow-500', label: 'Low Stock' },
  'super-admin': { icon: Shield, color: 'text-red-500', label: 'Super Admin' },
  general: { icon: Info, color: 'text-muted-foreground', label: 'General' },
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useOrderStore();
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const unreadCount = getUnreadCount();

  const filterByType = (type: NotificationType | 'all') => {
    if (type === 'all') return notifications;
    return notifications.filter((n) => n.type === type);
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
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const filteredNotifications = filterByType(selectedType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage and view all your notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={markAllNotificationsRead}
            className="gap-2 border-flame-orange/50 text-flame-orange hover:bg-flame-orange/10"
          >
            <Check className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="glass-card rounded-xl border border-border/50 overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as NotificationType | 'all')} className="w-full">
          <div className="p-4 border-b border-border/50">
            <TabsList className="w-full grid grid-cols-6 bg-secondary/50">
              <TabsTrigger value="all" className="text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-sm">
                <CreditCard className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="order" className="text-sm">
                <ShoppingCart className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="low-stock" className="text-sm">
                <AlertTriangle className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="super-admin" className="text-sm">
                <Shield className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="general" className="text-sm">
                <Info className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedType} className="m-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm mt-2">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredNotifications.map((notification) => {
                    const config = typeConfig[notification.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-secondary/50 cursor-pointer transition-colors",
                          !notification.read && "bg-secondary/30"
                        )}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div className="flex gap-4">
                          <div className={cn("mt-0.5 flex-shrink-0", config.color)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn(
                                "text-sm font-semibold text-foreground",
                                !notification.read && "text-flame-orange"
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-flame-orange rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
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


