'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, ExternalLink } from 'lucide-react';
import { apiGet, apiPostForm } from '@/lib/api';
import { PageHeader, FormActions, FormField, FormSection } from '@/components/admin';
import { toast } from 'sonner';

type Artist = {
  id: number;
  user_id: number | null;
  name: string;
  slug: string;
  bio: string | null;
  website: string | null;
  status: 'approved' | 'pending' | 'suspended' | 'rejected';
  is_verified: boolean;
  profile_url: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  genres: Array<{ id: string; name: string }>;
  user?: {
    id: number;
    name: string;
    email: string;
    username: string;
    phone: string;
  } | null;
};

type Genre = { id: number; name: string };

type ArtistFormData = {
  name: string;
  slug: string;
  bio: string;
  website: string;
  status: 'approved' | 'pending' | 'suspended' | 'rejected';
  is_verified: boolean;
  genre_id: string;
  spotify_url: string;
  apple_music_url: string;
  youtube_url: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  tiktok_url: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
};

function toFieldErrors(error: unknown): { message: string; fields: Record<string, string> } {
  const e = error as ApiError;
  const fields: Record<string, string> = {};
  const errors = e.response?.data?.errors;
  if (errors) {
    for (const [key, value] of Object.entries(errors)) {
      fields[key] = value[0];
    }
  }
  return {
    message: e.response?.data?.message || e.message || 'Failed to update artist',
    fields,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function appendOptionalUrl(formData: FormData, key: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed || !isHttpUrl(trimmed)) return;
  formData.append(key, trimmed);
}

export default function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ArtistFormData>({
    name: '',
    slug: '',
    bio: '',
    website: '',
    status: 'approved',
    is_verified: false,
    genre_id: '',
    spotify_url: '',
    apple_music_url: '',
    youtube_url: '',
    instagram_url: '',
    twitter_url: '',
    facebook_url: '',
    tiktok_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const { data: artistRes, isLoading } = useQuery({
    queryKey: ['admin', 'artist', id],
    queryFn: () => apiGet<{ data: Artist }>(`/admin/artists/${id}`),
  });

  const { data: genresRes } = useQuery({
    queryKey: ['genres', 'list'],
    queryFn: () => apiGet<{ data: Genre[] }>('/genres'),
  });

  const artist = artistRes?.data;

  useEffect(() => {
    if (!artist) return;
    setFormData({
      name: artist.name || '',
      slug: artist.slug || '',
      bio: artist.bio || '',
      website: artist.website || '',
      // Normalise legacy 'active' value returned by older API records to the
      // canonical 'approved' used by ArtistStatus enum and the edit form.
      status: (artist.status === 'active' ? 'approved' : artist.status) || 'approved',
      is_verified: !!artist.is_verified,
      genre_id: artist.genres?.[0]?.id || '',
      spotify_url: artist.spotify_url || '',
      apple_music_url: artist.apple_music_url || '',
      youtube_url: artist.youtube_url || '',
      instagram_url: artist.instagram_url || '',
      twitter_url: artist.twitter_url || '',
      facebook_url: artist.facebook_url || '',
      tiktok_url: artist.tiktok_url || '',
    });
    setProfilePreview(artist.profile_url || artist.avatar_url || null);
    setCoverPreview(artist.cover_url || null);
    setProfileFile(null);
    setCoverFile(null);
    setErrors({});
  }, [artist]);

  const updateArtistMutation = useMutation({
    mutationFn: async (payload: ArtistFormData) => {
      const request = new FormData();
      request.append('name', payload.name.trim());
      request.append('slug', payload.slug.trim());
      request.append('status', payload.status);
      request.append('is_verified', payload.is_verified ? '1' : '0');

      if (payload.bio.trim()) request.append('bio', payload.bio.trim());
      appendOptionalUrl(request, 'website', payload.website);
      if (payload.genre_id) request.append('genre_ids[0]', payload.genre_id);

      const socialFields: Array<
        'spotify_url' |
        'apple_music_url' |
        'youtube_url' |
        'instagram_url' |
        'twitter_url' |
        'facebook_url' |
        'tiktok_url'
      > = [
        'spotify_url',
        'apple_music_url',
        'youtube_url',
        'instagram_url',
        'twitter_url',
        'facebook_url',
        'tiktok_url',
      ];

      for (const field of socialFields) {
        appendOptionalUrl(request, field, payload[field]);
      }

      if (profileFile) request.append('profile_image', profileFile);
      if (coverFile) request.append('cover_image', coverFile);

      return apiPostForm<{ success: boolean; message: string; data?: Artist }>(`/admin/artists/${id}`, request);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Artist updated successfully');
      setErrors({});
      setProfileFile(null);
      setCoverFile(null);

      if (response.data) {
        queryClient.setQueryData(['admin', 'artist', id], { data: response.data });
        setProfilePreview(response.data.profile_url || response.data.avatar_url || null);
        setCoverPreview(response.data.cover_url || null);
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: (error) => {
      const parsed = toFieldErrors(error);
      setErrors(parsed.fields);
      const firstFieldError = Object.values(parsed.fields)[0];
      toast.error(firstFieldError || parsed.message);
    },
  });

  const onProfileFileChange = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Profile image must be an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile image must be less than 5MB');
      return;
    }
    setProfileFile(file);
    try {
      setProfilePreview(await readFileAsDataUrl(file));
    } catch {
      toast.error('Failed to preview profile image');
    }
  };

  const onCoverFileChange = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Cover image must be an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Cover image must be less than 10MB');
      return;
    }
    setCoverFile(file);
    try {
      setCoverPreview(await readFileAsDataUrl(file));
    } catch {
      toast.error('Failed to preview cover image');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = 'Artist name is required';
    if (!formData.slug.trim()) nextErrors.slug = 'Slug is required';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    updateArtistMutation.mutate(formData);
  };

  if (isLoading || !artist) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 rounded bg-muted animate-pulse" />
        <div className="h-105 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Artist"
        description="Update artist profile, status and media"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Artists', href: '/admin/artists' },
          { label: artist.name, href: `/admin/artists/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/admin/artists/${id}`}
        actions={
          artist.user?.id ? (
            <Link
              href={`/admin/users/${artist.user.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Edit Linked User
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : undefined
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Artist Profile" description="Fields map directly to AdminArtistsController::update">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Artist Name" error={errors.name} required>
                  <input
                    value={formData.name}
                    onChange={(e) => {
                      const next = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: next,
                        slug: prev.slug || next.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      }));
                    }}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>

                <FormField label="Slug" error={errors.slug} required>
                  <input
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>

                <FormField label="Website" error={errors.website}>
                  <input
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                    placeholder="https://..."
                  />
                </FormField>

                <FormField label="Primary Genre" error={errors.genre_ids}>
                  <select
                    value={formData.genre_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, genre_id: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  >
                    <option value="">Select genre</option>
                    {genresRes?.data?.map((genre) => (
                      <option key={genre.id} value={String(genre.id)}>{genre.name}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Bio" error={errors.bio}>
                <textarea
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2 bg-background"
                  placeholder="Artist bio"
                />
              </FormField>
            </FormSection>

            <FormSection title="Social Links" description="These map to social_links on the backend">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  ['spotify_url', 'Spotify URL'],
                  ['apple_music_url', 'Apple Music URL'],
                  ['youtube_url', 'YouTube URL'],
                  ['instagram_url', 'Instagram URL'],
                  ['twitter_url', 'Twitter/X URL'],
                  ['facebook_url', 'Facebook URL'],
                  ['tiktok_url', 'TikTok URL'],
                ] as Array<[keyof ArtistFormData, string]>).map(([field, label]) => (
                  <FormField key={field} label={label} error={errors[field]}>
                    <input
                      type="text"
                      inputMode="url"
                      value={formData[field] as string}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="w-full rounded-lg border px-4 py-2 bg-background"
                      placeholder="https://..."
                    />
                  </FormField>
                ))}
              </div>
            </FormSection>
          </div>

          <div className="space-y-6">
            <FormSection title="Images" description="Upload profile and cover images">
              <div className="space-y-4">
                <div data-testid="artist-profile-upload">
                  <label className="block text-sm font-medium mb-2">Profile Image</label>
                  <div className="relative h-36 rounded-lg border overflow-hidden bg-muted">
                    {profilePreview && (
                      <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                    )}
                    {!profilePreview && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80 text-muted-foreground">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm font-medium">Upload profile image</span>
                      </div>
                    )}
                  </div>
                  <input
                    data-testid="artist-profile-image-input"
                    aria-label="Profile image file"
                    type="file"
                    accept="image/*"
                    className="mt-3 block w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary"
                    onChange={(e) => void onProfileFileChange(e.target.files?.[0])}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, or WEBP up to 5MB.</p>
                </div>

                <div data-testid="artist-cover-upload">
                  <label className="block text-sm font-medium mb-2">Cover Image</label>
                  <div className="relative h-36 rounded-lg border overflow-hidden bg-muted">
                    {coverPreview && (
                      <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                    )}
                    {!coverPreview && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80 text-muted-foreground">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm font-medium">Upload cover image</span>
                      </div>
                    )}
                  </div>
                  <input
                    data-testid="artist-cover-image-input"
                    aria-label="Cover image file"
                    type="file"
                    accept="image/*"
                    className="mt-3 block w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary"
                    onChange={(e) => void onCoverFileChange(e.target.files?.[0])}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, or WEBP up to 10MB.</p>
                </div>
              </div>
            </FormSection>

            <FormSection title="Status">
              <div className="space-y-4">
                <FormField label="Status" error={errors.status}>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ArtistFormData['status'] }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  >
                    <option value="approved">Active (Approved)</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </FormField>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_verified: e.target.checked }))}
                  />
                  Verified Artist
                </label>

                {artist.user && (
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">Linked User</p>
                    <p className="text-muted-foreground">{artist.user.name} · {artist.user.email}</p>
                    <Link href={`/admin/users/${artist.user.id}/edit`} className="text-primary hover:underline mt-2 inline-block">
                      Manage user account
                    </Link>
                  </div>
                )}
              </div>
            </FormSection>
          </div>
        </div>

        <FormActions
          cancelHref={`/admin/artists/${id}`}
          submitLabel={updateArtistMutation.isPending ? 'Saving...' : 'Save Artist Profile'}
          isSubmitting={updateArtistMutation.isPending}
        />
      </form>

      {updateArtistMutation.isPending && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-primary text-primary-foreground px-4 py-2 inline-flex items-center gap-2 shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating artist...
        </div>
      )}
    </div>
  );
}
