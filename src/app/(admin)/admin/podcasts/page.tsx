'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Play,
  Mic2,
  Headphones,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet, apiDelete } from '@/lib/api';

interface Podcast {
  id: number;
  title: string;
  host: string;
  cover_url: string;
  episodes_count: number;
  subscribers_count: number;
  total_plays: number;
  category: string;
  status: 'active' | 'paused' | 'pending' | 'draft';
  last_episode_at: string;
}

interface PaginatedResponse {
  data: Podcast[];
  meta?: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

interface StatsResponse {
  active_shows?: number;
  total_episodes?: number;
  total_listens?: number;
  new_this_month?: number;
}

export default function PodcastsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'podcasts', 'stats'],
    queryFn: () => apiGet<StatsResponse>('/admin/podcasts/stats'),
  });

  const { data: podcastsData, isLoading, error } = useQuery({
    queryKey: ['admin', 'podcasts', { search: searchQuery, status: statusFilter, page }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('per_page', '12');
      return apiGet<PaginatedResponse>(`/admin/podcasts?${params.toString()}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/podcasts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'podcasts'] });
    },
  });

  const podcasts = podcastsData?.data ?? [];
  const meta = podcastsData?.meta;
  const stats = statsData;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Podcasts</h1>
          <p className="text-muted-foreground">Manage podcast shows</p>
        </div>
        <Link
          href="/admin/podcasts/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Podcast
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Mic2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats?.active_shows ?? '—'}</p>
          <p className="text-sm text-muted-foreground">Active Shows</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats?.total_episodes != null ? formatNumber(stats.total_episodes) : '—'}</p>
          <p className="text-sm text-muted-foreground">Total Episodes</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats?.total_listens != null ? formatNumber(stats.total_listens) : '—'}</p>
          <p className="text-sm text-muted-foreground">Total Listens</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-green-600">{stats?.new_this_month != null ? `+${stats.new_this_month}` : '—'}</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search podcasts..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
          <p className="text-lg font-medium">Failed to load podcasts</p>
          <p className="text-sm">Please try refreshing the page.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && podcasts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Mic2 className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No podcasts found</p>
          <p className="text-sm mb-4">
            {searchQuery ? 'Try adjusting your search.' : 'Get started by creating your first podcast.'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/podcasts/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Podcast
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && podcasts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {podcasts.map((podcast) => (
            <div key={podcast.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {podcast.cover_url ? (
                  <Image
                    src={podcast.cover_url}
                    alt={podcast.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Mic2 className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <span className={cn(
                  'absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium capitalize',
                  statusStyles[podcast.status] ?? statusStyles.pending
                )}>
                  {podcast.status}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold mb-1">{podcast.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">by {podcast.host}</p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center border-y py-3">
                  <div>
                    <p className="font-semibold">{podcast.episodes_count ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Episodes</p>
                  </div>
                  <div>
                    <p className="font-semibold">{formatNumber(podcast.subscribers_count ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                  </div>
                  <div>
                    <p className="font-semibold">{formatNumber(podcast.total_plays ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">Plays</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-muted rounded">{podcast.category}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/podcasts/${podcast.id}`}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/podcasts/${podcast.id}/edit`}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this podcast?')) {
                          deleteMutation.mutate(podcast.id);
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-lg text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((meta.current_page - 1) * meta.per_page) + 1}-{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} podcasts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.current_page <= 1}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'px-3 py-1 rounded-lg',
                  p === meta.current_page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                {p}
              </button>
            ))}
            {meta.last_page > 5 && (
              <>
                <span className="px-2">...</span>
                <button onClick={() => setPage(meta.last_page)} className="px-3 py-1 hover:bg-muted rounded-lg">
                  {meta.last_page}
                </button>
              </>
            )}
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={meta.current_page >= meta.last_page}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
