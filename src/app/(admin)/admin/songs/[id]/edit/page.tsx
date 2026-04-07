'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Music, Upload, Image as ImageIcon, FileAudio } from 'lucide-react';
import { apiGet, apiPostForm } from '@/lib/api';
import { PageHeader, FormActions, FormField, FormSection } from '@/components/admin';
import { toast } from 'sonner';
import { buildAdminSongUpdateFormData } from '@/lib/admin-song-payloads';

type ArtistOption = { id: number; name: string };
type AlbumOption = { id: number; title: string };
type GenreOption = { id: number; name: string };

type SongDetail = {
  id: number;
  title: string;
  slug?: string | null;
  description?: string | null;
  lyrics?: string | null;
  status?: 'draft' | 'pending' | 'published' | 'rejected' | string;
  is_featured?: boolean;
  is_explicit?: boolean;
  artwork_url?: string | null;
  audio_file_url?: string | null;
  artist_id?: number | null;
  album_id?: number | null;
  release_date?: string | null;
  track_number?: number | null;
  disc_number?: number | null;
  duration_seconds?: number | null;
  genre_ids?: number[];
  genres?: Array<{ id: number | string; name: string }>;
  featured_artists?: Array<number | string | { id: number | string }>;
  isrc?: string | null;
  bpm?: number | null;
  key?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

type SongFormState = {
  title: string;
  slug: string;
  artist_id: string;
  album_id: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  explicit: boolean;
  is_featured: boolean;
  release_date: string;
  track_number: string;
  disc_number: string;
  duration_seconds: string;
  genre_ids: string[];
  featured_artists: string[];
  isrc: string;
  bpm: string;
  key: string;
  description: string;
  lyrics: string;
  meta_title: string;
  meta_description: string;
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

type UpdateSongVariables = {
  includeFiles: boolean;
  fallbackFromInvalidUpload?: boolean;
};

const EMPTY_FORM: SongFormState = {
  title: '',
  slug: '',
  artist_id: '',
  album_id: '',
  status: 'draft',
  explicit: false,
  is_featured: false,
  release_date: '',
  track_number: '',
  disc_number: '',
  duration_seconds: '',
  genre_ids: [],
  featured_artists: [],
  isrc: '',
  bpm: '',
  key: '',
  description: '',
  lyrics: '',
  meta_title: '',
  meta_description: '',
};

function extractFieldErrors(error: unknown): { message: string; fields: Record<string, string> } {
  const e = error as ApiError;
  const fields: Record<string, string> = {};
  const all = e.response?.data?.errors;

  if (all) {
    for (const [key, value] of Object.entries(all)) {
      fields[key] = value[0];
    }
  }

  return {
    message: e.response?.data?.message || e.message || 'Failed to update song',
    fields,
  };
}

function normalizeFeaturedArtists(input: SongDetail['featured_artists']): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry) => {
      if (typeof entry === 'number' || typeof entry === 'string') return String(entry);
      if (entry && typeof entry === 'object' && 'id' in entry) return String(entry.id);
      return '';
    })
    .filter(Boolean);
}

function toDateInput(dateLike?: string | null): string {
  if (!dateLike) return '';
  return dateLike.includes('T') ? dateLike.split('T')[0] : dateLike;
}

function hasInvalidUploadError(message?: string): boolean {
  if (!message) return false;
  return /uploaded file is invalid|invalid upload|path must not be empty/i.test(message);
}

