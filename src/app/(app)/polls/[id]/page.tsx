'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Clock,
  Users,
  Share2,
  CheckCircle,
  BarChart3,
  Music,
  Mic2,
  Coins,
  Loader2,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePoll, useVotePoll, transformPoll, type Poll, type PollOption, type PollType } from '@/hooks/usePolls';

const TYPE_LABEL: Record<PollType, { label: string; icon: React.ElementType; className: string }> = {
  general:        { label: 'Poll',           icon: BarChart3, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  song_battle:    { label: 'Song Battle',    icon: Music,     className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  artist_contest: { label: 'Artist Contest', icon: Mic2,      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

export default function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [localVote, setLocalVote] = useState<{ optionId: number; creditsEarned: number } | null>(null);

  const { data: pollData, isLoading, error } = usePoll(id);
  const voteMutation = useVotePoll();

  const poll: Poll | null = useMemo(() => {
    if (pollData) return transformPoll(pollData as Record<string, unknown>);
    return null;
  }, [pollData]);

  const displayPoll: Poll | null = useMemo(() => {
    if (!poll || !localVote) return poll;

    const updatedOptions = poll.options.map(opt => ({
      ...opt,
      votes: opt.id === localVote.optionId ? opt.votes + 1 : opt.votes,
    }));
    const newTotal = updatedOptions.reduce((sum, o) => sum + o.votes, 0);

    return {
      ...poll,
      options: updatedOptions.map(opt => ({
        ...opt,
        percentage: newTotal > 0 ? Math.round((opt.votes / newTotal) * 100) : 0,
      })),
      totalVotes: newTotal,
      hasVoted: true,
      votedOptionId: localVote.optionId,
    };
  }, [poll, localVote]);

  const getRemainingTime = () => {
    if (!displayPoll) return '';
    const diff = new Date(displayPoll.endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Poll has closed';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes} minutes remaining`;
  };

  const handleVote = () => {
    if (!poll || !selectedOption || poll.hasVoted || localVote) return;

    voteMutation.mutate(
      { pollId: id, optionId: selectedOption },
      {
        onSuccess: (data) => {
          const creditsEarned = (data as { credits_earned?: number })?.credits_earned ?? 0;
          setLocalVote({ optionId: selectedOption, creditsEarned });
        },
      }
    );
  };

  const showResults = displayPoll?.hasVoted || displayPoll?.status === 'closed' || !!localVote;
  const typeMeta = displayPoll ? (TYPE_LABEL[displayPoll.poll_type] ?? TYPE_LABEL.general) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !displayPoll) {
    return (
      <div className="container py-8 max-w-3xl">
        <Link href="/polls" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to Polls
        </Link>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Poll not found</p>
        </div>
      </div>
    );
  }

  const winnerPercentage = showResults ? Math.max(...displayPoll.options.map(o => o.percentage)) : 0;

  return (
    <div className="container py-8 max-w-3xl">
      <Link href="/polls" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />
        Back to Polls
      </Link>

      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                <Image src={displayPoll.creator.avatar} alt={displayPoll.creator.name} width={40} height={40} className="object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{displayPoll.creator.name}</span>
                  {displayPoll.creator.isVerified && <CheckCircle className="h-4 w-4 text-primary fill-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(displayPoll.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {typeMeta && (
              <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', typeMeta.className)}>
                <typeMeta.icon className="h-3 w-3" />
                {typeMeta.label}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">{displayPoll.question}</h1>
          {displayPoll.description && <p className="text-muted-foreground text-sm">{displayPoll.description}</p>}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {getRemainingTime()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {displayPoll.totalVotes.toLocaleString()} votes
            </span>
            {!displayPoll.hasVoted && !localVote && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Coins className="h-4 w-4" />
                Earn +{displayPoll.credits_reward} credits
              </span>
            )}
            {displayPoll.category_label && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{displayPoll.category_label}</span>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="p-6">
          <div className="space-y-3">
            {displayPoll.options.map(option => {
              const isSelected = selectedOption === option.id || displayPoll.votedOptionId === option.id;
              const isWinner = showResults && option.percentage === winnerPercentage && winnerPercentage > 0;

              return (
                <OptionButton
                  key={option.id}
                  option={option}
                  isSelected={isSelected}
                  isWinner={isWinner}
                  showResults={!!showResults}
                  pollType={displayPoll.poll_type}
                  onClick={() => !showResults && setSelectedOption(option.id)}
                />
              );
            })}
          </div>

          {/* Vote button */}
          {!showResults && displayPoll.status === 'active' && (
            <button
              onClick={handleVote}
              disabled={!selectedOption || voteMutation.isPending}
              className={cn(
                'w-full mt-6 py-3 rounded-lg font-medium transition-colors',
                selectedOption && !voteMutation.isPending
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {voteMutation.isPending ? 'Submitting…' : `Vote${selectedOption ? '' : ' — select an option'}`}
            </button>
          )}

          {/* Post-vote state */}
          {showResults && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">
                {localVote ? 'Thank you for voting!' : displayPoll.hasVoted ? 'You already voted' : 'This poll has closed'}
              </p>
              {localVote && localVote.creditsEarned > 0 ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                  +{localVote.creditsEarned} credits earned!
                </p>
              ) : localVote && localVote.creditsEarned === 0 ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Daily credit limit reached — vote still counted!
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground mt-1">
                {displayPoll.totalVotes.toLocaleString()} total votes
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  option,
  isSelected,
  isWinner,
  showResults,
  pollType,
  onClick,
}: {
  option: PollOption;
  isSelected: boolean;
  isWinner: boolean;
  showResults: boolean;
  pollType: PollType;
  onClick: () => void;
}) {
  const thumbnail = option.song?.artwork_url ?? option.artist?.avatar_url ?? null;
  const isRound = pollType === 'artist_contest';

  return (
    <button
      onClick={onClick}
      disabled={showResults}
      className={cn(
        'w-full relative rounded-lg border transition-all text-left overflow-hidden',
        showResults ? 'cursor-default' : 'cursor-pointer hover:border-primary',
        isSelected && !showResults && 'border-primary ring-2 ring-primary/20',
        isWinner && showResults && 'border-primary/50'
      )}
    >
      {showResults && (
        <div
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-out',
            isSelected ? 'bg-primary/15' : 'bg-muted/40'
          )}
          style={{ width: `${option.percentage}%` }}
        />
      )}

      <div className="relative flex items-center gap-3 p-4">
        {/* Selection circle (pre-vote) */}
        {!showResults && (
          <div className={cn(
            'shrink-0 h-5 w-5 rounded-full border-2 transition-colors',
            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
          )}>
            {isSelected && <div className="h-full w-full flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-white" /></div>}
          </div>
        )}

        {/* Song / artist image */}
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={option.text}
            width={40}
            height={40}
            className={cn('object-cover shrink-0', isRound ? 'rounded-full' : 'rounded')}
          />
        )}

        {/* Text + sub-label */}
        <div className="flex-1 min-w-0">
          <span className={cn('font-medium block truncate', isSelected && 'text-primary')}>
            {option.text}
          </span>
          {option.song?.artist_name && (
            <span className="text-xs text-muted-foreground truncate">{option.song.artist_name}</span>
          )}
        </div>

        {/* Results */}
        {showResults && (
          <div className="shrink-0 flex items-center gap-2">
            {isWinner && <Trophy className="h-4 w-4 text-amber-500" />}
            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
            <div className="text-right">
              <span className="font-semibold">{option.percentage}%</span>
              <span className="text-sm text-muted-foreground ml-1">({option.votes.toLocaleString()})</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
