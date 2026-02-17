'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ListChecks,
  Search,
  Loader2,
  Check,
  X,
  Crown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';
import {
  useAdminNominations,
  useApproveNomination,
  useRejectNomination,
  useSetWinner,
  useDeleteNomination,
  useCreateNomination,
  type NominationStatus,
  type NomineeType,
  type CreateNominationData,
} from '@/hooks/useAwards';

const nominationStatusConfig: Record<NominationStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  winner: { label: 'Winner', variant: 'info' },
};

export default function AdminNominationsPage() {
  const searchParams = useSearchParams();
  const initialAwardId = searchParams.get('award_id');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [awardFilter, setAwardFilter] = useState(initialAwardId || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: res, isLoading } = useAdminNominations({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    award_id: awardFilter ? Number(awardFilter) : undefined,
    category_id: categoryFilter ? Number(categoryFilter) : undefined,
    page,
    per_page: 15,
  });

  const approveNom = useApproveNomination();
  const rejectNom = useRejectNomination();
  const setWinner = useSetWinner();
  const deleteNom = useDeleteNomination();
  const createNom = useCreateNomination();

  const nominations = res?.data || [];
  const seasons = res?.seasons || [];
  const categories = res?.categories || [];
  const meta = res?.meta;

  // Quick create form state
  const [newNom, setNewNom] = useState<CreateNominationData>({
    award_id: Number(initialAwardId) || 0,
    category_id: 0,
    nominee_name: '',
    nominee_type: 'artist',
    nomination_reason: '',
    is_official: true,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNom.mutate(newNom, {
      onSuccess: () => {
        setShowCreateForm(false);
        setNewNom({ award_id: 0, category_id: 0, nominee_name: '', nominee_type: 'artist', nomination_reason: '', is_official: true });
      },
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteNom.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nominations"
        description="Review, approve, and manage award nominations"
        actions={
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Nomination
          </button>
        }
      />

      {/* Quick Create Form */}
      {showCreateForm && (
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Add Official Nomination</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Award *</label>
                <select
                  value={newNom.award_id}
                  onChange={(e) => setNewNom((p) => ({ ...p, award_id: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  required
                >
                  <option value={0}>Select Award...</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>{s.title} ({s.year})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Category *</label>
                <select
                  value={newNom.category_id}
                  onChange={(e) => setNewNom((p) => ({ ...p, category_id: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  required
                >
                  <option value={0}>Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Nominee Name *</label>
                <input
                  type="text"
                  value={newNom.nominee_name}
                  onChange={(e) => setNewNom((p) => ({ ...p, nominee_name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  placeholder="Nominee name..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Nominee Type</label>
                <select
                  value={newNom.nominee_type}
                  onChange={(e) => setNewNom((p) => ({ ...p, nominee_type: e.target.value as NomineeType }))}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                >
                  <option value="artist">Artist</option>
                  <option value="song">Song</option>
                  <option value="album">Album</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Reason (optional)</label>
              <textarea
                value={newNom.nomination_reason}
                onChange={(e) => setNewNom((p) => ({ ...p, nomination_reason: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg bg-background"
                rows={2}
                placeholder="Why this nominee deserves a nomination..."
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={createNom.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createNom.isPending ? 'Creating...' : 'Create Nomination'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nominees..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="winner">Winner</option>
        </select>
        <select
          value={awardFilter}
          onChange={(e) => { setAwardFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="">All Awards</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>{s.title} ({s.year})</option>
          ))}
        </select>
      </div>

      {/* Nominations Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : nominations.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border">
          <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Nominations Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter || awardFilter
              ? 'Try adjusting your filters'
              : 'No nominations have been submitted yet'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nominee</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Award</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Official</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nominations.map((nom) => {
                  const config = nominationStatusConfig[nom.status] || nominationStatusConfig.pending;
                  return (
                    <tr key={nom.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {nom.status === 'winner' && <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                          <div>
                            <p className="font-medium">{nom.nominee_name}</p>
                            {nom.nomination_reason && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{nom.nomination_reason}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{nom.category?.name || `#${nom.category_id}`}</td>
                      <td className="px-4 py-3 text-sm">{nom.award?.title || `#${nom.award_id}`}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 capitalize">
                          {nom.nominee_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={config.label} variant={config.variant} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {nom.is_official ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {nom.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveNom.mutate(nom.id)}
                                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600 transition-colors"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => rejectNom.mutate(nom.id)}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 transition-colors"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {nom.status === 'approved' && (
                            <button
                              onClick={() => setWinner.mutate(nom.id)}
                              className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded text-amber-600 transition-colors"
                              title="Set as Winner"
                            >
                              <Crown className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteId(nom.id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 transition-colors"
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
                Page {meta.current_page} of {meta.last_page} ({meta.total} nominations)
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
        title="Delete Nomination"
        description="Are you sure you want to delete this nomination? Associated votes will also be removed."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteNom.isPending}
      />
    </div>
  );
}
