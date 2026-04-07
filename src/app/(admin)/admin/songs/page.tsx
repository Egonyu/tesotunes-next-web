'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { cn, formatResolvedDuration } from '@/lib/utils';
import { toast } from 'sonner';
import { isModeratorOnlyRole } from '@/lib/roles';

interface Song {
  id: number;
  title: string;
  artist: { id: number; name: string } | null;
  album: { id: number; title: string } | null;
  artwork_url: string | null;
  duration_seconds?: number;
  duration_formatted?: string;
  plays_count: number | null;
  play_count: number | null;
  status: string;
  created_at: string;
}

interface SongsResponse {
    data: Song[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface SongsStats {
  total: number;
  published: number;
  pending: number;
  draft: number;
  rejected?: number;
  isrc_assigned?: number;
  isrc_ready?: number;
  isrc_blocked?: number;
}

interface BulkApproveResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    approved_count: number;
    isrc_assigned_count: number;
    isrc_already_assigned_count: number;
    isrc_blocked_count: number;
  };
}

function buildApproveToastMessage(payload: BulkApproveResponse['data'], singularLabel: string, pluralLabel: string): string {
  const approvedCount = payload.approved_count || payload.count || 0;
  const label = approvedCount === 1 ? singularLabel : pluralLabel;
  const parts = [`${approvedCount} ${label} approved`];

  if (payload.isrc_assigned_count > 0) {
    parts.push(`${payload.isrc_assigned_count} ISRC assigned`);
  }

  if (payload.isrc_already_assigned_count > 0) {
    parts.push(`${payload.isrc_already_assigned_count} already had ISRC`);
  }

  if (payload.isrc_blocked_count > 0) {
    parts.push(`${payload.isrc_blocked_count} not yet eligible for ISRC`);
  }

  return parts.join(' • ');
}

