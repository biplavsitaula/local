"use client";

import { useState } from 'react';
import { Bell, CreditCard, ShoppingCart, AlertTriangle, Shield, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export function NotificationDropdown() {
  const { notifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useOrderStore();
  const unreadCount = getUnreadCount();

  const filterByType = (type: NotificationType | 'all') => {
    if (type === 'all') return notifications;
    return notifications.filter((n) => n.type === type);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-flame-red rounded-full text-xs flex items-center justify-center text-white font-medium">
              {unreadCount}
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
              onClick={(e) => {
                e.stopPropagation();
                markAllNotificationsRead();
              }}
              className="text-xs text-flame-orange hover:text-flame-orange h-auto p-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-6 bg-secondary/50 rounded-none">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">
              <CreditCard className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="order" className="text-xs">
              <ShoppingCart className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="low-stock" className="text-xs">
              <AlertTriangle className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="super-admin" className="text-xs">
              <Shield className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs">
              <Info className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>

          {(['all', 'payment', 'order', 'low-stock', 'super-admin', 'general'] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="m-0">
              <ScrollArea className="h-[300px]">
                {filterByType(tab).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filterByType(tab).map((notification) => {
                      const config = typeConfig[notification.type];
                      const Icon = config.icon;
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-3 hover:bg-secondary/50 cursor-pointer transition-colors",
                            !notification.read && "bg-secondary/30"
                          )}
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div className={cn("mt-0.5", config.color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={cn(
                                  "text-sm font-medium text-foreground truncate",
                                  !notification.read && "text-flame-orange"
                                )}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-flame-orange rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                {formatTime(notification.createdAt)}
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
          ))}
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

