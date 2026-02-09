'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Camera, Link as LinkIcon, Twitter, Instagram, Youtube, Music2, Loader2 } from 'lucide-react';
import { useSettings, useUpdateProfileSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const { data: settings } = useSettings();
  const updateProfile = useUpdateProfileSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatar, setAvatar] = useState(session?.user?.image || '/images/default-avatar.jpg');
  const [formData, setFormData] = useState({
    displayName: session?.user?.name || '',
    username: '',
    bio: '',
    website: '',
    twitter: '',
    instagram: '',
    youtube: '',
    spotify: '',
  });

  // Load existing settings when they arrive
  useEffect(() => {
    if (settings?.profile) {
      setFormData(prev => ({
        ...prev,
        displayName: settings.profile.display_name || prev.displayName,
      }));
    }
  }, [settings]);
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        public_profile: settings?.profile?.public_profile ?? true,
        show_listening_activity: settings?.profile?.show_listening_activity ?? true,
        show_followers: settings?.profile?.show_followers ?? true,
        show_following: settings?.profile?.show_following ?? true,
      });
      toast.success('Profile settings saved successfully!');
    } catch {
      toast.error('Failed to save profile settings. Please try again.');
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
        <p className="text-muted-foreground text-sm">
          Customize how others see you on TesoTunes.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div 
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
          >
            <div className="relative h-24 w-24 rounded-full overflow-hidden">
              <Image
                src={avatar}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <h3 className="font-medium">Profile Photo</h3>
            <p className="text-sm text-muted-foreground">
              Click to upload a new photo. Max size: 5MB
            </p>
          </div>
        </div>
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Basic Information</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border bg-background"
                placeholder="Your display name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border bg-background"
                  placeholder="username"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              maxLength={200}
              className="w-full px-4 py-2 rounded-lg border bg-background resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.bio.length}/200 characters
            </p>
          </div>
        </div>
        
        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Social Links</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <LinkIcon className="h-5 w-5" />
              </div>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border bg-background"
                placeholder="https://yourwebsite.com"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center">
                <Twitter className="h-5 w-5 text-[#1DA1F2]" />
              </div>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border bg-background"
                placeholder="Twitter username"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E4405F]/10 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-[#E4405F]" />
              </div>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border bg-background"
                placeholder="Instagram username"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF0000]/10 flex items-center justify-center">
                <Youtube className="h-5 w-5 text-[#FF0000]" />
              </div>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border bg-background"
                placeholder="YouTube channel URL"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1DB954]/10 flex items-center justify-center">
                <Music2 className="h-5 w-5 text-[#1DB954]" />
              </div>
              <input
                type="text"
                value={formData.spotify}
                onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border bg-background"
                placeholder="Spotify artist URL"
              />
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            className="px-6 py-2 border rounded-lg font-medium hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
