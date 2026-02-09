'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount, useNotifications, useMarkAsRead, useRealtimeNotifications, type Notification } from '@/hooks/useNotifications';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch unread count
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.total || 0;
  
  // Fetch latest notifications for dropdown
  const { data: notificationsData, isLoading } = useNotifications({ filter: 'all' });
  const notifications = (notificationsData?.data || []).slice(0, 5);
  
  // Mark as read mutation
  const markAsRead = useMarkAsRead();
  
  // Connect to real-time updates
  useRealtimeNotifications();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }
    setIsOpen(false);
  };
  
  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border bg-popover shadow-lg z-50">
          <div className="sticky top-0 bg-popover border-b px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Link 
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || '/notifications'}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'flex items-start gap-3 p-4 hover:bg-muted transition-colors',
                    !notification.read_at && 'bg-primary/5'
                  )}
                >
                  {notification.actor?.avatar_url ? (
                    <Image
                      src={notification.actor.avatar_url}
                      alt={notification.actor.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notification.created_at)}</p>
                  </div>
                  {!notification.read_at && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
