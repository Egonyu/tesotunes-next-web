'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Upload, X, Plus, Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';

interface Artist {
  id: string;
  name: string;
}

interface Album {
  id: string;
  title: string;
}

interface Genre {
  id: string;
  name: string;
}

interface Song {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: number;
  explicit: boolean;
  lyrics: string;
  isrc: string;
  bpm: number;
  key: string;
  track_number: number;
  disc_number: number;
  release_date: string;
  status: string;
  is_featured: boolean;
  cover_url: string;
  artist: { id: string; name: string };
  featured_artists: { id: string; name: string }[];
  album?: { id: string; title: string };
  genres: { id: string; name: string }[];
  credits: { role: string; name: string }[];
  meta_title: string;
  meta_description: string;
}

interface SongFormData {
  title: string;
  slug: string;
  artist_id: string;
  featured_artists: string[];
  album_id: string;
  genre_ids: string[];
  duration: string;
  release_date: string;
  track_number: string;
  disc_number: string;
  explicit: boolean;
  lyrics: string;
  description: string;
  status: string;
  is_featured: boolean;
  audio_file: File | null;
  cover_image: File | null;
  credits: { role: string; name: string }[];
  isrc: string;
  bpm: string;
  key: string;
  meta_title: string;
  meta_description: string;
}

