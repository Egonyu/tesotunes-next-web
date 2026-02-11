'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Upload, X, Plus, User } from 'lucide-react';
import Image from 'next/image';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';

interface Genre {
  id: string;
  name: string;
}

interface ArtistFormData {
  name: string;
  slug: string;
  bio: string;
  short_bio: string;
  genre_ids: string[];
  country: string;
  city: string;
  website: string;
  spotify_url: string;
  apple_music_url: string;
  youtube_url: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  tiktok_url: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  profile_image: File | null;
  cover_image: File | null;
  meta_title: string;
  meta_description: string;
}

export default function CreateArtistPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ArtistFormData>({
    name: '',
    slug: '',
    bio: '',
    short_bio: '',
    genre_ids: [],
    country: '',
    city: '',
    website: '',
    spotify_url: '',
    apple_music_url: '',
    youtube_url: '',
    instagram_url: '',
    twitter_url: '',
    facebook_url: '',
    tiktok_url: '',
    status: 'active',
    is_verified: false,
    is_featured: false,
    profile_image: null,
    cover_image: null,
    meta_title: '',
    meta_description: '',
  });
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: genres } = useQuery({
    queryKey: ['admin', 'genres', 'list'],
    queryFn: () => apiGet<{ data: Genre[] }>('/api/admin/genres'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost('/api/admin/artists', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      router.push('/admin/artists');
    },
    onError: (error: { response?: { data?: { errors?: Record<string, string[]> } } }) => {
      if (error.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          newErrors[key] = messages[0];
        });
        setErrors(newErrors);
      }
    },
  });

  const updateField = (field: keyof ArtistFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
    }
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_image: file }));
      const reader = new FileReader();
      reader.onload = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }));
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('slug', formData.slug);
    data.append('bio', formData.bio);
    data.append('short_bio', formData.short_bio);
    data.append('country', formData.country);
    data.append('city', formData.city);
    data.append('website', formData.website);
    data.append('spotify_url', formData.spotify_url);
    data.append('apple_music_url', formData.apple_music_url);
    data.append('youtube_url', formData.youtube_url);
    data.append('instagram_url', formData.instagram_url);
    data.append('twitter_url', formData.twitter_url);
    data.append('facebook_url', formData.facebook_url);
    data.append('tiktok_url', formData.tiktok_url);
    data.append('status', formData.status);
    data.append('is_verified', formData.is_verified ? '1' : '0');
    data.append('is_featured', formData.is_featured ? '1' : '0');
    data.append('meta_title', formData.meta_title);
    data.append('meta_description', formData.meta_description);
    
    formData.genre_ids.forEach(id => data.append('genre_ids[]', id));
    
    if (formData.profile_image) data.append('profile_image', formData.profile_image);
    if (formData.cover_image) data.append('cover_image', formData.cover_image);
    
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Artist"
        description="Create a new artist profile"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Artists', href: '/admin/artists' },
          { label: 'New Artist' },
        ]}
        backHref="/admin/artists"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Artist Name"
                  required
                  error={errors.name}
                  className="col-span-2"
                >
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Enter artist name"
                  />
                </FormField>

                <FormField label="Slug" error={errors.slug}>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="artist-url-slug"
                  />
                </FormField>

                <FormField label="Website" error={errors.website}>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://artistwebsite.com"
                  />
                </FormField>
              </div>

              <FormField label="Short Bio" error={errors.short_bio}>
                <input
                  type="text"
                  value={formData.short_bio}
                  onChange={(e) => updateField('short_bio', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  placeholder="One-line description (max 160 chars)"
                  maxLength={160}
                />
              </FormField>

              <FormField label="Full Bio" error={errors.bio}>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={6}
                  placeholder="Full artist biography..."
                />
              </FormField>
            </FormSection>

            <FormSection title="Location">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Country" error={errors.country}>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Uganda"
                  />
                </FormField>
                <FormField label="City" error={errors.city}>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Kampala"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Social Links">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Spotify" error={errors.spotify_url}>
                  <input
                    type="url"
                    value={formData.spotify_url}
                    onChange={(e) => updateField('spotify_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </FormField>
                <FormField label="Apple Music" error={errors.apple_music_url}>
                  <input
                    type="url"
                    value={formData.apple_music_url}
                    onChange={(e) => updateField('apple_music_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://music.apple.com/artist/..."
                  />
                </FormField>
                <FormField label="YouTube" error={errors.youtube_url}>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => updateField('youtube_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://youtube.com/@artist"
                  />
                </FormField>
                <FormField label="Instagram" error={errors.instagram_url}>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => updateField('instagram_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://instagram.com/artist"
                  />
                </FormField>
                <FormField label="Twitter/X" error={errors.twitter_url}>
                  <input
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => updateField('twitter_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://twitter.com/artist"
                  />
                </FormField>
                <FormField label="Facebook" error={errors.facebook_url}>
                  <input
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => updateField('facebook_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://facebook.com/artist"
                  />
                </FormField>
                <FormField label="TikTok" error={errors.tiktok_url} className="col-span-2">
                  <input
                    type="url"
                    value={formData.tiktok_url}
                    onChange={(e) => updateField('tiktok_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://tiktok.com/@artist"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="SEO">
              <FormField label="Meta Title" error={errors.meta_title}>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => updateField('meta_title', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  placeholder="SEO title"
                />
              </FormField>
              <FormField label="Meta Description" error={errors.meta_description}>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => updateField('meta_description', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="SEO description"
                />
              </FormField>
            </FormSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FormSection title="Profile Image">
              <div className="border-2 border-dashed rounded-xl overflow-hidden aspect-square">
                {profilePreview ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={profilePreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, profile_image: null }));
                          setProfilePreview(null);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer p-6">
                    <User className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Upload artist photo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 500x500px
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </FormSection>

            <FormSection title="Cover Image">
              <div className="border-2 border-dashed rounded-xl overflow-hidden aspect-[16/9]">
                {coverPreview ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, cover_image: null }));
                          setCoverPreview(null);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer p-6">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Upload cover image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1920x1080px
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </FormSection>

            <FormSection title="Genres">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {genres?.data?.map(genre => (
                  <label key={genre.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.genre_ids.includes(genre.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('genre_ids', [...formData.genre_ids, genre.id]);
                        } else {
                          updateField('genre_ids', formData.genre_ids.filter(id => id !== genre.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{genre.name}</span>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Status & Visibility">
              <FormField label="Status" error={errors.status}>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-null px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </FormField>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => updateField('is_verified', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Verified Artist</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => updateField('is_featured', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Featured Artist</span>
                </label>
              </div>
            </FormSection>
          </div>
        </div>

        <FormActions
          cancelHref="/admin/artists"
          isSubmitting={createMutation.isPending}
          submitLabel="Create Artist"
        />
      </form>
    </div>
  );
}
