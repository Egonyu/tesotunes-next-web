'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Loader2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCreateAlbum } from '@/hooks/useArtist';

export default function CreateAlbumPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const createAlbum = useCreateAlbum();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    release_date: '',
    type: 'album' as 'album' | 'single' | 'ep',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Album title is required');
      return;
    }

    try {
      await createAlbum.mutateAsync({
        title: formData.title,
        description: formData.description,
        release_date: formData.release_date || undefined,
        type: formData.type,
        genre: formData.genre,
        cover_image: coverFile || undefined,
      });
      toast.success('Album created successfully!');
      router.push('/artist/albums');
    } catch {
      toast.error('Failed to create album. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/artist/albums" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Album</h1>
          <p className="text-muted-foreground">Upload your music and share it with the world</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverChange}
        />

        {/* Cover Art & Basic Info */}
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div>
            <label className="block text-sm font-medium mb-2">Cover Art</label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="aspect-square w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden relative"
            >
              {coverPreview ? (
                <Image src={coverPreview} alt="Album cover preview" fill className="object-cover" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload Cover</span>
                </>
              )}
            </button>
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
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
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

        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground mb-1">
            <Upload className="h-4 w-4" />
            Add songs after album creation
          </div>
          <p>
            Album metadata and cover art are saved first. Upload individual tracks from the artist upload flow and attach them to this album after it is created.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={createAlbum.isPending || !formData.title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {createAlbum.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createAlbum.isPending ? 'Creating...' : 'Create Album'}
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
