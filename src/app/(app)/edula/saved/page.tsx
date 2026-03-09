'use client';

import { useSession } from 'next-auth/react';
import { Bookmark, Loader2 } from 'lucide-react';
import { useSavedFeed } from '@/hooks/useFeed';
import { PostCard } from '@/components/edula/post-card';
import { FeedItemCard } from '@/components/edula/feed-item-card';
import type { MixedFeedContent } from '@/types/edula';
import { transformPost } from '@/types/edula';

export default function SavedPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : undefined;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSavedFeed();

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];

  const renderItem = (item: MixedFeedContent, index: number) => {
    if (item.source === 'post') {
      return (
        <PostCard
          key={`saved-post-${item.data.id}-${index}`}
          post={transformPost(item.data)}
          isOwner={currentUserId === item.data.author.id}
        />
      );
    }
    if (item.source === 'feed_item') {
      return (
        <FeedItemCard
          key={`saved-fi-${item.data.uuid}-${index}`}
          item={item.data}
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bookmark className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Saved Items</h1>
          <p className="text-sm text-muted-foreground">
            Your bookmarked posts and feed items
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">No saved items yet</p>
          <p className="text-sm text-muted-foreground/70">
            Bookmark posts and feed items to find them here later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allItems.map(renderItem)}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                'Load more'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
