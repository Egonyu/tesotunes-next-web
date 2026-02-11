'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Upload, X, Plus, Disc } from 'lucide-react';
import Image from 'next/image';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';

interface Artist {
  id: string;
  name: string;
}

interface Genre {
  id: string;
  name: string;
}

interface AlbumFormData {
  title: string;
  slug: string;
  artist_id: string;
  featured_artists: string[];
  genre_ids: string[];
  release_date: string;
  album_type: string;
  description: string;
  label: string;
  copyright: string;
  upc: string;
  status: string;
  is_featured: boolean;
  explicit: boolean;
  cover_image: File | null;
  meta_title: string;
  meta_description: string;
}

export default function CreateAlbumPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AlbumFormData>({
    title: '',
    slug: '',
    artist_id: '',
    featured_artists: [],
    genre_ids: [],
    release_date: '',
    album_type: 'album',
    description: '',
    label: '',
    copyright: '',
    upc: '',
    status: 'draft',
    is_featured: false,
    explicit: false,
    cover_image: null,
    meta_title: '',
    meta_description: '',
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: artists } = useQuery({
    queryKey: ['admin', 'artists', 'list'],
    queryFn: () => apiGet<{ data: Artist[] }>('/api/admin/artists?per_page=1000'),
  });

  const { data: genres } = useQuery({
    queryKey: ['admin', 'genres', 'list'],
    queryFn: () => apiGet<{ data: Genre[] }>('/api/admin/genres'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost('/api/admin/albums', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      router.push('/admin/albums');
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

  const updateField = (field: keyof AlbumFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
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
    data.append('title', formData.title);
    data.append('slug', formData.slug);
    data.append('artist_id', formData.artist_id);
    data.append('release_date', formData.release_date);
    data.append('album_type', formData.album_type);
    data.append('description', formData.description);
    data.append('label', formData.label);
    data.append('copyright', formData.copyright);
    data.append('upc', formData.upc);
    data.append('status', formData.status);
    data.append('is_featured', formData.is_featured ? '1' : '0');
    data.append('explicit', formData.explicit ? '1' : '0');
    data.append('meta_title', formData.meta_title);
    data.append('meta_description', formData.meta_description);
    
    formData.genre_ids.forEach(id => data.append('genre_ids[]', id));
    formData.featured_artists.forEach(id => data.append('featured_artists[]', id));
    
    if (formData.cover_image) data.append('cover_image', formData.cover_image);
    
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Album"
        description="Create a new album or EP"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Albums', href: '/admin/albums' },
          { label: 'New Album' },
        ]}
        backHref="/admin/albums"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Title"
                  required
                  error={errors.title}
                  className="col-span-2"
                >
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Enter album title"
                  />
                </FormField>

                <FormField label="Slug" error={errors.slug}>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="album-url-slug"
                  />
                </FormField>

                <FormField label="UPC" error={errors.upc}>
                  <input
                    type="text"
                    value={formData.upc}
                    onChange={(e) => updateField('upc', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="012345678901"
                  />
                </FormField>
              </div>

              <FormField label="Description" error={errors.description}>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Album description, story behind it, etc."
                />
              </FormField>
            </FormSection>

            <FormSection title="Release Details">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Release Date" required error={errors.release_date}>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => updateField('release_date', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  />
                </FormField>

                <FormField label="Album Type" error={errors.album_type}>
                  <select
                    value={formData.album_type}
                    onChange={(e) => updateField('album_type', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  >
                    <option value="album">Album</option>
                    <option value="ep">EP</option>
                    <option value="single">Single</option>
                    <option value="compilation">Compilation</option>
                    <option value="live">Live Album</option>
                    <option value="remix">Remix Album</option>
                  </select>
                </FormField>

                <FormField label="Record Label" error={errors.label}>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => updateField('label', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Record label name"
                  />
                </FormField>

                <FormField label="Copyright" error={errors.copyright}>
                  <input
                    type="text"
                    value={formData.copyright}
                    onChange={(e) => updateField('copyright', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="© 2026 Artist Name"
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
            <FormSection title="Cover Art">
              <div className="border-2 border-dashed rounded-xl overflow-hidden aspect-square">
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
                      Upload album cover
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1400x1400px
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

            <FormSection title="Artist">
              <FormField label="Primary Artist" required error={errors.artist_id}>
                <select
                  value={formData.artist_id}
                  onChange={(e) => updateField('artist_id', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select artist</option>
                  {artists?.data?.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Featured Artists" error={errors.featured_artists}>
                <select
                  multiple
                  value={formData.featured_artists}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    updateField('featured_artists', selected);
                  }}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary h-24"
                >
                  {artists?.data?.filter(a => a.id !== formData.artist_id).map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
              </FormField>
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
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="published">Published</option>
                </select>
              </FormField>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.explicit}
                    onChange={(e) => updateField('explicit', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Contains Explicit Content</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => updateField('is_featured', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Featured Album</span>
                </label>
              </div>
            </FormSection>
          </div>
        </div>

        <FormActions
          cancelHref="/admin/albums"
          isSubmitting={createMutation.isPending}
          submitLabel="Create Album"
        />
      </form>
    </div>
  );
}
