'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Gift, 
  Star, 
  Trophy,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Medal,
  Crown,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useLoyaltyPoints,
  useLoyaltyPointsHistory,
  useAllLoyaltyRewards,
  useRedeemedRewards,
  useEarnedBadges,
  useLoyaltyLeaderboard,
  type LoyaltyReward,
  type LoyaltyTransaction,
  type LoyaltyBadge,
} from '@/hooks/useLoyalty';

type Tab = 'overview' | 'history' | 'badges' | 'leaderboard';

export default function LoyaltyRewardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  const { data: pointsData, isLoading: loadingPoints, error: pointsError } = useLoyaltyPoints();
  const { data: historyData, isLoading: loadingHistory } = useLoyaltyPointsHistory({ limit: 20 });
  const { data: allRewards, isLoading: loadingRewards } = useAllLoyaltyRewards();
  const { data: redeemedRewards } = useRedeemedRewards();
  const { data: earnedBadges } = useEarnedBadges();
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLoyaltyLeaderboard();

  const points = pointsData ?? { balance: 0, lifetime_earned: 0, lifetime_spent: 0 };
  const history: LoyaltyTransaction[] = historyData?.data || [];
  const rewards: LoyaltyReward[] = allRewards || [];
  const redeemed: LoyaltyReward[] = redeemedRewards || [];
  const badges: LoyaltyBadge[] = earnedBadges || [];
  const leaders = leaderboard || [];
  
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'history', label: 'History' },
    { key: 'badges', label: 'Badges' },
    { key: 'leaderboard', label: 'Leaderboard' },
  ];

  if (loadingPoints) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pointsError) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="p-12 rounded-xl border bg-card text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
          <h2 className="text-xl font-semibold mb-2">Unable to load rewards</h2>
          <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Points Summary */}
      <div className="p-6 rounded-xl bg-linear-to-br from-purple-600 to-pink-600 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-purple-200">Points Balance</p>
            <p className="text-4xl font-bold mt-1">
              {points.balance.toLocaleString()}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Star className="h-6 w-6" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-purple-200 text-sm">Lifetime Earned</p>
            <p className="text-xl font-semibold">{points.lifetime_earned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-purple-200 text-sm">Redeemed</p>
            <p className="text-xl font-semibold">{points.lifetime_spent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Redeemed Rewards */}
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">My Redeemed Rewards</h3>
              <span className="text-sm text-muted-foreground">{redeemed.length} redeemed</span>
            </div>
            {redeemed.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Gift className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No rewards redeemed yet</p>
                <Link href="/loyalty/discover" className="text-primary text-sm hover:underline mt-1 inline-block">
                  Browse available rewards
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {redeemed.slice(0, 5).map((reward) => (
                  <div key={reward.id} className="flex items-center gap-4 p-4">
                    {reward.image_url ? (
                      <Image 
                        src={reward.image_url} 
                        alt={reward.title}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Gift className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{reward.title}</p>
                      <p className="text-sm text-muted-foreground">{reward.points_required.toLocaleString()} pts</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      Redeemed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Rewards */}
          {loadingRewards ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rewards.length > 0 && (
            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Available Rewards</h3>
                <Link href="/loyalty/discover" className="text-sm text-primary flex items-center">
                  See all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {rewards.slice(0, 4).map((reward) => (
                  <div key={reward.id} className="p-3 rounded-lg border">
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
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Gift className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{reward.title}</p>
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Star className="h-3 w-3" />
                          <span>{reward.points_required.toLocaleString()} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Points History</h3>
          </div>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No points activity yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {history.map((tx) => {
                const isPositive = tx.type === 'earn' || tx.type === 'bonus';
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center',
                        isPositive
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      )}>
                        {isPositive ? (
                          <ArrowDownRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <p className={cn(
                      'font-semibold',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {isPositive ? '+' : '-'}{Math.abs(tx.points).toLocaleString()} pts
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Earned Badges</h3>
              <span className="text-sm text-muted-foreground">{badges.length} earned</span>
            </div>
            {badges.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Medal className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No badges earned yet</p>
                <p className="text-sm mt-1">Keep engaging to unlock achievements!</p>
              </div>
            ) : (
              <div className="grid gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
                {badges.map((badge) => (
                  <div key={badge.id} className="p-4 rounded-lg border text-center">
                    {badge.icon_url ? (
                      <Image
                        src={badge.icon_url}
                        alt={badge.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 mx-auto rounded-full mb-2"
                      />
                    ) : (
                      <div className="h-12 w-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                        <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    )}
                    <h4 className="font-medium text-sm">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    {badge.earned_at && (
                      <p className="text-xs text-primary mt-2">
                        Earned {new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Global Leaderboard</h3>
          </div>
          {loadingLeaderboard ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leaders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Crown className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Leaderboard data not available yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {leaders.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                      entry.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      entry.rank === 2 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                      entry.rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {entry.rank}
                    </div>
                    <div className="flex items-center gap-3">
                      {entry.user.avatar ? (
                        <Image
                          src={entry.user.avatar}
                          alt={entry.user.name}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {entry.user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{entry.user.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.tier}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{entry.points.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
