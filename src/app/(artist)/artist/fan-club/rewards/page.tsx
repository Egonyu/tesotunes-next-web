'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Gift,
  Plus,
  Loader2,
  AlertCircle,
  Crown,
  Star,
  Edit,
  Trash2,
  X,
  Check,
  Tag,
  Ticket,
  Headphones,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useArtistLoyaltyClub,
  useArtistLoyaltyRewards,
  useCreateLoyaltyReward,
  useUpdateLoyaltyReward,
  useDeleteLoyaltyReward,
  type LoyaltyReward,
} from '@/hooks/useLoyalty';

type RewardFormData = {
  title: string;
  description: string;
  points_required: number;
  quantity_available: number | null;
  reward_type: 'digital' | 'physical' | 'experience' | 'discount';
  expires_at: string;
};

const emptyForm: RewardFormData = {
  title: '',
  description: '',
  points_required: 100,
  quantity_available: null,
  reward_type: 'digital',
  expires_at: '',
};

const rewardTypeIcons: Record<string, typeof Gift> = {
  digital: Headphones,
  physical: ShoppingBag,
  experience: Ticket,
  discount: Tag,
};

const rewardTypeLabels: Record<string, string> = {
  digital: 'Digital Content',
  physical: 'Physical Item',
  experience: 'Experience',
  discount: 'Discount',
};

export default function FanClubRewardsPage() {
  const { data: club, isLoading: loadingClub } = useArtistLoyaltyClub();
  const clubId = club?.id || 0;
  const { data: rewards, isLoading: loadingRewards, error } = useArtistLoyaltyRewards(clubId);
  const createMutation = useCreateLoyaltyReward();
  const updateMutation = useUpdateLoyaltyReward();
  const deleteMutation = useDeleteLoyaltyReward();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RewardFormData>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const rewardsList: LoyaltyReward[] = rewards || [];

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (reward: LoyaltyReward) => {
    setEditingId(reward.id);
    setFormData({
      title: reward.title,
      description: reward.description || '',
      points_required: reward.points_required,
      quantity_available: reward.quantity_available,
      reward_type: reward.reward_type,
      expires_at: reward.expires_at ? reward.expires_at.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Reward title is required');
      return;
    }

    if (editingId) {
      updateMutation.mutate(
        {
          reward_id: editingId,
          title: formData.title,
          description: formData.description || undefined,
          points_required: formData.points_required,
          quantity_available: formData.quantity_available,
          reward_type: formData.reward_type,
          expires_at: formData.expires_at || null,
        },
        {
          onSuccess: () => {
            toast.success('Reward updated');
            setShowForm(false);
            setEditingId(null);
          },
          onError: (err: Error) => toast.error(err.message || 'Failed to update reward'),
        }
      );
    } else {
      createMutation.mutate(
        {
          club_id: clubId,
          title: formData.title,
          description: formData.description || undefined,
          points_required: formData.points_required,
          quantity_available: formData.quantity_available ?? undefined,
          reward_type: formData.reward_type,
          expires_at: formData.expires_at || undefined,
        },
        {
          onSuccess: () => {
            toast.success('Reward created');
            setShowForm(false);
            setFormData(emptyForm);
          },
          onError: (err: Error) => toast.error(err.message || 'Failed to create reward'),
        }
      );
    }
  };

  const handleDeleteConfirmed = (rewardId: number) => {
    deleteMutation.mutate(rewardId, {
      onSuccess: () => {
        toast.success('Reward deleted');
        setConfirmDeleteId(null);
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to delete reward');
        setConfirmDeleteId(null);
      },
    });
  };

  if (loadingClub) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-12 rounded-xl border bg-card text-center">
        <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-xl font-semibold mb-2">No Fan Club Yet</h2>
        <p className="text-muted-foreground">Create your fan club first to manage rewards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            {rewardsList.length} reward{rewardsList.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Reward
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {editingId ? 'Edit Reward' : 'Create New Reward'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="p-1 rounded hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Exclusive Unreleased Track"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe what fans will get..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">Points Required *</label>
                <input
                  type="number"
                  value={formData.points_required}
                  onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
                  min={1}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Quantity (leave empty for unlimited)</label>
                <input
                  type="number"
                  value={formData.quantity_available ?? ''}
                  onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value ? parseInt(e.target.value) : null })}
                  min={0}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">Reward Type</label>
                <select
                  value={formData.reward_type}
                  onChange={(e) => setFormData({ ...formData, reward_type: e.target.value as RewardFormData['reward_type'] })}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="digital">Digital Content</option>
                  <option value="physical">Physical Item</option>
                  <option value="experience">Experience</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Expires At</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Check className="h-4 w-4" />
                {editingId ? 'Update Reward' : 'Create Reward'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 py-2.5 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rewards List */}
      {loadingRewards ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-12 rounded-xl border bg-card text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
          <p className="text-muted-foreground">Failed to load rewards</p>
        </div>
      ) : rewardsList.length === 0 && !showForm ? (
        <div className="p-12 rounded-xl border bg-card text-center">
          <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Rewards Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Create rewards for your fans to redeem with their loyalty points.
            Offer exclusive content, merchandise discounts, meet & greets, and more.
          </p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Your First Reward
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rewardsList.map((reward) => {
            const TypeIcon = rewardTypeIcons[reward.reward_type] || Gift;
            const isExpired = reward.expires_at && new Date(reward.expires_at) < new Date();

            return (
              <div
                key={reward.id}
                className={cn(
                  'rounded-xl border bg-card overflow-hidden',
                  !reward.is_active && 'opacity-60'
                )}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {reward.image_url ? (
                        <Image
                          src={reward.image_url}
                          alt={reward.title}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TypeIcon className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{reward.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {rewardTypeLabels[reward.reward_type] || reward.reward_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      {confirmDeleteId === reward.id ? (
                        <>
                          <span className="text-xs text-muted-foreground mr-1">Delete?</span>
                          <button
                            onClick={() => handleDeleteConfirmed(reward.id)}
                            disabled={deleteMutation.isPending}
                            className="px-2 py-1 text-xs rounded bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs rounded border hover:bg-muted"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditForm(reward)}
                            className="p-1.5 rounded hover:bg-muted"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(reward.id)}
                            className="p-1.5 rounded hover:bg-muted"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {reward.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {reward.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="h-4 w-4" />
                      <span className="font-semibold text-sm">
                        {reward.points_required.toLocaleString()} pts
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {reward.quantity_available !== null && (
                        <span className="text-xs text-muted-foreground">
                          {reward.quantity_available} left
                        </span>
                      )}
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        isExpired
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : reward.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500'
                      )}>
                        {isExpired ? 'Expired' : reward.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {reward.expires_at && !isExpired && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Expires {new Date(reward.expires_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
