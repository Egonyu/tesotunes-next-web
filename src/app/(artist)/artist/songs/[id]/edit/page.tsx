'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Music,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistSong, useArtistAlbums } from '@/hooks/useArtist';
import { useGenres } from '@/hooks/api';
import { apiPostForm, isApiError } from '@/lib/api';
import { buildArtistSongUpdateFormData } from '@/lib/artist-media-payloads';
import { toast } from 'sonner';

interface SongDetail {
  id: number;
  title: string;
  cover: string | null;
  artwork_url?: string | null;
  album: string | null;
  album_id: number | null;
  plays: number;
  downloads: number;
  duration: string;
  duration_seconds?: number;
  status: string;
  release_date: string;
  lyrics: string | null;
  description: string | null;
  is_explicit: boolean;
  is_free: boolean;
  is_downloadable?: boolean;
  genre: string | null;
  genre_id?: number | null;
  primary_genre_id?: number | null;
  price: number;
  composer?: string | null;
  producer?: string | null;
  featured_artists?: string | null;
}

export default function EditSongPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const songId = Number(params.id);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState<number | ''>('');
  const [genreId, setGenreId] = useState('');
  const [featuredArtists, setFeaturedArtists] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [isExplicit, setIsExplicit] = useState(false);
  const [description, setDescription] = useState('');
  const [composer, setComposer] = useState('');
  const [producer, setProducer] = useState('');
  const [isDownloadable, setIsDownloadable] = useState(true);
  const [isFree, setIsFree] = useState(true);

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);

  // Data hooks
  const { data: song, isLoading, error: fetchError } = useArtistSong(songId);
  const { data: genres } = useGenres();
  const { data: albumsData } = useArtistAlbums({ per_page: 100, enabled: true });
  const albums = albumsData?.data || [];

  // Populate form when song data loads
  useEffect(() => {
    if (song && !formLoaded) {
      const s = song as unknown as SongDetail;
      setTitle(s.title || '');
      setAlbumId(s.album_id || '');
      setGenreId(String(s.genre_id || s.primary_genre_id || ''));
      setFeaturedArtists(s.featured_artists || '');
      setLyrics(s.lyrics || '');
      setReleaseDate(s.release_date ? s.release_date.split('T')[0] : '');
      setPrice(s.price ? String(s.price) : '');
      setIsExplicit(s.is_explicit || false);
      setDescription(s.description || '');
      setComposer(s.composer || '');
      setProducer(s.producer || '');
      setIsDownloadable(s.is_downloadable !== false);
      setIsFree(s.is_free !== false);
      setCoverPreview(s.artwork_url || s.cover || null);
      setFormLoaded(true);
    }
  }, [song, formLoaded]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Cover image must be less than 10MB');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const formData = buildArtistSongUpdateFormData({
        title: title.trim(),
        album_id: albumId === '' ? undefined : Number(albumId),
        genre: genreId || undefined,
        featured_artists: featuredArtists,
        lyrics,
        release_date: releaseDate || undefined,
        price: price && !isFree ? price : undefined,
        is_explicit: isExplicit,
        description,
        composer,
        producer,
        is_downloadable: isDownloadable,
        is_free: isFree,
        cover_image: coverFile || undefined,
      });

      await apiPostForm(`/artist/songs/${songId}`, formData);

      toast.success('Song updated successfully');
      queryClient.invalidateQueries({ queryKey: ['artist', 'songs'] });
      router.push(`/artist/songs/${songId}`);
    } catch (err: unknown) {
      let errorMessage = 'Failed to update song. Please try again.';
      if (isApiError(err)) {
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(', ');
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (fetchError || !song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Song Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This song doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/artist/songs" className="text-primary hover:underline">
          Back to Songs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Hidden file input */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverSelect}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/artist/songs/${songId}`} className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Edit Song</h1>
          <p className="text-muted-foreground">Update your song details</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded">
            <X className="h-4 w-4 text-red-500" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Art */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Cover Art
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 rounded-xl overflow-hidden bg-muted shrink-0">
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2 border rounded-lg hover:bg-muted text-sm font-medium"
              >
                {coverPreview ? 'Change Cover' : 'Upload Cover'}
              </button>
              {coverFile && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    const s = song as unknown as SongDetail;
                    setCoverPreview(s.artwork_url || s.cover || null);
                  }}
                  className="block text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset to original
                </button>
              )}
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP. Max 10MB. Recommended: 1400x1400px
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-6 rounded-xl border bg-card space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Music className="h-5 w-5" />
            Song Details
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background"
              placeholder="Song title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Album</label>
              <select
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              >
                <option value="">Single (No Album)</option>
                {albums.map((a: { id: number; title: string }) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <select
                value={genreId}
                onChange={(e) => setGenreId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              >
                <option value="">Select genre</option>
                {genres?.map((g: { id: number; name: string }) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Featured Artists</label>
            <input
              type="text"
              value={featuredArtists}
              onChange={(e) => setFeaturedArtists(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background"
              placeholder="e.g., Artist 1, Artist 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg bg-background resize-none"
              placeholder="Brief description of the song"
              maxLength={2000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lyrics</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border rounded-lg bg-background resize-none font-mono text-sm"
              placeholder="Paste your lyrics here..."
            />
          </div>
        </div>

        {/* Pricing & Release */}
        <div className="p-6 rounded-xl border bg-card space-y-4">
          <h2 className="font-semibold">Pricing & Release</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Release Date</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (UGX)</label>
              <input
                type="number"
                value={isFree ? '' : price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isFree}
                className="w-full px-4 py-2 border rounded-lg bg-background disabled:opacity-50"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">Free download</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDownloadable}
                onChange={(e) => setIsDownloadable(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">Allow downloads</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isExplicit}
                onChange={(e) => setIsExplicit(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">Contains explicit content</span>
            </label>
          </div>
        </div>

        {/* Advanced */}
        <div className="p-6 rounded-xl border bg-card">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-full"
          >
            <Info className="h-4 w-4" />
            Advanced Options
            <span className="ml-auto text-xs">{showAdvanced ? 'Hide' : 'Show'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Composer</label>
                  <input
                    type="text"
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    placeholder="Song composer"
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Producer</label>
                  <input
                    type="text"
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    placeholder="Song producer"
                    maxLength={255}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>

          <Link
            href={`/artist/songs/${songId}`}
            className="px-6 py-3 border rounded-lg font-medium hover:bg-muted text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
