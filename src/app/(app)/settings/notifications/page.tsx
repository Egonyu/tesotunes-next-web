'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Music2, Heart, MessageSquare, DollarSign, Calendar, Loader2, Clock, Users, Gift, TrendingUp, ShoppingBag, Trophy, AlertTriangle, CheckCircle2, ListMusic, Ticket, PlayCircle, CreditCard, Moon, VolumeX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences,
  useRegisterPushNotification,
  type NotificationPreferences as PreferencesType,
} from '@/hooks/useNotifications';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/lib/push-notifications';
import { toast } from 'sonner';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const isArtist = session?.user?.role === 'artist' || session?.user?.role === 'label' || session?.user?.role === 'admin' || session?.user?.role === 'super_admin';

  const { data: preferencesData, isLoading: isLoadingPreferences } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const registerPush = useRegisterPushNotification();
  
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'never'>('weekly');
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [globalMute, setGlobalMute] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new_releases',
      label: 'New Releases',
      description: 'Get notified when artists you follow release new music',
      icon: Music2,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'new_episode',
      label: 'New Episodes',
      description: 'When a podcast you subscribe to publishes a new episode',
      icon: PlayCircle,
      email: false,
      push: true,
      inApp: true,
    },
    {
      id: 'likes',
      label: 'Likes & Saves',
      description: 'When someone likes your content or saves your playlists',
      icon: Heart,
      email: false,
      push: true,
      inApp: true,
    },
    {
      id: 'comments',
      label: 'Comments & Replies',
      description: 'New comments on your content and replies to your threads',
      icon: MessageSquare,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'playlist_share',
      label: 'Playlist Shares',
      description: 'When someone shares a playlist with you',
      icon: ListMusic,
      email: false,
      push: true,
      inApp: true,
    },
    {
      id: 'payments',
      label: 'Payments & Earnings',
      description: 'Payment confirmations, earnings updates, and withdrawal alerts',
      icon: DollarSign,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'ticket_purchase',
      label: 'Ticket Purchases',
      description: 'Booking confirmations and ticket delivery for events',
      icon: Ticket,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'events',
      label: 'Events & Reminders',
      description: 'Upcoming events, ticket sales, and concert reminders',
      icon: Calendar,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'new_follower',
      label: 'New Followers',
      description: 'When someone follows you or your playlists',
      icon: Users,
      email: false,
      push: true,
      inApp: true,
    },
    {
      id: 'award_nomination',
      label: 'Award Nominations',
      description: 'When you or someone you follow is nominated for an award',
      icon: Trophy,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'subscription_expiring',
      label: 'Subscription Expiry',
      description: 'Reminders before your subscription expires (7, 3, and 1 day before)',
      icon: AlertTriangle,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'referral_reward',
      label: 'Referral Rewards',
      description: 'When someone signs up with your referral code and you earn credits',
      icon: Gift,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'trending',
      label: 'Trending & Recommendations',
      description: 'Weekly picks, trending music, and personalized recommendations',
      icon: TrendingUp,
      email: true,
      push: false,
      inApp: true,
    },
    {
      id: 'orders',
      label: 'Orders & Shipping',
      description: 'Order confirmations, shipping updates, and delivery alerts',
      icon: ShoppingBag,
      email: true,
      push: true,
      inApp: true,
    },
    // Artist-only — shown conditionally in the UI
    {
      id: 'song_approved',
      label: 'Song Approved',
      description: 'When your submitted song passes moderation and goes live',
      icon: CheckCircle2,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'payout_approved',
      label: 'Payout Approved',
      description: 'When your withdrawal request is processed and funds are disbursed',
      icon: CreditCard,
      email: true,
      push: true,
      inApp: true,
    },
  ]);
  
  // Check push notification support on mount
  useEffect(() => {
    if (isPushNotificationSupported()) {
      setPushSupported(true);
      setPushPermission(getNotificationPermission());
    }
  }, []);
  
  // Load preferences from API
  useEffect(() => {
    if (preferencesData?.data) {
      const apiPrefs = preferencesData.data;
      if (typeof apiPrefs.global_mute === 'boolean') setGlobalMute(apiPrefs.global_mute);
      if (apiPrefs.quiet_hours) {
        setQuietHoursEnabled(apiPrefs.quiet_hours.enabled ?? false);
        if (apiPrefs.quiet_hours.start) setQuietHoursStart(apiPrefs.quiet_hours.start);
        if (apiPrefs.quiet_hours.end) setQuietHoursEnd(apiPrefs.quiet_hours.end);
      }
      setSettings(prevSettings =>
        prevSettings.map(setting => {
          const pref = (apiPrefs as Record<string, unknown>)[setting.id];
          if (pref && typeof pref === 'object' && 'email' in pref) {
            const p = pref as { email: boolean; push: boolean; in_app: boolean };
            return {
              ...setting,
              email: p.email ?? setting.email,
              push: p.push ?? setting.push,
              inApp: p.in_app ?? setting.inApp,
            };
          }
          return setting;
        })
      );
    }
  }, [preferencesData]);
  
  const updateSetting = (id: string, channel: 'email' | 'push' | 'inApp', value: boolean) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, [channel]: value } : s
    ));
  };
  
  const handleSave = async () => {
    const preferences: Record<string, unknown> = {};
    
    settings.forEach(setting => {
      preferences[setting.id] = {
        email: setting.email,
        push: setting.push,
        in_app: setting.inApp,
      };
    });

    // weekly_digest is a boolean flag, not a channel object
    preferences['weekly_digest'] = emailDigestFrequency !== 'never';
    // Include full digest frequency and marketing preferences
    preferences['email_digest'] = { frequency: emailDigestFrequency };
    preferences['marketing'] = { enabled: marketingEmails };
    // Quiet hours & global mute
    preferences['global_mute'] = globalMute;
    preferences['quiet_hours'] = {
      enabled: quietHoursEnabled,
      start: quietHoursStart,
      end: quietHoursEnd,
    };
    
    updatePreferences.mutate(preferences as PreferencesType);
  };
  
  const handleEnablePushNotifications = async () => {
    if (!pushSupported) {
      toast.error('Push notifications are not supported in your browser');
      return;
    }
    
    setIsEnablingPush(true);
    
    try {
      const subscription = await subscribeToPushNotifications();
      await registerPush.mutateAsync(subscription);
      setPushPermission('granted');
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enable push notifications');
    } finally {
      setIsEnablingPush(false);
    }
  };
  
  const handleDisablePushNotifications = async () => {
    try {
      await unsubscribeFromPushNotifications();
      setPushPermission('default');
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
      toast.error('Failed to disable push notifications');
    }
  };
  
  if (isLoadingPreferences) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Notifications</h2>
        <p className="text-muted-foreground text-sm">
          Choose how you want to receive notifications.
        </p>
      </div>
      
      {/* Push Notification Banner */}
      {pushSupported && pushPermission !== 'granted' && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-4">
            <Bell className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium mb-1">Enable Push Notifications</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant notifications even when TesoTunes is closed
              </p>
              <button
                onClick={handleEnablePushNotifications}
                disabled={isEnablingPush}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isEnablingPush && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEnablingPush ? 'Enabling...' : 'Enable Push Notifications'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {pushSupported && pushPermission === 'granted' && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-start gap-4">
            <Bell className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium mb-1">Push Notifications Enabled</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You'll receive push notifications for your selected preferences
              </p>
              <button
                onClick={handleDisablePushNotifications}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Disable push notifications
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Channels Legend */}
      <div className="flex items-center gap-8 p-4 rounded-lg bg-muted/30">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="text-sm">Email</span>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span className="text-sm">Push</span>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="text-sm">In-App</span>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="space-y-4">
        {settings.filter(s => s.id !== 'song_approved' && s.id !== 'payout_approved').map((setting) => {
          const Icon = setting.icon;
          
          return (
            <div 
              key={setting.id}
              className="flex items-start gap-4 p-4 rounded-lg border"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{setting.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Email Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.email}
                    onChange={(e) => updateSetting(setting.id, 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                </label>
                
                {/* Push Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.push}
                    onChange={(e) => updateSetting(setting.id, 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  <Smartphone className="h-4 w-4 ml-2 text-muted-foreground" />
                </label>
                
                {/* In-App Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.inApp}
                    onChange={(e) => updateSetting(setting.id, 'inApp', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  <Bell className="h-4 w-4 ml-2 text-muted-foreground" />
                </label>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Artist-only Notifications */}
      {isArtist && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Artist Notifications</h3>
          </div>
          {[
            {
              id: 'song_approved',
              label: 'Song Approved',
              description: 'When your submitted song passes moderation and goes live',
              icon: CheckCircle2,
            },
            {
              id: 'payout_approved',
              label: 'Payout Approved',
              description: 'When your withdrawal request is processed and funds are disbursed',
              icon: CreditCard,
            },
          ].map((artistSetting) => {
            const existing = settings.find(s => s.id === artistSetting.id);
            const Icon = artistSetting.icon;
            if (!existing) return null;
            return (
              <div
                key={artistSetting.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{artistSetting.label}</h3>
                    <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded font-medium">Artist</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{artistSetting.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={existing.email} onChange={(e) => updateSetting(artistSetting.id, 'email', e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={existing.push} onChange={(e) => updateSetting(artistSetting.id, 'push', e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    <Smartphone className="h-4 w-4 ml-2 text-muted-foreground" />
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={existing.inApp} onChange={(e) => updateSetting(artistSetting.id, 'inApp', e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    <Bell className="h-4 w-4 ml-2 text-muted-foreground" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <button
          onClick={() => setSettings(settings.map(s => ({ ...s, email: true, push: true, inApp: true })))}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Enable All
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={() => setSettings(settings.map(s => ({ ...s, email: false, push: false, inApp: false })))}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Disable All
        </button>
      </div>

      {/* Email Digest Settings */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold">Email Digest</h3>
            <p className="text-sm text-muted-foreground">
              Get a summary of activity and personalized recommendations
            </p>
          </div>
        </div>

        <div className="ml-13 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['daily', 'weekly', 'monthly', 'never'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setEmailDigestFrequency(freq)}
                className={`px-4 py-2 text-sm rounded-lg border transition capitalize ${
                  emailDigestFrequency === freq
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <Clock className="h-3.5 w-3.5 inline mr-1.5" />
                {freq}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {emailDigestFrequency === 'daily' && 'You\'ll receive a daily digest at 8:00 AM with your listening stats and recommendations.'}
            {emailDigestFrequency === 'weekly' && 'You\'ll receive a weekly digest every Monday at 9:00 AM EAT (East Africa Time) with your top songs, new releases, and activity.'}
            {emailDigestFrequency === 'monthly' && 'You\'ll receive a monthly digest on the 1st with your listening report and highlights.'}
            {emailDigestFrequency === 'never' && 'You won\'t receive any email digests.'}
          </p>
        </div>
      </div>

      {/* Marketing Emails */}
      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-medium">Marketing & Promotions</h3>
            <p className="text-sm text-muted-foreground">
              Special offers, new feature announcements, and artist promotions
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={marketingEmails}
            onChange={(e) => setMarketingEmails(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
        </label>
      </div>
      
      {/* Quiet Hours & Global Mute */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold">Do Not Disturb</h3>

        {/* Global Mute */}
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0">
              <VolumeX className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h4 className="font-medium">Global Mute</h4>
              <p className="text-sm text-muted-foreground">
                Silence all notifications immediately — still saved, just not delivered
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={globalMute}
              onChange={(e) => setGlobalMute(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-slate-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>

        {/* Quiet Hours */}
        <div className="p-4 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Moon className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-medium">Quiet Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Pause push &amp; in-app notifications during a time window each day
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-13">
              <div>
                <label className="block text-sm font-medium mb-1">Start time</label>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End time</label>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">
                Times are in East Africa Time (EAT, UTC+3). Notifications will still arrive in your inbox — delivery resumes after the window ends.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={updatePreferences.isPending}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {updatePreferences.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
