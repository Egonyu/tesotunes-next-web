'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPostForm } from '@/lib/api';
import { Upload, X, Music, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import { toast } from 'sonner';
import { getErrorMessage, getValidationErrors } from '@/lib/utils';
import { buildAdminSongCreateFormData } from '@/lib/admin-song-payloads';

// -------------------------------------------------------------------
// Types — matching the Laravel backend contract (CLAUDE.md §Song Upload)
// -------------------------------------------------------------------

interface AlbumOption {
  id: number;
  title: string;
}

interface ArtistOption {
  id: number;
  name: string;
}

interface GenreOption {
  id: number;
  name: string;
  slug?: string;
}

/** Form state mirrors backend validation rules exactly */
interface SongFormState {
  title: string;
  artist_id: string;
  audio: File | null;
  cover: File | null;
  album_id: string;
  genre_id: string;
  genre_ids: string[];
  featured_artists: string[];
  lyrics: string;
  release_date: string;
  duration_seconds: string;
  price: string;
  is_explicit: boolean;
  description: string;
  composer: string;
  producer: string;
  is_downloadable: boolean;
  is_free: boolean;
  status: string;
}

const INITIAL_FORM: SongFormState = {
  title: '',
  artist_id: '',
  audio: null,
  cover: null,
  album_id: '',
  genre_id: '',
  genre_ids: [],
  featured_artists: [],
  lyrics: '',
  release_date: '',
  duration_seconds: '',
  price: '',
  is_explicit: false,
  description: '',
  composer: '',
  producer: '',
  is_downloadable: true,
  is_free: true,
  status: 'draft',
};

export default function CreateSongPage() {
  const router = useRouter();
  const [form, setForm] = useState<SongFormState>(INITIAL_FORM);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---- Data queries ----

  const { data: albumsRes } = useQuery({
    queryKey: ['admin', 'albums', 'list'],
    queryFn: () => apiGet<{ data: AlbumOption[] }>('/admin/albums?per_page=500'),
  });

  const { data: artistsRes } = useQuery({
    queryKey: ['admin', 'artists', 'list'],
    queryFn: () => apiGet<{ data: ArtistOption[] }>('/admin/artists?per_page=500'),
  });

  const { data: genresRes } = useQuery({
    queryKey: ['genres'],
    queryFn: () => apiGet<{ data: GenreOption[] }>('/genres'),
  });

  const albums = albumsRes?.data ?? [];
  const artists = artistsRes?.data ?? [];
  const genres = genresRes?.data ?? [];

  // ---- Mutation ----

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiPostForm('/admin/songs', data),
    onSuccess: () => {
      toast.success('Song created successfully!');
      router.push('/admin/songs');
    },
    onError: (error: unknown) => {
      const validationErrors = getValidationErrors(error);
      if (validationErrors && !validationErrors._form) {
        setErrors(validationErrors);
        toast.error('Please fix the validation errors below');
      } else {
        toast.error(getErrorMessage(error, 'Failed to create song. Please try again.'));
      }
    },
  });

  // ---- Helpers ----

  const updateField = <K extends keyof SongFormState>(field: K, value: SongFormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Cover image must be under 10MB');
        return;
      }
      updateField('cover', file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error('Audio file must be under 500MB');
        return;
      }
      updateField('audio', file);
      setAudioFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation — only title + audio are required by backend
    const validationErrors: Record<string, string> = {};
    if (!form.title.trim()) validationErrors.title = 'Title is required';
    if (!form.artist_id) validationErrors.artist_id = 'Artist is required';
    if (!form.audio) validationErrors.audio = 'Audio file is required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    const data = buildAdminSongCreateFormData({
      title: form.title,
      artist_id: form.artist_id,
      status: form.status,
      explicit: form.is_explicit,
      is_featured: false,
      album_id: form.album_id,
      release_date: form.release_date,
      duration_seconds: form.duration_seconds,
      lyrics: form.lyrics,
      description: form.description,
      genre_ids: form.genre_ids.length > 0 ? form.genre_ids : (form.genre_id ? [form.genre_id] : []),
      featured_artists: form.featured_artists,
      composer: form.composer,
      producer: form.producer,
      price: form.is_free ? '' : form.price,
      is_downloadable: form.is_downloadable,
      is_free: form.is_free,
      audio_file: form.audio,
      cover_image: form.cover,
    });

    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Song"
        description="Upload and publish a new song to the platform"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Songs', href: '/admin/songs' },
          { label: 'New Song' },
        ]}
        backHref="/admin/songs"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============ Main Content (left 2/3) ============ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <FormSection title="Basic Information">
              <FormField label="Title" required error={errors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  placeholder="Enter song title"
                  maxLength={255}
                />
              </FormField>

              <FormField label="Artist" required error={errors.artist_id}>
                <select
                  value={form.artist_id}
                  onChange={(e) => updateField('artist_id', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={String(artist.id)}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Description" error={errors.description}>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Brief description of the song (max 2000 characters)"
                  maxLength={2000}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Composer" error={errors.composer}>
                  <input
                    type="text"
                    value={form.composer}
                    onChange={(e) => updateField('composer', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Song composer"
                    maxLength={255}
                  />
                </FormField>
                <FormField label="Producer" error={errors.producer}>
                  <input
                    type="text"
                    value={form.producer}
                    onChange={(e) => updateField('producer', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Song producer"
                    maxLength={255}
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Audio File */}
            <FormSection title="Audio File">
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                {audioFileName ? (
                  <div className="flex items-center justify-center gap-4">
                    <Music className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{audioFileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {form.audio ? `${(form.audio.size / (1024 * 1024)).toFixed(1)} MB` : ''}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          updateField('audio', null);
                          setAudioFileName(null);
                        }}
                        className="text-sm text-red-600 hover:underline mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload audio file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, FLAC, AAC, M4A, OGG — max 500MB
                    </p>
                    <input
                      type="file"
                      accept=".mp3,.wav,.flac,.aac,.m4a,.ogg,audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {(errors.audio || errors.audio_file) && (
                <p className="text-sm text-red-600 mt-1">{errors.audio || errors.audio_file}</p>
              )}
            </FormSection>

            {/* Lyrics */}
            <FormSection title="Lyrics">
              <textarea
                value={form.lyrics}
                onChange={(e) => updateField('lyrics', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary font-mono text-sm"
                rows={10}
                placeholder="Enter song lyrics..."
              />
            </FormSection>

            {/* Featured Artists */}
            <FormSection title="Featured Artists">
              <FormField label="Featured Artists" error={errors.featured_artists || errors['featured_artists.0']}>
                <select
                  multiple
                  value={form.featured_artists}
                  onChange={(e) =>
                    updateField(
                      'featured_artists',
                      Array.from(e.target.selectedOptions).map((option) => option.value)
                    )
                  }
                  className="w-full min-h-30 px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  {artists
                    .filter((artist) => String(artist.id) !== form.artist_id)
                    .map((artist) => (
                      <option key={artist.id} value={String(artist.id)}>
                        {artist.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Hold Ctrl or Cmd to select multiple featured artists
                </p>
              </FormField>
            </FormSection>
          </div>

          {/* ============ Sidebar (right 1/3) ============ */}
          <div className="space-y-6">
            {/* Cover Image */}
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
                          updateField('cover', null);
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
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      JPEG, PNG, WebP — max 10MB
                    </p>
                    <input
                      type="file"
                      accept=".jpeg,.jpg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {(errors.cover || errors.cover_image) && (
                <p className="text-sm text-red-600 mt-1">{errors.cover || errors.cover_image}</p>
              )}
            </FormSection>

            {/* Album */}
            <FormSection title="Album">
              <FormField label="Album" error={errors.album_id}>
                <select
                  value={form.album_id}
                  onChange={(e) => updateField('album_id', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="">Single (No Album)</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </FormField>
            </FormSection>

            {/* Genre */}
            <FormSection title="Genre">
              <FormField label="Primary Genre" error={errors.genre_id}>
                <select
                  value={form.genre_id}
                  onChange={(e) => updateField('genre_id', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select genre</option>
                  {genres.map(genre => (
                    <option key={genre.id} value={String(genre.id)}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Additional Genres" error={errors.genre_ids}>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {genres.map(genre => (
                    <label key={genre.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.genre_ids.includes(String(genre.id))}
                        onChange={(e) => {
                          const gid = String(genre.id);
                          if (e.target.checked) {
                            updateField('genre_ids', [...form.genre_ids, gid]);
                          } else {
                            updateField('genre_ids', form.genre_ids.filter(id => id !== gid));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{genre.name}</span>
                    </label>
                  ))}
                  {genres.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">Loading genres...</p>
                  )}
                </div>
              </FormField>
            </FormSection>

            {/* Pricing */}
            <FormSection title="Pricing">
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_free}
                    onChange={(e) => updateField('is_free', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Free song</span>
                </label>

                {!form.is_free && (
                  <FormField label="Price (UGX)" error={errors.price}>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      min="0"
                      step="100"
                    />
                  </FormField>
                )}

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_downloadable}
                    onChange={(e) => updateField('is_downloadable', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Allow downloads</span>
                </label>
              </div>
            </FormSection>

            {/* Release & Status */}
            <FormSection title="Release & Status">
              <FormField label="Release Date" error={errors.release_date}>
                <input
                  type="date"
                  value={form.release_date}
                  onChange={(e) => updateField('release_date', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
              </FormField>

              <FormField label="Duration (seconds or mm:ss)" error={errors.duration_seconds}>
                <input
                  type="text"
                  value={form.duration_seconds}
                  onChange={(e) => updateField('duration_seconds', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  placeholder="245 or 04:05"
                />
              </FormField>

              <FormField label="Status" error={errors.status}>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="published">Published</option>
                </select>
              </FormField>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_explicit}
                  onChange={(e) => updateField('is_explicit', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Explicit Content</span>
              </label>
            </FormSection>
          </div>
        </div>

        {/* Submit */}
        <FormActions
          cancelHref="/admin/songs"
          isSubmitting={createMutation.isPending}
          submitLabel={createMutation.isPending ? 'Uploading...' : 'Create Song'}
        />

        {createMutation.isPending && (
          <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Uploading audio file... This may take a moment for large files.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
