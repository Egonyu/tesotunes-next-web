'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Loader2, Users } from 'lucide-react';
import { PostCard } from '@/components/edula/post-card';
import { transformPost, type PostCardData } from '@/types/edula';
import {
  useFeed,
  useLikePost,
  useUnlikePost,
  useBookmarkPost,
  useUnbookmarkPost,
  useRepost,
} from '@/hooks/useFeed';
import { toast } from 'sonner';

export default function FollowingFeedPage() {
  const { data: feedData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed('following');
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const bookmarkPost = useBookmarkPost();
  const unbookmarkPost = useUnbookmarkPost();
  const repost = useRepost();

  const posts: PostCardData[] = useMemo(() => {
    if (feedData?.pages) {
      return feedData.pages.flatMap((page) => page.data.map(transformPost));
    }
    return [];
  }, [feedData]);

  const handleLike = (postId: number, isLiked: boolean) => {
    if (isLiked) unlikePost.mutate(postId);
    else likePost.mutate(postId);
  };

  const handleBookmark = (postId: number, isBookmarked: boolean) => {
    if (isBookmarked) unbookmarkPost.mutate(postId);
    else bookmarkPost.mutate(postId);
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
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Following</h1>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">Posts from people you follow</p>
      </div>

      {/* Feed */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onRepost={(id) => { repost.mutate({ postId: id }); toast.success('Reposted!'); }}
              onNotInterested={() => toast.info('Preference saved')}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-muted-foreground mt-1">
            Follow some artists and fans to see their posts here
          </p>
          <Link
            href="/edula/discover"
            className="inline-block mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
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
