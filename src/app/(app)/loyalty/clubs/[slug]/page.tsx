'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

import {
  ChevronLeft,
  Gift,
  Star,
  Users,
  Check,
  Loader2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useLoyaltyClubBySlug,
  useJoinLoyaltyClub,
  useLeaveLoyaltyClub,
  useLoyaltyRewards,
  useLoyaltyClubTiers,
  useLoyaltyEarningActivities,
  useMyLoyaltyCards,
  useRedeemReward,
  type LoyaltyReward,
  type LoyaltyCard,
  type LoyaltyTier,
  type EarningActivity,
} from '@/hooks/useLoyalty';

interface ClubPageProps {
  params: Promise<{ slug: string }>;
}

export default function LoyaltyClubPage({ params }: ClubPageProps) {
  const { slug } = use(params);
  const { data: club, isLoading: loadingClub, error } = useLoyaltyClubBySlug(slug);
  const { data: rewards, isLoading: loadingRewards } = useLoyaltyRewards(club?.id);
  const { data: tiers } = useLoyaltyClubTiers(club?.id || 0);
  const { data: earningActivities } = useLoyaltyEarningActivities();
  const { data: myCards } = useMyLoyaltyCards();
  const joinMutation = useJoinLoyaltyClub();
  const leaveMutation = useLeaveLoyaltyClub();
  const redeemMutation = useRedeemReward();
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  const memberCard = club ? myCards?.find((card: LoyaltyCard) => card.club_id === club.id) : undefined;
  const isMember = !!memberCard;

  const handleJoin = () => {
    if (club) {
      joinMutation.mutate(club.id, {
        onSuccess: () => toast.success('Successfully joined the program!'),
        onError: (err: Error) => toast.error(err.message || 'Failed to join'),
      });
    }
  };

  const handleLeave = () => {
    if (club && confirm('Are you sure you want to leave? You will lose all accumulated points.')) {
      leaveMutation.mutate(club.id, {
        onSuccess: () => toast.success('You have left the program'),
        onError: (err: Error) => toast.error(err.message || 'Failed to leave'),
      });
    }
  };

  const handleRedeem = (reward: LoyaltyReward) => {
    if (!memberCard) return;
    if (memberCard.points_balance < reward.points_required) {
      toast.error(`Not enough points. You need ${reward.points_required - memberCard.points_balance} more.`);
      return;
    }
    setRedeemingId(reward.id);
    redeemMutation.mutate({ reward_id: reward.id }, {
      onSuccess: () => {
        toast.success('Reward redeemed successfully!');
        setRedeemingId(null);
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to redeem reward');
        setRedeemingId(null);
      },
    });
  };
  
  if (loadingClub) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !club) {
    return (
      <div className="container max-w-4xl py-8">
        <Link href="/loyalty/discover" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to discover
        </Link>
        <div className="p-12 rounded-xl border bg-card text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-xl font-semibold mb-2">Club not found</h2>
          <p className="text-muted-foreground">This loyalty program may not exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  const rewardsList: LoyaltyReward[] = rewards || [];
  const tiersList: LoyaltyTier[] = tiers || [];
  const activities: EarningActivity[] = earningActivities || [];
  
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/loyalty/discover" className="p-2 rounded-lg hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="text-muted-foreground">Loyalty Program</span>
      </div>
      
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="shrink-0">
          {club.logo_url ? (
            <Image 
              src={club.logo_url} 
              alt={club.name}
              width={128}
              height={128}
              className="h-32 w-32 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-32 w-32 rounded-2xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center">
              <Gift className="h-16 w-16 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
          {club.artist && (
            <Link href={`/artists/${club.artist.id}`} className="text-primary hover:underline mb-3 inline-block">
              by {club.artist.name}
            </Link>
          )}
          <p className="text-muted-foreground mb-4">
            {club.description || 'Join this exclusive loyalty program to earn points and unlock amazing rewards.'}
          </p>
          
          <div className="flex items-center gap-6 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{club.member_count.toLocaleString()} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span>{rewardsList.length} rewards</span>
            </div>
            {memberCard && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="font-medium">{memberCard.points_balance.toLocaleString()} pts</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {!isMember ? (
              <button
                onClick={handleJoin}
                disabled={joinMutation.isPending}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {joinMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Join Program - Free'
                )}
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">{memberCard?.tier || 'Bronze'} Member</span>
                </div>
                <button
                  onClick={handleLeave}
                  disabled={leaveMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive rounded-lg border hover:border-destructive transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Leave
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* How to Earn — dynamic from API */}
      {activities.length > 0 && (
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold mb-4">Ways to Earn Points</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {activities.map((activity: EarningActivity) => (
              <div key={activity.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{activity.action}</h3>
                  <p className="text-sm text-muted-foreground">
                    +{activity.points} points — {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tier Info — dynamic from API */}
      <div className="p-6 rounded-xl border bg-card">
        <h2 className="text-xl font-semibold mb-4">Membership Tiers</h2>
        {tiersList.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-4">
            {tiersList.map((tier: LoyaltyTier) => (
              <div
                key={tier.id}
                className={cn(
                  'p-4 rounded-lg border text-center',
                  memberCard?.tier === tier.name && 'ring-2 ring-primary',
                )}
                style={{ borderColor: (tier.color || '#888') + '40', backgroundColor: (tier.color || '#888') + '10' }}
              >
                <Star className="h-6 w-6 mx-auto mb-2" style={{ color: tier.color || '#888' }} />
                <h3 className="font-semibold">{tier.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {tier.min_points.toLocaleString()}+ pts
                </p>
                {tier.benefits?.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tier.benefits.slice(0, 3).map((b: string, i: number) => (
                      <li key={i} className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500 shrink-0" />
                        <span className="text-left">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { name: 'Bronze', color: '#CD7F32', min: 0 },
              { name: 'Silver', color: '#9CA3AF', min: 500 },
              { name: 'Gold', color: '#F59E0B', min: 2000 },
              { name: 'Platinum', color: '#64748B', min: 10000 },
            ].map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'p-4 rounded-lg border text-center',
                  memberCard?.tier === tier.name && 'ring-2 ring-primary',
                )}
              >
                <Star className="h-6 w-6 mx-auto mb-2" style={{ color: tier.color }} />
                <h3 className="font-semibold">{tier.name}</h3>
                <p className="text-xs text-muted-foreground">{tier.min.toLocaleString()}+ pts</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Available Rewards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Rewards</h2>
        {loadingRewards ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rewardsList.length === 0 ? (
          <div className="p-8 rounded-xl border bg-card text-center">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No rewards available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rewardsList.map((reward) => {
              const canAfford = memberCard && memberCard.points_balance >= reward.points_required;
              const isAvailable = (reward.quantity_available ?? 1) > 0;
              const isRedeeming = redeemingId === reward.id;

              return (
                <div key={reward.id} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-start gap-4">
                    {reward.image_url ? (
                      <Image 
                        src={reward.image_url}
                        alt={reward.title}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Gift className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="h-4 w-4" />
                          <span className="font-semibold">{reward.points_required.toLocaleString()} pts</span>
                        </div>
                        {isMember && isAvailable ? (
                          <button
                            onClick={() => handleRedeem(reward)}
                            disabled={!canAfford || isRedeeming}
                            className={cn(
                              'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                              canAfford
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                            )}
                          >
                            {isRedeeming ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : canAfford ? (
                              'Redeem'
                            ) : (
                              `Need ${(reward.points_required - (memberCard?.points_balance || 0)).toLocaleString()} more`
                            )}
                          </button>
                        ) : (
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'
                          )}>
                            {isAvailable ? `${reward.quantity_available} left` : 'Sold out'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
