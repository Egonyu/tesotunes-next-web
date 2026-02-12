'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Music,
  Calendar,
  Download,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Album {
  id: number;
  title: string;
  artist: { id: number; name: string } | null;
  artwork_url: string | null;
  songs_count: number;
  release_date: string | null;
  total_plays: number;
  status: 'released' | 'draft' | 'pending' | 'upcoming';
}

interface AlbumsResponse {
    data: Album[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface AlbumsStats {
  total: number;
  released: number;
  pending: number;
  draft: number;
  upcoming: number;
}

export default function AlbumsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlbums, setSelectedAlbums] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: albumsData, isLoading } = useQuery({
    queryKey: ['admin', 'albums', { page: currentPage, status: statusFilter, search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', '20');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      return apiGet<AlbumsResponse>(`/api/admin/albums?${params.toString()}`);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'albums', 'statistics'],
    queryFn: () => apiGet<{ data: AlbumsStats }>('/api/admin/albums/statistics'),
  });

  const deleteMutation = useMutation({
    mutationFn: (albumId: number) => apiDelete(`/api/admin/albums/${albumId}`),
    onSuccess: () => {
      toast.success('Album deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'albums'] });
    },
    onError: () => toast.error('Failed to delete album'),
  });

  const albums = albumsData?.data || [];
  const meta = albumsData?.meta;
  const stats = statsData?.data;
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const statusStyles: Record<string, string> = {
    released: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  };
  
  const toggleSelect = (id: number) => {
    setSelectedAlbums(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    setSelectedAlbums(
      selectedAlbums.length === albums.length ? [] : albums.map(a => a.id)
    );
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
          <h1 className="text-2xl font-bold">Albums</h1>
          <p className="text-muted-foreground">Manage album releases</p>
        </div>
        <Link
          href="/admin/albums/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Album
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{formatNumber(stats?.total || 0)}</p>
          <p className="text-sm text-muted-foreground">Total Albums</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-green-600">{formatNumber(stats?.released || 0)}</p>
          <p className="text-sm text-muted-foreground">Released</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-gray-600">{stats?.draft || 0}</p>
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
            placeholder="Search albums..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="released">Released</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
      
      {/* Bulk Actions */}
      {selectedAlbums.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <span className="text-sm">{selectedAlbums.length} selected</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
              Publish
            </button>
            <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedAlbums.length === albums.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded"
                />
              </th>
              <th className="p-4 text-left text-sm font-medium">Album</th>
              <th className="p-4 text-left text-sm font-medium">Artist</th>
              <th className="p-4 text-left text-sm font-medium">Songs</th>
              <th className="p-4 text-left text-sm font-medium">Plays</th>
              <th className="p-4 text-left text-sm font-medium">Release Date</th>
              <th className="p-4 text-left text-sm font-medium">Status</th>
              <th className="p-4 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {albums.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No albums found
                </td>
              </tr>
            ) : albums.map((album) => (
              <tr key={album.id} className="hover:bg-muted/50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedAlbums.includes(album.id)}
                    onChange={() => toggleSelect(album.id)}
                    className="h-4 w-4 rounded"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                      {album.artwork_url ? (
                        <Image
                          src={album.artwork_url}
                          alt={album.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                          <Music className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{album.title}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{album.artist?.name || 'Unknown'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    {album.songs_count}
                  </div>
                </td>
                <td className="p-4">{formatNumber(album.total_plays)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {album.release_date ? new Date(album.release_date).toLocaleDateString() : 'TBD'}
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium capitalize',
                    statusStyles[album.status] || statusStyles.draft
                  )}>
                    {album.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/albums/${album.id}`}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/albums/${album.id}/edit`}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => deleteMutation.mutate(album.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-muted rounded-lg text-red-600 disabled:opacity-50"
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((meta.current_page - 1) * meta.per_page) + 1}-{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total.toLocaleString()} albums
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
  );
}
