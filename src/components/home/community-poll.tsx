"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, CheckCircle, Loader2, ChevronRight, Vote, Music, Mic2, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolls, useVotePoll, transformPoll, type Poll, type PollType } from "@/hooks/usePolls";
import { useSession } from "next-auth/react";

const TYPE_STYLE: Record<PollType, { icon: React.ElementType; label: string; className: string }> = {
  general:         { icon: Vote,   label: "Poll",            className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  song_battle:     { icon: Music,  label: "Song Battle",     className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
  artist_contest:  { icon: Mic2,   label: "Artist Contest",  className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
  research_survey: { icon: Users,  label: "Research Survey", className: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400" },
};

export function CommunityPoll() {
  const { data: session } = useSession();
  const { data: pollsData, isLoading } = usePolls("active");
  const voteMutation = useVotePoll();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [localVoted, setLocalVoted] = useState(false);
  const [creditsEarned, setCreditsEarned] = useState<number | null>(null);

  const poll: Poll | null = useMemo(() => {
    if (pollsData && Array.isArray(pollsData) && pollsData.length > 0) {
      return transformPoll(pollsData[0] as unknown as Record<string, unknown>);
    }
    return null;
  }, [pollsData]);

  const hasVoted = poll?.hasVoted || localVoted;
  const showResults = hasVoted || poll?.status === "closed";

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
      setSelectedOption(optionId);
      return;
    }

    if (!poll.questionId) return;
    setSelectedOption(optionId);
    setLocalVoted(true);
    voteMutation.mutate(
      { pollId: String(poll.id), questionId: poll.questionId, optionId },
      {
        onSuccess: (data) => {
          const earned = (data as { credits_earned?: number })?.credits_earned ?? 0;
          if (earned > 0) setCreditsEarned(earned);
        },
        onError: () => setLocalVoted(false),
      }
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

  const typeMeta = TYPE_STYLE[poll.poll_type] ?? TYPE_STYLE.general;
  const TypeIcon = typeMeta.icon;
  const maxPct = showResults ? Math.max(...displayOptions.map((o) => o.percentage)) : 0;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Type badge */}
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", typeMeta.className)}>
              <TypeIcon className="h-3 w-3" />
              {typeMeta.label}
            </span>
            {poll.category_label && poll.category !== poll.poll_type && (
              <span className="text-[10px] text-muted-foreground">· {poll.category_label}</span>
            )}
          </div>
          <span className={cn(
            "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full",
            poll.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          )}>
            {poll.status === "active" ? "Active" : "Closed"}
          </span>
        </div>

        <h3 className="text-base font-bold leading-snug">{poll.question}</h3>
        {poll.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{poll.description}</p>
        )}
      </div>

      {/* Options */}
      <div className="px-5 pb-3 space-y-1.5">
        {displayOptions.slice(0, 4).map((option) => {
          const isSelected = selectedOption === option.id || poll.votedOptionId === option.id;
          const isWinner = showResults && option.percentage === maxPct && maxPct > 0;
          const thumbnail = option.song?.artwork_url ?? option.artist?.avatar_url ?? null;
          const isRound = poll.poll_type === "artist_contest";

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || poll.status === "closed" || voteMutation.isPending}
              className={cn(
                "relative w-full text-left rounded-lg overflow-hidden transition-all border",
                !showResults && "hover:border-primary/50 cursor-pointer",
                showResults && "cursor-default",
                isSelected ? "border-primary/60 ring-1 ring-primary/30" : "border-border/60"
              )}
            >
              {showResults && (
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-out",
                    isWinner ? "bg-primary/15 dark:bg-primary/20" : "bg-muted/50"
                  )}
                  style={{ width: `${option.percentage}%` }}
                />
              )}

              <div className="relative flex items-center gap-2 px-3 py-2">
                {thumbnail && (
                  <Image
                    src={thumbnail}
                    alt={option.text}
                    width={28}
                    height={28}
                    className={cn("object-cover shrink-0", isRound ? "rounded-full" : "rounded")}
                  />
                )}
                <span className={cn("text-sm font-medium truncate flex-1", isSelected && "text-primary")}>
                  {option.text}
                </span>
                {showResults && (
                  <span className="text-xs font-semibold text-muted-foreground shrink-0">
                    {option.percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {displayOptions.length > 4 && (
          <Link href={`/polls/${poll.id}`} className="text-xs text-primary hover:underline block pt-0.5">
            +{displayOptions.length - 4} more options
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {totalVotes.toLocaleString()} votes
          </span>
          {creditsEarned && creditsEarned > 0 ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-xs animate-in fade-in">
              <Coins className="h-3.5 w-3.5" />
              +{creditsEarned} earned!
            </span>
          ) : !hasVoted && poll.status === "active" ? (
            <span className="flex items-center gap-1 text-xs">
              <Coins className="h-3.5 w-3.5" />
              +{poll.credits_reward} credits
            </span>
          ) : null}
        </div>
        <Link
          href="/polls"
          className="text-primary hover:underline flex items-center gap-0.5 text-xs font-medium"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
