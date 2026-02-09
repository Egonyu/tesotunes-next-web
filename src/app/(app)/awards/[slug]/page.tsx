'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Star,
  Vote,
  ChevronLeft,
  Crown,
  Check,
  Users,
  Music,
  Mic,
  Disc,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatDate } from '@/lib/utils';
import { useAwardSeason, useVoteForNomination, useAwardLeaderboard, type AwardCategory } from '@/hooks/useAwards';
import { toast } from 'sonner';

const nomineeTypeIcons = {
  artist: Mic,
  song: Music,
  album: Disc,
};

export default function AwardSeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { data: season, isLoading } = useAwardSeason(slug);
  const { data: leaderboard } = useAwardLeaderboard(slug, 10);
  const vote = useVoteForNomination();

  const isVotingOpen = season?.status === 'voting_open';
  const isCompleted = season?.status === 'completed' || season?.status === 'closed';

  const handleVote = (nominationId: number) => {
    if (!isVotingOpen) {
      toast.info('Voting is not currently open for this season.');
      return;
    }
    vote.mutate({ seasonSlug: slug, nominationId });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Season Not Found</h1>
        <Link href="/awards" className="text-primary hover:underline">Back to Awards</Link>
      </div>
    );
  }

  const activeCategory = selectedCategory
    ? season.categories?.find(c => c.id === selectedCategory)
    : season.categories?.[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Back Navigation */}
      <Link href="/awards" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        All Awards
      </Link>

      {/* Season Header */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border border-amber-500/20 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <span className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full',
                isVotingOpen ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                isCompleted ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
              )}>
                {isVotingOpen ? 'Voting Open' : isCompleted ? 'Completed' : season.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{season.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4" />
                {season.categories_count} categories
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Vote className="h-4 w-4" />
                {formatNumber(season.total_votes)} votes
              </span>
              {season.voting_end && (
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {isVotingOpen ? 'Ends' : 'Ended'} {formatDate(season.voting_end)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Category Sidebar */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>
          {season.categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg text-sm transition-colors',
                (activeCategory?.id === category.id)
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/20'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              {category.name}
              <span className="block text-[10px] mt-0.5 opacity-60">{category.nominations.length} nominees</span>
            </button>
          ))}
        </div>

        {/* Nominees */}
        <div className="lg:col-span-2">
          {activeCategory && (
            <div>
              <h2 className="text-xl font-bold mb-2">{activeCategory.name}</h2>
              <p className="text-muted-foreground text-sm mb-6">{activeCategory.description}</p>

              <div className="space-y-3">
                {activeCategory.nominations.map((nomination) => {
                  const Icon = nomineeTypeIcons[nomination.nominee_type] || Music;
                  return (
                    <div
                      key={nomination.id}
                      className={cn(
                        'p-4 rounded-xl border bg-card flex items-center gap-4 transition-all',
                        nomination.is_winner && 'ring-2 ring-amber-500 bg-amber-500/5',
                        nomination.has_voted && !nomination.is_winner && 'ring-1 ring-primary/30',
                      )}
                    >
                      <div className="relative w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                        {nomination.nominee_image_url ? (
                          <Image src={nomination.nominee_image_url} alt={nomination.nominee_name} fill className="object-cover" />
                        ) : (
                          <Icon className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                        )}
                        {nomination.is_winner && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{nomination.nominee_name}</p>
                        {nomination.artist_name && (
                          <p className="text-sm text-muted-foreground">{nomination.artist_name}</p>
                        )}
                        {/* Vote bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                nomination.is_winner ? 'bg-amber-500' : 'bg-primary/60'
                              )}
                              style={{ width: `${nomination.vote_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatNumber(nomination.votes_count)} ({nomination.vote_percentage}%)
                          </span>
                        </div>
                      </div>

                      {isVotingOpen && !nomination.has_voted ? (
                        <button
                          onClick={() => handleVote(nomination.id)}
                          disabled={vote.isPending}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 shrink-0"
                        >
                          Vote
                        </button>
                      ) : nomination.has_voted ? (
                        <div className="flex items-center gap-1 text-primary text-sm shrink-0">
                          <Check className="h-4 w-4" />
                          Voted
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top Voters */}
        <div>
          <div className="rounded-xl border bg-card p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold">Top Voters</h3>
            </div>
            {!leaderboard?.length ? (
              <p className="text-sm text-muted-foreground">Be the first to vote!</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                        index === 0 ? 'bg-amber-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-muted'
                      )}
                    >
                      {entry.rank}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-muted overflow-hidden">
                      {entry.user.avatar_url ? (
                        <Image src={entry.user.avatar_url} alt={entry.user.name} width={28} height={28} className="object-cover" />
                      ) : (
                        <Users className="w-3.5 h-3.5 m-1.5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{entry.user.name}</span>
                    <span className="text-xs text-muted-foreground">{entry.total_votes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
