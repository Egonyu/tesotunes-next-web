'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Crown,
  Loader2,
  Upload,
  Save,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useArtistLoyaltyClub,
  useUpdateArtistLoyaltyClub,
} from '@/hooks/useLoyalty';

export default function FanClubSettingsPage() {
  const { data: club, isLoading: loadingClub } = useArtistLoyaltyClub();
  const updateMutation = useUpdateArtistLoyaltyClub();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with club data
  useEffect(() => {
    if (club) {
      setName(club.name);
      setDescription(club.description || '');
      setIsActive(club.is_active);
      setLogoPreview(club.logo_url || null);
    }
  }, [club]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo must be under 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (!club) return;
    if (!name.trim()) {
      toast.error('Club name is required');
      return;
    }

    updateMutation.mutate(
      {
        id: club.id,
        name: name.trim(),
        description: description.trim(),
        is_active: isActive,
        logo: logoFile || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Settings saved successfully');
          setLogoFile(null);
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to save settings');
        },
      }
    );
  };

  if (loadingClub) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-12 rounded-xl border bg-card text-center">
        <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-xl font-semibold mb-2">No Fan Club Yet</h2>
        <p className="text-muted-foreground">Create your fan club first to edit settings.</p>
      </div>
    );
  }

  const hasChanges =
    name !== club.name ||
    description !== (club.description || '') ||
    isActive !== club.is_active ||
    logoFile !== null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Club Info */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h3 className="font-semibold">Club Information</h3>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium mb-2">Logo</label>
          <div className="flex items-center gap-4">
            <div
              onClick={() => logoInputRef.current?.click()}
              className="relative h-20 w-20 rounded-xl border-2 border-dashed cursor-pointer hover:border-primary transition-colors overflow-hidden group"
            >
              {logoPreview ? (
                <>
                  <Image
                    src={logoPreview}
                    alt="Club logo"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="text-sm text-primary hover:underline"
              >
                Upload new logo
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or WebP. Max 5MB.
              </p>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Club Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your fan club name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Describe your fan club and what members get..."
          />
        </div>
      </div>

      {/* Status Toggle */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Visibility</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Active Status</p>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? 'Your fan club is visible to fans and accepting new members'
                : 'Your fan club is hidden from discovery'}
            </p>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              isActive ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                isActive ? 'translate-x-5.5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </div>

      {/* Slug Display */}
      {club.slug && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-2">Public URL</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm font-mono truncate">
              /loyalty/clubs/{club.slug}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/loyalty/clubs/${club.slug}`);
                toast.success('Link copied!');
              }}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-muted whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-card p-6">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Deactivating your fan club will hide it from discovery but existing members will retain their points.
        </p>
        {isActive && (
          <button
            onClick={() => setIsActive(false)}
            className="px-4 py-2 text-sm border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Deactivate Fan Club
          </button>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between sticky bottom-0 py-4 bg-background/95 backdrop-blur border-t -mx-4 px-4 lg:-mx-6 lg:px-6">
        <div>
          {hasChanges && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              You have unsaved changes
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || !hasChanges}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {updateMutation.isPending ? (
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
