'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import { Upload, X, Mic } from 'lucide-react';
import Image from 'next/image';

interface PodcastFormData {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  host_name: string;
  host_bio: string;
  category_id: string;
  language: string;
  website: string;
  email: string;
  spotify_url: string;
  apple_podcasts_url: string;
  google_podcasts_url: string;
  rss_feed_url: string;
  is_explicit: boolean;
  is_featured: boolean;
  status: string;
  cover_image: File | null;
}

const initialFormData: PodcastFormData = {
  title: '',
  slug: '',
  description: '',
  short_description: '',
  host_name: '',
  host_bio: '',
  category_id: '',
  language: 'en',
  website: '',
  email: '',
  spotify_url: '',
  apple_podcasts_url: '',
  google_podcasts_url: '',
  rss_feed_url: '',
  is_explicit: false,
  is_featured: false,
  status: 'draft',
  cover_image: null,
};

interface Category {
  id: string;
  name: string;
}

export default function EditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PodcastFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const { data: podcastData, isLoading } = useQuery({
    queryKey: ['admin', 'podcast', id],
    queryFn: () => apiGet<{ data: any }>(`/admin/podcasts/${id}`),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'podcast-categories'],
    queryFn: () => apiGet<{ data: Category[] }>('/api/admin/podcast-categories'),
  });

  useEffect(() => {
    if (podcastData?.data) {
      const p = podcastData.data;
      setFormData({
        title: p.title || '',
        slug: p.slug || '',
        description: p.description || '',
        short_description: p.short_description || '',
        host_name: p.host_name || '',
        host_bio: p.host_bio || '',
        category_id: p.category?.id || p.category_id || '',
        language: p.language || 'en',
        website: p.website || '',
        email: p.email || '',
        spotify_url: p.spotify_url || '',
        apple_podcasts_url: p.apple_podcasts_url || '',
        google_podcasts_url: p.google_podcasts_url || '',
        rss_feed_url: p.rss_feed_url || '',
        is_explicit: p.is_explicit || false,
        is_featured: p.is_featured || false,
        status: p.status || 'draft',
        cover_image: null,
      });
      if (p.cover_url) {
        setCoverPreview(p.cover_url);
      }
    }
  }, [podcastData]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost(`/admin/podcasts/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'podcasts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'podcast', id] });
      router.push(`/admin/podcasts/${id}`);
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('_method', 'PUT');
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          data.append(key, value ? '1' : '0');
        } else if (value instanceof File) {
          data.append(key, value);
        } else {
          data.append(key, String(value));
        }
      }
    });
    
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Podcast"
        description={`Editing ${formData.title}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Podcasts', href: '/admin/podcasts' },
          { label: formData.title || 'Podcast', href: `/admin/podcasts/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/admin/podcasts/${id}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Podcast Information" description="Basic podcast details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Title"
              name="title"
              value={formData.title}
              onChangeEvent={handleChange}
              error={errors.title}
              required
            />
            <FormField
              label="Slug"
              name="slug"
              value={formData.slug}
              onChangeEvent={handleChange}
              error={errors.slug}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select category...</option>
                {categoriesData?.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Host Information" description="Details about the podcast host">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Host Name"
              name="host_name"
              value={formData.host_name}
              onChangeEvent={handleChange}
              error={errors.host_name}
            />
            <FormField
              label="Contact Email"
              name="email"
              type="email"
              value={formData.email}
              onChangeEvent={handleChange}
              error={errors.email}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Host Bio</label>
            <textarea
              name="host_bio"
              value={formData.host_bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </FormSection>

        <FormSection title="Cover Image" description="Podcast artwork">
          <div className="flex items-start gap-6">
            {coverPreview ? (
              <div className="relative w-40 h-40 rounded-lg overflow-hidden">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview(null);
                    setFormData(prev => ({ ...prev, cover_image: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-40 h-40 rounded-lg bg-muted flex items-center justify-center">
                <Mic className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div>
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted">
                <Upload className="h-4 w-4" />
                <span>Upload Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Square image, 1400x1400px minimum
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection title="External Links" description="Podcast distribution links">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChangeEvent={handleChange}
              error={errors.website}
            />
            <FormField
              label="RSS Feed URL"
              name="rss_feed_url"
              type="url"
              value={formData.rss_feed_url}
              onChangeEvent={handleChange}
              error={errors.rss_feed_url}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Spotify"
              name="spotify_url"
              type="url"
              value={formData.spotify_url}
              onChangeEvent={handleChange}
              error={errors.spotify_url}
            />
            <FormField
              label="Apple Podcasts"
              name="apple_podcasts_url"
              type="url"
              value={formData.apple_podcasts_url}
              onChangeEvent={handleChange}
              error={errors.apple_podcasts_url}
            />
          </div>
          
          <FormField
            label="Google Podcasts"
            name="google_podcasts_url"
            type="url"
            value={formData.google_podcasts_url}
            onChangeEvent={handleChange}
            error={errors.google_podcasts_url}
          />
        </FormSection>

        <FormSection title="Settings" description="Podcast visibility and status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_explicit"
                checked={formData.is_explicit}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Contains Explicit Content</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Featured Podcast</span>
            </label>
          </div>
        </FormSection>

        <FormActions
          cancelHref={`/admin/podcasts/${id}`}
          isLoading={updateMutation.isPending}
          submitLabel="Update Podcast"
        />
      </form>
    </div>
  );
}
