'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
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
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  useAwardDetail,
  useAwardCategories,
  useVote,
  useSubmitNomination,
  type AwardCategory,
  type AwardNomination,
} from '@/hooks/useAwards';
import { toast } from 'sonner';

const nomineeTypeIcons: Record<string, typeof Music> = {
  artist: Mic,
  song: Music,
  album: Disc,
};

const statusDisplay: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
  nominations_open: { label: 'Nominations Open', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
  nominations_closed: { label: 'Nominations Closed', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  voting_open: { label: 'Voting Open', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  voting_closed: { label: 'Voting Closed', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
  completed: { label: 'Completed', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
};

export default function AwardDetailPageClient() {
  const rawParams = useParams();
  const slug = rawParams?.slug as string;
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: award, isLoading, error } = useAwardDetail(slug);
  const { data: categories } = useAwardCategories(award?.id ?? '');
  const voteMutation = useVote();
  const nominationMutation = useSubmitNomination();

  const isVotingOpen = award?.is_voting_open ?? false;
  const isNominationOpen = award?.is_nomination_open ?? false;
  const isCompleted = award?.status === 'completed' || award?.status === 'voting_closed';

  // Resolve active category
  const activeCategory = useMemo(() => {
    if (!categories?.length) return null;
    if (selectedCategoryId) {
      return categories.find((c) => c.id === selectedCategoryId) ?? categories[0];
    }
    return categories[0];
  }, [categories, selectedCategoryId]);

  const handleVote = (nominationId: number, categoryId: number) => {
    if (!isVotingOpen) {
      toast.info('Voting is not currently open.');
      return;
    }
    if (!award) return;
    voteMutation.mutate({
      awardId: award.id,
      categoryId,
      nominationId,
    });
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-56 bg-muted rounded-2xl" />
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────────
  if (!award || error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Trophy className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Award Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This award season doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/awards"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Awards
        </Link>
      </div>
    );
  }

  const display = statusDisplay[award.status] ?? statusDisplay.upcoming;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* ── Back Navigation ─────────────────────────────────────────────── */}
      <Link
        href="/awards"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All Awards
      </Link>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/90 via-orange-500/80 to-yellow-500/70 dark:from-amber-900/90 dark:via-orange-900/80 dark:to-yellow-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />

        {/* Decorative trophy */}
        <div className="absolute top-6 right-10 opacity-10">
          <Trophy className="h-40 w-40 text-white" />
        </div>

        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-2xl">
              {/* Status indicator */}
              <div className="flex items-center gap-3 mb-4">
                {(isVotingOpen || isNominationOpen) && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                )}
                <span
                  className={cn(
                    'text-xs font-semibold px-3 py-1 rounded-full border',
                    display.color.replace(/bg-\S+\/10/g, 'bg-white/20').replace(/text-\S+/g, 'text-white').replace(/border-\S+/g, 'border-white/30')
                  )}
                >
                  {display.label}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {award.title}
              </h1>

              {award.description && (
                <p className="text-white/75 text-base mt-3 line-clamp-2">
                  {award.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-5 mt-5 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  {award.year}
                </span>
                {categories && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4" />
                    {categories.length} categories
                  </span>
                )}
                {award.nominations_count !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {award.nominations_count} nominations
                  </span>
                )}
                {award.ceremony_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Ceremony: {formatDate(award.ceremony_date)}
                  </span>
                )}
              </div>
            </div>

            {/* Voting timeline */}
            {(award.voting_starts_at || award.voting_ends_at) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 min-w-[200px]">
                <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-3">
                  Timeline
                </h4>
                <div className="space-y-2.5 text-sm text-white/70">
                  {award.nomination_starts_at && (
                    <div className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-yellow-300" />
                      <span>Nominations: {formatDate(award.nomination_starts_at)}</span>
                    </div>
                  )}
                  {award.voting_starts_at && (
                    <div className="flex items-center gap-2">
                      <Vote className="h-3.5 w-3.5 text-green-300" />
                      <span>Voting: {formatDate(award.voting_starts_at)}</span>
                    </div>
                  )}
                  {award.voting_ends_at && (
                    <div className="flex items-center gap-2">
                      <Timer className="h-3.5 w-3.5 text-red-300" />
                      <span>Ends: {formatDate(award.voting_ends_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Categories + Nominees Grid ──────────────────────────────────── */}
      {categories && categories.length > 0 ? (
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <aside className="space-y-1.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Categories
            </h3>
            {categories.map((category) => {
              const isSelected = activeCategory?.id === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl text-sm transition-all',
                    isSelected
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/20 shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="block truncate">{category.name}</span>
                  <span className="block text-[11px] mt-0.5 opacity-60">
                    {category.nominations_count ?? 0} nominees
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Nominees List */}
          <div className="lg:col-span-3">
            {activeCategory ? (
              <CategoryNominees
                category={activeCategory}
                awardId={award.id}
                isVotingOpen={isVotingOpen}
                isCompleted={isCompleted}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
              />
            ) : (
              <div className="text-center py-16 rounded-2xl border bg-card">
                <Star className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">Select a category to view nominees</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border bg-card">
          <Trophy className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No Categories Yet</h3>
          <p className="text-sm text-muted-foreground">
            Categories and nominations will appear here once they are added.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Category Nominees Component ──────────────────────────────────────────────

function CategoryNominees({
  category,
  awardId,
  isVotingOpen,
  isCompleted,
  onVote,
  isVoting,
}: {
  category: AwardCategory;
  awardId: number;
  isVotingOpen: boolean;
  isCompleted: boolean;
  onVote: (nominationId: number, categoryId: number) => void;
  isVoting: boolean;
}) {
  const nominations = category.nominations ?? [];

  // Sort: winners first, then by votes_count desc
  const sorted = useMemo(() => {
    return [...nominations].sort((a, b) => {
      if (a.status === 'winner' && b.status !== 'winner') return -1;
      if (b.status === 'winner' && a.status !== 'winner') return 1;
      return (b.votes_count ?? 0) - (a.votes_count ?? 0);
    });
  }, [nominations]);

  // Calculate max votes for percentage bar
  const maxVotes = useMemo(() => {
    return Math.max(1, ...nominations.map((n) => n.votes_count ?? 0));
  }, [nominations]);

  return (
    <div>
      {/* Category header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{category.name}</h2>
        {category.description && (
          <p className="text-muted-foreground mt-1">{category.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span>{nominations.length} nominees</span>
          {isVotingOpen && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Voting Open
            </span>
          )}
        </div>
      </div>

      {/* Nominees */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 rounded-xl border bg-card/60">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No nominations in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((nomination, index) => (
            <NomineeCard
              key={nomination.id}
              nomination={nomination}
              rank={index + 1}
              maxVotes={maxVotes}
              categoryId={category.id}
              isVotingOpen={isVotingOpen}
              isCompleted={isCompleted}
              onVote={onVote}
              isVoting={isVoting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Nominee Card ─────────────────────────────────────────────────────────────

function NomineeCard({
  nomination,
  rank,
  maxVotes,
  categoryId,
  isVotingOpen,
  isCompleted,
  onVote,
  isVoting,
}: {
  nomination: AwardNomination;
  rank: number;
  maxVotes: number;
  categoryId: number;
  isVotingOpen: boolean;
  isCompleted: boolean;
  onVote: (nominationId: number, categoryId: number) => void;
  isVoting: boolean;
}) {
  const Icon = nomineeTypeIcons[nomination.nominee_type ?? ''] ?? Music;
  const isWinner = nomination.status === 'winner';
  const voteCount = nomination.votes_count ?? 0;
  const votePercentage = maxVotes > 0 ? Math.round((voteCount / maxVotes) * 100) : 0;

  return (
    <div
      className={cn(
        'group relative p-5 rounded-2xl border bg-card transition-all',
        isWinner && 'ring-2 ring-amber-500/60 bg-amber-50/50 dark:bg-amber-950/20',
        !isWinner && isVotingOpen && 'hover:shadow-md hover:border-amber-500/30',
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            rank === 1
              ? 'bg-amber-500 text-white'
              : rank === 2
                ? 'bg-gray-400 text-white'
                : rank === 3
                  ? 'bg-amber-700 text-white'
                  : 'bg-muted text-muted-foreground'
          )}
        >
          {isWinner ? (
            <Crown className="h-4 w-4" />
          ) : (
            rank
          )}
        </div>

        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0">
          {nomination.nominee_artwork ? (
            <Image
              src={nomination.nominee_artwork}
              alt={nomination.nominee_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="h-6 w-6 text-muted-foreground/60" />
            </div>
          )}
          {isWinner && (
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 shadow-lg">
              <Crown className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Info + Vote Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate text-base">
              {nomination.nominee_name}
            </p>
            {isWinner && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                WINNER
              </span>
            )}
          </div>

          {nomination.nomination_reason && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {nomination.nomination_reason}
            </p>
          )}

          {/* Vote Progress Bar — show when voting or completed */}
          {(isVotingOpen || isCompleted || voteCount > 0) && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isWinner
                      ? 'bg-amber-500'
                      : rank <= 3
                        ? 'bg-amber-400/70'
                        : 'bg-primary/50'
                  )}
                  style={{ width: `${votePercentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap min-w-[60px] text-right">
                {formatNumber(voteCount)} votes
              </span>
            </div>
          )}
        </div>

        {/* Vote Button */}
        <div className="shrink-0 ml-2">
          {isVotingOpen ? (
            <button
              onClick={() => onVote(nomination.id, categoryId)}
              disabled={isVoting}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                'bg-amber-500 text-white hover:bg-amber-600 active:scale-95',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-sm hover:shadow-md'
              )}
            >
              <span className="flex items-center gap-1.5">
                <Vote className="h-4 w-4" />
                Vote
              </span>
            </button>
          ) : isWinner ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
