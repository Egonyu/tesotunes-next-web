'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Song {
  id: number;
  title: string;
  artist: { id: number; name: string } | null;
  album: { id: number; title: string } | null;
  artwork_url: string | null;
  duration: number;
  plays_count: number;
  status: 'published' | 'pending_review' | 'rejected' | 'draft';
  created_at: string;
}

interface SongsResponse {
  success: boolean;
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
  pending_review: number;
  draft: number;
}

export default function SongsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);
  const [playingSong, setPlayingSong] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  
  const { data: songsData, isLoading } = useQuery({
    queryKey: ['admin', 'songs', { page: currentPage, status: statusFilter, search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', '20');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      return apiGet<SongsResponse>(`/admin/songs?${params.toString()}`);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'songs', 'statistics'],
    queryFn: () => apiGet<{ success: boolean; data: SongsStats }>('/admin/songs/statistics'),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (songIds: number[]) => apiPost('/admin/songs/bulk-approve', { song_ids: songIds }),
    onSuccess: () => {
      toast.success('Songs approved successfully');
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

  const songs = songsData?.data || [];
  const meta = songsData?.meta;
  const stats = statsData?.data;
  
  const statusStyles = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  
  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
    return plays.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{formatPlays(stats?.total || 0)}</p>
          <p className="text-sm text-muted-foreground">Total Songs</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-green-600">{formatPlays(stats?.published || 0)}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-yellow-600">{stats?.pending_review || 0}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-gray-600">{formatPlays(stats?.draft || 0)}</p>
          <p className="text-sm text-muted-foreground">Drafts</p>
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
          <option value="pending_review">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
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
          <button className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
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
                  <td className="p-4 text-sm text-muted-foreground">{formatDuration(song.duration)}</td>
                  <td className="p-4 text-sm">{formatPlays(song.plays_count)}</td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      statusStyles[song.status]
                    )}>
                      {song.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(song.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
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
                      <button
                        onClick={() => deleteMutation.mutate(song.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-muted rounded-lg text-red-500 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
