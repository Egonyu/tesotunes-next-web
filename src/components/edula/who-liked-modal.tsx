'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePostLikers } from '@/hooks/useFeed';
import type { PostLiker } from '@/hooks/useFeed';

interface WhoLikedModalProps {
  postId: number;
  onClose: () => void;
}

export function WhoLikedModal({ postId, onClose }: WhoLikedModalProps) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePostLikers(postId);
  const backdropRef = useRef<HTMLDivElement>(null);

  const allLikers: PostLiker[] =
    data?.pages.flatMap((p) => p.data ?? []) ?? [];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose],
  );

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-lg">Liked by</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allLikers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No likes yet
            </p>
          ) : (
            <ul className="space-y-3">
              {allLikers.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                    onClick={onClose}
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm font-medium text-muted-foreground">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm flex items-center gap-1 truncate">
                        {user.name}
                        {user.is_verified && (
                          <CheckCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}

              {hasNextPage && (
                <li className="pt-2">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full py-2 text-sm text-primary hover:underline"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      'Load more'
                    )}
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
