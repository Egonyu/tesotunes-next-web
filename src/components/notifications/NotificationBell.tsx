'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  Loader2,
  Heart,
  MessageCircle,
  UserPlus,
  Music,
  ShoppingBag,
  CreditCard,
  Megaphone,
  Repeat2,
  Trophy,
  Gift,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  ListMusic,
  Ticket,
  DollarSign,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount, useNotifications, useMarkAsRead, useRealtimeNotifications, type Notification } from '@/hooks/useNotifications';

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  repost: Repeat2,
  purchase: ShoppingBag,
  payment: CreditCard,
  announcement: Megaphone,
  music: Music,
  new_episode: PlayCircle,
  new_podcast: Music,
  ticket: Ticket,
  award_nomination: Trophy,
  referral_reward: Gift,
  song_approved: CheckCircle2,
  subscription_expiring: AlertTriangle,
  weekly_digest: Mail,
  playlist_share: ListMusic,
  tip: DollarSign,
};

function getNotificationIcon(type: Notification['type']): LucideIcon {
  return NOTIFICATION_ICONS[type] ?? Bell;
}

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
        <div className="absolute right-0 mt-2 w-80 max-h-112 overflow-y-auto rounded-xl border bg-popover shadow-lg z-50">
          <div className="sticky top-0 bg-popover border-b px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">Notifications</h3>
              <Link 
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {/* By-type unread badges */}
            {unreadData?.by_type && Object.keys(unreadData.by_type).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(unreadData.by_type)
                  .filter(([, count]) => count > 0)
                  .slice(0, 4)
                  .map(([type, count]) => {
                    const Icon = getNotificationIcon(type as Notification['type']);
                    return (
                      <span key={type} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-muted rounded-full">
                        <Icon className="h-3 w-3" />
                        {count}
                      </span>
                    );
                  })}
              </div>
            )}
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
              {notifications.map((notification) => {
                const TypeIcon = getNotificationIcon(notification.type);
                return (
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
                    <div className="relative shrink-0">
                      <Image
                        src={notification.actor.avatar_url}
                        alt={notification.actor.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-muted border">
                        <TypeIcon className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
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
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