export default function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    slug: '',
    artist_id: '',
    featured_artists: [],
    album_id: '',
    genre_ids: [],
    duration: '',
    release_date: '',
    track_number: '1',
    disc_number: '1',
    explicit: false,
    lyrics: '',
    description: '',
    status: 'draft',
    is_featured: false,
    audio_file: null,
    cover_image: null,
    credits: [],
    isrc: '',
    bpm: '',
    key: '',
    meta_title: '',
    meta_description: '',
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creditInput, setCreditInput] = useState({ role: '', name: '' });

  const { data: song, isLoading: songLoading } = useQuery({
    queryKey: ['admin', 'song', id],
    queryFn: () => apiGet<{ data: Song }>(`/admin/songs/${id}`),
  });

  const { data: artists } = useQuery({
    queryKey: ['admin', 'artists', 'list'],
    queryFn: () => apiGet<{ data: Artist[] }>('/admin/artists?per_page=1000'),
  });

  const { data: albums } = useQuery({
    queryKey: ['admin', 'albums', 'list'],
    queryFn: () => apiGet<{ data: Album[] }>('/admin/albums?per_page=1000'),
  });

  const { data: genres } = useQuery({
    queryKey: ['admin', 'genres', 'list'],
    queryFn: () => apiGet<{ data: Genre[] }>('/admin/genres'),
  });

  // Populate form when song data loads
  useEffect(() => {
    if (song?.data) {
      const s = song.data;
      setFormData({
        title: s.title,
        slug: s.slug,
        artist_id: s.artist.id,
        featured_artists: s.featured_artists?.map(a => a.id) || [],
        album_id: s.album?.id || '',
        genre_ids: s.genres?.map(g => g.id) || [],
        duration: s.duration?.toString() || '',
        release_date: s.release_date?.split('T')[0] || '',
        track_number: s.track_number?.toString() || '1',
        disc_number: s.disc_number?.toString() || '1',
        explicit: s.explicit,
        lyrics: s.lyrics || '',
        description: s.description || '',
        status: s.status,
        is_featured: s.is_featured,
        audio_file: null,
        cover_image: null,
        credits: s.credits || [],
        isrc: s.isrc || '',
        bpm: s.bpm?.toString() || '',
        key: s.key || '',
        meta_title: s.meta_title || '',
        meta_description: s.meta_description || '',
      });
      if (s.cover_url) {
        setCoverPreview(s.cover_url);
      }
    }
  }, [song]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost(`/admin/songs/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
      router.push(`/admin/songs/${id}`);
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

  const updateField = (field: keyof SongFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, audio_file: file }));
      setAudioFileName(file.name);
    }
  };

  const addCredit = () => {
    if (creditInput.role.trim() && creditInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        credits: [...prev.credits, { ...creditInput }],
      }));
      setCreditInput({ role: '', name: '' });
    }
  };

  const removeCredit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      credits: prev.credits.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('_method', 'PUT');
    data.append('title', formData.title);
    data.append('slug', formData.slug);
    data.append('artist_id', formData.artist_id);
    data.append('album_id', formData.album_id);
    data.append('duration', formData.duration);
    data.append('release_date', formData.release_date);
    data.append('track_number', formData.track_number);
    data.append('disc_number', formData.disc_number);
    data.append('explicit', formData.explicit ? '1' : '0');
    data.append('lyrics', formData.lyrics);
    data.append('description', formData.description);
    data.append('status', formData.status);
    data.append('is_featured', formData.is_featured ? '1' : '0');
    data.append('isrc', formData.isrc);
    data.append('bpm', formData.bpm);
    data.append('key', formData.key);
    data.append('meta_title', formData.meta_title);
    data.append('meta_description', formData.meta_description);
    
    formData.genre_ids.forEach(id => data.append('genre_ids[]', id));
    formData.featured_artists.forEach(id => data.append('featured_artists[]', id));
    data.append('credits', JSON.stringify(formData.credits));
    
    if (formData.audio_file) data.append('audio_file', formData.audio_file);
    if (formData.cover_image) data.append('cover_image', formData.cover_image);
    
    updateMutation.mutate(data);
  };

  if (songLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!song?.data) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Song not found</h2>
        <Link href="/admin/songs" className="text-primary hover:underline mt-2 inline-block">
          Back to songs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${song.data.title}`}
        description="Update song information"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Songs', href: '/admin/songs' },
          { label: song.data.title, href: `/admin/songs/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/admin/songs/${id}`}
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
                    placeholder="Enter song title"
                  />
                </FormField>

                <FormField label="Slug" error={errors.slug}>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="song-url-slug"
                  />
                </FormField>

                <FormField label="ISRC" error={errors.isrc}>
                  <input
                    type="text"
                    value={formData.isrc}
                    onChange={(e) => updateField('isrc', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="USRC12345678"
                  />
                </FormField>
              </div>

              <FormField label="Description" error={errors.description}>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Brief description of the song"
                />
              </FormField>
            </FormSection>

            <FormSection title="Audio File">
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                {audioFileName ? (
                  <div className="flex items-center justify-center gap-4">
                    <Music className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{audioFileName}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, audio_file: null }));
                          setAudioFileName(null);
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload new audio file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, FLAC up to 100MB (leave empty to keep current)
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </FormSection>

            <FormSection title="Lyrics">
              <textarea
                value={formData.lyrics}
                onChange={(e) => updateField('lyrics', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary font-mono text-sm"
                rows={10}
                placeholder="Enter song lyrics..."
              />
            </FormSection>

            <FormSection title="Credits">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={creditInput.role}
                    onChange={(e) => setCreditInput(prev => ({ ...prev, role: e.target.value }))}
                    className="flex-1 px-4 py-2 border rounded-lg bg-background"
                    placeholder="Role (e.g., Producer)"
                  />
                  <input
                    type="text"
                    value={creditInput.name}
                    onChange={(e) => setCreditInput(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 px-4 py-2 border rounded-lg bg-background"
                    placeholder="Name"
                  />
                  <button
                    type="button"
                    onClick={addCredit}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {formData.credits.length > 0 && (
                  <div className="space-y-2">
                    {formData.credits.map((credit, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                        <span className="font-medium">{credit.role}:</span>
                        <span className="flex-1">{credit.name}</span>
                        <button
                          type="button"
                          onClick={() => removeCredit(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
            <FormSection title="Cover Image">
              <div className="border-2 border-dashed rounded-xl overflow-hidden aspect-square">
                {coverPreview ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="p-2 bg-white text-black rounded-full hover:bg-gray-200 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                      </label>
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
                      Upload cover art
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

            <FormSection title="Artist & Album">
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

              <FormField label="Album" error={errors.album_id}>
                <select
                  value={formData.album_id}
                  onChange={(e) => updateField('album_id', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="">Single (No Album)</option>
                  {albums?.data?.map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
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

            <FormSection title="Track Details">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Track #" error={errors.track_number}>
                  <input
                    type="number"
                    value={formData.track_number}
                    onChange={(e) => updateField('track_number', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    min="1"
                  />
                </FormField>
                <FormField label="Disc #" error={errors.disc_number}>
                  <input
                    type="number"
                    value={formData.disc_number}
                    onChange={(e) => updateField('disc_number', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    min="1"
                  />
                </FormField>
                <FormField label="BPM" error={errors.bpm}>
                  <input
                    type="number"
                    value={formData.bpm}
                    onChange={(e) => updateField('bpm', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    placeholder="120"
                  />
                </FormField>
                <FormField label="Key" error={errors.key}>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => updateField('key', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    placeholder="Am"
                  />
                </FormField>
              </div>

              <FormField label="Duration (seconds)" error={errors.duration}>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  placeholder="180"
                />
              </FormField>

              <FormField label="Release Date" error={errors.release_date}>
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => updateField('release_date', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
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
                  <span className="text-sm">Explicit Content</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => updateField('is_featured', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Featured Song</span>
                </label>
              </div>
            </FormSection>
          </div>
        </div>

        <FormActions
          cancelHref={`/admin/songs/${id}`}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save Changes"
        />
      </form>
    </div>
  );
}
