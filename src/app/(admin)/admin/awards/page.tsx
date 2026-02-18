'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Plus,
  Search,
  Calendar,
  Users,
  Vote,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Award,
  Crown,
  ListChecks,
  Tags,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';
import {
  useAdminAwards,
  useDeleteAward,
  type Award as AwardType,
  type AwardStatus,
  type AwardStats,
} from '@/hooks/useAwards';

const statusConfig: Record<AwardStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  draft: { label: 'Draft', variant: 'default' },
  upcoming: { label: 'Upcoming', variant: 'info' },
  nominations_open: { label: 'Nominations Open', variant: 'warning' },
  nominations_closed: { label: 'Nominations Closed', variant: 'default' },
  voting_open: { label: 'Voting Open', variant: 'success' },
  voting_closed: { label: 'Voting Closed', variant: 'default' },
  completed: { label: 'Completed', variant: 'default' },
};

export default function AdminAwardsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: awardsRes, isLoading } = useAdminAwards({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    page,
    per_page: 10,
  });

  const deleteAward = useDeleteAward();

  const awards = awardsRes?.data || [];
  const stats = awardsRes?.stats;
  const meta = awardsRes?.meta;

  const handleDelete = () => {
    if (deleteId) {
      deleteAward.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Awards Management"
        description="Manage award shows, categories, nominations, and voting"
        actions={
          <Link
            href="/admin/awards/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Award
          </Link>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Awards', value: stats.total_awards, icon: Trophy, color: 'text-amber-500' },
            { label: 'Categories', value: stats.total_categories, icon: Tags, color: 'text-blue-500' },
            { label: 'Nominations', value: stats.total_nominations, icon: ListChecks, color: 'text-purple-500' },
            { label: 'Total Votes', value: stats.total_votes, icon: Vote, color: 'text-green-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg bg-muted', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/awards/categories"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:border-primary/50 transition-colors"
        >
          <Tags className="h-5 w-5 text-blue-500" />
          <div>
            <p className="font-medium">Categories</p>
            <p className="text-sm text-muted-foreground">Manage award categories</p>
          </div>
        </Link>
        <Link
          href="/admin/awards/nominations"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:border-primary/50 transition-colors"
        >
          <ListChecks className="h-5 w-5 text-purple-500" />
          <div>
            <p className="font-medium">Nominations</p>
            <p className="text-sm text-muted-foreground">Review & manage nominations</p>
          </div>
        </Link>
        <Link
          href="/admin/awards/create"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border hover:border-primary/50 transition-colors"
        >
          <Plus className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium">New Award Show</p>
            <p className="text-sm text-muted-foreground">Launch a new award season</p>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search awards..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="nominations_open">Nominations Open</option>
          <option value="voting_open">Voting Open</option>
          <option value="voting_closed">Voting Closed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Awards Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : awards.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Awards Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first award show to get started</p>
          <Link
            href="/admin/awards/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Create Award
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Award</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Year</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Ceremony</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Visibility</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {awards.map((award) => {
                  const config = statusConfig[award.status] || statusConfig.upcoming;
                  return (
                    <tr key={award.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium">{award.title}</p>
                            <p className="text-sm text-muted-foreground">{award.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{award.year}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={config.label} variant={config.variant} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {award.ceremony_date
                          ? new Date(award.ceremony_date).toLocaleDateString()
                          : 'TBD'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full',
                          award.visibility === 'public'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        )}>
                          {award.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/awards/${award.id}`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/awards/${award.id}/edit`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(award.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} ({meta.total} awards)
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Award"
        description="Are you sure you want to delete this award? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteAward.isPending}
      />
    </div>
  );
}
