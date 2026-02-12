'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Edit, Trash2, Music, Play, Pause, Eye, ArrowUpRight, 
  Calendar, TrendingUp, Clock, Disc, User, Tag, Heart,
  Download, Share2, BarChart2, Headphones
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';

interface Song {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: number;
  plays: number;
  downloads: number;
  likes: number;
  shares: number;
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
  audio_url: string;
  artist: { id: string; name: string; slug: string };
  featured_artists: { id: string; name: string; slug: string }[];
  album?: { id: string; title: string; slug: string; cover_url: string };
  genres: { id: string; name: string }[];
  credits: { role: string; name: string }[];
  created_at: string;
  updated_at: string;
}

interface PlayHistory {
  date: string;
  plays: number;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function SongDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: song, isLoading } = useQuery({
    queryKey: ['admin', 'song', id],
    queryFn: () => apiGet<{ data: Song }>(`/api/admin/songs/${id}`),
  });

  const { data: playHistory } = useQuery({
    queryKey: ['admin', 'song', id, 'play-history'],
    queryFn: () => apiGet<{ data: PlayHistory[] }>(`/api/admin/songs/${id}/play-history`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/admin/songs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
      router.push('/admin/songs');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () => apiPost(`/api/admin/songs/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: () => apiPost(`/api/admin/songs/${id}/toggle-featured`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
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

  const s = song.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={s.title}
        description={`by ${s.artist.name}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Songs', href: '/admin/songs' },
          { label: s.title },
        ]}
        backHref="/admin/songs"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/songs/${s.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              View Live
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href={`/admin/songs/${id}/edit`}
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
          {/* Song Header Card */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex gap-6">
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden">
                {s.cover_url ? (
                  <Image
                    src={s.cover_url}
                    alt={s.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Music className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  {isPlaying ? (
                    <Pause className="h-12 w-12 text-white" fill="white" />
                  ) : (
                    <Play className="h-12 w-12 text-white" fill="white" />
                  )}
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={s.status} />
                  {s.explicit && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-800 rounded">
                      EXPLICIT
                    </span>
                  )}
                  {s.is_featured && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded">
                      FEATURED
                    </span>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-1">{s.title}</h2>
                
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Link href={`/admin/artists/${s.artist.id}`} className="hover:text-primary hover:underline">
                    {s.artist.name}
                  </Link>
                  {s.featured_artists?.length > 0 && (
                    <>
                      <span>feat.</span>
                      {s.featured_artists.map((fa, i) => (
                        <span key={fa.id}>
                          <Link href={`/admin/artists/${fa.id}`} className="hover:text-primary hover:underline">
                            {fa.name}
                          </Link>
                          {i < s.featured_artists.length - 1 && ', '}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(s.duration)}</span>
                  </div>
                  {s.album && (
                    <div className="flex items-center gap-1.5">
                      <Disc className="h-4 w-4 text-muted-foreground" />
                      <Link href={`/admin/albums/${s.album.id}`} className="hover:text-primary hover:underline">
                        {s.album.title}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(s.release_date).toLocaleDateString()}</span>
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
                <span className="text-sm">Plays</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(s.plays)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Likes</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(s.likes)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Download className="h-4 w-4" />
                <span className="text-sm">Downloads</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(s.downloads)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Shares</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(s.shares)}</p>
            </div>
          </div>

          {/* Play History Chart Placeholder */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Play History (Last 30 Days)
              </h3>
            </div>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              {playHistory?.data?.length ? (
                <div className="w-full h-full flex items-end gap-1">
                  {playHistory.data.map((day, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                      style={{ 
                        height: `${Math.max(10, (day.plays / Math.max(...playHistory.data.map(d => d.plays))) * 100)}%` 
                      }}
                      title={`${day.date}: ${day.plays} plays`}
                    />
                  ))}
                </div>
              ) : (
                <p>No play data available</p>
              )}
            </div>
          </div>

          {/* Lyrics */}
          {s.lyrics && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Lyrics</h3>
              <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                {s.lyrics}
              </pre>
            </div>
          )}

          {/* Description */}
          {s.description && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Description</h3>
              <p className="text-muted-foreground">{s.description}</p>
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
                <span>{s.status === 'published' ? 'Unpublish' : 'Publish'}</span>
                <StatusBadge status={s.status === 'published' ? 'draft' : 'published'} />
              </button>
              <button
                onClick={() => toggleFeatureMutation.mutate()}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted"
                disabled={toggleFeatureMutation.isPending}
              >
                {s.is_featured ? 'Remove from Featured' : 'Add to Featured'}
              </button>
            </div>
          </div>

          {/* Track Details */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Track Details</h3>
            <dl className="space-y-3 text-sm">
              {s.isrc && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ISRC</dt>
                  <dd className="font-mono">{s.isrc}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Track #</dt>
                <dd>{s.track_number}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Disc #</dt>
                <dd>{s.disc_number}</dd>
              </div>
              {s.bpm && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">BPM</dt>
                  <dd>{s.bpm}</dd>
                </div>
              )}
              {s.key && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Key</dt>
                  <dd>{s.key}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Genres */}
          {s.genres?.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {s.genres.map(genre => (
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

          {/* Credits */}
          {s.credits?.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Credits
              </h3>
              <dl className="space-y-2 text-sm">
                {s.credits.map((credit, i) => (
                  <div key={i} className="flex justify-between">
                    <dt className="text-muted-foreground">{credit.role}</dt>
                    <dd>{credit.name}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Timestamps</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(s.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(s.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Song"
        description={`Are you sure you want to delete "${s.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
