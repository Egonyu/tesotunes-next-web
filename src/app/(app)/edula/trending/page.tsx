'use client';

import { useState, useMemo } from 'react';
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
  Flame,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrending, useLikePost, useUnlikePost, useBookmarkPost, useUnbookmarkPost } from '@/hooks/useFeed';

interface TrendingPost {
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
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  trendingRank?: number;
}

// Mock data for fallback
const mockPosts: TrendingPost[] = [
  {
    id: 1,
    author: {
      id: 1,
      name: 'Eddy Kenzo',
      username: '@eddykenzo',
      avatar: '/images/artists/kenzo.jpg',
      isVerified: true,
    },
    content: 'Just dropped a new track! 🔥 This one is for all my fans who\'ve been waiting. "Midnight Dreams" available now on TesoTunes!',
    media: {
      type: 'song',
      url: '/songs/midnight-dreams',
      thumbnail: '/images/songs/midnight.jpg',
      title: 'Midnight Dreams',
      artist: 'Eddy Kenzo',
    },
    createdAt: '2026-02-06T10:30:00',
    likes: 24560,
    comments: 3450,
    reposts: 5670,
    views: 125000,
    isLiked: false,
    isBookmarked: false,
    trendingRank: 1,
  },
  {
    id: 2,
    author: {
      id: 7,
      name: 'Sheebah Karungi',
      username: '@sheebah',
      avatar: '/images/artists/sheebah.jpg',
      isVerified: true,
    },
    content: 'Announcing SHEEBAH LIVE 2026! 🎤👑 Get your tickets now!\n\n📅 March 15, 2026\n📍 Lugogo Cricket Oval\n🎫 Link in bio',
    media: {
      type: 'image',
      url: '/images/posts/sheebah-live.jpg',
    },
    createdAt: '2026-02-06T08:00:00',
    likes: 18900,
    comments: 2100,
    reposts: 4500,
    views: 98000,
    isLiked: true,
    isBookmarked: true,
    trendingRank: 2,
  },
  {
    id: 3,
    author: {
      id: 10,
      name: 'TesoTunes Official',
      username: '@tesotunes',
      avatar: '/images/brand/logo.jpg',
      isVerified: true,
    },
    content: '🎉 NEW FEATURE ALERT!\n\nIntroducing Edula - your personalized music timeline! Connect with artists, share discoveries, and be part of the conversation.\n\n#TesoTunesEdula',
    createdAt: '2026-02-05T16:00:00',
    likes: 15600,
    comments: 1890,
    reposts: 7800,
    views: 85000,
    isLiked: false,
    isBookmarked: false,
    trendingRank: 3,
  },
  {
    id: 4,
    author: {
      id: 6,
      name: 'Fik Fameica',
      username: '@fikfameica',
      avatar: '/images/artists/fik.jpg',
      isVerified: true,
    },
    content: 'When the beat drops just right 🎵🔥\n\n[Video clip of crowd going wild]',
    media: {
      type: 'video',
      url: '/videos/crowd.mp4',
      thumbnail: '/images/posts/crowd-thumb.jpg',
    },
    createdAt: '2026-02-05T22:00:00',
    likes: 12400,
    comments: 980,
    reposts: 3200,
    views: 67000,
    isLiked: false,
    isBookmarked: false,
    trendingRank: 4,
  },
];

export default function TrendingFeedPage() {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  
  // API hooks
  const { data: trendingData, isLoading } = useTrending();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const bookmarkPost = useBookmarkPost();
  const unbookmarkPost = useUnbookmarkPost();
  
  // Transform API data or use mock
  // Note: useTrending returns trending hashtags/topics, not posts.
  // For trending posts, we'd need a separate endpoint. Using mock for now.
  const posts: TrendingPost[] = useMemo(() => {
    // TODO: Replace with actual trending posts API when available
    return mockPosts;
  }, []);
  
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
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h`;
    return `${Math.floor(diffHrs / 24)}d`;
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
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          <h1 className="text-xl font-bold">Trending</h1>
        </div>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {(['today', 'week', 'month'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                timeFilter === filter
                  ? 'bg-background shadow'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="p-4 rounded-xl border bg-card relative">
            {/* Trending Badge */}
            {post.trendingRank && post.trendingRank <= 3 && (
              <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                <TrendingUp className="h-3 w-3" />
                #{post.trendingRank}
              </div>
            )}
            
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
                {post.media.type === 'video' && (
                  <div className="relative h-64 rounded-xl overflow-hidden bg-muted">
                    <Image
                      src={post.media.thumbnail!}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-7 w-7 text-black ml-1" fill="currentColor" />
                      </div>
                    </div>
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
            
            {/* Views */}
            <p className="text-sm text-muted-foreground mt-3">
              {formatNumber(post.views)} views
            </p>
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <button 
                onClick={() => toggleLike(post.id, post.isLiked)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950 transition-colors',
                  post.isLiked ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                <Heart className="h-5 w-5" fill={post.isLiked ? 'currentColor' : 'none'} />
                <span className="text-sm">{formatNumber(post.likes)}</span>
              </button>
              <Link
                href={`/edula/${post.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">{formatNumber(post.comments)}</span>
              </Link>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-500 transition-colors">
                <Repeat2 className="h-5 w-5" />
                <span className="text-sm">{formatNumber(post.reposts)}</span>
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
      
      {/* Load More */}
      <button className="w-full py-3 text-center text-primary hover:underline">
        Load more trending
      </button>
    </div>
  );
}
