'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import {
  ArrowLeft,
  Upload,
  Music,
  Image as ImageIcon,
  Loader2,
  Plus,
  X,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateAlbumPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    release_date: '',
    type: 'album' as 'album' | 'single' | 'ep',
  });
  const [tracks, setTracks] = useState<{ title: string; file: File | null }[]>([]);

  const createAlbum = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost<{ data: { id: number } }>('/artist/albums', data);
    },
    onSuccess: (res) => {
      toast.success('Album created successfully!');
      router.push('/artist/albums');
    },
    onError: () => {
      toast.error('Failed to create album. Please try again.');
    },
  });

  const addTrack = () => {
    setTracks([...tracks, { title: '', file: null }]);
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const updateTrack = (index: number, field: string, value: string | File) => {
    const updated = [...tracks];
    updated[index] = { ...updated[index], [field]: value };
    setTracks(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('genre', formData.genre);
    data.append('release_date', formData.release_date);
    data.append('type', formData.type);

    tracks.forEach((track, i) => {
      data.append(`tracks[${i}][title]`, track.title);
      if (track.file) {
        data.append(`tracks[${i}][file]`, track.file);
      }
    });

    createAlbum.mutate(data);
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
        {/* Cover Art & Basic Info */}
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div>
            <label className="block text-sm font-medium mb-2">Cover Art</label>
            <div className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload Cover</span>
            </div>
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

        {/* Tracks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tracks</h2>
            <button
              type="button"
              onClick={addTrack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Add Track
            </button>
          </div>

          {tracks.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed p-8 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">No tracks added</h3>
              <p className="text-sm text-muted-foreground mb-4">Add tracks to your album</p>
              <button
                type="button"
                onClick={addTrack}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Add First Track
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground w-6 text-center">{i + 1}</span>
                  <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={track.title}
                    onChange={(e) => updateTrack(i, 'title', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-md border bg-background text-sm"
                    placeholder="Track title"
                  />
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm cursor-pointer hover:bg-muted">
                    <Upload className="h-3.5 w-3.5" />
                    {track.file ? track.file.name.slice(0, 20) : 'Upload'}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) updateTrack(i, 'file', e.target.files[0]);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeTrack(i)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={createAlbum.isPending || !formData.title}
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
