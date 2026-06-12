'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellOff,
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
  Clock,
  PlayCircle,
  ListMusic,
  Ticket,
  DollarSign,
  Mail,
  Settings,
  Check,
  Volume2,
  VolumeX,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SafeImage, InitialsAvatar } from '@/components/ui/safe-image';
import {
  useUnreadCount,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useRealtimeNotifications,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  type Notification,
} from '@/hooks/useNotifications';
import { useSession } from 'next-auth/react';

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
  song_pending_review: Clock,
  song_moderation: Music,
  artist_application: CheckCircle2,
  artist_release: Music,
  catalog_claim: Bell,
  admin_artist_application_pending: Clock,
  admin_catalog_claim_pending: Clock,
  subscription_expiring: AlertTriangle,
  weekly_digest: Mail,
  playlist_share: ListMusic,
  tip: DollarSign,
};

function getNotificationIcon(type: Notification['type']): LucideIcon {
  return NOTIFICATION_ICONS[type] ?? Bell;
}

const NOTIFICATION_COLORS: Record<string, string> = {
  like: 'text-red-500',
  comment: 'text-blue-500',
  follow: 'text-purple-500',
  song_approved: 'text-green-500',
  artist_release: 'text-primary',
  tip: 'text-yellow-500',
  payment: 'text-emerald-500',
  award_nomination: 'text-amber-500',
  subscription_expiring: 'text-orange-500',
  admin_artist_application_pending: 'text-amber-500',
  admin_catalog_claim_pending: 'text-amber-500',
};

function formatTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString();
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const userRole = (session?.user as { role?: string } | undefined)?.role ?? '';
  const isAdmin = ['admin', 'super_admin'].some((r) => userRole.toLowerCase().includes(r));
  const isArtist = ['artist'].some((r) => userRole.toLowerCase().includes(r));

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.total ?? 0;

  const { data: notificationsData, isLoading } = useNotifications({ filter: 'all' });
  const notifications = (notificationsData?.data ?? []).slice(0, 6);

  const { data: prefsData } = useNotificationPreferences();
  const prefs = prefsData?.data;

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const updatePrefs = useUpdateNotificationPreferences();

  useRealtimeNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPrefs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleNotificationClick(notification: Notification) {
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  }

  function toggleGlobalMute() {
    if (!prefs) return;
    updatePrefs.mutate({ ...prefs, global_mute: !prefs.global_mute });
  }

  const globalMute = prefs?.global_mute ?? false;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Bell trigger */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowPrefs(false); }}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {globalMute ? (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && !globalMute && (
          <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[22rem] rounded-xl border bg-popover shadow-xl z-50 flex flex-col max-h-[32rem] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <div>
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                  title="Mark all as read"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {markAllAsRead.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Check className="h-4 w-4" />
                  }
                </button>
              )}
              <button
                onClick={() => setShowPrefs(!showPrefs)}
                title="Quick preferences"
                className={cn(
                  'p-1.5 rounded-md hover:bg-muted transition-colors',
                  showPrefs ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* By-type unread badges */}
          {!showPrefs && unreadData?.by_type && Object.keys(unreadData.by_type).length > 0 && (
            <div className="flex flex-wrap gap-1 px-4 py-2 border-b bg-muted/30 shrink-0">
              {Object.entries(unreadData.by_type)
                .filter(([, count]) => count > 0)
                .slice(0, 5)
                .map(([type, count]) => {
                  const Icon = getNotificationIcon(type as Notification['type']);
                  const color = NOTIFICATION_COLORS[type] ?? 'text-muted-foreground';
                  return (
                    <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-background border rounded-full">
                      <Icon className={cn('h-3 w-3', color)} />
                      <span className="font-medium">{count}</span>
                    </span>
                  );
                })}
            </div>
          )}

          {/* Quick prefs panel */}
          {showPrefs && (
            <div className="px-4 py-3 border-b bg-muted/20 shrink-0 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick preferences</p>

              {/* Global mute */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {globalMute ? <VolumeX className="h-4 w-4 text-orange-500" /> : <Volume2 className="h-4 w-4" />}
                  <span className="text-sm font-medium">{globalMute ? 'Muted' : 'Mute all'}</span>
                </div>
                <button
                  onClick={toggleGlobalMute}
                  disabled={updatePrefs.isPending}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                    globalMute ? 'bg-orange-500' : 'bg-input'
                  )}
                >
                  <span className={cn(
                    'pointer-events-none block h-4 w-4 rounded-full bg-background shadow transition-transform',
                    globalMute ? 'translate-x-4' : 'translate-x-0'
                  )} />
                </button>
              </div>

              {/* Artist-specific quick toggle */}
              {isArtist && prefs?.song_approved && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Song approvals</span>
                  </div>
                  <button
                    onClick={() => updatePrefs.mutate({ ...prefs, song_approved: { ...prefs.song_approved!, in_app: !prefs.song_approved?.in_app } })}
                    disabled={updatePrefs.isPending}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                      prefs.song_approved?.in_app ? 'bg-primary' : 'bg-input'
                    )}
                  >
                    <span className={cn(
                      'pointer-events-none block h-4 w-4 rounded-full bg-background shadow transition-transform',
                      prefs.song_approved?.in_app ? 'translate-x-4' : 'translate-x-0'
                    )} />
                  </button>
                </div>
              )}

              {/* Admin quick toggle */}
              {isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Admin notifications are always delivered.
                </p>
              )}

              <Link
                href="/settings/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Settings className="h-3 w-3" />
                Manage all notification settings
              </Link>
            </div>
          )}

          {/* Notification list */}
          {!showPrefs && (
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const TypeIcon = getNotificationIcon(notification.type);
                    const iconColor = NOTIFICATION_COLORS[notification.type] ?? 'text-muted-foreground';
                    const isUnread = !notification.read_at;

                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'w-full flex items-start gap-3 p-4 hover:bg-muted/60 transition-colors text-left',
                          isUnread && 'bg-primary/5'
                        )}
                      >
                        {/* Actor avatar with type badge */}
                        <div className="relative shrink-0">
                          {notification.actor ? (
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                              <SafeImage
                                src={notification.actor.avatar_url}
                                alt={notification.actor.name}
                                width={40}
                                height={40}
                                className="object-cover"
                                fallback={<InitialsAvatar name={notification.actor.name} textClassName="text-xs" />}
                              />
                            </div>
                          ) : (
                            <div className={cn('h-10 w-10 rounded-full flex items-center justify-center bg-muted')}>
                              <TypeIcon className={cn('h-5 w-5', iconColor)} />
                            </div>
                          )}
                          {notification.actor && (
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-popover border">
                              <TypeIcon className={cn('h-3 w-3', iconColor)} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notification.created_at)}</p>
                        </div>

                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {!showPrefs && (
            <div className="border-t px-4 py-2.5 shrink-0 flex items-center justify-between bg-muted/20">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-primary hover:underline font-medium"
              >
                View all
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Admin view →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
