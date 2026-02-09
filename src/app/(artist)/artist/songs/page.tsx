'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  MoreVertical,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  MinusSquare,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyArtistSongs, useDeleteSong, useBulkDeleteSongs, useBulkUpdateSongStatus } from '@/hooks/useArtist';
import { toast } from 'sonner';

export default function ArtistSongsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [page, setPage] = useState(1);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  
  const { data: songsData, isLoading, error } = useMyArtistSongs({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    page,
    per_page: 10,
    sort: sortBy === 'title' ? 'title' : sortBy === 'plays' ? 'plays' : sortBy === 'downloads' ? 'downloads' : 'created_at',
    order: sortBy === 'title' ? 'asc' : 'desc',
  });
  
  const deleteSong = useDeleteSong();
  const bulkDelete = useBulkDeleteSongs();
  const bulkStatus = useBulkUpdateSongStatus();
  
  const songs = songsData?.data || [];
  const pagination = songsData?.pagination || { current_page: 1, last_page: 1, per_page: 10, total: 0 };
  const statusCounts = songsData?.status_counts || { total: 0, published: 0, pending: 0, draft: 0 };

  const allSelected = songs.length > 0 && songs.every((s: { id: number }) => selectedIds.has(s.id));
  const someSelected = songs.some((s: { id: number }) => selectedIds.has(s.id));

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(songs.map((s: { id: number }) => s.id)));
    }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedIds.size} selected song(s)?`)) return;
    bulkDelete.mutate(Array.from(selectedIds), {
      onSuccess: () => {
        toast.success(`${selectedIds.size} songs deleted`);
        setSelectedIds(new Set());
        setBatchMode(false);
      },
      onError: () => toast.error('Failed to delete songs'),
    });
  };

  const handleBulkStatus = (status: string) => {
    bulkStatus.mutate({ song_ids: Array.from(selectedIds), status }, {
      onSuccess: () => {
        toast.success(`${selectedIds.size} songs updated to ${status}`);
        setSelectedIds(new Set());
      },
      onError: () => toast.error('Failed to update status'),
    });
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const statusStyles: Record<string, string> = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  
  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteSong.mutate(id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Failed to load songs</p>
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
          <h1 className="text-2xl font-bold">My Songs</h1>
          <p className="text-muted-foreground">Manage your music catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setBatchMode(!batchMode); setSelectedIds(new Set()); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
              batchMode ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted'
            )}
          >
            <CheckSquare className="h-4 w-4" />
            {batchMode ? 'Cancel' : 'Select'}
          </button>
          <Link
            href="/artist/upload"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Upload Song
          </Link>
        </div>
      </div>

      {/* Batch Action Bar */}
      {batchMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-primary/5 border-primary/20">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-border" />
          <button onClick={() => handleBulkStatus('published')} className="px-3 py-1.5 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">
            Publish
          </button>
          <button onClick={() => handleBulkStatus('draft')} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
            Draft
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDelete.isPending}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
          <div className="flex-1" />
          <button onClick={() => { setSelectedIds(new Set()); }} className="p-1 hover:bg-muted rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{statusCounts.total}</p>
          <p className="text-sm text-muted-foreground">Total Songs</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-green-600">{statusCounts.published}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-gray-600">{statusCounts.draft}</p>
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search songs..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="recent">Most Recent</option>
          <option value="plays">Most Plays</option>
          <option value="downloads">Most Downloads</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>
      
      {/* Songs List */}
      <div className="space-y-2">
        {batchMode && songs.length > 0 && (
          <button onClick={toggleSelectAll} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            {allSelected ? <MinusSquare className="h-4 w-4" /> : someSelected ? <MinusSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        )}
        {songs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No songs found</p>
          </div>
        ) : songs.map((song) => (
          <div 
            key={song.id} 
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors",
              batchMode && selectedIds.has(song.id) && "ring-2 ring-primary/50 bg-primary/5"
            )}
          >
            {/* Checkbox */}
            {batchMode && (
              <button onClick={() => toggleSelect(song.id)} className="shrink-0">
                {selectedIds.has(song.id) ? (
                  <CheckSquare className="h-5 w-5 text-primary" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            )}
            {/* Play Button & Cover */}
            <div className="relative group">
              <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={song.cover}
                  alt={song.title}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => setPlayingId(playingId === song.id ? null : song.id)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
              >
                {playingId === song.id ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
            
            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{song.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {song.album || 'Single'} • {song.duration}
              </p>
            </div>
            
            {/* Stats */}
            <div className="hidden md:flex items-center gap-8 text-sm">
              <div className="text-center">
                <p className="font-medium">{formatNumber(song.plays)}</p>
                <p className="text-xs text-muted-foreground">Plays</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{formatNumber(song.downloads)}</p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </div>
            </div>
            
            {/* Status */}
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium capitalize hidden sm:block',
              statusStyles[song.status]
            )}>
              {song.status}
            </span>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-muted rounded-lg hidden md:block" title="Share">
                <Share2 className="h-4 w-4" />
              </button>
              <Link
                href={`/artist/songs/${song.id}`}
                className="p-2 hover:bg-muted rounded-lg"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={`/artist/songs/${song.id}/edit`}
                className="p-2 hover:bg-muted rounded-lg"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button 
                className="p-2 hover:bg-muted rounded-lg text-red-600"
                title="Delete"
                onClick={() => handleDelete(song.id, song.title)}
                disabled={deleteSong.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((pagination.current_page - 1) * pagination.per_page) + 1}-{Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} songs
        </p>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50" 
            disabled={pagination.current_page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
            let pageNum: number;
            if (pagination.last_page <= 5) {
              pageNum = i + 1;
            } else if (pagination.current_page <= 3) {
              pageNum = i + 1;
            } else if (pagination.current_page >= pagination.last_page - 2) {
              pageNum = pagination.last_page - 4 + i;
            } else {
              pageNum = pagination.current_page - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={cn(
                  'px-3 py-1 rounded-lg',
                  pageNum === pagination.current_page
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
