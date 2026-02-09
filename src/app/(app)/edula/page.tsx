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
  Music,
  Image as ImageIcon,
  Video,
  CheckCircle,
  Bookmark,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useFeed, 
  useCreatePost, 
  useLikePost, 
  useUnlikePost, 
  useBookmarkPost, 
  useUnbookmarkPost,
  transformPostToComponent,
  type Post as APIPost
} from '@/hooks/useFeed';
import { toast } from 'sonner';

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

// Mock data fallback
const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      id: 1,
      name: 'Eddy Kenzo',
      username: '@eddykenzo',
      avatar: '/images/artists/kenzo.jpg',
      isVerified: true,
    },
    content: 'Just dropped a new track! 🔥 This one is for all my fans who\'ve been waiting. "Midnight Dreams" available now on TesoTunes. Let me know what you think! 🎵',
    media: {
      type: 'song',
      url: '/songs/midnight-dreams',
      thumbnail: '/images/songs/midnight.jpg',
      title: 'Midnight Dreams',
      artist: 'Eddy Kenzo',
    },
    createdAt: '2026-02-06T10:30:00',
    likes: 2456,
    comments: 345,
    reposts: 567,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
  },
  {
    id: 2,
    author: {
      id: 2,
      name: 'Sarah Nakato',
      username: '@sarahnakato',
      avatar: '/images/artists/sarah.jpg',
      isVerified: true,
    },
    content: 'Studio vibes today 🎙️ Working on something special for y\'all. Can\'t wait to share!',
    media: {
      type: 'image',
      url: '/images/posts/studio.jpg',
    },
    createdAt: '2026-02-06T09:15:00',
    likes: 1234,
    comments: 89,
    reposts: 234,
    isLiked: true,
    isReposted: false,
    isBookmarked: true,
  },
  {
    id: 3,
    author: {
      id: 3,
      name: 'DJ Empress',
      username: '@djempress',
      avatar: '/images/artists/empress.jpg',
      isVerified: true,
    },
    content: 'New podcast episode out now! We discuss the evolution of Afrobeats and what\'s next for the genre. Link in bio 🎧\n\n#TheBeatLab #Afrobeats',
    createdAt: '2026-02-06T08:00:00',
    likes: 567,
    comments: 45,
    reposts: 123,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
  },
];

export default function EdulaPage() {
  const [newPost, setNewPost] = useState('');
  
  // Fetch feed from API
  const { 
    data: feedData, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useFeed('for-you');
  
  // Mutations
  const createPostMutation = useCreatePost();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const bookmarkPostMutation = useBookmarkPost();
  const unbookmarkPostMutation = useUnbookmarkPost();
  
  // Transform API data or use mock fallback
  const posts: Post[] = useMemo(() => {
    if (feedData?.pages) {
      return feedData.pages.flatMap(page => 
        page.data.map(transformPostToComponent)
      );
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
      unlikePostMutation.mutate(postId);
    } else {
      likePostMutation.mutate(postId);
    }
  };
  
  const toggleBookmark = (postId: number, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      unbookmarkPostMutation.mutate(postId);
    } else {
      bookmarkPostMutation.mutate(postId);
    }
  };
  
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    
    try {
      await createPostMutation.mutateAsync({ content: newPost });
      setNewPost('');
      toast.success('Post created!');
    } catch {
      toast.error('Failed to create post');
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
      {/* Create Post */}
      <div className="p-4 rounded-xl border bg-card">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's happening in music?"
              rows={3}
              className="w-full bg-transparent resize-none outline-none"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary">
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary">
                  <Music className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim() || createPostMutation.isPending}
                className={cn(
                  'px-4 py-2 rounded-full font-medium text-sm',
                  newPost.trim() && !createPostMutation.isPending
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {createPostMutation.isPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feed */}
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
      
      {/* Load More */}
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 text-center text-primary hover:underline disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more posts'}
        </button>
      )}
    </div>
  );
}
