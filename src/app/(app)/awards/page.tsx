'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Star,
  Vote,
  Calendar,
  ChevronRight,
  Crown,
  Flame,
  Music,
  Sparkles,
  Award,
  Timer,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatDate } from '@/lib/utils';
import { useAwards, useCurrentSeason, type Award as AwardType } from '@/hooks/useAwards';

const statusConfig: Record<string, { label: string; color: string; glow?: string }> = {
  upcoming: {
    label: 'Upcoming',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  },
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400',
  },
  nominations_open: {
    label: 'Nominations Open',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400',
    glow: 'ring-2 ring-yellow-400/30',
  },
  nominations_closed: {
    label: 'Nominations Closed',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400',
  },
  voting_open: {
    label: 'Vote Now',
    color: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400',
    glow: 'ring-2 ring-green-400/30',
  },
  voting_closed: {
    label: 'Voting Closed',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400',
  },
  completed: {
    label: 'Completed',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400',
  },
};

type FilterType = 'all' | 'active' | 'past';

function isActive(status: string) {
  return ['nominations_open', 'voting_open', 'upcoming'].includes(status);
}

function isPast(status: string) {
  return ['voting_closed', 'completed', 'nominations_closed'].includes(status);
}

export default function AwardsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: awardsRes, isLoading: awardsLoading } = useAwards({ per_page: 50 });
  const { data: currentSeason } = useCurrentSeason();

  const awards = awardsRes?.data ?? [];

  const filteredAwards = awards.filter((a) => {
    if (filter === 'active') return isActive(a.status);
    if (filter === 'past') return isPast(a.status);
    return true;
  });

  // Find the hero award: current season or most prominent active award
  const heroAward =
    currentSeason ??
    awards.find((a) => a.status === 'voting_open' || a.status === 'nominations_open');

  if (awardsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-10">
      {/* Hero */}
      {heroAward && <HeroBanner award={heroAward} />}

      {/* Quick Stats */}
      <QuickStats awards={awards} />

      {/* Award Seasons Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Award Seasons</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Browse all award ceremonies and vote for your favourites
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1 p-1 bg-muted/60 rounded-xl">
            {(['all', 'active', 'past'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all',
                  filter === f
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredAwards.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-card border border-dashed">
            <Trophy className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No award seasons found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {filter !== 'all'
                ? 'Try switching the filter.'
                : 'Check back soon for upcoming awards!'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAwards.map((award) => (
              <AwardCard key={award.id} award={award} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <HowItWorks />
    </div>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({ award }: { award: AwardType }) {
  const isVoting = award.status === 'voting_open';
  const isNominating = award.status === 'nominations_open';

  return (
    <div className="relative rounded-3xl overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/90 via-orange-500/80 to-yellow-500/70 dark:from-amber-900/90 dark:via-orange-900/80 dark:to-yellow-900/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

      {/* Decorative icons */}
      <div className="absolute top-6 right-8 opacity-10">
        <Trophy className="h-48 w-48 text-white" />
      </div>
      <div className="absolute bottom-4 left-12 opacity-10">
        <Sparkles className="h-24 w-24 text-white" />
      </div>

      {/* Content */}
      <div className="relative p-8 md:p-12 lg:p-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            {(isVoting || isNominating) && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
            )}
            <span className="text-sm font-semibold text-white/90 uppercase tracking-widest">
              {isVoting
                ? 'Voting is Live'
                : isNominating
                  ? 'Nominations Open'
                  : 'Coming Soon'}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
            {award.title}
          </h1>

          {award.description && (
            <p className="text-white/80 text-lg mb-2 line-clamp-2">{award.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mt-4 mb-8">
            {award.nominations_count !== undefined && (
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                {award.nominations_count} nominations
              </span>
            )}
            {award.ceremony_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Ceremony: {formatDate(award.ceremony_date)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              {award.year}
            </span>
          </div>

          <Link
            href={`/awards/${award.slug}`}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-amber-700 rounded-2xl font-bold text-base hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {isVoting ? (
              <>
                <Vote className="h-5 w-5" />
                Vote Now
              </>
            ) : isNominating ? (
              <>
                <Star className="h-5 w-5" />
                Nominate
              </>
            ) : (
              <>
                <ArrowRight className="h-5 w-5" />
                View Details
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────

function QuickStats({ awards }: { awards: AwardType[] }) {
  const totalAwards = awards.length;
  const activeAwards = awards.filter((a) => isActive(a.status)).length;
  const totalNominations = awards.reduce((sum, a) => sum + (a.nominations_count ?? 0), 0);
  const totalCategories = awards.reduce((sum, a) => sum + (a.categories_count ?? 0), 0);

  const stats = [
    {
      label: 'Award Seasons',
      value: totalAwards,
      icon: Trophy,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Active Now',
      value: activeAwards,
      icon: Flame,
      color: 'text-green-500 bg-green-500/10',
    },
    {
      label: 'Nominations',
      value: formatNumber(totalNominations),
      icon: Star,
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      label: 'Categories',
      value: totalCategories,
      icon: Music,
      color: 'text-blue-500 bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden p-5 rounded-2xl border bg-card hover:shadow-md transition-shadow"
        >
          <div className={cn('p-2.5 rounded-xl w-fit mb-3', stat.color)}>
            <stat.icon className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Award Card ───────────────────────────────────────────────────────────────

function AwardCard({ award }: { award: AwardType }) {
  const config = statusConfig[award.status] ?? statusConfig.upcoming;

  return (
    <Link
      href={`/awards/${award.slug}`}
      className="group relative rounded-2xl border bg-card overflow-hidden hover:shadow-xl transition-all hover:-translate-y-0.5"
    >
      {/* Top visual band */}
      <div className="relative h-36 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/15 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-yellow-900/15">
        {award.artwork ? (
          <Image src={award.artwork} alt={award.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="h-16 w-16 text-amber-500/20 group-hover:text-amber-500/30 transition-colors" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              'text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm',
              config.color,
              config.glow
            )}
          >
            {config.label}
          </span>
        </div>

        {/* Gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 pt-2">
        <h3 className="text-lg font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
          {award.title}
        </h3>

        {award.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{award.description}</p>
        )}

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {award.year}
          </span>
          {award.nominations_count !== undefined && award.nominations_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" />
              {award.nominations_count} nominees
            </span>
          )}
        </div>

        {/* Dates */}
        {(award.voting_starts_at || award.nomination_starts_at) && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground/70">
            <Timer className="h-3 w-3" />
            {award.voting_starts_at
              ? `Voting: ${formatDate(award.voting_starts_at)}`
              : award.nomination_starts_at
                ? `Nominations: ${formatDate(award.nomination_starts_at)}`
                : null}
          </div>
        )}

        {/* CTA strip */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
            {award.is_voting_open
              ? 'Vote Now'
              : award.is_nomination_open
                ? 'Submit Nomination'
                : 'View Details'}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      icon: Star,
      title: 'Nominate',
      description:
        'Submit your favourite artists, songs, and albums during the nomination period.',
      color: 'text-yellow-500 bg-yellow-500/10',
    },
    {
      icon: Vote,
      title: 'Vote',
      description:
        'Cast your votes for approved nominees in each category when voting opens.',
      color: 'text-green-500 bg-green-500/10',
    },
    {
      icon: Crown,
      title: 'Celebrate',
      description:
        'Winners are announced at the ceremony. Check results and celebrate the best!',
      color: 'text-purple-500 bg-purple-500/10',
    },
  ];

  return (
    <section className="rounded-2xl border bg-card/60 p-8 md:p-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Three simple steps to participate in the awards
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={step.title} className="text-center">
            <div className="relative inline-flex mb-4">
              <div className={cn('p-4 rounded-2xl', step.color)}>
                <step.icon className="h-7 w-7" />
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
            </div>
            <h3 className="font-bold text-lg">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
