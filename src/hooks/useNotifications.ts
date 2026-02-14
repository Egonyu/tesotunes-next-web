import { useEffect, useCallback, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { getEchoInstance } from '@/lib/echo';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'repost' | 'purchase' | 'payment' | 'announcement' | 'music';
  title: string;
  message: string;
  link: string;
  read_at: string | null;
  created_at: string;
  actor?: {
    name: string;
    avatar_url: string;
  };
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface UnreadCountsResponse {
  total: number;
  by_type: Record<string, number>;
}

// Notification preferences interface
export interface NotificationPreferences {
  new_releases?: { email: boolean; push: boolean; in_app: boolean };
  likes?: { email: boolean; push: boolean; in_app: boolean };
  comments?: { email: boolean; push: boolean; in_app: boolean };
  payments?: { email: boolean; push: boolean; in_app: boolean };
  events?: { email: boolean; push: boolean; in_app: boolean };
  new_follower?: { email: boolean; push: boolean; in_app: boolean };
  playlist_activity?: { email: boolean; push: boolean; in_app: boolean };
  artist_release?: { email: boolean; push: boolean; in_app: boolean };
  comment_reply?: { email: boolean; push: boolean; in_app: boolean };
  payment_received?: { email: boolean; push: boolean; in_app: boolean };
  payout_approved?: { email: boolean; push: boolean; in_app: boolean };
  song_approved?: { email: boolean; push: boolean; in_app: boolean };
  subscription_expiring?: { email: boolean; push: boolean; in_app: boolean };
  award_nomination?: { email: boolean; push: boolean; in_app: boolean };
  event_reminder?: { email: boolean; push: boolean; in_app: boolean };
  system_announcement?: { email: boolean; push: boolean; in_app: boolean };
  quiet_hours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
  global_mute?: boolean;
}

export interface NotificationPreferencesResponse {
    data: NotificationPreferences;
}

// Real-time notification event from WebSocket
interface RealtimeNotificationEvent {
  notification: Notification;
}

// ============================================================================
// Fetch Hooks
// ============================================================================

export function useNotifications(options?: { filter?: 'all' | 'unread'; page?: number }) {
  const filter = options?.filter || 'all';
  const page = options?.page || 1;
  
  return useQuery({
    queryKey: ['notifications', { filter, page }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('unread', 'true');
      params.append('page', String(page));
      return apiGet<NotificationsResponse>(`/notifications?${params.toString()}`);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => apiGet<UnreadCountsResponse>('/notifications/unread-counts'),
    staleTime: 30 * 1000,
    refetchInterval: 2 * 60 * 1000, // 2 minutes instead of 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => apiGet<NotificationPreferencesResponse>('/notifications/settings'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiPost(`/notifications/${id}/mark-read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiPost('/notifications/mark-all-read', {}),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
    onError: () => toast.error('Failed to mark notifications as read'),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/notifications/${id}`),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
    onError: () => toast.error('Failed to delete notification'),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: NotificationPreferences) => 
      apiPost('/notifications/settings', preferences),
    onSuccess: () => {
      toast.success('Notification preferences updated');
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: () => toast.error('Failed to update notification preferences'),
  });
}

export function useRegisterPushNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (subscription: PushSubscription) => 
      apiPost('/notifications/push-token', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      }),
    onSuccess: () => {
      toast.success('Push notifications enabled');
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: () => toast.error('Failed to enable push notifications'),
  });
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ============================================================================
// Real-time Hook
// ============================================================================

export function useRealtimeNotifications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const handleNewNotification = useCallback((event: RealtimeNotificationEvent) => {
    const notification = event.notification;
    
    // Show toast for new notification
    toast(notification.title, {
      description: notification.message,
      action: notification.link ? {
        label: 'View',
        onClick: () => window.location.href = notification.link,
      } : undefined,
    });
    
    // Invalidate queries to refresh notification list
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
  }, [queryClient]);
  
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const echo = getEchoInstance();
    if (!echo) return;
    
    const userId = session.user.id;
    
    try {
      // Subscribe to private user channel for notifications
      const channel = echo.private(`user.${userId}`);
      
      channel
        .listen('.notification.created', handleNewNotification)
        .listen('RealtimeNotification', handleNewNotification);
      
      // Track connection status
      const pusher = (echo as unknown as { connector: { pusher: { connection: { bind: (event: string, cb: () => void) => void } } } }).connector.pusher;
      
      if (pusher?.connection) {
        pusher.connection.bind('connected', () => {
          setIsConnected(true);
          setConnectionError(null);
        });
        
        pusher.connection.bind('disconnected', () => {
          setIsConnected(false);
        });
        
        pusher.connection.bind('error', () => {
          setConnectionError('Connection error');
          setIsConnected(false);
        });
      }
      
      return () => {
        channel.stopListening('.notification.created');
        channel.stopListening('RealtimeNotification');
        echo.leave(`user.${userId}`);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setConnectionError('Failed to connect');
      }, 0);
    }
  }, [session?.user?.id, handleNewNotification]);
  
  return { isConnected, connectionError };
}

// ============================================================================
// Combined Hook for Notifications Page
// ============================================================================

export function useNotificationsWithRealtime(options?: { filter?: 'all' | 'unread' }) {
  const filter = options?.filter || 'all';
  
  // Fetch notifications
  const { 
    data: notificationsData, 
    isLoading, 
    error 
  } = useNotifications({ filter });
  
  // Fetch unread count
  const { data: unreadData } = useUnreadCount();
  
  // Connect to real-time updates
  const { isConnected } = useRealtimeNotifications();
  
  // Mutations
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  
  return {
    notifications: notificationsData?.data || [],
    meta: notificationsData?.meta,
    unreadCount: unreadData?.total || 0,
    unreadByType: unreadData?.by_type || {},
    isLoading,
    error,
    isConnected,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isMarkingRead: markAsRead.isPending,
    isMarkingAllRead: markAllAsRead.isPending,
    isDeleting: deleteNotification.isPending,
  };
}
