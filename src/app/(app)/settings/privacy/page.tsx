'use client';

import { useState, useEffect } from 'react';
import { Shield, Eye, BarChart3, Megaphone, Loader2, Save } from 'lucide-react';
import { useSettings, useUpdatePrivacySettings, type PrivacySettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export default function PrivacySettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updatePrivacy = useUpdatePrivacySettings();

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    data_collection: true,
    personalized_ads: true,
    share_listening_data: false,
  });

  useEffect(() => {
    if (settings?.privacy) {
      setPrivacySettings(settings.privacy);
    }
  }, [settings]);

  const handleToggle = (key: keyof PrivacySettings) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updatePrivacy.mutate(privacySettings, {
      onSuccess: () => toast.success('Privacy settings updated'),
      onError: () => toast.error('Failed to update privacy settings'),
    });
  };

  const privacyOptions = [
    {
      key: 'data_collection' as const,
      label: 'Data Collection',
      description: 'Allow us to collect usage data to improve the platform experience',
      icon: BarChart3,
    },
    {
      key: 'personalized_ads' as const,
      label: 'Personalized Ads',
      description: 'Show ads tailored to your listening habits and preferences',
      icon: Megaphone,
    },
    {
      key: 'share_listening_data' as const,
      label: 'Share Listening Activity',
      description: 'Let others see what you\'re currently listening to on your profile',
      icon: Eye,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Privacy Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Control how your data is collected and shared
        </p>
      </div>

      {/* Privacy Toggles */}
      <div className="space-y-4">
        {privacyOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(option.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings[option.key]
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    privacySettings[option.key] ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Data Management */}
      <div className="p-4 bg-card rounded-xl border border-border">
        <h3 className="font-semibold mb-2">Data Management</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You can request a copy of your data or delete your account at any time.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors">
            Download My Data
          </button>
          <button className="px-4 py-2 text-sm text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updatePrivacy.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {updatePrivacy.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}
