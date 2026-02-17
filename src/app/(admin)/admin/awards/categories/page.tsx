'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Tags,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';
import {
  useAdminAwardCategories,
  useDeleteAwardCategory,
  type CategoryType,
} from '@/hooks/useAwards';

const categoryTypeLabels: Record<CategoryType, string> = {
  music: 'Music',
  artist: 'Artist',
  album: 'Album',
  song: 'Song',
  video: 'Video',
  podcast: 'Podcast',
  general: 'General',
};

export default function AdminCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: res, isLoading } = useAdminAwardCategories({
    search: searchQuery || undefined,
    type: typeFilter || undefined,
    page,
    per_page: 15,
  });

  const deleteCategory = useDeleteAwardCategory();

  const categories = res?.data || [];
  const meta = res?.meta;

  const handleDelete = () => {
    if (deleteId) {
      deleteCategory.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Award Categories"
        description="Manage categories used across all award shows"
        actions={
          <Link
            href="/admin/awards/categories/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Category
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="">All Types</option>
          {Object.entries(categoryTypeLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Categories Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border">
          <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first award category</p>
          <Link
            href="/admin/awards/categories/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Create Category
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Sort Order</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cat.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        {cat.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                        {cat.category_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={cat.is_active ? 'Active' : 'Inactive'}
                        variant={cat.is_active ? 'success' : 'default'}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{cat.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600"
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
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} ({meta.total} categories)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                  disabled={page === meta.last_page}
                  className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back Link */}
      <div>
        <Link href="/admin/awards" className="text-sm text-primary hover:underline">
          ← Back to Awards
        </Link>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? Nominations in this category may be affected."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