export default function SongsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') ?? 'all';
  const initialIsrcStatus = searchParams.get('isrc_status') ?? 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [isrcFilter, setIsrcFilter] = useState<string>(initialIsrcStatus);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);
  const [playingSong, setPlayingSong] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isModeratorOnly = isModeratorOnlyRole(session?.user?.role);

  const { data: songsData, isLoading } = useQuery({
    queryKey: ['admin', 'songs', { page: currentPage, status: statusFilter, isrcStatus: isrcFilter, search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', '20');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (isrcFilter !== 'all') params.set('isrc_status', isrcFilter);
      if (searchQuery) params.set('search', searchQuery);
      return apiGet<SongsResponse>(`/admin/songs?${params.toString()}`);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'songs', 'statistics'],
    queryFn: () => apiGet<{ data: SongsStats }>('/admin/songs/statistics'),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (songIds: number[]) => apiPost<BulkApproveResponse>('/admin/songs/bulk-approve', { song_ids: songIds }),
    onSuccess: (response) => {
      toast.success(buildApproveToastMessage(response.data, 'song', 'songs'));
      setSelectedSongs([]);
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to approve songs'),
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (songIds: number[]) => apiPost('/admin/songs/bulk-reject', { song_ids: songIds }),
    onSuccess: () => {
      toast.success('Songs rejected');
      setSelectedSongs([]);
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to reject songs'),
  });

  const deleteMutation = useMutation({
    mutationFn: (songId: number) => apiDelete(`/admin/songs/${songId}`),
    onSuccess: () => {
      toast.success('Song deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to delete song'),
  });

  const approveSingleMutation = useMutation({
    mutationFn: (songId: number) => apiPost<BulkApproveResponse>('/admin/songs/bulk-approve', { song_ids: [songId] }),
    onSuccess: (response) => {
      toast.success(buildApproveToastMessage(response.data, 'song', 'songs'));
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to approve song'),
  });

  const rejectSingleMutation = useMutation({
    mutationFn: (songId: number) => apiPost('/admin/songs/bulk-reject', { song_ids: [songId], reason: 'Rejected by admin' }),
    onSuccess: () => {
      toast.success('Song rejected');
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to reject song'),
  });

  const songs = songsData?.data || [];
  const meta = songsData?.meta;
  const stats = statsData?.data;

  const statusStyles: Record<string, string> = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  const statusLabels: Record<string, string> = {
    published: 'Published',
    pending_review: 'Pending Review',
    pending: 'Pending Review',
    rejected: 'Rejected',
    draft: 'Draft',
  };

  const formatPlays = (plays: number | null | undefined) => {
    const count = plays ?? 0;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const toggleSelectAll = () => {
    if (selectedSongs.length === songs.length) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs(songs.map(s => s.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedSongs.includes(id)) {
      setSelectedSongs(selectedSongs.filter(s => s !== id));
    } else {
      setSelectedSongs([...selectedSongs, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Songs</h1>
          <p className="text-muted-foreground">Manage music catalog</p>
        </div>
        <Link
          href="/admin/songs/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Song
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-8 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{formatPlays(stats?.total || 0)}</p>
          <p className="text-sm text-muted-foreground">Total Songs</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-green-600">{formatPlays(stats?.published || 0)}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-gray-600">{formatPlays(stats?.draft || 0)}</p>
          <p className="text-sm text-muted-foreground">Drafts</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-emerald-600">{stats?.isrc_assigned || 0}</p>
          <p className="text-sm text-muted-foreground">ISRC Assigned</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-blue-600">{stats?.isrc_ready || 0}</p>
          <p className="text-sm text-muted-foreground">ISRC Ready</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-amber-600">{stats?.isrc_blocked || 0}</p>
          <p className="text-sm text-muted-foreground">ISRC Blocked</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search songs..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="pending">Pending Review</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={isrcFilter}
          onChange={(e) => { setIsrcFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All ISRC States</option>
          <option value="assigned">ISRC Assigned</option>
          <option value="ready">ISRC Ready</option>
          <option value="blocked">ISRC Blocked</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
          <Filter className="h-4 w-4" />
          More Filters
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedSongs.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedSongs.length} selected</span>
          <button
            onClick={() => bulkApproveMutation.mutate(selectedSongs)}
            disabled={bulkApproveMutation.isPending}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </button>
          <button
            onClick={() => bulkRejectMutation.mutate(selectedSongs)}
            disabled={bulkRejectMutation.isPending}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
          {!isModeratorOnly && (
            <button className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSongs.length === songs.length}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium">Song</th>
                <th className="p-4 text-left text-sm font-medium">Artist</th>
                <th className="p-4 text-left text-sm font-medium">Duration</th>
                <th className="p-4 text-left text-sm font-medium">Plays</th>
                <th className="p-4 text-left text-sm font-medium">Status</th>
                <th className="p-4 text-left text-sm font-medium">Uploaded</th>
                <th className="p-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {songs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No songs found
                  </td>
                </tr>
              ) : songs.map((song) => (
                <tr key={song.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedSongs.includes(song.id)}
                      onChange={() => toggleSelect(song.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted group">
                        {song.artwork_url ? (
                          <Image
                            src={song.artwork_url}
                            alt={song.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                            <Play className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          onClick={() => setPlayingSong(playingSong === song.id ? null : song.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {playingSong === song.id ? (
                            <Pause className="h-5 w-5 text-white" />
                          ) : (
                            <Play className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.album?.title || 'Single'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{song.artist?.name || 'Unknown'}</td>
                  <td className="p-4 text-sm text-muted-foreground">{formatResolvedDuration(undefined, song.duration_seconds, song.duration_formatted)}</td>
                  <td className="p-4 text-sm">{formatPlays(song.play_count ?? song.plays_count)}</td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      statusStyles[song.status || 'draft'] || statusStyles.draft
                    )}>
                      {statusLabels[song.status || 'draft'] || song.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(song.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      {(song.status === 'pending' || song.status === 'pending_review') && (
                        <>
                          <button
                            onClick={() => approveSingleMutation.mutate(song.id)}
                            disabled={approveSingleMutation.isPending}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-950 rounded-lg text-green-600 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => rejectSingleMutation.mutate(song.id)}
                            disabled={rejectSingleMutation.isPending}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-yellow-600 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/admin/songs/${song.id}`}
                        className="p-2 hover:bg-muted rounded-lg"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/songs/${song.id}/edit`}
                        className="p-2 hover:bg-muted rounded-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {!isModeratorOnly && (
                        <button
                          onClick={() => deleteMutation.mutate(song.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 hover:bg-muted rounded-lg text-red-500 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((meta.current_page - 1) * meta.per_page) + 1}-{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total.toLocaleString()} songs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'px-3 py-1 rounded-lg',
                      page === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                  >
                    {page}
                  </button>
                );
              })}
              {meta.last_page > 5 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    onClick={() => setCurrentPage(meta.last_page)}
                    className={cn(
                      'px-3 py-1 rounded-lg',
                      meta.last_page === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                  >
                    {meta.last_page}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                disabled={currentPage === meta.last_page}
                className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
