'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Music2, Heart, MessageSquare, DollarSign, Calendar, Loader2, Clock, Users, Gift, TrendingUp, ShoppingBag } from 'lucide-react';
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
  const { data: preferencesData, isLoading: isLoadingPreferences } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const registerPush = useRegisterPushNotification();
  
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'never'>('weekly');
  const [marketingEmails, setMarketingEmails] = useState(true);
  
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
      id: 'payments',
      label: 'Payments & Earnings',
      description: 'Payment confirmations, earnings updates, and withdrawal alerts',
      icon: DollarSign,
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
      id: 'referral_updates',
      label: 'Referral Updates',
      description: 'When someone signs up with your referral or you earn rewards',
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

    // Include email digest and marketing preferences
    preferences['email_digest'] = { frequency: emailDigestFrequency };
    preferences['marketing'] = { enabled: marketingEmails };
    
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
        {settings.map((setting) => {
          const Icon = setting.icon;
          
          return (
            <div 
              key={setting.id}
              className="flex items-start gap-4 p-4 rounded-lg border"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
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
            {emailDigestFrequency === 'weekly' && 'You\'ll receive a weekly digest every Monday with your top songs, new releases, and activity.'}
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
