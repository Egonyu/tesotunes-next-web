'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Music,
  Calendar,
  Loader2,
  AlertCircle,
  Disc3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistAlbums } from '@/hooks/useArtist';

export default function ArtistAlbumsPage() {
  const [page, setPage] = useState(1);
  const { data: albumsData, isLoading, error } = useArtistAlbums({ page, per_page: 12 });

  const albums = albumsData?.data || [];
  const pagination = albumsData?.pagination || { current_page: 1, last_page: 1, per_page: 12, total: 0 };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Failed to load albums</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Albums</h1>
          <p className="text-muted-foreground">Manage your album releases</p>
        </div>
        <Link
          href="/artist/albums/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Album
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Disc3 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{pagination.total}</p>
          <p className="text-sm text-muted-foreground">Total Albums</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Music className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">
            {albums.reduce((sum, a) => sum + (a.songs_count || 0), 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Tracks</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{albums.length > 0 ? 'Active' : 'None'}</p>
          <p className="text-sm text-muted-foreground">Album Status</p>
        </div>
      </div>

      {/* Albums Grid */}
      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Disc3 className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Albums Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first album to organize your songs into collections. Albums help fans discover and enjoy your music.
          </p>
          <Link
            href="/artist/albums/create"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Your First Album
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="rounded-xl border bg-card overflow-hidden group">
              <div className="relative aspect-square bg-muted">
                {album.artwork ? (
                  <Image
                    src={album.artwork}
                    alt={album.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Disc3 className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href={`/artist/albums/${album.id}/edit`}
                    className="p-3 bg-white rounded-full hover:bg-gray-100"
                  >
                    <Edit className="h-5 w-5 text-gray-900" />
                  </Link>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold mb-1">{album.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Music className="h-4 w-4" />
                    {album.songs_count} {album.songs_count === 1 ? 'song' : 'songs'}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/artist/albums/${album.id}/edit`}
                    className="p-2 hover:bg-muted rounded-lg"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Album Card */}
          <Link
            href="/artist/albums/create"
            className="rounded-xl border-2 border-dashed bg-card hover:bg-muted/50 transition-colors flex flex-col items-center justify-center min-h-75 group"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
              <Plus className="h-8 w-8" />
            </div>
            <p className="font-medium">Create New Album</p>
            <p className="text-sm text-muted-foreground">Add songs to a new collection</p>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} albums)
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
              disabled={pagination.current_page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
