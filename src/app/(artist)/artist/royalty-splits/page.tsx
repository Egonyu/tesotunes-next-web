'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Loader2,
  AlertCircle,
  Music,
  Trash2,
  Pencil,
  X,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useRoyaltySplits,
  useCreateRoyaltySplit,
  useUpdateRoyaltySplit,
  useDeleteRoyaltySplit,
  useMyArtistSongs,
  type RoyaltySplit,
  type CreateRoyaltySplitData,
} from '@/hooks/useArtist';

export default function RoyaltySplitsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSplit, setEditingSplit] = useState<RoyaltySplit | null>(null);
  const [deletingSplitId, setDeletingSplitId] = useState<number | null>(null);

  const { data: splits, isLoading, error } = useRoyaltySplits();
  const { data: songsData } = useMyArtistSongs({ per_page: 100, status: 'published' });
  const createMutation = useCreateRoyaltySplit();
  const updateMutation = useUpdateRoyaltySplit();
  const deleteMutation = useDeleteRoyaltySplit();

  const songs = songsData?.data || [];

  // Group splits by song
  const splitsBySong = (splits || []).reduce<Record<number, RoyaltySplit[]>>((acc, split) => {
    if (!acc[split.song_id]) acc[split.song_id] = [];
    acc[split.song_id].push(split);
    return acc;
  }, {});

  const handleDelete = (splitId: number) => {
    deleteMutation.mutate(splitId, {
      onSuccess: () => {
        toast.success('Royalty split removed');
        setDeletingSplitId(null);
      },
      onError: () => toast.error('Failed to remove split'),
    });
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
        <p className="text-destructive">Failed to load royalty splits</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Royalty Splits
          </h1>
          <p className="text-muted-foreground">
            Manage revenue sharing with collaborators
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Split
        </button>
      </div>

      {/* Summary Cards */}
      {splits && splits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border bg-card">
            <p className="text-sm text-muted-foreground">Active Splits</p>
            <p className="text-2xl font-bold">
              {splits.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <p className="text-sm text-muted-foreground">Total Distributed</p>
            <p className="text-2xl font-bold">
              UGX {splits.reduce((sum, s) => sum + s.total_earned, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <p className="text-sm text-muted-foreground">Pending Payouts</p>
            <p className="text-2xl font-bold">
              UGX {splits.reduce((sum, s) => sum + s.pending_payout, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Splits by Song */}
      {Object.keys(splitsBySong).length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Royalty Splits Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add collaborators to share revenue from your songs. Splits can apply to streaming, downloads, or both.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Add Your First Split
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(splitsBySong).map(([songId, songSplits]) => {
            const totalPct = songSplits.reduce((sum, s) => sum + s.percentage, 0);
            const artistPct = 100 - totalPct;
            return (
              <div key={songId} className="rounded-xl border bg-card overflow-hidden">
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Music className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{songSplits[0].song_title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Your share: {artistPct}% · {songSplits.length} collaborator{songSplits.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {/* Percentage bar */}
                  <div className="hidden md:flex items-center gap-2 min-w-[200px]">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${artistPct}%` }}
                        title={`You: ${artistPct}%`}
                      />
                      <div
                        className="h-full bg-orange-400"
                        style={{ width: `${totalPct}%` }}
                        title={`Splits: ${totalPct}%`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {totalPct}% shared
                    </span>
                  </div>
                </div>

                <div className="divide-y">
                  {songSplits.map((split) => (
                    <div
                      key={split.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-bold text-orange-600">
                          {split.recipient_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{split.recipient_name}</p>
                          {split.recipient_email && (
                            <p className="text-xs text-muted-foreground">{split.recipient_email}</p>
                          )}
                          <div className="flex gap-2 mt-1">
                            {split.applies_to_streaming && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                Streaming
                              </span>
                            )}
                            {split.applies_to_downloads && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                Downloads
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-sm">{split.percentage}%</p>
                          <p className="text-xs text-muted-foreground">
                            Earned: UGX {split.total_earned.toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            split.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : split.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {split.status}
                        </span>

                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingSplit(split)}
                            className="p-1.5 rounded hover:bg-muted"
                            title="Edit split"
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setDeletingSplitId(split.id)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Remove split"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Split Modal */}
      {showAddModal && (
        <AddSplitModal
          songs={songs}
          existingSplits={splits || []}
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => {
            createMutation.mutate(data, {
              onSuccess: () => {
                toast.success('Royalty split added');
                setShowAddModal(false);
              },
              onError: () => toast.error('Failed to add split'),
            });
          }}
          isPending={createMutation.isPending}
        />
      )}

      {/* Edit Split Modal */}
      {editingSplit && (
        <EditSplitModal
          split={editingSplit}
          existingSplits={(splits || []).filter(
            (s) => s.song_id === editingSplit.song_id && s.id !== editingSplit.id
          )}
          onClose={() => setEditingSplit(null)}
          onSubmit={(data) => {
            updateMutation.mutate(
              { splitId: editingSplit.id, data },
              {
                onSuccess: () => {
                  toast.success('Split updated');
                  setEditingSplit(null);
                },
                onError: () => toast.error('Failed to update split'),
              }
            );
          }}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      {deletingSplitId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">Remove Split?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This collaborator will no longer receive revenue from this song.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingSplitId(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingSplitId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Add Split Modal
// ============================================================================

function AddSplitModal({
  songs,
  existingSplits,
  onClose,
  onSubmit,
  isPending,
}: {
  songs: Array<{ id: number; title: string }>;
  existingSplits: RoyaltySplit[];
  onClose: () => void;
  onSubmit: (data: CreateRoyaltySplitData) => void;
  isPending: boolean;
}) {
  const [songId, setSongId] = useState<number | ''>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [percentage, setPercentage] = useState('');
  const [streaming, setStreaming] = useState(true);
  const [downloads, setDownloads] = useState(true);

  const selectedSongSplits = songId
    ? existingSplits.filter((s) => s.song_id === songId)
    : [];
  const usedPercentage = selectedSongSplits.reduce((sum, s) => sum + s.percentage, 0);
  const maxPercentage = 100 - usedPercentage;
  const pctValue = Number(percentage) || 0;
  const isValid =
    songId &&
    recipientName.trim() &&
    recipientEmail.trim() &&
    pctValue > 0 &&
    pctValue <= maxPercentage &&
    (streaming || downloads);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !songId) return;
    onSubmit({
      song_id: songId,
      recipient_name: recipientName.trim(),
      recipient_email: recipientEmail.trim(),
      percentage: pctValue,
      applies_to_streaming: streaming,
      applies_to_downloads: downloads,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add Royalty Split</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Song</label>
            <select
              value={songId}
              onChange={(e) => setSongId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              required
            >
              <option value="">Select a song</option>
              {songs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {songId && usedPercentage > 0 && (
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p>
                <span className="font-medium">{usedPercentage}%</span> already assigned to{' '}
                {selectedSongSplits.length} collaborator{selectedSongSplits.length !== 1 ? 's' : ''}.
                Max available: <span className="font-medium">{maxPercentage}%</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Collaborator Name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., Sheebah Karungi"
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              required
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Collaborator Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="collaborator@email.com"
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Revenue Share (%)
            </label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder={`1 - ${maxPercentage}`}
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              min={1}
              max={maxPercentage}
              required
            />
            {pctValue > maxPercentage && (
              <p className="text-xs text-red-500 mt-1">
                Cannot exceed {maxPercentage}% (total splits must be ≤ 100%)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Applies To</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={streaming}
                  onChange={(e) => setStreaming(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Streaming
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={downloads}
                  onChange={(e) => setDownloads(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Downloads
              </label>
            </div>
            {!streaming && !downloads && (
              <p className="text-xs text-red-500 mt-1">Select at least one revenue type</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Split
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Edit Split Modal
// ============================================================================

function EditSplitModal({
  split,
  existingSplits,
  onClose,
  onSubmit,
  isPending,
}: {
  split: RoyaltySplit;
  existingSplits: RoyaltySplit[];
  onClose: () => void;
  onSubmit: (data: { percentage?: number; applies_to_streaming?: boolean; applies_to_downloads?: boolean }) => void;
  isPending: boolean;
}) {
  const [percentage, setPercentage] = useState(String(split.percentage));
  const [streaming, setStreaming] = useState(split.applies_to_streaming);
  const [downloads, setDownloads] = useState(split.applies_to_downloads);

  const otherPct = existingSplits.reduce((sum, s) => sum + s.percentage, 0);
  const maxPercentage = 100 - otherPct;
  const pctValue = Number(percentage) || 0;
  const isValid = pctValue > 0 && pctValue <= maxPercentage && (streaming || downloads);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      percentage: pctValue,
      applies_to_streaming: streaming,
      applies_to_downloads: downloads,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Edit Split — {split.recipient_name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Revenue Share (%)
            </label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              min={1}
              max={maxPercentage}
              required
            />
            {pctValue > maxPercentage && (
              <p className="text-xs text-red-500 mt-1">
                Cannot exceed {maxPercentage}%
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Applies To</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={streaming}
                  onChange={(e) => setStreaming(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Streaming
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={downloads}
                  onChange={(e) => setDownloads(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Downloads
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
