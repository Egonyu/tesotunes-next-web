'use client';

import { useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { PostCard } from '@/components/edula/post-card';
import { FeedItemCard } from '@/components/edula/feed-item-card';
import { EarnFeedCard, type EarnCardData } from '@/components/contributions/earn-feed-card';
import { CreatePostComposer } from '@/components/edula/create-post-composer';
import { ModuleFilterChips } from '@/components/edula/module-filter-chips';
import { transformPost, type MixedFeedContent } from '@/types/edula';
import type { FeedModule } from '@/types/edula';
import {
  useMixedFeed,
  useModuleFeed,
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
  const [moduleFilter, setModuleFilter] = useState<FeedModule | 'all'>('all');

  // Feed data — mixed Posts + FeedItems (for-you when no module filter)
  const forYouFeed = useMixedFeed('for-you');

  // Module-filtered feed (only active when a specific module is selected)
  const moduleFeed = useModuleFeed(moduleFilter !== 'all' ? moduleFilter : '');

  // Pick the active feed source based on filter
  const activeFeed = moduleFilter === 'all' ? forYouFeed : moduleFeed;
  const { data: feedData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = activeFeed;

  // Mutations
  const createPostMutation = useCreatePost();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const bookmarkPost = useBookmarkPost();
  const unbookmarkPost = useUnbookmarkPost();
  const repost = useRepost();
  const deletePost = useDeletePost();
  const refreshFeed = useRefreshFeed();

  // Flatten pages into a single mixed content array
  const feedItems: MixedFeedContent[] = useMemo(() => {
    if (feedData?.pages) {
      return feedData.pages.flatMap((page) => page.items);
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
      await createPostMutation.mutateAsync({
        content: data.content,
        visibility: data.visibility,
        media: data.media,
      });
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

      {/* Module Filter Chips */}
      <ModuleFilterChips selected={moduleFilter} onChange={setModuleFilter} />

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

      {/* Feed — Mixed Posts + FeedItems */}
      <div className="space-y-4">
        {feedItems.map((item, idx) => {
          if (item.source === 'post') {
            const postCardData = transformPost(item.data);
            return (
              <PostCard
                key={`post-${item.data.id}-${idx}`}
                post={postCardData}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onRepost={handleRepost}
                onDelete={handleDelete}
                onNotInterested={(id) => toast.info('Preference saved')}
                isOwner={postCardData.author.id === currentUserId}
              />
            );
          }

          // "Earn" translation task card (Ateso corpus) woven into the feed.
          const raw = item.data as unknown as { feed_type?: string } & EarnCardData;
          if (raw.feed_type === 'contribution_task') {
            return <EarnFeedCard key={`earn-${item.data.uuid ?? item.data.id}-${idx}`} item={raw} />;
          }

          // FeedItem card
          return (
            <FeedItemCard
              key={`fi-${item.data.uuid ?? item.data.id}-${idx}`}
              item={item.data}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {feedItems.length === 0 && (
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
