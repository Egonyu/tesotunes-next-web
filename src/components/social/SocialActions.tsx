'use client';

import { LikeButton } from '@/components/social/LikeButton';
import { FollowButton } from '@/components/social/FollowButton';
import { CommentSection } from '@/components/social/CommentSection';
import type { LikeableType, FollowableType, CommentableType } from '@/types/social';

// ============================================================================
// SocialActions — client-side social buttons for server components
//
// Usage in a server component:
//   <SocialActions entityType="album" entityId={123} showComments />
// ============================================================================

interface SocialActionsProps {
  entityType: LikeableType & CommentableType;
  entityId: number;
  /** Show like button */
  showLike?: boolean;
  /** Like button variant */
  likeVariant?: 'icon' | 'pill' | 'inline';
  /** Show follow button (only for followable types) */
  showFollow?: boolean;
  /** Follow entity type override */
  followType?: FollowableType;
  /** Follow button variant */
  followVariant?: 'default' | 'compact' | 'pill' | 'outline';
  /** Show comment section */
  showComments?: boolean;
  /** Title for comment section */
  commentTitle?: string;
  /** Optional initial like count */
  initialLikeCount?: number;
  /** Optional initial follower count */
  initialFollowerCount?: number;
}

export function SocialActions({
  entityType,
  entityId,
  showLike = true,
  likeVariant = 'inline',
  showFollow = false,
  followType,
  followVariant = 'default',
  showComments = true,
  commentTitle,
  initialLikeCount = 0,
  initialFollowerCount = 0,
}: SocialActionsProps) {
  return (
    <div className="space-y-8">
      {/* Inline buttons */}
      {(showLike || showFollow) && (
        <div className="flex items-center gap-4">
          {showLike && (
            <LikeButton
              likeableType={entityType}
              likeableId={entityId}
              variant={likeVariant}
              showCount
              initialCount={initialLikeCount}
              iconSize={7}
            />
          )}
          {showFollow && followType && (
            <FollowButton
              followableType={followType}
              followableId={entityId}
              variant={followVariant}
              showCount
              initialCount={initialFollowerCount}
            />
          )}
        </div>
      )}

      {/* Comments */}
      {showComments && (
        <CommentSection
          commentableType={entityType}
          commentableId={entityId}
          title={commentTitle}
        />
      )}
    </div>
  );
}
