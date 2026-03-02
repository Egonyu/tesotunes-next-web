'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Clock,
  Users,
  TrendingUp,
  Plus,
  CheckCircle,
  Filter,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePolls, useVotePoll, transformPoll, Poll } from '@/hooks/usePolls';

export default function PollsPage() {
  const [showActive, setShowActive] = useState(true);

  // API hooks
  const status = showActive ? 'active' : 'closed';
  const { data: pollsData, isLoading } = usePolls(status);
  const voteMutation = useVotePoll();

  // Transform API data to component format
  const polls: Poll[] = useMemo(() => {
    if (pollsData && Array.isArray(pollsData)) {
      return pollsData.map((p: unknown) => transformPoll(p as Record<string, unknown>));
    }
    return [];
  }, [pollsData]);

  const filteredPolls = polls.filter(poll => {
    return showActive ? poll.status === 'active' : poll.status === 'closed';
  });

  const handleVote = (pollId: number, optionId: number) => {
    voteMutation.mutate({ pollId: pollId.toString(), optionId });
  };

  const getRemainingTime = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Closed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Polls</h1>
          <p className="text-muted-foreground">
            Vote and make your voice heard
          </p>
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
      <div className="flex gap-2">
        <button
          onClick={() => setShowActive(true)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            showActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Active
        </button>
        <button
          onClick={() => setShowActive(false)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            !showActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Closed
        </button>
      </div>

      {/* Polls List */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredPolls.map((poll) => (
          <PollCard key={poll.id} poll={poll} getRemainingTime={getRemainingTime} />
        ))}
      </div>

      {filteredPolls.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No polls found</p>
        </div>
      )}
    </div>
  );
}

function PollCard({
  poll,
  getRemainingTime
}: {
  poll: Poll;
  getRemainingTime: (date: string) => string;
}) {
  return (
    <Link
      href={`/polls/${poll.id}`}
      className="block p-6 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
            <Image
              src={poll.creator.avatar}
              alt={poll.creator.name}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium">{poll.creator.name}</span>
          {poll.creator.isVerified && (
            <CheckCircle className="h-4 w-4 text-primary fill-primary" />
          )}
        </div>
        <span className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-full',
          poll.status === 'active'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        )}>
          {poll.status === 'active' ? getRemainingTime(poll.endsAt) : 'Closed'}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
      {poll.description && (
        <p className="text-sm text-muted-foreground mb-4">{poll.description}</p>
      )}

      {/* Options Preview */}
      <div className="space-y-2">
        {poll.options.slice(0, 3).map((option) => (
          <div key={option.id} className="relative">
            <div className="h-10 rounded-lg bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  poll.votedOptionId === option.id
                    ? 'bg-primary/30'
                    : 'bg-muted-foreground/10'
                )}
                style={{ width: `${option.percentage}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <span className="text-sm font-medium truncate">{option.text}</span>
              <span className="text-sm text-muted-foreground">{option.percentage}%</span>
            </div>
          </div>
        ))}
        {poll.options.length > 3 && (
          <p className="text-xs text-muted-foreground">
            +{poll.options.length - 3} more options
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {poll.totalVotes.toLocaleString()} votes
        </span>
        {poll.hasVoted && (
          <span className="flex items-center gap-1 text-primary">
            <CheckCircle className="h-4 w-4" />
            Voted
          </span>
        )}
      </div>
    </Link>
  );
}
