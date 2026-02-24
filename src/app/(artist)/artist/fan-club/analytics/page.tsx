'use client';

import Image from 'next/image';
import {
  BarChart3,
  Users,
  Star,
  TrendingUp,
  Gift,
  Crown,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useArtistLoyaltyClub,
  useArtistClubAnalytics,
  type FanClubAnalytics,
} from '@/hooks/useLoyalty';

export default function FanClubAnalyticsPage() {
  const { data: club, isLoading: loadingClub } = useArtistLoyaltyClub();
  const clubId = club?.id || 0;
  const { data: analytics, isLoading: loadingAnalytics, error } = useArtistClubAnalytics(clubId);

  if (loadingClub || loadingAnalytics) {
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
        <p className="text-muted-foreground">Create your fan club first to view analytics.</p>
      </div>
    );
  }

  if (error || !analytics) {
    // Show placeholder analytics when API isn't available
    return (
      <div className="space-y-6">
        {/* Stats Grid with placeholders */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5 text-blue-500" />}
            label="Total Members"
            value={club.member_count.toLocaleString()}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            label="New This Month"
            value="—"
          />
          <StatCard
            icon={<Star className="h-5 w-5 text-amber-500" />}
            label="Points Distributed"
            value="—"
          />
          <StatCard
            icon={<Gift className="h-5 w-5 text-purple-500" />}
            label="Rewards Redeemed"
            value="—"
          />
        </div>

        <div className="p-8 rounded-xl border bg-card text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Analytics Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Detailed analytics including growth charts, tier distribution, and member
            engagement will be available once your fan club gains more members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-500" />}
          label="Total Members"
          value={analytics.total_members.toLocaleString()}
          change={analytics.new_members_this_month > 0 ? `+${analytics.new_members_this_month} this month` : undefined}
          positive
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label="Growth Rate"
          value={`${analytics.growth_rate.toFixed(1)}%`}
          positive={analytics.growth_rate > 0}
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-amber-500" />}
          label="Points Distributed"
          value={analytics.total_points_distributed.toLocaleString()}
        />
        <StatCard
          icon={<Gift className="h-5 w-5 text-purple-500" />}
          label="Rewards Redeemed"
          value={analytics.total_rewards_redeemed.toLocaleString()}
        />
      </div>

      {/* Tier Distribution */}
      {analytics.tier_distribution.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Tier Distribution</h3>
          <div className="space-y-3">
            {analytics.tier_distribution.map((tier) => {
              const color = getTierColor(tier.tier);
              return (
                <div key={tier.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 text-xs rounded-full', color.badge)}>
                        {tier.tier}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {tier.count} members
                      </span>
                    </div>
                    <span className="text-sm font-medium">{tier.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', color.bar)}
                      style={{ width: `${Math.max(tier.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Growth */}
        {analytics.monthly_growth.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Monthly Growth</h3>
            <div className="space-y-3">
              {analytics.monthly_growth.slice(-6).map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3.5 w-3.5 text-blue-500" />
                      <span>{month.members}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      <span>{month.points.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Members */}
        {analytics.top_members.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Top Members</h3>
            <div className="space-y-3">
              {analytics.top_members.slice(0, 5).map((member, idx) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold',
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {idx + 1}
                    </span>
                    {member.user.avatar ? (
                      <Image
                        src={member.user.avatar}
                        alt={member.user.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {member.user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{member.user.name}</p>
                      <span className={cn(
                        'text-xs',
                        member.tier === 'Gold' ? 'text-amber-600' :
                        member.tier === 'Platinum' ? 'text-slate-600' :
                        'text-muted-foreground'
                      )}>
                        {member.tier}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{member.points_balance.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popular Rewards */}
      {analytics.popular_rewards.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Popular Rewards</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.popular_rewards.map((reward) => (
              <div key={reward.id} className="p-4 rounded-lg border">
                <h4 className="font-medium text-sm mb-1">{reward.title}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {reward.points_required.toLocaleString()} pts
                  </span>
                  <span className="text-primary font-medium">
                    {reward.redemption_count} redeemed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div className="p-5 rounded-xl border bg-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {change && (
        <p className={cn(
          'text-xs mt-1 flex items-center gap-1',
          positive ? 'text-green-600' : 'text-red-600'
        )}>
          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {change}
        </p>
      )}
    </div>
  );
}

function getTierColor(tier: string) {
  switch (tier.toLowerCase()) {
    case 'platinum':
      return {
        badge: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
        bar: 'bg-slate-500',
      };
    case 'gold':
      return {
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        bar: 'bg-amber-500',
      };
    case 'silver':
      return {
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        bar: 'bg-gray-400',
      };
    default:
      return {
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        bar: 'bg-orange-500',
      };
  }
}
