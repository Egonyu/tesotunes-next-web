'use client';

import { useCallback } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFollowStatus, useToggleFollow } from '@/hooks/useSocial';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { FollowableType } from '@/types/social';

// ============================================================================
// FollowButton — drop-in reusable follow toggle for ANY entity
//
// Usage:
//   <FollowButton followableType="artist"  followableId={123} />
//   <FollowButton followableType="playlist" followableId={456} variant="compact" />
//   <FollowButton followableType="user"    followableId={789} showCount />
// ============================================================================

type FollowButtonVariant = 'default' | 'compact' | 'pill' | 'outline';

interface FollowButtonProps {
  followableType: FollowableType;
  followableId: number;
  /** Display style */
  variant?: FollowButtonVariant;
  /** Show follower count */
  showCount?: boolean;
  /** Override initial follower count */
  initialCount?: number;
  /** Override initial follow state */
  initialFollowing?: boolean;
  /** Label when following (default: "Following") */
  followingLabel?: string;
  /** Label when not following (default: "Follow") */
  followLabel?: string;
  /** Additional CSS class on wrapper */
  className?: string;
  /** Disable fetching status from API */
  skipFetch?: boolean;
}

export function FollowButton({
  followableType,
  followableId,
  variant = 'default',
  showCount = false,
  initialCount = 0,
  initialFollowing = false,
  followingLabel = 'Following',
  followLabel = 'Follow',
  className,
  skipFetch = false,
}: FollowButtonProps) {
  const { data: session } = useSession();
  const { data: status, isLoading } = useFollowStatus(followableType, followableId, {
    enabled: !skipFetch,
  });
  const toggleFollow = useToggleFollow(followableType, followableId);

  const isFollowing = status?.data?.is_following ?? initialFollowing;
  const followersCount = status?.data?.followers_count ?? initialCount;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!session?.user) {
        toast.error('Please sign in to follow');
        return;
      }
      toggleFollow.mutate(isFollowing);
    },
    [toggleFollow, session, isFollowing]
  );

  const isPending = isLoading || toggleFollow.isPending;

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
          isFollowing
            ? 'bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
          className
        )}
        aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isFollowing ? (
          <UserMinus className="h-3 w-3" />
        ) : (
          <UserPlus className="h-3 w-3" />
        )}
        <span>{isFollowing ? followingLabel : followLabel}</span>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
          isFollowing
            ? 'border border-primary text-primary hover:border-destructive hover:text-destructive hover:bg-destructive/5'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
          className
        )}
        aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          <UserMinus className="h-4 w-4" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        <span>{isFollowing ? followingLabel : followLabel}</span>
        {showCount && (
          <span className="text-xs opacity-75">
            {formatFollowerCount(followersCount)}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'outline') {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-6 py-2 font-medium transition-colors',
          isFollowing
            ? 'border-primary text-primary hover:bg-primary/10 hover:border-destructive hover:text-destructive'
            : 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
          className
        )}
        aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isPending && <span>{isFollowing ? followingLabel : followLabel}</span>}
      </button>
    );
  }

  // Default variant — full-width button style matching artist page
  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 font-medium transition-colors border',
        isFollowing
          ? 'border-primary text-primary hover:bg-primary/10'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary',
        className
      )}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        followingLabel
      ) : (
        followLabel
      )}
    </button>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatFollowerCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}
