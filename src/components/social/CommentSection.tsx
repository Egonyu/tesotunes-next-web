'use client';

import { useState, useCallback, Fragment } from 'react';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Trash2,
  Edit2,
  Flag,
  ChevronDown,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useComments,
  useCreateComment,
  useDeleteSocialComment,
  useLikeComment,
} from '@/hooks/useSocial';
import type { CommentableType, SocialComment } from '@/types/social';
import { toast } from 'sonner';

// ============================================================================
// CommentSection — drop-in reusable commenting for ANY entity
//
// Usage:
//   <CommentSection commentableType="song" commentableId={123} />
//   <CommentSection commentableType="event" commentableId={456} />
//   <CommentSection commentableType="product" commentableId={789} />
// ============================================================================

interface CommentSectionProps {
  commentableType: CommentableType;
  commentableId: number;
  /** Optional heading override; defaults to "Comments" */
  title?: string;
  /** Max depth for nested replies (default: 2) */
  maxReplyDepth?: number;
  /** Hide the compose box (e.g. for logged-out users) */
  readOnly?: boolean;
  /** Additional CSS class on the root wrapper */
  className?: string;
}

export function CommentSection({
  commentableType,
  commentableId,
  title = 'Comments',
  maxReplyDepth = 2,
  readOnly = false,
  className,
}: CommentSectionProps) {
  const { status } = useSession();
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'popular'>('latest');
  const isAuthenticated = status === 'authenticated';
  const isReadOnly = readOnly || status === 'unauthenticated';

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useComments(commentableType, commentableId, { sort: sortOrder });

  const createComment = useCreateComment(commentableType, commentableId);

  const comments: SocialComment[] = data?.pages.flatMap((p) => p.data) ?? [];
  const totalCount = data?.pages[0]?.meta?.total ?? 0;

  const handleSubmit = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      if (!isAuthenticated) {
        toast.error('Please sign in to post a comment');
        return;
      }

      try {
        await createComment.mutateAsync({ content });
        toast.success('Comment posted');
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err?.response?.data?.message || 'Failed to post comment');
      }
    },
    [createComment, isAuthenticated]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {title}
          {totalCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({totalCount})
            </span>
          )}
        </h3>

        {/* Sort selector */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
          className="text-sm border rounded-md px-2 py-1 bg-background"
        >
          <option value="latest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      {/* Compose box */}
      {!isReadOnly && (
        <CommentComposer
          onSubmit={handleSubmit}
          isPending={createComment.isPending}
          placeholder="Write a comment..."
        />
      )}

      {status === 'unauthenticated' && (
        <p className="text-sm text-muted-foreground">Sign in to join the conversation.</p>
      )}

      {/* Comment list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              commentableType={commentableType}
              commentableId={commentableId}
              depth={0}
              maxReplyDepth={maxReplyDepth}
              readOnly={isReadOnly}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-2" />
            )}
            Load more comments
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CommentComposer — text input + submit
// ============================================================================

interface CommentComposerProps {
  onSubmit: (content: string) => Promise<void> | void;
  isPending: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

function CommentComposer({
  onSubmit,
  isPending,
  placeholder = 'Write a reply...',
  autoFocus = false,
}: CommentComposerProps) {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (!text.trim() || isPending) return;
    await onSubmit(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="min-h-[60px] resize-none"
          autoFocus={autoFocus}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Press Ctrl+Enter to submit
        </p>
      </div>
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!text.trim() || isPending}
        className="self-end"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// ============================================================================
// CommentItem — single comment with reply toggle
// ============================================================================

interface CommentItemProps {
  comment: SocialComment;
  commentableType: CommentableType;
  commentableId: number;
  depth: number;
  maxReplyDepth: number;
  readOnly: boolean;
}

function CommentItem({
  comment,
  commentableType,
  commentableId,
  depth,
  maxReplyDepth,
  readOnly,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const createReply = useCreateComment(commentableType, commentableId);
  const deleteComment = useDeleteSocialComment(commentableType, commentableId);
  const likeComment = useLikeComment();

  const [liked, setLiked] = useState(comment.is_liked);
  const [likesCount, setLikesCount] = useState(comment.likes_count);

  const handleLike = () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(wasLiked ? Math.max(0, likesCount - 1) : likesCount + 1);
    likeComment.mutate(comment.id, {
      onError: () => {
        setLiked(wasLiked);
        setLikesCount(wasLiked ? likesCount : Math.max(0, likesCount - 1));
      },
    });
  };

  const handleReply = async (content: string) => {
    try {
      await createReply.mutateAsync({ content, parent_id: comment.id });
      setShowReplyBox(false);
      setShowReplies(true);
      toast.success('Reply posted');
    } catch {
      toast.error('Failed to post reply');
    }
  };

  const handleDelete = () => {
    deleteComment.mutate(comment.id, {
      onSuccess: () => toast.success('Comment deleted'),
      onError: () => toast.error('Failed to delete comment'),
    });
    setMenuOpen(false);
  };

  return (
    <div
      className={cn(
        'py-3',
        depth > 0 && 'ml-8 border-l-2 border-muted pl-4'
      )}
    >
      {/* Author row */}
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
          {comment.user.avatar_url ? (
            <Image
              src={comment.user.avatar_url}
              alt={comment.user.name}
              width={32}
              height={32}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-xs font-semibold">
              {comment.user.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{comment.user.name}</span>
            {comment.user.is_verified && (
              <CheckCircle className="h-3.5 w-3.5 text-primary fill-primary" />
            )}
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.created_at)}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          {/* Content */}
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>

          {/* Action bar */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                liked
                  ? 'text-red-500'
                  : 'text-muted-foreground hover:text-red-500'
              )}
            >
              <Heart
                className="h-3.5 w-3.5"
                fill={liked ? 'currentColor' : 'none'}
              />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            {!readOnly && depth < maxReplyDepth && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Reply
              </button>
            )}

            {comment.replies_count > 0 && !showReplies && (
              <button
                onClick={() => setShowReplies(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                {comment.replies_count}{' '}
                {comment.replies_count === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {/* More menu */}
            <div className="relative ml-auto">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-popover border rounded-lg shadow-lg z-20 py-1">
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      Report
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reply composer */}
          {showReplyBox && (
            <div className="mt-3">
              <CommentComposer
                onSubmit={handleReply}
                isPending={createReply.isPending}
                placeholder={`Reply to ${comment.user.name}...`}
                autoFocus
              />
            </div>
          )}

          {/* Nested replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  commentableType={commentableType}
                  commentableId={commentableId}
                  depth={depth + 1}
                  maxReplyDepth={maxReplyDepth}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
