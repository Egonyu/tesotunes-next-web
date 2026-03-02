'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Music,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PageHeader, ConfirmDialog } from '@/components/admin';

interface Genre {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  emoji: string | null;
  is_active: boolean;
  sort_order: number;
  songs_count: number;
  artwork_url: string | null;
  created_at: string;
  updated_at: string;
}

interface GenresResponse {
  success: boolean;
  data: Genre[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export default function GenresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null);
  const queryClient = useQueryClient();

  const { data: genresData, isLoading } = useQuery({
    queryKey: ['admin', 'genres', { page: currentPage, search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', '50');
      if (searchQuery) params.set('search', searchQuery);
      return apiGet<GenresResponse>(`/admin/genres?${params.toString()}`);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/admin/genres/${id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'genres'] });
      toast.success('Genre status updated');
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to toggle status';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/genres/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'genres'] });
      toast.success('Genre deleted');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete genre';
      toast.error(msg);
      setDeleteTarget(null);
    },
  });

  const genres = genresData?.data || [];
  const meta = genresData?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Genres"
        description={`Manage music genres${meta ? ` (${meta.total} total)` : ''}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Genres' },
        ]}
        actions={
          <Link
            href="/admin/genres/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Genre
          </Link>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search genres..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Genres Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : genres.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No genres found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term' : 'Create your first genre to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Genre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Color</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Songs</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {genres.map((genre) => (
                  <tr key={genre.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {(genre.emoji || genre.icon) && (
                          <span className="text-xl">{genre.emoji || genre.icon}</span>
                        )}
                        <div>
                          <p className="font-medium">{genre.name}</p>
                          <p className="text-xs text-muted-foreground">{genre.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {genre.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-5 w-5 rounded-full border"
                            style={{ backgroundColor: genre.color }}
                          />
                          <span className="text-xs text-muted-foreground font-mono">{genre.color}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{genre.songs_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{genre.sort_order}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActiveMutation.mutate(genre.id)}
                        disabled={toggleActiveMutation.isPending}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                          genre.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        )}
                      >
                        {genre.is_active ? (
                          <><ToggleRight className="h-3.5 w-3.5" /> Active</>
                        ) : (
                          <><ToggleLeft className="h-3.5 w-3.5" /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/genres/${genre.id}/edit`}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(genre)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
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
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} ({meta.total} genres)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
              disabled={currentPage >= meta.last_page}
              className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Genre"
          description={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone. Genres with published songs cannot be deleted.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
