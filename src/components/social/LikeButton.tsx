'use client';

import { useCallback } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLikeStatus, useToggleLike } from '@/hooks/useSocial';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { LikeableType } from '@/types/social';

// ============================================================================
// LikeButton — drop-in reusable like toggle for ANY entity
//
// Usage:
//   <LikeButton likeableType="song"  likeableId={123} />
//   <LikeButton likeableType="event" likeableId={456} showCount />
//   <LikeButton likeableType="album" likeableId={789} variant="pill" />
// ============================================================================

type LikeButtonVariant = 'icon' | 'pill' | 'inline';

interface LikeButtonProps {
  likeableType: LikeableType;
  likeableId: number;
  /** Display style */
  variant?: LikeButtonVariant;
  /** Show like count next to icon */
  showCount?: boolean;
  /** Override initial like count (before query resolves) */
  initialCount?: number;
  /** Override initial liked state */
  initialLiked?: boolean;
  /** Icon size in tailwind units (default: 5 = 20px) */
  iconSize?: 4 | 5 | 6 | 7;
  /** Additional CSS class on wrapper */
  className?: string;
  /** Disable fetching status from API (use initial values only) */
  skipFetch?: boolean;
}

export function LikeButton({
  likeableType,
  likeableId,
  variant = 'icon',
  showCount = true,
  initialCount = 0,
  initialLiked = false,
  iconSize = 5,
  className,
  skipFetch = false,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const { data: status, isLoading } = useLikeStatus(likeableType, likeableId, {
    enabled: !skipFetch && !!session?.user,
  });
  const toggleLike = useToggleLike(likeableType, likeableId);

  const isLiked = status?.data?.is_liked ?? initialLiked;
  const likesCount = status?.data?.likes_count ?? initialCount;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!session?.user) {
        toast.error('Please sign in to like');
        return;
      }
      toggleLike.mutate();
    },
    [toggleLike, session]
  );

  const sizeClass = `h-${iconSize} w-${iconSize}`;

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading || toggleLike.isPending}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
          isLiked
            ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400'
            : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          className
        )}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        {isLoading ? (
          <Loader2 className={cn(sizeClass, 'animate-spin')} />
        ) : (
          <Heart
            className={cn(sizeClass, 'transition-transform', isLiked && 'scale-110')}
            fill={isLiked ? 'currentColor' : 'none'}
          />
        )}
        {showCount && <span>{formatCount(likesCount)}</span>}
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading || toggleLike.isPending}
        className={cn(
          'inline-flex items-center gap-1 text-sm transition-colors',
          isLiked
            ? 'text-red-500'
            : 'text-muted-foreground hover:text-red-500',
          className
        )}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        {isLoading ? (
          <Loader2 className={cn(sizeClass, 'animate-spin')} />
        ) : (
          <Heart
            className={cn(sizeClass, 'transition-transform', isLiked && 'scale-110')}
            fill={isLiked ? 'currentColor' : 'none'}
          />
        )}
        {showCount && likesCount > 0 && <span>{formatCount(likesCount)}</span>}
      </button>
    );
  }

  // Default: icon variant
  return (
    <button
      onClick={handleClick}
      disabled={isLoading || toggleLike.isPending}
      className={cn(
        'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
        isLiked
          ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950/30'
          : 'hover:bg-muted',
        className
      )}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      {isLoading ? (
        <Loader2 className={cn(sizeClass, 'animate-spin')} />
      ) : (
        <Heart
          className={cn(sizeClass, 'transition-transform', isLiked && 'scale-110')}
          fill={isLiked ? 'currentColor' : 'none'}
        />
      )}
      {showCount ? (
        <span className="text-xs">{likesCount > 0 ? formatCount(likesCount) : 'Like'}</span>
      ) : (
        <span className="text-xs">Like</span>
      )}
    </button>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}
