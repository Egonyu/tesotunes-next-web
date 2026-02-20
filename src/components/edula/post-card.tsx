'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  Play,
  CheckCircle,
  Bookmark,
  Eye,
  TrendingUp,
  Flag,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import type { PostCardData } from '@/types/edula';

interface PostCardProps {
  post: PostCardData;
  onLike?: (postId: number, isLiked: boolean) => void;
  onBookmark?: (postId: number, isBookmarked: boolean) => void;
  onRepost?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onNotInterested?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  showViews?: boolean;
  showTrendingBadge?: boolean;
  isOwner?: boolean;
}

export function PostCard({
  post,
  onLike,
  onBookmark,
  onRepost,
  onShare,
  onNotInterested,
  onReport,
  onDelete,
  showViews = false,
  showTrendingBadge = false,
  isOwner = false,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLike = useCallback(() => {
    onLike?.(post.id, post.isLiked);
  }, [onLike, post.id, post.isLiked]);

  const handleBookmark = useCallback(() => {
    onBookmark?.(post.id, post.isBookmarked);
  }, [onBookmark, post.id, post.isBookmarked]);

  return (
    <article className="p-4 rounded-xl border bg-card relative group">
      {/* Trending Badge */}
      {showTrendingBadge && post.trendingRank && post.trendingRank <= 3 && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
          <TrendingUp className="h-3 w-3" />
          #{post.trendingRank}
        </div>
      )}

      {/* Author Row */}
      <div className="flex items-start justify-between mb-3">
        <Link href={`/artists/${post.author.id}`} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
                {post.author.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{post.author.name}</span>
              {post.author.isVerified && (
                <CheckCircle className="h-4 w-4 text-primary fill-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {post.author.username} · {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </Link>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-xl shadow-lg z-20 py-1">
                {onNotInterested && (
                  <button
                    onClick={() => {
                      onNotInterested(post.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <EyeOff className="h-4 w-4" />
                    Not interested
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={() => {
                      onReport(post.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                )}
                {isOwner && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(post.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete post
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/edula/${post.id}`} className="block">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
      </Link>

      {/* Media */}
      {post.media && (
        <div className="mt-3">
          <MediaAttachment media={post.media} />
        </div>
      )}

      {/* Views (optional) */}
      {showViews && post.views !== undefined && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
          <Eye className="h-3.5 w-3.5" />
          {formatNumber(post.views)} views
        </p>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors',
            'hover:bg-red-50 dark:hover:bg-red-950',
            post.isLiked ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          <Heart className="h-[18px] w-[18px]" fill={post.isLiked ? 'currentColor' : 'none'} />
          <span className="text-xs font-medium">{formatNumber(post.likes)}</span>
        </button>

        <Link
          href={`/edula/${post.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="text-xs font-medium">{formatNumber(post.comments)}</span>
        </Link>

        <button
          onClick={() => onRepost?.(post.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors',
            'hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-500',
            post.isReposted ? 'text-green-500' : 'text-muted-foreground'
          )}
        >
          <Repeat2 className="h-[18px] w-[18px]" />
          <span className="text-xs font-medium">{formatNumber(post.reposts)}</span>
        </button>

        <div className="flex items-center gap-0.5">
          <button
            onClick={handleBookmark}
            className={cn(
              'p-2 rounded-full transition-colors',
              post.isBookmarked ? 'text-primary' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Bookmark className="h-[18px] w-[18px]" fill={post.isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onShare?.(post.id)}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <Share className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Media Attachment sub-component
// ---------------------------------------------------------------------------

function MediaAttachment({
  media,
}: {
  media: NonNullable<PostCardData['media']>;
}) {
  if (media.type === 'image') {
    return (
      <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden bg-muted">
        <Image src={media.url} alt="" fill className="object-cover" unoptimized />
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden bg-muted">
        {media.thumbnail && (
          <Image src={media.thumbnail} alt="" fill className="object-cover" unoptimized />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="h-7 w-7 text-black ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  if (media.type === 'song') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border">
        <div className="relative h-14 w-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
          {media.thumbnail && (
            <Image src={media.thumbnail} alt={media.title || ''} fill className="object-cover" unoptimized />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="h-6 w-6 text-white" fill="currentColor" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{media.title}</p>
          <p className="text-xs text-muted-foreground truncate">{media.artist}</p>
        </div>
      </div>
    );
  }

  if (media.type === 'album') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent border">
        <div className="relative h-14 w-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
          {media.thumbnail && (
            <Image src={media.thumbnail} alt={media.title || ''} fill className="object-cover" unoptimized />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{media.title}</p>
          <p className="text-xs text-muted-foreground truncate">{media.artist} · Album</p>
        </div>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHrs < 24) return `${diffHrs}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export { formatTimeAgo, formatNumber };
