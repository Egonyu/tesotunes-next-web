'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface ArtistProfile {
  id: number;
  name: string;
  bio: string;
  avatar: string;
  cover_image: string;
  genre: string;
  location: string;
  website: string;
  twitter: string;
  instagram: string;
  youtube: string;
  spotify: string;
  monthly_listeners: number;
  total_plays: number;
  followers: number;
}

export default function ArtistProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['artist', 'profile'],
    queryFn: () => apiGet<{ data: ArtistProfile }>('/artist/profile').then(r => r.data),
  });

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    genre: '',
    location: '',
    website: '',
    twitter: '',
    instagram: '',
    youtube: '',
    spotify: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  const updateProfile = useMutation({
    mutationFn: (data: Partial<ArtistProfile>) =>
      apiPut('/artist/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'profile'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        genre: profile.genre || '',
        location: profile.location || '',
        website: profile.website || '',
        twitter: profile.twitter || '',
        instagram: profile.instagram || '',
        youtube: profile.youtube || '',
        spotify: profile.spotify || '',
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(formData);
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
        {profile?.cover_image && (
          <Image src={profile.cover_image} alt="Cover" fill className="object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Avatar & Stats */}
      <div className="flex items-end gap-6 -mt-12 ml-6 relative z-10">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-muted">
            {profile?.avatar ? (
              <Image src={profile.avatar} alt="Avatar" width={96} height={96} className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {profile?.name?.[0] || 'A'}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 pb-1">
          <h2 className="text-xl font-bold">{profile?.name || 'Artist Name'}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>{(profile?.followers ?? 0).toLocaleString()} followers</span>
            <span>{(profile?.monthly_listeners ?? 0).toLocaleString()} monthly listeners</span>
            <span>{(profile?.total_plays ?? 0).toLocaleString()} total plays</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">Artist Name</label>
            {isEditing ? (
              <input
                type="text" value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border bg-background"
              />
            ) : (
              <p className="text-muted-foreground">{profile?.name || '—'}</p>
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
              <label className="block text-sm font-medium mb-1.5">Genre</label>
              {isEditing ? (
                <input
                  type="text" value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              ) : (
                <p className="text-muted-foreground">{profile?.genre || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              {isEditing ? (
                <input
                  type="text" value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />{profile?.location || '—'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold border-b pb-2">Social Links</h3>

          {[
            { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
            { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: '@username' },
            { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username' },
            { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Channel URL' },
            { key: 'spotify', label: 'Spotify', icon: Music2, placeholder: 'Spotify URL' },
          ].map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder={placeholder}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{(profile as unknown as Record<string, unknown>)?.[key] as string || '—'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
