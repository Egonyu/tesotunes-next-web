'use client';

import { useMemo } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { PostCard } from '@/components/edula/post-card';
import { CreatePostComposer } from '@/components/edula/create-post-composer';
import { transformPost, type PostCardData } from '@/types/edula';
import {
  useFeed,
  useCreatePost,
  useLikePost,
  useUnlikePost,
  useBookmarkPost,
  useUnbookmarkPost,
  useRepost,
  useDeletePost,
  useRefreshFeed,
} from '@/hooks/useFeed';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function EdulaPage() {
  const { data: session } = useSession();

  // Feed data
  const {
    data: feedData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed('for-you');

  // Mutations
  const createPostMutation = useCreatePost();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const bookmarkPost = useBookmarkPost();
  const unbookmarkPost = useUnbookmarkPost();
  const repost = useRepost();
  const deletePost = useDeletePost();
  const refreshFeed = useRefreshFeed();

  // Transform API data
  const posts: PostCardData[] = useMemo(() => {
    if (feedData?.pages) {
      return feedData.pages.flatMap((page) => page.data.map(transformPost));
    }
    return [];
  }, [feedData]);

  const currentUserId = (session?.user as { id?: number } | undefined)?.id;
  const userAvatar = (session?.user as { avatar_url?: string } | undefined)?.avatar_url;
  const userName = session?.user?.name || '?';

  const handleCreatePost = async (data: {
    content: string;
    visibility: string;
    media?: File[];
  }) => {
    try {
      await createPostMutation.mutateAsync({ content: data.content });
      toast.success('Post created!');
    } catch {
      toast.error('Failed to create post');
    }
  };

  const handleLike = (postId: number, isLiked: boolean) => {
    if (isLiked) {
      unlikePost.mutate(postId);
    } else {
      likePost.mutate(postId);
    }
  };

  const handleBookmark = (postId: number, isBookmarked: boolean) => {
    if (isBookmarked) {
      unbookmarkPost.mutate(postId);
    } else {
      bookmarkPost.mutate(postId);
    }
  };

  const handleRepost = (postId: number) => {
    repost.mutate({ postId });
    toast.success('Reposted!');
  };

  const handleDelete = (postId: number) => {
    deletePost.mutate(postId, {
      onSuccess: () => toast.success('Post deleted'),
      onError: () => toast.error('Failed to delete post'),
    });
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
      {/* Create Post Composer */}
      {session?.user && (
        <CreatePostComposer
          onSubmit={handleCreatePost}
          isSubmitting={createPostMutation.isPending}
          avatarUrl={userAvatar}
          avatarFallback={userName.charAt(0)}
        />
      )}

      {/* Refresh Banner */}
      {refreshFeed.isSuccess && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-2 text-sm text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          New posts available — click to see
        </button>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onRepost={handleRepost}
            onDelete={handleDelete}
            onNotInterested={(id) => toast.info('Preference saved')}
            isOwner={post.author.id === currentUserId}
          />
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-medium">Your feed is empty</p>
          <p className="text-sm text-muted-foreground mt-1">
            Follow artists and users to see their posts here
          </p>
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 text-center text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isFetchingNextPage ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : (
            'Load more posts'
          )}
        </button>
      )}
    </div>
  );
}
