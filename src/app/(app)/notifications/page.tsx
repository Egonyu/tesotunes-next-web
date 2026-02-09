'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  Music,
  ShoppingBag,
  CreditCard,
  Megaphone,
  Trash2,
  Settings,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationsWithRealtime, type Notification } from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsWithRealtime({ filter });
  
  const typeConfig = {
    like: { icon: Heart, color: 'text-red-500 bg-red-100 dark:bg-red-950' },
    comment: { icon: MessageCircle, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950' },
    follow: { icon: UserPlus, color: 'text-green-500 bg-green-100 dark:bg-green-950' },
    repost: { icon: Repeat2, color: 'text-green-500 bg-green-100 dark:bg-green-950' },
    purchase: { icon: ShoppingBag, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950' },
    payment: { icon: CreditCard, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950' },
    announcement: { icon: Megaphone, color: 'text-orange-500 bg-orange-100 dark:bg-orange-950' },
    music: { icon: Music, color: 'text-primary bg-primary/10' },
  };
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="container py-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
              {unreadCount}
            </span>
          )}
          {/* Real-time connection indicator */}
          <div 
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
              isConnected 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-muted text-muted-foreground'
            )}
            title={isConnected ? 'Real-time updates active' : 'Connecting...'}
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-muted rounded-lg"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
          <Link
            href="/settings/notifications"
            className="p-2 hover:bg-muted rounded-lg"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            filter === 'unread'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>
      
      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden divide-y">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.announcement;
            const Icon = config.icon;
            const isRead = !!notification.read_at;
            
            return (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors',
                  !isRead && 'bg-primary/5'
                )}
              >
                {/* Icon or Avatar */}
                {notification.actor ? (
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                      {notification.actor.avatar_url ? (
                        <Image
                          src={notification.actor.avatar_url}
                          alt={notification.actor.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-lg font-medium">
                          {notification.actor.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      'absolute -bottom-1 -right-1 p-1 rounded-full',
                      config.color
                    )}>
                      <Icon className="h-3 w-3" />
                    </div>
                  </div>
                ) : (
                  <div className={cn('p-3 rounded-full', config.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link href={notification.link || '#'} onClick={() => !isRead && markAsRead(notification.id)}>
                    <p className={cn('font-medium', !isRead && 'font-semibold')}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </Link>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  {!isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 hover:bg-muted rounded-full text-muted-foreground"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </p>
          <p className="text-muted-foreground mt-1">
            {filter === 'unread' 
              ? 'You have no unread notifications'
              : 'You\'ll see notifications here when you get them'}
          </p>
        </div>
      )}
    </div>
  );
}
