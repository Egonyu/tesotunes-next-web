'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Crown,
  Users,
  Star,
  TrendingUp,
  Gift,
  Plus,
  Loader2,
  AlertCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useArtistLoyaltyClub,
  useCreateArtistLoyaltyClub,
  useArtistLoyaltyMembers,
  useArtistLoyaltyRewards,
  type LoyaltyClub,
} from '@/hooks/useLoyalty';

export default function ArtistFanClubPage() {
  const { data: fanClub, isLoading, error } = useArtistLoyaltyClub();
  const createMutation = useCreateArtistLoyaltyClub();
  const [showCreate, setShowCreate] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', description: '' });

  // Only fetch members/rewards if club exists
  const clubId = fanClub?.id || 0;
  const { data: membersData } = useArtistLoyaltyMembers(clubId, { page: 1 });
  const { data: rewardsData } = useArtistLoyaltyRewards(clubId);

  const members = membersData?.data || [];
  const rewards = rewardsData || [];

  const handleCreate = () => {
    if (!newClub.name.trim()) {
      toast.error('Please enter a club name');
      return;
    }
    createMutation.mutate(newClub, {
      onSuccess: () => {
        toast.success('Fan club created successfully!');
        setShowCreate(false);
        setNewClub({ name: '', description: '' });
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to create fan club');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !fanClub) {
    return (
      <div className="p-12 rounded-xl border bg-card text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
        <h2 className="text-xl font-semibold mb-2">Unable to load fan club</h2>
        <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  // No fan club yet - show create form
  if (!fanClub && !showCreate) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
        <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <Crown className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Create Your Fan Club</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Build a loyal community around your music. Offer exclusive content,
            early access, discounts, and special perks to your biggest fans.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 max-w-lg mx-auto text-left">
          <div className="p-4 rounded-lg border">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-sm font-medium">Build Community</p>
            <p className="text-xs text-muted-foreground">Connect with your most dedicated fans</p>
          </div>
          <div className="p-4 rounded-lg border">
            <Gift className="h-5 w-5 text-primary mb-2" />
            <p className="text-sm font-medium">Exclusive Rewards</p>
            <p className="text-xs text-muted-foreground">Create rewards for loyal supporters</p>
          </div>
          <div className="p-4 rounded-lg border">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <p className="text-sm font-medium">Grow Revenue</p>
            <p className="text-xs text-muted-foreground">Earn from memberships and engagement</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          Get Started
        </button>
      </div>
    );
  }

  // Show create form
  if (showCreate) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h2 className="text-xl font-bold">Create Your Fan Club</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Club Name *</label>
            <input
              type="text"
              value={newClub.name}
              onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Inner Circle, VIP Lounge"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={newClub.description}
              onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe what exclusive perks fans will get..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !newClub.name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Fan Club
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 rounded-lg border hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fan club exists - show dashboard
  const club = fanClub as LoyaltyClub;

  return (
    <div className="space-y-6">
      {/* Club Header Card */}
      <div className="p-6 rounded-xl border bg-card">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="shrink-0">
            {club.logo_url ? (
              <Image
                src={club.logo_url}
                alt={club.name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-xl object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Crown className="h-10 w-10 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold truncate">{club.name}</h2>
              <span className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                club.is_active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              )}>
                {club.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {club.description || 'No description yet'}
            </p>
            <div className="flex items-center gap-4 mt-3">
              {club.slug && (
                <Link
                  href={`/loyalty/clubs/${club.slug}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                  target="_blank"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Public Page
                </Link>
              )}
              <Link
                href="/artist/fan-club/settings"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Edit Settings →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Total Members</span>
          </div>
          <p className="text-3xl font-bold">{club.member_count.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Active Rewards</span>
          </div>
          <p className="text-3xl font-bold">{rewards.filter(r => r.is_active).length}</p>
        </div>
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-muted-foreground">Points Distributed</span>
          </div>
          <p className="text-3xl font-bold">—</p>
        </div>
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Growth</span>
          </div>
          <p className="text-3xl font-bold">—</p>
        </div>
      </div>

      {/* Recent Members & Rewards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Members */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Recent Members</h3>
            <Link
              href="/artist/fan-club/members"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No members yet</p>
              <p className="text-sm mt-1">Share your fan club to attract members</p>
            </div>
          ) : (
            <div className="divide-y">
              {members.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {member.user.avatar ? (
                      <Image
                        src={member.user.avatar}
                        alt={member.user.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {member.user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      member.tier === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      member.tier === 'Silver' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                      member.tier === 'Platinum' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    )}>
                      {member.tier}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {member.points_balance.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rewards */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Rewards</h3>
            <Link
              href="/artist/fan-club/rewards"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {rewards.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Gift className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No rewards yet</p>
              <Link
                href="/artist/fan-club/rewards"
                className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Create your first reward
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {rewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {reward.image_url ? (
                      <Image
                        src={reward.image_url}
                        alt={reward.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{reward.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {reward.points_required.toLocaleString()} pts required
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    reward.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500'
                  )}>
                    {reward.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
