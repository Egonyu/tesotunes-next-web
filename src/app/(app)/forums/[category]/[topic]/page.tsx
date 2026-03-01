'use client';

import { use, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Reply,
  MoreHorizontal,
  Flag,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Quote,
  Edit,
  Trash,
  Clock,
  MessageCircle,
  Eye,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForumTopic, useTopicPosts, useCreateForumPost, useLikeForumPost, transformPost } from '@/hooks/useForums';

interface Post {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
    username?: string;
    avatar: string;
    isVerified?: boolean;
    role?: string;
    joinDate?: string;
    joinedAt?: string;
    postCount?: number;
    reputation?: number;
  };
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  likes: number;
  isLiked: boolean;
  isSolution?: boolean;
  isOP?: boolean;
  quotedPost?: {
    author: string;
    content: string;
  };
}

interface Topic {
  id: number;
  title: string;
  category: string;
  categorySlug: string;
  views: number;
  isBookmarked: boolean;
  tags: string[];
  posts: Post[];
}

export default function TopicDetailPage({
  params
}: {
  params: Promise<{ category: string; topic: string }>
}) {
  const { category, topic: topicSlug } = use(params);
  const [replyContent, setReplyContent] = useState('');
  // Local like states for optimistic UI even when API is unavailable
  const [localLikes, setLocalLikes] = useState<Record<number, boolean>>({});

  // API hooks
  const { data: topicData, isLoading: topicLoading, error: topicError } = useForumTopic(category, topicSlug);
  const topicId = topicData?.data?.id || 0;
  const { data: postsData, isLoading: postsLoading } = useTopicPosts(topicId);
  const createPostMutation = useCreateForumPost();
  const likePostMutation = useLikeForumPost();

  // Transform API data to component format
  const topic: Topic | null = useMemo(() => {
    if (topicData?.data) {
      const t = topicData.data;
      // Posts from separate endpoint, or from embedded replies in topic response
      const postsFromData = postsData?.pages?.flatMap(p => p.data) || [];
      const postsFromReplies = (t.replies || []).map((p) => transformPost(p));
      const allPosts = postsFromData.length > 0
        ? postsFromData.map((p) => transformPost(p))
        : postsFromReplies;
      return {
        id: t.id,
        title: t.title,
        category: t.category?.name || 'General',
        categorySlug: category,
        views: t.views || 0,
        isBookmarked: false,
        tags: [],
        posts: allPosts,
      };
    }
    return null;
  }, [topicData, postsData, category]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitReply = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    if (!topicData?.data?.id) {
      // Optimistic local-only reply when API unavailable
      setReplyContent('');
      return;
    }

    createPostMutation.mutate(
      { topicId: topicData.data.id, content: replyContent },
      {
        onSuccess: () => {
          setReplyContent('');
        },
      }
    );
  }, [replyContent, topicData, createPostMutation]);

  const handleLikePost = useCallback((postId: number, isLiked: boolean) => {
    // Toggle local like state regardless of API availability
    setLocalLikes(prev => ({ ...prev, [postId]: !isLiked }));
    likePostMutation.mutate(postId);
  }, [likePostMutation]);

  if (topicLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="container py-8 max-w-3xl">
        <Link href="/forums" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to Forums
        </Link>
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Topic not found</p>
          <p className="text-muted-foreground">This topic may have been removed or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/forums" className="text-muted-foreground hover:text-foreground">
          Forums
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Link href={`/forums/${category}`} className="text-muted-foreground hover:text-foreground">
          {topic.category}
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium truncate max-w-xs">{topic.title}</span>
      </div>

      {/* Topic Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{topic.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {topic.posts.length} replies
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {topic.views.toLocaleString()} views
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            {topic.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-muted rounded-lg">
            <Bookmark className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {topic.posts.map((post, index) => (
          <div
            key={post.id}
            id={`post-${post.id}`}
            className={cn(
              'rounded-xl border bg-card',
              post.isOP && 'ring-2 ring-primary/20'
            )}
          >
            <div className="flex flex-col md:flex-row">
              {/* Author Sidebar */}
              <div className="p-4 md:w-48 md:border-r bg-muted/30 rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
                <div className="flex md:flex-col items-center md:items-start gap-3">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                    {post.author.avatar?.startsWith('http') ? (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">
                        {post.author.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{post.author.name}</p>
                    {post.author.role && (
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded mt-1">
                        {post.author.role}
                      </span>
                    )}
                    {post.isOP && (
                      <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded mt-1 ml-1">
                        OP
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden md:block mt-4 text-xs text-muted-foreground space-y-1">
                  <p>Posts: {post.author.postCount}</p>
                  <p>Reputation: {post.author.reputation}</p>
                  <p>Joined: {post.author.joinDate ? new Date(post.author.joinDate).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'N/A'}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(post.createdAt)}</span>
                    {post.editedAt && (
                      <span className="italic">(edited {formatDate(post.editedAt)})</span>
                    )}
                  </div>
                  <span>#{index + 1}</span>
                </div>

                {/* Quoted Post */}
                {post.quotedPost && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/50 border-l-4 border-muted-foreground/30">
                    <p className="text-xs text-muted-foreground mb-1">
                      <Quote className="h-3 w-3 inline mr-1" />
                      {post.quotedPost.author} said:
                    </p>
                    <p className="text-sm text-muted-foreground italic line-clamp-2">
                      {post.quotedPost.content}
                    </p>
                  </div>
                )}

                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                  {post.content}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post.id, localLikes[post.id] ?? post.isLiked)}
                      className={cn(
                        'flex items-center gap-1 text-sm',
                        (localLikes[post.id] ?? post.isLiked) ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Heart className="h-4 w-4" fill={(localLikes[post.id] ?? post.isLiked) ? 'currentColor' : 'none'} />
                      {post.likes + ((localLikes[post.id] !== undefined && localLikes[post.id] !== post.isLiked) ? (localLikes[post.id] ? 1 : -1) : 0)}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <Reply className="h-4 w-4" />
                      Reply
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <Quote className="h-4 w-4" />
                      Quote
                    </button>
                  </div>
                  <button className="p-1 hover:bg-muted rounded">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Reply to this topic</h3>
        <form onSubmit={handleSubmitReply}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={6}
            placeholder="Write your reply... (Markdown supported)"
            className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
          />
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Supports **bold**, *italic*, `code`, and [links](url)
            </p>
            <button
              type="submit"
              disabled={createPostMutation.isPending || !replyContent.trim()}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-colors',
                createPostMutation.isPending || !replyContent.trim()
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {createPostMutation.isPending ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button className="px-3 py-2 rounded-lg border hover:bg-muted disabled:opacity-50" disabled>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">1</button>
        <button className="px-3 py-2 rounded-lg border hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
