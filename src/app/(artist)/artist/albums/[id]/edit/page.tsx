'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Calendar,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useArtistAlbumDetail, useUpdateAlbum } from '@/hooks/useArtist';

export default function EditAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const { data: album, isLoading } = useArtistAlbumDetail(albumId);
  const updateAlbum = useUpdateAlbum();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    release_date: '',
    type: 'album' as 'album' | 'single' | 'ep',
  });

  // Populate form when album loads
  useEffect(() => {
    if (album) {
      setFormData({
        title: album.title || '',
        description: album.description || '',
        genre: album.genre || '',
        release_date: album.release_date?.split('T')[0] || '',
        type: album.type || 'album',
      });
    }
  }, [album]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Cover image must be less than 10MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Album title is required');
      return;
    }

    try {
      await updateAlbum.mutateAsync({
        id: albumId,
        data: {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          genre: formData.genre,
          release_date: formData.release_date || undefined,
          cover_image: coverFile || undefined,
        },
      });
      toast.success('Album updated successfully!');
      router.push('/artist/albums');
    } catch {
      toast.error('Failed to update album. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Album not found</p>
        <Link href="/artist/albums" className="text-primary hover:underline mt-2 inline-block">
          Back to albums
        </Link>
      </div>
    );
  }

  const displayCover = coverPreview || album.artwork_url || album.artwork;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/artist/albums" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Album</h1>
          <p className="text-muted-foreground">Update &ldquo;{album.title}&rdquo;</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Art & Basic Info */}
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div>
            <label className="block text-sm font-medium mb-2">Cover Art</label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="aspect-square w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden relative"
            >
              {displayCover ? (
                <Image
                  src={displayCover}
                  alt="Album cover"
                  fill
                  className="object-cover"
                />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Change Cover</span>
                </>
              )}
              {displayCover && (
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white font-medium">Change</span>
                </div>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border bg-background"
                placeholder="Album title"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'album' | 'single' | 'ep' })}
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                >
                  <option value="album">Album</option>
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Genre</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                  placeholder="e.g. Afrobeats"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Release Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border bg-background resize-none"
                placeholder="Tell fans about this release..."
              />
            </div>
          </div>
        </div>

        {/* Track listing (read-only) */}
        {album.songs && album.songs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Tracks ({album.songs.length})</h2>
            <div className="rounded-xl border divide-y">
              {album.songs.map((song, i) => (
                <div key={song.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm text-muted-foreground w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {song.play_count.toLocaleString()} plays
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(song.duration_seconds / 60)}:{String(song.duration_seconds % 60).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={updateAlbum.isPending || !formData.title}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {updateAlbum.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {updateAlbum.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/artist/albums"
            className="px-6 py-2.5 rounded-lg border font-medium hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
