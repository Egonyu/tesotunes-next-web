'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Users,
  Plus,
  CheckCircle,
  Music,
  Mic2,
  Coins,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePolls, transformPoll, POLL_CATEGORIES, type Poll, type PollType } from '@/hooks/usePolls';

const TYPE_BADGE: Record<PollType, { label: string; icon: React.ElementType; className: string }> = {
  general:         { label: 'Poll',            icon: BarChart3, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  song_battle:     { label: 'Song Battle',     icon: Music,     className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  artist_contest:  { label: 'Artist Contest',  icon: Mic2,      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  research_survey: { label: 'Research Survey', icon: Users,     className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
};

export default function PollsPage() {
  const [showActive, setShowActive] = useState(true);
  const [typeFilter, setTypeFilter] = useState<PollType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const status = showActive ? 'active' : 'closed';
  const { data: pollsData, isLoading } = usePolls(
    status,
    typeFilter || undefined,
    categoryFilter || undefined
  );

  const polls: Poll[] = useMemo(() => {
    if (pollsData && Array.isArray(pollsData)) {
      return pollsData.map((p: unknown) => transformPoll(p as Record<string, unknown>));
    }
    return [];
  }, [pollsData]);

  const getRemainingTime = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Closed';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Polls</h1>
          <p className="text-muted-foreground">Vote and earn credits — up to 5 polls per day</p>
        </div>
        <Link
          href="/polls/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 w-fit"
        >
          <Plus className="h-4 w-4" />
          Create Poll
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {(['active', 'closed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setShowActive(s === 'active')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                (s === 'active') === showActive ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as PollType | '')}
          className="px-3 py-1.5 rounded-lg border bg-background text-sm"
        >
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="song_battle">Song Battle</option>
          <option value="artist_contest">Artist Contest</option>
          <option value="research_survey">Research Survey</option>
        </select>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-background text-sm"
        >
          <option value="">All Categories</option>
          {POLL_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Polls grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {polls.map(poll => (
          <PollCard key={poll.id} poll={poll} getRemainingTime={getRemainingTime} />
        ))}
      </div>

      {polls.length === 0 && (
        <div className="text-center py-16">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No polls found</p>
        </div>
      )}
    </div>
  );
}

function PollCard({ poll, getRemainingTime }: { poll: Poll; getRemainingTime: (d: string) => string }) {
  const badge = TYPE_BADGE[poll.poll_type] ?? TYPE_BADGE.general;
  const BadgeIcon = badge.icon;

  return (
    <Link
      href={`/polls/${poll.id}`}
      className="block p-5 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', badge.className)}>
            <BadgeIcon className="h-3 w-3" />
            {badge.label}
          </span>
          {poll.category_label && poll.category !== poll.poll_type && (
            <span className="text-xs text-muted-foreground">· {poll.category_label}</span>
          )}
        </div>
        <span className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-full shrink-0',
          poll.status === 'active'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        )}>
          {poll.status === 'active' ? getRemainingTime(poll.endsAt) : 'Closed'}
        </span>
      </div>

      <h3 className="text-base font-semibold mb-3 line-clamp-2">{poll.question}</h3>

      {/* Options preview */}
      <div className="space-y-2">
        {poll.options.slice(0, 3).map(option => (
          <div key={option.id} className="relative">
            <div className="h-10 rounded-lg bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  poll.votedOptionId === option.id ? 'bg-primary/30' : 'bg-muted-foreground/10'
                )}
                style={{ width: `${option.percentage}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-3 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {option.song?.artwork_url && (
                  <Image src={option.song.artwork_url} alt={option.song.title} width={24} height={24} className="rounded object-cover shrink-0" />
                )}
                {option.artist?.avatar_url && (
                  <Image src={option.artist.avatar_url} alt={option.artist.stage_name} width={24} height={24} className="rounded-full object-cover shrink-0" />
                )}
                <span className="text-sm font-medium truncate">{option.text}</span>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{option.percentage}%</span>
            </div>
          </div>
        ))}
        {poll.options.length > 3 && (
          <p className="text-xs text-muted-foreground">+{poll.options.length - 3} more options</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {poll.totalVotes.toLocaleString()} responses
        </span>
        <span className="flex items-center gap-1">
          <Coins className="h-3.5 w-3.5" />
          +{poll.credits_reward} credits
        </span>
        {poll.hasVoted && (
          <span className="flex items-center gap-1 text-primary ml-auto">
            <CheckCircle className="h-3.5 w-3.5" />
            Voted
          </span>
        )}
      </div>
    </Link>
  );
}
