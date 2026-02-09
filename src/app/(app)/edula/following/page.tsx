'use client';

import { useMemo } from 'react';
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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeed, useLikePost, useUnlikePost, useBookmarkPost, useUnbookmarkPost, transformPostToComponent } from '@/hooks/useFeed';

interface Post {
  id: number;
  author: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video' | 'song' | 'album';
    url: string;
    thumbnail?: string;
    title?: string;
    artist?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
}

// Mock data for fallback
const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      id: 5,
      name: 'Vinka',
      username: '@vinkaofficial',
      avatar: '/images/artists/vinka.jpg',
      isVerified: true,
    },
    content: 'Thank you Kampala! Last night was magical ✨ See you again soon!',
    media: {
      type: 'image',
      url: '/images/posts/concert.jpg',
    },
    createdAt: '2026-02-06T14:00:00',
    likes: 3456,
    comments: 234,
    reposts: 456,
    isLiked: true,
    isReposted: false,
    isBookmarked: false,
  },
  {
    id: 2,
    author: {
      id: 6,
      name: 'Fik Fameica',
      username: '@fikfameica',
      avatar: '/images/artists/fik.jpg',
      isVerified: true,
    },
    content: 'New collaboration dropping next week! 🔥 Who should I feature next?',
    createdAt: '2026-02-06T12:30:00',
    likes: 2100,
    comments: 567,
    reposts: 123,
    isLiked: false,
    isReposted: false,
    isBookmarked: true,
  },
  {
    id: 3,
    author: {
      id: 7,
      name: 'Sheebah Karungi',
      username: '@sheebah',
      avatar: '/images/artists/sheebah.jpg',
      isVerified: true,
    },
    content: 'Listen to my new single "Golden Hour" now streaming on TesoTunes! 👑',
    media: {
      type: 'song',
      url: '/songs/golden-hour',
      thumbnail: '/images/songs/golden.jpg',
      title: 'Golden Hour',
      artist: 'Sheebah Karungi',
    },
    createdAt: '2026-02-06T10:00:00',
    likes: 4567,
    comments: 389,
    reposts: 789,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
  },
];

export default function FollowingFeedPage() {
  // API hooks
  const { data: feedData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed('following');
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const bookmarkPost = useBookmarkPost();
  const unbookmarkPost = useUnbookmarkPost();
  
  // Transform API data or use mock
  const posts: Post[] = useMemo(() => {
    if (feedData?.pages) {
      return feedData.pages.flatMap(page => page.data.map(transformPostToComponent));
    }
    return mockPosts;
  }, [feedData]);
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h`;
    return `${Math.floor(diffHrs / 24)}d`;
  };
  
  const toggleLike = (postId: number, isCurrentlyLiked: boolean) => {
    if (isCurrentlyLiked) {
      unlikePost.mutate(postId);
    } else {
      likePost.mutate(postId);
    }
  };
  
  const toggleBookmark = (postId: number, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      unbookmarkPost.mutate(postId);
    } else {
      bookmarkPost.mutate(postId);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Following</h1>
        <p className="text-sm text-muted-foreground">Posts from people you follow</p>
      </div>
      
      {/* Feed */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="p-4 rounded-xl border bg-card">
              {/* Author */}
              <div className="flex items-start justify-between mb-3">
                <Link href={`/artists/${post.author.id}`} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{post.author.name}</span>
                      {post.author.isVerified && (
                        <CheckCircle className="h-4 w-4 text-primary fill-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {post.author.username} · {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </Link>
                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <Link href={`/edula/${post.id}`}>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </Link>
              
              {/* Media */}
              {post.media && (
                <div className="mt-3">
                  {post.media.type === 'image' && (
                    <div className="relative h-64 rounded-xl overflow-hidden bg-muted">
                      <Image
                        src={post.media.url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  {post.media.type === 'song' && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                      <div className="relative h-14 w-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <Image
                          src={post.media.thumbnail!}
                          alt={post.media.title!}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-6 w-6 text-white" fill="currentColor" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{post.media.title}</p>
                        <p className="text-sm text-muted-foreground">{post.media.artist}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <button 
                  onClick={() => toggleLike(post.id, post.isLiked)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950 transition-colors',
                    post.isLiked ? 'text-red-500' : 'text-muted-foreground'
                  )}
                >
                  <Heart className="h-5 w-5" fill={post.isLiked ? 'currentColor' : 'none'} />
                  <span className="text-sm">{post.likes.toLocaleString()}</span>
                </button>
                <Link
                  href={`/edula/${post.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{post.comments.toLocaleString()}</span>
                </Link>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-500 transition-colors">
                  <Repeat2 className="h-5 w-5" />
                  <span className="text-sm">{post.reposts.toLocaleString()}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => toggleBookmark(post.id, post.isBookmarked)}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      post.isBookmarked 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Bookmark className="h-5 w-5" fill={post.isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors">
                    <Share className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-muted-foreground mt-1">
            Follow some artists and fans to see their posts here
          </p>
          <Link
            href="/edula/discover"
            className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full"
          >
            Discover People
          </Link>
        </div>
      )}
      
      {/* Load More */}
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 text-center text-primary hover:underline disabled:opacity-50"
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            'Load more posts'
          )}
        </button>
      )}
    </div>
  );
}
