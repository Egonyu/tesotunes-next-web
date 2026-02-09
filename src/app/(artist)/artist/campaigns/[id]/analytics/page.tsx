'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Calendar,
  Target,
  Share2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Heart,
  Gift,
  Globe,
} from 'lucide-react';
import { useCampaignAnalytics, useCampaign, transformCampaign } from '@/hooks/useCampaigns';

export default function CampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: campaignData, isLoading: loadingCampaign } = useCampaign(id);
  const { data: analytics, isLoading: loadingAnalytics } = useCampaignAnalytics(id);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const campaign = campaignData ? transformCampaign(campaignData as Record<string, unknown>) : null;

  if (loadingCampaign || loadingAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Raised',
      value: `UGX ${(analytics?.total_raised || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500 bg-green-500/10',
      change: analytics?.goal_progress_pct ? `${analytics.goal_progress_pct.toFixed(0)}% of goal` : undefined,
    },
    {
      label: 'Total Backers',
      value: analytics?.total_backers || 0,
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: 'Avg Donation',
      value: `UGX ${(analytics?.average_donation || 0).toLocaleString()}`,
      icon: Heart,
      color: 'text-pink-500 bg-pink-500/10',
    },
    {
      label: 'Conversion Rate',
      value: `${(analytics?.conversion_rate || 0).toFixed(1)}%`,
      icon: Target,
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      label: 'Days Remaining',
      value: analytics?.days_remaining || campaign?.daysLeft || 0,
      icon: Calendar,
      color: 'text-orange-500 bg-orange-500/10',
    },
    {
      label: 'Projected Total',
      value: `UGX ${(analytics?.projected_total || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10',
      change: analytics?.projected_total && campaign?.goal
        ? analytics.projected_total >= campaign.goal
          ? 'On track'
          : 'Below target'
        : undefined,
      changePositive: analytics?.projected_total && campaign?.goal
        ? analytics.projected_total >= campaign.goal
        : false,
    },
  ];

  // Generate chart bars from daily data
  const maxDailyAmount = Math.max(
    ...(analytics?.daily_donations?.map((d) => d.amount) || [1])
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/artist/campaigns"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Campaigns
          </Link>
          <h1 className="text-2xl font-bold">Campaign Analytics</h1>
          {campaign && (
            <p className="text-muted-foreground mt-1">{campaign.title}</p>
          )}
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          {(['7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                timeRange === range
                  ? 'bg-background shadow font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-xl border bg-card">
              <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {stat.change && (
                <p className={`text-xs mt-1 flex items-center gap-0.5 ${
                  stat.changePositive === false ? 'text-red-500' : 'text-green-500'
                }`}>
                  {stat.changePositive === false ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                  {stat.change}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Donations Chart */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            Daily Donations
          </h2>
          {analytics?.daily_donations?.length ? (
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-40">
                {analytics.daily_donations.slice(-14).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/80 rounded-t-sm min-h-1 hover:bg-primary transition"
                      style={{ height: `${(day.amount / maxDailyAmount) * 100}%` }}
                      title={`${new Date(day.date).toLocaleDateString()}: UGX ${day.amount.toLocaleString()} (${day.count} donations)`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{analytics.daily_donations.length > 14 
                  ? new Date(analytics.daily_donations[analytics.daily_donations.length - 14]?.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : new Date(analytics.daily_donations[0]?.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
                }</span>
                <span>{new Date(analytics.daily_donations[analytics.daily_donations.length - 1]?.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No donation data yet</p>
          )}
        </div>

        {/* Reward Breakdown */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5 text-pink-500" />
            Reward Breakdown
          </h2>
          {analytics?.reward_breakdown?.length ? (
            <div className="space-y-3">
              {analytics.reward_breakdown.map((reward, i) => {
                const totalRewardAmount = analytics.reward_breakdown.reduce((s, r) => s + r.amount, 0) || 1;
                const pct = (reward.amount / totalRewardAmount) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{reward.reward_title}</span>
                      <span className="text-sm text-muted-foreground">{reward.count} backers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        UGX {(reward.amount / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No reward data yet</p>
          )}
        </div>

        {/* Referral Sources */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-blue-500" />
            Referral Sources
          </h2>
          {analytics?.referral_sources?.length ? (
            <div className="space-y-3">
              {analytics.referral_sources.map((source, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium capitalize">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{source.count} visitors</p>
                    <p className="text-xs text-muted-foreground">
                      UGX {source.amount.toLocaleString()} raised
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No referral data yet</p>
          )}
        </div>

        {/* Top Backers */}
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-500" />
            Top Backers
          </h2>
          {analytics?.top_backers?.length ? (
            <div className="space-y-3">
              {analytics.top_backers.map((backer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {backer.is_anonymous ? 'Anonymous' : backer.name}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    UGX {backer.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No backer data yet</p>
          )}
        </div>
      </div>

      {/* Goal Progress */}
      {campaign && (
        <div className="p-6 rounded-xl border bg-card">
          <h2 className="font-semibold mb-4">Goal Progress</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((analytics?.goal_progress_pct || 0), 100)}%` }}
                />
              </div>
            </div>
            <span className="text-lg font-bold">{(analytics?.goal_progress_pct || 0).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>UGX {(analytics?.total_raised || 0).toLocaleString()} raised</span>
            <span>Goal: UGX {campaign.goal.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
