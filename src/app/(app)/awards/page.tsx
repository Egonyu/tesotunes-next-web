'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Star,
  Users,
  Vote,
  Calendar,
  Clock,
  ChevronRight,
  Crown,
  Flame,
  Music,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { useAwardSeasons, useAwardLeaderboard, useAwardStats, type AwardSeason } from '@/hooks/useAwards';

const statusConfig: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  nominations_open: { label: 'Nominations Open', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' },
  voting_open: { label: 'Vote Now', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
  closed: { label: 'Voting Closed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400' },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
};

export default function AwardsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');
  const { data: seasons, isLoading } = useAwardSeasons();
  const { data: leaderboard } = useAwardLeaderboard(undefined, 10);
  const { data: stats } = useAwardStats();

  const filteredSeasons = seasons?.filter((s) => {
    if (filter === 'active') return ['nominations_open', 'voting_open'].includes(s.status);
    if (filter === 'past') return ['closed', 'completed'].includes(s.status);
    return true;
  });

  const activeSeason = seasons?.find(s => s.status === 'voting_open' || s.status === 'nominations_open');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg" />)}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-muted rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      {activeSeason && (
        <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-6 w-6 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">LIVE NOW</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{activeSeason.name}</h1>
              <p className="text-muted-foreground mb-6">
                {activeSeason.categories_count} categories • {formatNumber(activeSeason.total_votes)} votes cast
              </p>
              <Link
                href={`/awards/${activeSeason.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                <Vote className="h-5 w-5" />
                {activeSeason.status === 'voting_open' ? 'Vote Now' : 'View Nominations'}
              </Link>
            </div>
            <div className="relative w-48 h-48 shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-32 w-32 text-amber-500/20" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Votes', value: formatNumber(stats.total_votes), icon: Vote, color: 'text-amber-500' },
            { label: 'Voters', value: formatNumber(stats.total_voters), icon: Users, color: 'text-blue-500' },
            { label: 'Categories', value: stats.total_categories, icon: Star, color: 'text-purple-500' },
            { label: 'Nominees', value: stats.total_nominees, icon: Music, color: 'text-green-500' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border bg-card">
              <stat.icon className={cn('h-5 w-5 mb-2', stat.color)} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Seasons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Award Seasons</h2>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(['all', 'active', 'past'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors',
                    filter === f ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {!filteredSeasons?.length ? (
            <div className="text-center py-12 rounded-xl border bg-card">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No award seasons found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSeasons.map((season) => {
                const config = statusConfig[season.status] || statusConfig.upcoming;
                return (
                  <Link
                    key={season.id}
                    href={`/awards/${season.slug}`}
                    className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-32 bg-linear-to-br from-amber-500/10 to-orange-500/10">
                      {season.cover_image_url && (
                        <Image src={season.cover_image_url} alt={season.name} fill className="object-cover" />
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', config.color)}>
                          {config.label}
                        </span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 h-12 bg-linear-to-t from-card to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold group-hover:text-primary transition-colors">{season.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" />
                          {season.categories_count} categories
                        </span>
                        <span className="flex items-center gap-1">
                          <Vote className="h-3.5 w-3.5" />
                          {formatNumber(season.total_votes)} votes
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(season.voting_start).toLocaleDateString()} - {new Date(season.voting_end).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-lg">Top Voters</h3>
            </div>
            {!leaderboard?.length ? (
              <p className="text-sm text-muted-foreground">No leaderboard data</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                        index === 0 ? 'bg-amber-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-muted text-muted-foreground'
                      )}
                    >
                      {entry.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                      {entry.user.avatar_url ? (
                        <Image src={entry.user.avatar_url} alt={entry.user.name} width={32} height={32} className="object-cover" />
                      ) : (
                        <Users className="w-4 h-4 m-2 text-muted-foreground" />
                      )}
                    </div>
                    <span className="flex-1 font-medium truncate text-sm">{entry.user.name}</span>
                    <span className="text-sm text-muted-foreground">{formatNumber(entry.total_votes)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hall of Fame */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-lg">Hall of Fame</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Past winners and their achievements are displayed here after each season completes.
            </p>
            <Link
              href="/awards?filter=past"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View Past Seasons
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
