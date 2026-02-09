'use client';

import { useState } from 'react';
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

export default function CreatePodcastPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PodcastFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'podcast-categories'],
    queryFn: () => apiGet<{ data: Category[] }>('/admin/podcast-categories'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost('/admin/podcasts', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'podcasts'] });
      router.push('/admin/podcasts');
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
    
    // Auto-generate slug
    if (name === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
    
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
    
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Podcast"
        description="Add a new podcast show"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Podcasts', href: '/admin/podcasts' },
          { label: 'Create' },
        ]}
        backHref="/admin/podcasts"
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
              placeholder="The Music Hour"
            />
            <FormField
              label="Slug"
              name="slug"
              value={formData.slug}
              onChangeEvent={handleChange}
              error={errors.slug}
              required
              placeholder="the-music-hour"
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
              placeholder="Brief summary of the podcast..."
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
              placeholder="Detailed description of the podcast..."
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
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
              placeholder="John Doe"
            />
            <FormField
              label="Contact Email"
              name="email"
              type="email"
              value={formData.email}
              onChangeEvent={handleChange}
              error={errors.email}
              placeholder="podcast@example.com"
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
              placeholder="Brief bio about the host..."
            />
          </div>
        </FormSection>

        <FormSection title="Cover Image" description="Podcast artwork (1400x1400 recommended)">
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
          {errors.cover_image && <p className="text-sm text-red-500">{errors.cover_image}</p>}
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
              placeholder="https://example.com"
            />
            <FormField
              label="RSS Feed URL"
              name="rss_feed_url"
              type="url"
              value={formData.rss_feed_url}
              onChangeEvent={handleChange}
              error={errors.rss_feed_url}
              placeholder="https://example.com/feed.xml"
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
              placeholder="https://open.spotify.com/show/..."
            />
            <FormField
              label="Apple Podcasts"
              name="apple_podcasts_url"
              type="url"
              value={formData.apple_podcasts_url}
              onChangeEvent={handleChange}
              error={errors.apple_podcasts_url}
              placeholder="https://podcasts.apple.com/..."
            />
          </div>
          
          <FormField
            label="Google Podcasts"
            name="google_podcasts_url"
            type="url"
            value={formData.google_podcasts_url}
            onChangeEvent={handleChange}
            error={errors.google_podcasts_url}
            placeholder="https://podcasts.google.com/..."
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
          cancelHref="/admin/podcasts"
          isLoading={createMutation.isPending}
          submitLabel="Create Podcast"
        />
      </form>
    </div>
  );
}
