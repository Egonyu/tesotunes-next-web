'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  CheckCircle,
  Bookmark,
  Send,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatTimeAgo } from '@/components/edula/post-card';
import type { PostCardData } from '@/types/edula';
import {
  usePost,
  usePostComments,
  useLikePost,
  useUnlikePost,
  useBookmarkPost,
  useUnbookmarkPost,
  useCreateComment,
  useLikeComment,
} from '@/hooks/useFeed';

interface CommentData {
  id: number;
  author: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: CommentData[];
}



export default function PostDetailPage({
  params
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = use(params);
  const postIdNum = parseInt(postId);
  const [newComment, setNewComment] = useState('');

  // API hooks
  const { data: postData, isLoading: postLoading } = usePost(postIdNum);
  const { data: commentsData, isLoading: commentsLoading } = usePostComments(postIdNum);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const bookmarkPost = useBookmarkPost();
  const unbookmarkPost = useUnbookmarkPost();
  const createComment = useCreateComment();
  const likeComment = useLikeComment();

  // Transform API data or use mock
  const post: PostCardData | null = useMemo(() => {
    if (postData?.data) {
      const p = postData.data;
      return {
        id: p.id,
        author: {
          id: p.author.id,
          name: p.author.name,
          username: `@${p.author.username}`,
          avatar: p.author.avatar_url,
          isVerified: p.author.is_verified,
        },
        content: p.content,
        createdAt: p.created_at,
        likes: p.likes_count,
        comments: p.comments_count,
        reposts: p.reposts_count,
        isLiked: p.is_liked,
        isReposted: p.is_reposted,
        isBookmarked: p.is_bookmarked,
      };
    }
    return null;
  }, [postData, postIdNum]);

  const comments: CommentData[] = useMemo(() => {
    if (commentsData?.pages) {
      return commentsData.pages.flatMap(page =>
        page.data.map(c => ({
          id: c.id,
          author: {
            name: c.author.name,
            username: `@${c.author.username}`,
            avatar: c.author.avatar_url,
            isVerified: c.author.is_verified,
          },
          content: c.content,
          createdAt: c.created_at,
          likes: c.likes_count,
          isLiked: c.is_liked,
        }))
      );
    }
    return [];
  }, [commentsData]);

  const handleToggleLike = () => {
    if (!post) return;
    if (post.isLiked) {
      unlikePost.mutate(post.id);
    } else {
      likePost.mutate(post.id);
    }
  };

  const handleToggleBookmark = () => {
    if (!post) return;
    if (post.isBookmarked) {
      unbookmarkPost.mutate(post.id);
    } else {
      bookmarkPost.mutate(post.id);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;

    createComment.mutate({
      postId: post.id,
      content: newComment,
    }, {
      onSuccess: () => setNewComment(''),
    });
  };

  const handleLikeComment = (commentId: number) => {
    likeComment.mutate(commentId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en', {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (postLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-4 py-8">
        <Link href="/edula" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to Feed
        </Link>
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Post not found</p>
          <p className="text-muted-foreground">This post may have been removed or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Back Link */}
      <Link
        href="/edula"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Feed
      </Link>

      {/* Post */}
      <article className="p-4 rounded-xl border bg-card">
        {/* Author */}
        <div className="flex items-start justify-between mb-4">
          <Link href={`/artists/${post.author.id}`} className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{post.author.name}</span>
                {post.author.isVerified && (
                  <CheckCircle className="h-5 w-5 text-primary fill-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{post.author.username}</p>
            </div>
          </Link>
          <button className="p-2 hover:bg-muted rounded-full text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-lg whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Timestamp */}
        <p className="text-sm text-muted-foreground mb-4 pb-4 border-b">
          {formatDate(post.createdAt)}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm mb-4 pb-4 border-b">
          <span>
            <strong>{post.reposts.toLocaleString()}</strong>{' '}
            <span className="text-muted-foreground">Reposts</span>
          </span>
          <span>
            <strong>{post.likes.toLocaleString()}</strong>{' '}
            <span className="text-muted-foreground">Likes</span>
          </span>
          <span>
            <strong>{post.comments.toLocaleString()}</strong>{' '}
            <span className="text-muted-foreground">Comments</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-around">
          <button
            onClick={handleToggleLike}
            className={cn(
              'flex items-center gap-2 p-2 rounded-full transition-colors',
              post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            )}
          >
            <Heart className="h-6 w-6" fill={post.isLiked ? 'currentColor' : 'none'} />
          </button>
          <button className="flex items-center gap-2 p-2 rounded-full text-muted-foreground hover:text-blue-500 transition-colors">
            <MessageCircle className="h-6 w-6" />
          </button>
          <button className="flex items-center gap-2 p-2 rounded-full text-muted-foreground hover:text-green-500 transition-colors">
            <Repeat2 className="h-6 w-6" />
          </button>
          <button
            onClick={handleToggleBookmark}
            className={cn(
              'flex items-center gap-2 p-2 rounded-full transition-colors',
              post.isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <Bookmark className="h-6 w-6" fill={post.isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button className="flex items-center gap-2 p-2 rounded-full text-muted-foreground hover:text-primary transition-colors">
            <Share className="h-6 w-6" />
          </button>
        </div>
      </article>

      {/* Reply Box */}
      <form onSubmit={handleSubmitComment} className="p-4 border-x bg-card">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Post your reply"
              className="flex-1 px-4 py-2 rounded-full border bg-background"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || createComment.isPending}
              className={cn(
                'p-2 rounded-full',
                newComment.trim()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {createComment.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comments */}
      <div className="rounded-b-xl border bg-card overflow-hidden">
        {commentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          comments.map((comment, index) => (
            <div
              key={comment.id}
              className={cn('p-4', index !== comments.length - 1 && 'border-b')}
            >
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{comment.author.name}</span>
                    {comment.author.isVerified && (
                      <CheckCircle className="h-4 w-4 text-primary fill-primary" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {comment.author.username} · {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={cn(
                        'flex items-center gap-1 text-sm',
                        comment.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                      )}
                    >
                      <Heart className="h-4 w-4" fill={comment.isLiked ? 'currentColor' : 'none'} />
                      {comment.likes}
                    </button>
                    <button className="text-sm text-muted-foreground hover:text-foreground">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
