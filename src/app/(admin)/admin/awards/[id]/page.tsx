'use client';

import { use } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Users,
  Vote,
  ListChecks,
  Crown,
  ChevronRight,
  Plus,
  Check,
  X,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';
import {
  useAdminAwardDetail,
  useDeleteAward,
  useApproveNomination,
  useRejectNomination,
  useSetWinner,
  type AwardStatus,
  type NominationStatus,
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

const nominationStatusConfig: Record<NominationStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  winner: { label: 'Winner', variant: 'info' },
};

export default function AwardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: res, isLoading } = useAdminAwardDetail(id);
  const deleteAward = useDeleteAward();
  const approveNom = useApproveNomination();
  const rejectNom = useRejectNomination();
  const setWinner = useSetWinner();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!res?.data) {
    return (
      <div className="text-center py-24">
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Award Not Found</h3>
        <Link href="/admin/awards" className="text-primary hover:underline">Back to Awards</Link>
      </div>
    );
  }

  const award = res.data;
  const categories = res.categories || [];
  const nominations = res.nominations || [];
  const stats = res.stats || {};
  const config = statusConfig[award.status] || statusConfig.upcoming;

  const handleDelete = () => {
    deleteAward.mutate(award.id, {
      onSuccess: () => router.push('/admin/awards'),
    });
  };

  const groupedNominations = categories.map((cat) => ({
    category: cat,
    nominations: nominations.filter((n) => n.category_id === cat.id),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={award.title}
        description={`${award.year}${award.season ? ` — ${award.season}` : ''}`}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/admin/awards/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        }
      />

      {/* Award Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <StatusBadge status={config.label} variant={config.variant} />
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground mb-1">Visibility</p>
          <p className="font-medium capitalize">{award.visibility}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground mb-1">Categories</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground mb-1">Nominations</p>
          <p className="text-2xl font-bold">{nominations.length}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nominations</p>
            <p className="text-sm">
              {award.nomination_starts_at
                ? `${new Date(award.nomination_starts_at).toLocaleDateString()} — ${award.nomination_ends_at ? new Date(award.nomination_ends_at).toLocaleDateString() : 'TBD'}`
                : 'Not set'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Voting</p>
            <p className="text-sm">
              {award.voting_starts_at
                ? `${new Date(award.voting_starts_at).toLocaleDateString()} — ${award.voting_ends_at ? new Date(award.voting_ends_at).toLocaleDateString() : 'TBD'}`
                : 'Not set'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ceremony</p>
            <p className="text-sm">
              {award.ceremony_date ? new Date(award.ceremony_date).toLocaleDateString() : 'TBD'}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {award.description && (
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{award.description}</p>
        </div>
      )}

      {/* Settings */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            {award.allow_public_nominations ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Public Nominations</span>
          </div>
          <div className="flex items-center gap-2">
            {award.allow_public_voting ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Public Voting</span>
          </div>
          <div className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{award.votes_per_category} vote(s) per category</span>
          </div>
        </div>
      </div>

      {/* Nominations by Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nominations by Category</h3>
          <Link
            href={`/admin/awards/nominations?award_id=${award.id}`}
            className="text-sm text-primary hover:underline"
          >
            View All Nominations
          </Link>
        </div>

        {groupedNominations.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-xl border">
            <ListChecks className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No categories or nominations yet</p>
          </div>
        ) : (
          groupedNominations.map(({ category, nominations: noms }) => (
            <div key={category.id} className="bg-card rounded-xl border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{category.category_type}</p>
                </div>
                <span className="text-sm text-muted-foreground">{noms.length} nominations</span>
              </div>
              {noms.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">No nominations in this category</p>
              ) : (
                <div className="divide-y">
                  {noms.map((nom) => {
                    const nomConfig = nominationStatusConfig[nom.status] || nominationStatusConfig.pending;
                    return (
                      <div key={nom.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          {nom.status === 'winner' && <Crown className="h-4 w-4 text-amber-500" />}
                          <div>
                            <p className="font-medium">{nom.nominee_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{nom.nominee_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={nomConfig.label} variant={nomConfig.variant} />
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Award"
        description={`Are you sure you want to delete "${award.title}"? All associated nominations and votes will also be removed.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteAward.isPending}
      />
    </div>
  );
}
