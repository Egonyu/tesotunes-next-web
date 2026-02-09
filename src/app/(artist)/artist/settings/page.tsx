'use client';

import { useState, useEffect } from 'react';
import { 
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Save,
  Camera,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistProfile, useUpdateArtistProfile } from '@/hooks/useArtist';
import { toast } from 'sonner';

export default function ArtistSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { data: profile, isLoading, error } = useArtistProfile();
  const updateProfile = useUpdateArtistProfile();
  
  const [formData, setFormData] = useState({
    stage_name: '',
    bio: '',
    country: '',
    city: '',
    website_url: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    payout_phone_number: '',
    auto_publish: false,
  });
  
  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      const socialLinks = (profile.social_links || {}) as Record<string, string>;
      setFormData({
        stage_name: profile.stage_name || '',
        bio: profile.bio || '',
        country: profile.country || '',
        city: profile.city || '',
        website_url: profile.website_url || '',
        instagram: socialLinks.instagram || '',
        twitter: socialLinks.twitter || '',
        youtube: socialLinks.youtube || '',
        tiktok: socialLinks.tiktok || '',
        payout_phone_number: profile.payout_phone_number || '',
        auto_publish: profile.auto_publish || false,
      });
    }
  }, [profile]);
  
  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        stage_name: formData.stage_name,
        bio: formData.bio,
        country: formData.country,
        city: formData.city,
        website_url: formData.website_url,
        social_links: {
          instagram: formData.instagram,
          twitter: formData.twitter,
          youtube: formData.youtube,
          tiktok: formData.tiktok,
        },
        payout_phone_number: formData.payout_phone_number,
        auto_publish: formData.auto_publish,
      });
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    }
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payout', label: 'Payout', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Failed to load settings</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your artist account</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <nav className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        
        {/* Content */}
        <div className="flex-1 p-6 rounded-xl border bg-card">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="font-medium">Profile Photo</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stage Name *</label>
                  <input
                    type="text"
                    value={formData.stage_name}
                    onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://yoursite.com"
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell your fans about yourself..."
                  className="w-full px-4 py-2 border rounded-lg bg-background resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Uganda"
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Kampala"
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
              
              {/* Social Links */}
              <div>
                <h3 className="font-medium mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Instagram</label>
                    <input
                      type="url"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="https://instagram.com/username"
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter / X</label>
                    <input
                      type="url"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="https://twitter.com/username"
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">YouTube</label>
                    <input
                      type="url"
                      value={formData.youtube}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                      placeholder="https://youtube.com/c/channel"
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">TikTok</label>
                    <input
                      type="url"
                      value={formData.tiktok}
                      onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/@username"
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'new-follower', label: 'New followers', description: 'When someone follows you', enabled: true },
                  { id: 'song-plays', label: 'Song milestones', description: 'When your songs reach play milestones', enabled: true },
                  { id: 'earnings', label: 'Earnings updates', description: 'Weekly earnings summary', enabled: true },
                  { id: 'comments', label: 'Comments', description: 'When someone comments on your music', enabled: false },
                  { id: 'events', label: 'Event reminders', description: 'Upcoming event notifications', enabled: true },
                  { id: 'marketing', label: 'Marketing tips', description: 'Tips to grow your audience', enabled: false },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <button 
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        item.enabled ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                        item.enabled ? "right-0.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Payout Tab */}
          {activeTab === 'payout' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Payout Settings</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Payout Phone Number (Mobile Money)</label>
                <input
                  type="tel"
                  value={formData.payout_phone_number}
                  onChange={(e) => setFormData({ ...formData, payout_phone_number: e.target.value })}
                  placeholder="+256 700 000 000"
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
              </div>
              
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium">Auto-Publish Songs</p>
                  <p className="text-sm text-muted-foreground">Automatically publish songs after review</p>
                </div>
                <button 
                  onClick={() => setFormData({ ...formData, auto_publish: !formData.auto_publish })}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    formData.auto_publish ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                    formData.auto_publish ? "right-0.5" : "left-0.5"
                  )} />
                </button>
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              
              <div>
                <h3 className="font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 border rounded-lg hover:bg-muted">Enable</button>
              </div>
            </div>
          )}
          
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Appearance Settings</h2>
              
              <div>
                <h3 className="font-medium mb-4">Artist Page Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['Default', 'Dark', 'Purple'].map((theme) => (
                    <button
                      key={theme}
                      className={cn(
                        'p-4 rounded-xl border text-center transition-colors',
                        theme === 'Default' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      )}
                    >
                      <div className={cn(
                        'h-16 rounded-lg mb-2',
                        theme === 'Dark' ? 'bg-gray-900' :
                        theme === 'Purple' ? 'bg-purple-600' :
                        'bg-linear-to-br from-primary to-purple-600'
                      )} />
                      <p className="text-sm font-medium">{theme}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-end mt-8 pt-6 border-t">
            <button 
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
