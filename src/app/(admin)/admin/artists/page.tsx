'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Download,
  Star,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Artist {
  id: number;
  name: string;
  slug: string;
  avatar_url: string | null;
  is_verified: boolean;
  songs_count: number;
  albums_count: number;
  followers_count: number;
  total_plays: number;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
}

interface ArtistsResponse {
  success: boolean;
  data: Artist[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface ArtistsStats {
  total: number;
  verified: number;
  pending_verification: number;
  new_this_month: number;
}

export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: artistsData, isLoading } = useQuery({
    queryKey: ['admin', 'artists', { page: currentPage, status: statusFilter, search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', '12');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      return apiGet<ArtistsResponse>(`/admin/artists?${params.toString()}`);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'artists', 'statistics'],
    queryFn: () => apiGet<{ success: boolean; data: ArtistsStats }>('/admin/artists/statistics'),
  });

  const verifyMutation = useMutation({
    mutationFn: (artistId: number) => apiPost(`/admin/artists/${artistId}/verify`, {}),
    onSuccess: () => {
      toast.success('Artist verified');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: () => toast.error('Failed to verify artist'),
  });

  const artists = artistsData?.data || [];
  const meta = artistsData?.meta;
  const stats = statsData?.data;
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
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
          <h1 className="text-2xl font-bold">Artists</h1>
          <p className="text-muted-foreground">Manage artist accounts</p>
        </div>
        <Link
          href="/admin/artists/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Artist
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">{formatNumber(stats?.total || 0)}</p>
          <p className="text-sm text-muted-foreground">Total Artists</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-blue-600">{stats?.verified || 0}</p>
          <p className="text-sm text-muted-foreground">Verified</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-yellow-600">{stats?.pending_verification || 0}</p>
          <p className="text-sm text-muted-foreground">Pending Verification</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-green-600">+{stats?.new_this_month || 0}</p>
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
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search artists..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No artists found
          </div>
        ) : artists.map((artist) => (
          <div key={artist.id} className="p-4 rounded-xl border bg-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted">
                  {artist.avatar_url ? (
                    <Image
                      src={artist.avatar_url}
                      alt={artist.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 text-lg font-bold">
                      {artist.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{artist.name}</p>
                    {artist.is_verified && (
                      <CheckCircle className="h-4 w-4 text-primary fill-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{artist.slug}</p>
                </div>
              </div>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium capitalize',
                statusStyles[artist.status] || statusStyles.active
              )}>
                {artist.status}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4 text-center">
              <div>
                <p className="font-semibold">{artist.songs_count}</p>
                <p className="text-xs text-muted-foreground">Songs</p>
              </div>
              <div>
                <p className="font-semibold">{artist.albums_count}</p>
                <p className="text-xs text-muted-foreground">Albums</p>
              </div>
              <div>
                <p className="font-semibold">{formatNumber(artist.followers_count)}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="font-semibold">{formatNumber(artist.total_plays)}</p>
                <p className="text-xs text-muted-foreground">Plays</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Joined {new Date(artist.created_at).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/artists/${artist.id}`}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  href={`/admin/artists/${artist.id}/edit`}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                {!artist.is_verified && (
                  <button
                    onClick={() => verifyMutation.mutate(artist.id)}
                    disabled={verifyMutation.isPending}
                    className="p-2 hover:bg-muted rounded-lg text-primary disabled:opacity-50"
                    title="Verify"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((meta.current_page - 1) * meta.per_page) + 1}-{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total.toLocaleString()} artists
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
