"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Users, CheckCircle, Loader2, ChevronRight, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolls, useVotePoll, transformPoll, type Poll } from "@/hooks/usePolls";
import { useSession } from "next-auth/react";

// Mock poll for fallback when no polls exist yet
// (removed — component now shows empty state when no active polls)

export function CommunityPoll() {
  const { data: session } = useSession();
  const { data: pollsData, isLoading } = usePolls("active");
  const voteMutation = useVotePoll();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [localVoted, setLocalVoted] = useState(false);

  // Get the most recent active poll from API — no mock fallback
  const poll: Poll | null = useMemo(() => {
    if (pollsData && Array.isArray(pollsData) && pollsData.length > 0) {
      return transformPoll(pollsData[0] as unknown as Record<string, unknown>);
    }
    return null;
  }, [pollsData]);

  const hasVoted = poll?.hasVoted || localVoted;
  const showResults = hasVoted || poll?.status === "closed";

  // Optimistic local state for after voting
  const displayOptions = useMemo(() => {
    if (!poll) return [];
    if (!localVoted || !selectedOption) return poll.options;

    const updated = poll.options.map((opt) => ({
      ...opt,
      votes: opt.id === selectedOption ? opt.votes + 1 : opt.votes,
    }));
    const total = updated.reduce((sum, o) => sum + o.votes, 0);
    return updated.map((opt) => ({
      ...opt,
      percentage: total > 0 ? Math.round((opt.votes / total) * 100) : 0,
    }));
  }, [poll?.options, localVoted, selectedOption]);

  const totalVotes = displayOptions.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (optionId: number) => {
    if (!poll || hasVoted || poll.status === "closed") return;

    if (!session) {
      // Not logged in — just select visually
      setSelectedOption(optionId);
      return;
    }

    setSelectedOption(optionId);
    setLocalVoted(true);
    voteMutation.mutate(
      { pollId: String(poll.id), optionId },
      { onError: () => setLocalVoted(false) }
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
        <Vote className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">No active polls</p>
        <p className="text-xs mt-1">Check back later for community polls</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">TT</span>
            </div>
            <span className="text-sm font-semibold">{poll.creator.name}</span>
            {poll.creator.isVerified && (
              <CheckCircle className="h-3.5 w-3.5 text-primary fill-primary" />
            )}
          </div>
          <span
            className={cn(
              "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full",
              poll.status === "active"
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            )}
          >
            {poll.status === "active" ? "Active" : "Closed"}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug">{poll.question}</h3>
        {poll.description && (
          <p className="text-sm text-muted-foreground mt-1">{poll.description}</p>
        )}
      </div>

      {/* Options */}
      <div className="px-5 pb-4 space-y-2">
        {displayOptions.slice(0, 4).map((option) => {
          const isSelected = selectedOption === option.id || poll.votedOptionId === option.id;
          const isWinner = showResults && option.percentage === Math.max(...displayOptions.map((o) => o.percentage));

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || poll.status === "closed" || voteMutation.isPending}
              className={cn(
                "relative w-full text-left rounded-lg overflow-hidden transition-all",
                "border",
                !showResults && "hover:border-primary/50 cursor-pointer",
                showResults && "cursor-default",
                isSelected
                  ? "border-primary/60 ring-1 ring-primary/30"
                  : "border-border/60"
              )}
            >
              {/* Progress bar background */}
              {showResults && (
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-out",
                    isWinner
                      ? "bg-primary/15 dark:bg-primary/20"
                      : "bg-muted/50"
                  )}
                  style={{ width: `${option.percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between px-4 py-2.5">
                <span
                  className={cn(
                    "text-sm font-medium truncate pr-3",
                    isSelected && "text-primary"
                  )}
                >
                  {option.text}
                </span>
                {showResults && (
                  <span className="text-sm font-semibold text-muted-foreground shrink-0">
                    {option.percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {displayOptions.length > 4 && (
          <Link
            href={`/polls/${poll.id}`}
            className="text-xs text-primary hover:underline"
          >
            +{displayOptions.length - 4} more options
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {totalVotes.toLocaleString()} votes
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/polls"
            className="text-primary hover:underline flex items-center gap-0.5 text-xs font-medium"
          >
            View All Polls
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
