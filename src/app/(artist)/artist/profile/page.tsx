'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Camera,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Youtube,
  Music2,
  Loader2,
  MapPin,
  Globe,
  Save,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useArtistProfile, useUpdateArtistProfile } from '@/hooks/useArtist';

export default function ArtistProfilePage() {
  const { data: profile, isLoading } = useArtistProfile();
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
  });

  const [isEditing, setIsEditing] = useState(false);

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
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

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
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artist Profile</h1>
          <p className="text-muted-foreground">Manage your public artist profile</p>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg border font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        )}
      </div>

      {/* Cover Image */}
      <div className="relative h-48 rounded-xl overflow-hidden bg-linear-to-r from-primary/20 to-primary/5">
        {profile?.banner && (
          <Image src={profile.banner} alt="Cover" fill className="object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Avatar & Info */}
      <div className="flex items-end gap-6 -mt-12 ml-6 relative z-10">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-muted">
            {profile?.avatar ? (
              <Image src={profile.avatar} alt="Avatar" width={96} height={96} className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {profile?.stage_name?.[0] || 'A'}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 pb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile?.stage_name || 'Artist Name'}</h2>
            {profile?.is_verified && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            {profile?.country && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.city ? `${profile.city}, ` : ''}{profile.country}
              </span>
            )}
            <span className="capitalize">{profile?.verification_status || 'pending'}</span>
            {profile?.can_upload && (
              <span className="text-green-600">Upload enabled</span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">Stage Name</label>
            {isEditing ? (
              <input
                type="text" value={formData.stage_name}
                onChange={(e) => setFormData({...formData, stage_name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border bg-background"
              />
            ) : (
              <p className="text-muted-foreground">{profile?.stage_name || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border bg-background resize-none"
              />
            ) : (
              <p className="text-muted-foreground">{profile?.bio || '—'}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Country</label>
              {isEditing ? (
                <input
                  type="text" value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              ) : (
                <p className="text-muted-foreground">{profile?.country || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">City</label>
              {isEditing ? (
                <input
                  type="text" value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />{profile?.city || '—'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Social Links</h3>

          {[
            { key: 'website_url', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
            { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: '@username' },
            { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username' },
            { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Channel URL' },
            { key: 'tiktok', label: 'TikTok', icon: Music2, placeholder: '@username' },
          ].map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={formData[key as keyof typeof formData] || ''}
                    onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder={placeholder}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>
                    {key === 'website_url'
                      ? profile?.website_url || '—'
                      : ((profile?.social_links as Record<string, string> | null)?.[key]) || '—'
                    }
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
