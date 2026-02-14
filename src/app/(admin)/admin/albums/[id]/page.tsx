'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Edit, Trash2, Disc, Play, Eye, ArrowUpRight, 
  Calendar, Clock, Music, User, Tag, Heart,
  Headphones, Plus, MoreHorizontal, GripVertical
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';

interface Song {
  id: string;
  title: string;
  slug: string;
  duration: number;
  track_number: number;
  disc_number: number;
  plays: number;
  status: string;
}

interface Album {
  id: string;
  title: string;
  slug: string;
  description: string;
  album_type: string;
  release_date: string;
  label: string;
  copyright: string;
  upc: string;
  total_duration: number;
  total_tracks: number;
  plays: number;
  likes: number;
  status: string;
  is_featured: boolean;
  explicit: boolean;
  cover_url: string;
  artist: { id: string; name: string; slug: string };
  featured_artists: { id: string; name: string; slug: string }[];
  genres: { id: string; name: string }[];
  songs: Song[];
  created_at: string;
  updated_at: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: album, isLoading } = useQuery({
    queryKey: ['admin', 'album', id],
    queryFn: () => apiGet<{ data: Album }>(`/admin/albums/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/admin/albums/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'albums'] });
      router.push('/admin/albums');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () => apiPost(`/admin/albums/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'album', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!album?.data) {
    return (
      <div className="text-center py-12">
        <Disc className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Album not found</h2>
        <Link href="/admin/albums" className="text-primary hover:underline mt-2 inline-block">
          Back to albums
        </Link>
      </div>
    );
  }

  const a = album.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={a.title}
        description={`by ${a.artist.name}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Albums', href: '/admin/albums' },
          { label: a.title },
        ]}
        backHref="/admin/albums"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/albums/${a.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              View Live
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href={`/admin/albums/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Album Header Card */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex gap-6">
              <div className="relative w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-xl">
                {a.cover_url ? (
                  <Image
                    src={a.cover_url}
                    alt={a.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Disc className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded uppercase">
                    {a.album_type}
                  </span>
                  <StatusBadge status={a.status} />
                  {a.explicit && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-800 rounded">
                      EXPLICIT
                    </span>
                  )}
                  {a.is_featured && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded">
                      FEATURED
                    </span>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-1">{a.title}</h2>
                
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Link href={`/admin/artists/${a.artist.id}`} className="hover:text-primary hover:underline">
                    {a.artist.name}
                  </Link>
                  {a.featured_artists?.length > 0 && (
                    <>
                      <span>feat.</span>
                      {a.featured_artists.map((fa, i) => (
                        <span key={fa.id}>
                          <Link href={`/admin/artists/${fa.id}`} className="hover:text-primary hover:underline">
                            {fa.name}
                          </Link>
                          {i < a.featured_artists.length - 1 && ', '}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(a.release_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <span>{a.total_tracks} tracks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(a.total_duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Headphones className="h-4 w-4" />
                <span className="text-sm">Total Plays</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(a.plays)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Likes</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(a.likes)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Music className="h-4 w-4" />
                <span className="text-sm">Tracks</span>
              </div>
              <p className="text-2xl font-bold">{a.total_tracks}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duration</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(a.total_duration)}</p>
            </div>
          </div>

          {/* Tracklist */}
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Music className="h-5 w-5" />
                Tracklist
              </h3>
              <Link
                href={`/admin/songs/new?album_id=${id}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add Track
              </Link>
            </div>
            
            {a.songs?.length > 0 ? (
              <div className="divide-y">
                {a.songs.map((song) => (
                  <div key={song.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 group">
                    <button className="opacity-0 group-hover:opacity-100 cursor-grab text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-sm text-muted-foreground text-center">
                      {song.track_number}
                    </span>
                    <button className="p-1.5 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all">
                      <Play className="h-3 w-3" fill="currentColor" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/admin/songs/${song.id}`}
                        className="font-medium hover:text-primary hover:underline truncate block"
                      >
                        {song.title}
                      </Link>
                    </div>
                    <StatusBadge status={song.status} size="sm" />
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {formatNumber(song.plays)} plays
                    </span>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {formatDuration(song.duration)}
                    </span>
                    <button className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tracks added yet</p>
                <Link
                  href={`/admin/songs/new?album_id=${id}`}
                  className="text-primary hover:underline text-sm"
                >
                  Add the first track
                </Link>
              </div>
            )}
          </div>

          {/* Description */}
          {a.description && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{a.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => toggleStatusMutation.mutate()}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center justify-between"
                disabled={toggleStatusMutation.isPending}
              >
                <span>{a.status === 'published' ? 'Unpublish' : 'Publish'}</span>
                <StatusBadge status={a.status === 'published' ? 'draft' : 'published'} />
              </button>
              <Link
                href={`/admin/songs/new?album_id=${id}`}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Track
              </Link>
            </div>
          </div>

          {/* Album Details */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Album Details</h3>
            <dl className="space-y-3 text-sm">
              {a.upc && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">UPC</dt>
                  <dd className="font-mono">{a.upc}</dd>
                </div>
              )}
              {a.label && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Label</dt>
                  <dd>{a.label}</dd>
                </div>
              )}
              {a.copyright && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Copyright</dt>
                  <dd>{a.copyright}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="capitalize">{a.album_type}</dd>
              </div>
            </dl>
          </div>

          {/* Genres */}
          {a.genres?.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {a.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Timestamps</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(a.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(a.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Album"
        description={`Are you sure you want to delete "${a.title}"? This will not delete the songs but will remove them from this album.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