export default function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SongFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const { data: songRes, isLoading: songLoading } = useQuery({
    queryKey: ['admin', 'song', id],
    queryFn: () => apiGet<{ data: SongDetail }>(`/admin/songs/${id}`),
  });

  const { data: artistsRes } = useQuery({
    queryKey: ['admin', 'artists', 'song-edit'],
    queryFn: () => apiGet<{ data: ArtistOption[] }>('/admin/artists?per_page=1000'),
  });

  const { data: albumsRes } = useQuery({
    queryKey: ['admin', 'albums', 'song-edit'],
    queryFn: () => apiGet<{ data: AlbumOption[] }>('/albums?per_page=1000'),
  });

  const { data: genresRes } = useQuery({
    queryKey: ['admin', 'genres', 'song-edit'],
    queryFn: () => apiGet<{ data: GenreOption[] }>('/admin/genres'),
  });

  const song = songRes?.data;
  const artists = artistsRes?.data ?? [];
  const albums = albumsRes?.data ?? [];
  const genres = genresRes?.data ?? [];

  useEffect(() => {
    if (!song) return;

    const genreIds = song.genre_ids?.length
      ? song.genre_ids.map(String)
      : (song.genres ?? []).map((genre) => String(genre.id));

    setFormData({
      title: song.title || '',
      slug: song.slug || '',
      artist_id: song.artist_id ? String(song.artist_id) : '',
      album_id: song.album_id ? String(song.album_id) : '',
      status: (song.status as SongFormState['status']) || 'draft',
      explicit: !!song.is_explicit,
      is_featured: !!song.is_featured,
      release_date: toDateInput(song.release_date),
      track_number: song.track_number ? String(song.track_number) : '',
      disc_number: song.disc_number ? String(song.disc_number) : '',
      duration_seconds: song.duration_seconds ? String(song.duration_seconds) : '',
      genre_ids: genreIds,
      featured_artists: normalizeFeaturedArtists(song.featured_artists),
      isrc: song.isrc || '',
      bpm: song.bpm ? String(song.bpm) : '',
      key: song.key || '',
      description: song.description || '',
      lyrics: song.lyrics || '',
      meta_title: song.meta_title || '',
      meta_description: song.meta_description || '',
    });

    setCoverPreview(song.artwork_url || null);
    setCoverFile(null);
    setAudioFile(null);
    setErrors({});
  }, [song]);

  const featuredArtistOptions = useMemo(
    () => artists.filter((artist) => String(artist.id) !== formData.artist_id),
    [artists, formData.artist_id]
  );

  const safeCoverPreview = useMemo(() => {
    const value = coverPreview?.trim();
    return value ? value : null;
  }, [coverPreview]);

  const updateMutation = useMutation({
    mutationFn: async (variables: UpdateSongVariables) => {
      const payload = buildAdminSongUpdateFormData({
        title: formData.title,
        artist_id: formData.artist_id,
        status: formData.status,
        explicit: formData.explicit,
        is_featured: formData.is_featured,
        slug: formData.slug,
        album_id: formData.album_id,
        duration_seconds: formData.duration_seconds,
        release_date: formData.release_date,
        track_number: formData.track_number,
        disc_number: formData.disc_number,
        lyrics: formData.lyrics,
        description: formData.description,
        isrc: formData.isrc,
        bpm: formData.bpm,
        key: formData.key,
        genre_ids: formData.genre_ids,
        featured_artists: formData.featured_artists,
        audio_file: variables.includeFiles ? audioFile : null,
        cover_image: variables.includeFiles ? coverFile : null,
      });

      return apiPostForm<{ success: boolean; message?: string; data?: SongDetail }>(
        `/admin/songs/${id}`,
        payload,
        { timeout: 0 }
      );
    },
    onSuccess: (response, variables) => {
      if (variables.fallbackFromInvalidUpload) {
        toast.success('Song metadata updated. File replacement was skipped because the previous upload handle expired. Reselect files and save again if needed.');
      } else {
        toast.success(response.message || 'Song updated successfully');
      }

      setErrors({});
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });

      if (variables.fallbackFromInvalidUpload) {
        return;
      }

      router.push(`/admin/songs/${id}`);
    },
    onError: (error, variables) => {
      const parsed = extractFieldErrors(error);

      const invalidUpload = [
        parsed.message,
        parsed.fields.audio_file,
        parsed.fields.cover_image,
      ].some((entry) => hasInvalidUploadError(entry));

      if (invalidUpload && variables.includeFiles && (coverFile || audioFile)) {
        setCoverFile(null);
        setAudioFile(null);
        toast.warning('File upload handle expired. Retrying save without file replacement.');
        updateMutation.mutate({ includeFiles: false, fallbackFromInvalidUpload: true });
        return;
      }

      setErrors(parsed.fields);
      toast.error(Object.values(parsed.fields)[0] || parsed.message);
    },
  });

  const toggleGenre = (genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      genre_ids: prev.genre_ids.includes(genreId)
        ? prev.genre_ids.filter((idValue) => idValue !== genreId)
        : [...prev.genre_ids, genreId],
    }));
  };

  const handleCoverChange = (file?: File) => {
    if (!file) return;
    if (file.size <= 0) {
      toast.error('Selected cover image is empty. Please choose a valid file');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Cover image must be an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Cover image must be less than 10MB');
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (file?: File) => {
    if (!file) return;
    if (file.size <= 0) {
      toast.error('Selected audio file is empty. Please choose a valid file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Audio file must be less than 50MB');
      return;
    }

    setAudioFile(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!formData.title.trim()) nextErrors.title = 'Title is required';
    if (!formData.artist_id) nextErrors.artist_id = 'Artist is required';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    updateMutation.mutate({ includeFiles: true });
  };

  if (songLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-120 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="py-12 text-center">
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
        title={`Edit: ${song.title}`}
        description="Update song metadata, media and publishing settings"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Songs', href: '/admin/songs' },
          { label: song.title, href: `/admin/songs/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/admin/songs/${id}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Core Details" description="Fields map directly to SongsApiController::update validation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Title" required error={errors.title}>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                    placeholder="Song title"
                  />
                </FormField>

                <FormField label="Slug" error={errors.slug}>
                  <input
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                    placeholder="auto-generated-if-empty"
                  />
                </FormField>

                <FormField label="Artist" required error={errors.artist_id}>
                  <select
                    value={formData.artist_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, artist_id: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  >
                    <option value="">Select artist</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={String(artist.id)}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Album" error={errors.album_id}>
                  <select
                    value={formData.album_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, album_id: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  >
                    <option value="">No album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={String(album.id)}>
                        {album.title}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Status" error={errors.status}>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as SongFormState['status'] }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </FormField>

                <FormField label="Release Date" error={errors.release_date}>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, release_date: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={formData.explicit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, explicit: e.target.checked }))}
                  />
                  Explicit content
                </label>

                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  />
                  Featured song
                </label>
              </div>
            </FormSection>

            <FormSection title="Catalog Metadata">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Track #" error={errors.track_number}>
                  <input
                    type="number"
                    min={1}
                    value={formData.track_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, track_number: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>

                <FormField label="Disc #" error={errors.disc_number}>
                  <input
                    type="number"
                    min={1}
                    value={formData.disc_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, disc_number: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>

                <FormField label="Duration (seconds or mm:ss)" error={errors.duration_seconds}>
                  <input
                    value={formData.duration_seconds}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration_seconds: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                    placeholder="245 or 04:05"
                  />
                </FormField>

                <FormField label="ISRC" error={errors.isrc}>
                  <input
                    value={formData.isrc}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isrc: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>

                <FormField label="BPM" error={errors.bpm}>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={formData.bpm}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bpm: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>

                <FormField label="Key" error={errors.key}>
                  <input
                    value={formData.key}
                    onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                    placeholder="C#, Fm"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Genres & Contributors">
              <FormField label="Genres" error={errors.genre_ids || errors['genre_ids.0']}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-lg border p-3">
                  {genres.map((genre) => {
                    const genreId = String(genre.id);
                    const checked = formData.genre_ids.includes(genreId);

                    return (
                      <label key={genre.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleGenre(genreId)}
                        />
                        {genre.name}
                      </label>
                    );
                  })}
                </div>
              </FormField>

              <FormField label="Featured Artists" error={errors.featured_artists || errors['featured_artists.0']}>
                <select
                  multiple
                  value={formData.featured_artists}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                    setFormData((prev) => ({ ...prev, featured_artists: values }));
                  }}
                  className="w-full min-h-30 rounded-lg border px-4 py-2 bg-background"
                >
                  {featuredArtistOptions.map((artist) => (
                    <option key={artist.id} value={String(artist.id)}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </FormSection>

            <FormSection title="Description & Lyrics">
              <FormField label="Description" error={errors.description}>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2 bg-background"
                  placeholder="Short summary for admins and moderation"
                />
              </FormField>

              <FormField label="Lyrics" error={errors.lyrics}>
                <textarea
                  rows={8}
                  value={formData.lyrics}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lyrics: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2 bg-background"
                  placeholder="Song lyrics"
                />
              </FormField>
            </FormSection>
          </div>

          <div className="space-y-6">
            <FormSection title="Cover Image" description="Uploads map to cover_image">
              <div className="space-y-3">
                <div className="relative h-48 rounded-xl border overflow-hidden bg-muted">
                  {safeCoverPreview ? (
                    <img src={safeCoverPreview} alt="Song cover preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Upload cover image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCoverChange(e.target.files?.[0])}
                  />
                </label>
                {errors.cover_image && <p className="text-sm text-red-500">{errors.cover_image}</p>}
              </div>
            </FormSection>

            <FormSection title="Audio File" description="Optional replacement, field name: audio_file">
              <div className="space-y-3">
                {song.audio_file_url && (
                  <audio controls className="w-full" src={song.audio_file_url} />
                )}

                <label className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer">
                  <FileAudio className="h-4 w-4" />
                  {audioFile ? audioFile.name : 'Replace audio file'}
                  <input
                    type="file"
                    accept=".mp3,.wav,.flac,.aac,.m4a,.ogg,audio/*"
                    className="hidden"
                    onChange={(e) => handleAudioChange(e.target.files?.[0])}
                  />
                </label>
                {errors.audio_file && <p className="text-sm text-red-500">{errors.audio_file}</p>}
              </div>
            </FormSection>
          </div>
        </div>

        <FormActions
          cancelHref={`/admin/songs/${id}`}
          isSubmitting={updateMutation.isPending}
          submitLabel={updateMutation.isPending ? 'Saving…' : 'Save Song Changes'}
        />
      </form>
    </div>
  );
}
