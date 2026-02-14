'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Edit, Trash2, Mic, Play, Plus, ExternalLink, Rss,
  Clock, Headphones, Calendar, Eye, Star, AlertTriangle
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';

interface Episode {
  id: string;
  title: string;
  episode_number: number;
  duration: number;
  plays: number;
  published_at: string;
  status: string;
}

interface PodcastDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  host_name: string;
  host_bio: string;
  category: { id: string; name: string } | null;
  language: string;
  website: string;
  email: string;
  cover_url: string;
  spotify_url: string;
  apple_podcasts_url: string;
  google_podcasts_url: string;
  rss_feed_url: string;
  is_explicit: boolean;
  is_featured: boolean;
  status: string;
  stats: {
    total_episodes: number;
    total_plays: number;
    subscribers: number;
    total_duration: number;
    avg_rating: number;
  };
  episodes: Episode[];
  created_at: string;
  updated_at: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function PodcastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: podcast, isLoading } = useQuery({
    queryKey: ['admin', 'podcast', id],
    queryFn: () => apiGet<{ data: PodcastDetail }>(`/admin/podcasts/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/admin/podcasts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'podcasts'] });
      router.push('/admin/podcasts');
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: () => apiPost(`/admin/podcasts/${id}/toggle-featured`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'podcast', id] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => apiPost(`/admin/podcasts/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'podcast', id] });
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

  if (!podcast?.data) {
    return (
      <div className="text-center py-12">
        <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Podcast not found</h2>
        <Link href="/admin/podcasts" className="text-primary hover:underline mt-2 inline-block">
          Back to podcasts
        </Link>
      </div>
    );
  }

  const p = podcast.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={p.title}
        description={p.short_description}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Podcasts', href: '/admin/podcasts' },
          { label: p.title },
        ]}
        backHref="/admin/podcasts"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/podcasts/${id}/episodes/new`}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Add Episode
            </Link>
            <Link
              href={`/admin/podcasts/${id}/edit`}
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

      {/* Hero Section */}
      <div className="relative rounded-xl border bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
            {p.cover_url ? (
              <Image
                src={p.cover_url}
                alt={p.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Mic className="h-20 w-20 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{p.title}</h2>
              <StatusBadge status={p.status} />
              {p.is_featured && (
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded">
                  Featured
                </span>
              )}
              {p.is_explicit && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
                  Explicit
                </span>
              )}
            </div>
            
            <p className="text-muted-foreground mb-4">
              Hosted by <span className="text-foreground font-medium">{p.host_name}</span>
              {p.category && ` • ${p.category.name}`}
            </p>
            
            <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
            
            {/* External Links */}
            <div className="flex flex-wrap gap-2">
              {p.spotify_url && (
                <a
                  href={p.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full hover:bg-green-200"
                >
                  <span>Spotify</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {p.apple_podcasts_url && (
                <a
                  href={p.apple_podcasts_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full hover:bg-purple-200"
                >
                  <span>Apple</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {p.rss_feed_url && (
                <a
                  href={p.rss_feed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-full hover:bg-orange-200"
                >
                  <Rss className="h-3 w-3" />
                  <span>RSS</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Mic className="h-4 w-4" />
                <span className="text-sm">Episodes</span>
              </div>
              <p className="text-2xl font-bold">{p.stats.total_episodes}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Headphones className="h-4 w-4" />
                <span className="text-sm">Total Plays</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(p.stats.total_plays)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Subscribers</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(p.stats.subscribers)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="h-4 w-4" />
                <span className="text-sm">Rating</span>
              </div>
              <p className="text-2xl font-bold">{p.stats.avg_rating.toFixed(1)}</p>
            </div>
          </div>

          {/* Episodes List */}
          <div className="rounded-xl border bg-card">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Episodes</h3>
              <Link
                href={`/admin/podcasts/${id}/episodes/new`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Episode
              </Link>
            </div>
            {p.episodes?.length > 0 ? (
              <div className="divide-y">
                {p.episodes.map((episode) => (
                  <Link
                    key={episode.id}
                    href={`/admin/podcasts/${id}/episodes/${episode.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {episode.episode_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{episode.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(episode.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Headphones className="h-3 w-3" />
                          {formatNumber(episode.plays)}
                        </span>
                        <span>{new Date(episode.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <StatusBadge status={episode.status} size="sm" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No episodes yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {p.status === 'draft' && (
                <button
                  onClick={() => publishMutation.mutate()}
                  className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
                  disabled={publishMutation.isPending}
                >
                  <Eye className="h-4 w-4" />
                  Publish Podcast
                </button>
              )}
              <button
                onClick={() => toggleFeatureMutation.mutate()}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
                disabled={toggleFeatureMutation.isPending}
              >
                <Star className="h-4 w-4" />
                {p.is_featured ? 'Unfeature' : 'Feature'} Podcast
              </button>
              <Link
                href={`/admin/podcasts/${id}/analytics`}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Analytics
              </Link>
            </div>
          </div>

          {/* Host Info */}
          {p.host_bio && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">About the Host</h3>
              <div className="mb-3">
                <p className="font-medium">{p.host_name}</p>
                {p.email && (
                  <a href={`mailto:${p.email}`} className="text-sm text-primary hover:underline">
                    {p.email}
                  </a>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{p.host_bio}</p>
            </div>
          )}

          {/* Podcast Details */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Language</dt>
                <dd className="font-medium uppercase">{p.language}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Duration</dt>
                <dd className="font-medium">{formatDuration(p.stats.total_duration)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(p.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(p.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Podcast"
        description={`Are you sure you want to delete "${p.title}"? This will permanently remove the podcast and all its episodes.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
