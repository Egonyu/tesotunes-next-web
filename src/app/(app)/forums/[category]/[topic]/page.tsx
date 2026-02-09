'use client';

import { use, useState, useMemo } from 'react';
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
  Loader2
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
  
  // API hooks
  const { data: topicData, isLoading: topicLoading } = useForumTopic(category, topicSlug);
  const topicId = topicData?.data?.id || 0;
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useTopicPosts(topicId);
  const createPostMutation = useCreateForumPost();
  const likePostMutation = useLikeForumPost();
  
  // Mock data for fallback
  const mockTopic: Topic = {
    id: parseInt(topicSlug) || 1,
    title: 'Best studios in Kampala?',
    category: 'General Discussion',
    categorySlug: category,
    views: 1234,
    isBookmarked: false,
    tags: ['studios', 'kampala', 'recording'],
    posts: [
      {
        id: 1,
        content: `Hey everyone! 👋

I'm looking for recommendations on professional studios in Kampala for recording vocals. My budget is around 200k per session.

**What I'm looking for:**
- Good quality microphones (preferably Neumann or similar)
- Experienced sound engineer
- Comfortable booth
- Flexible scheduling

I've heard about some studios in Kololo and Ntinda but haven't visited any yet. Would love to hear about your experiences!

Thanks in advance! 🙏`,
        author: {
          id: 1,
          name: 'MusicLover99',
          avatar: '/images/avatars/1.jpg',
          joinDate: '2024-06-15',
          postCount: 127,
          reputation: 342,
        },
        createdAt: '2026-02-01T14:30:00',
        likes: 12,
        isLiked: false,
        isOP: true,
      },
      {
        id: 2,
        content: `Check out **Fenon Studios** in Kololo! They have great equipment and the engineers are super professional. Their rate is around 150k-180k per hour depending on the time.

I recorded my EP there last year and the quality was amazing.`,
        author: {
          id: 2,
          name: 'StudioGuru',
          avatar: '/images/avatars/10.jpg',
          role: 'Verified Artist',
          joinDate: '2023-01-20',
          postCount: 456,
          reputation: 1234,
        },
        createdAt: '2026-02-01T15:45:00',
        likes: 28,
        isLiked: true,
      },
      {
        id: 3,
        content: `I second Fenon Studios! Also want to add **Swangz Avenue** to the list - though they're a bit pricier.

For budget options, check out **Home Boy Studios** in Ntinda. Quality is decent and the engineers are really patient with new artists.`,
        author: {
          id: 3,
          name: 'ProducerX',
          avatar: '/images/avatars/3.jpg',
          joinDate: '2024-02-10',
          postCount: 89,
          reputation: 156,
        },
        createdAt: '2026-02-01T17:20:00',
        likes: 15,
        isLiked: false,
        quotedPost: {
          author: 'StudioGuru',
          content: 'Check out Fenon Studios in Kololo! They have great equipment...',
        },
      },
      {
        id: 4,
        content: `@ProducerX thanks for mentioning Home Boy Studios! That's exactly in my budget range.

@StudioGuru I'll definitely check out Fenon Studios too. Do they have a WhatsApp contact I can reach them on?`,
        author: {
          id: 1,
          name: 'MusicLover99',
          avatar: '/images/avatars/1.jpg',
          joinDate: '2024-06-15',
          postCount: 128,
          reputation: 343,
        },
        createdAt: '2026-02-02T09:00:00',
        editedAt: '2026-02-02T09:15:00',
        likes: 3,
        isLiked: false,
        isOP: true,
      },
    ],
  };
  
  // Transform API data to component format
  const topic: Topic = useMemo(() => {
    if (topicData?.data) {
      const t = topicData.data;
      const postsFromData = postsData?.pages?.flatMap(p => p.data) || [];
      return {
        id: t.id,
        title: t.title,
        category: t.category?.name || 'General',
        categorySlug: category,
        views: t.views || 0,
        isBookmarked: false,
        tags: [],
        posts: postsFromData.map((p) => transformPost(p)),
      };
    }
    return mockTopic;
  }, [topicData, postsData, category, mockTopic]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !topicData?.data?.id) return;
    
    createPostMutation.mutate(
      { topicId: topicData.data.id, content: replyContent },
      {
        onSuccess: () => {
          setReplyContent('');
          refetchPosts();
        },
      }
    );
  };
  
  const handleLikePost = (postId: number, _isLiked: boolean) => {
    likePostMutation.mutate(postId);
  };
  
  if (topicLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-muted overflow-hidden">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
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
                      onClick={() => handleLikePost(post.id, post.isLiked)}
                      className={cn(
                        'flex items-center gap-1 text-sm',
                        post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Heart className="h-4 w-4" fill={post.isLiked ? 'currentColor' : 'none'} />
                      {post.likes}
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
