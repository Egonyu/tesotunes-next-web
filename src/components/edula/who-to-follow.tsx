'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from './post-card';

interface WhoToFollowUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  followers?: number;
  bio?: string;
  isFollowing: boolean;
}

interface WhoToFollowProps {
  users: WhoToFollowUser[];
  onFollow?: (userId: number, isFollowing: boolean) => void;
  isPending?: boolean;
  showMore?: boolean;
}

export function WhoToFollow({ users, onFollow, isPending, showMore = true }: WhoToFollowProps) {
  if (users.length === 0) return null;

  return (
    <div className="p-4 rounded-xl border bg-card">
      <h3 className="font-semibold mb-4">Who to Follow</h3>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between gap-2">
            <Link href={`/artists/${user.id}`} className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  {user.isVerified && (
                    <CheckCircle className="h-3.5 w-3.5 text-primary fill-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user.username}
                  {user.followers !== undefined && ` · ${formatNumber(user.followers)} followers`}
                </p>
              </div>
            </Link>
            <button
              onClick={() => onFollow?.(user.id, user.isFollowing)}
              disabled={isPending}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex-shrink-0',
                user.isFollowing
                  ? 'border hover:bg-muted'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : user.isFollowing ? (
                'Following'
              ) : (
                <>
                  <UserPlus className="h-3 w-3" />
                  Follow
                </>
              )}
            </button>
          </div>
        ))}
      </div>
      {showMore && (
        <Link href="/edula/discover" className="block w-full mt-4 text-sm text-primary hover:underline text-center">
          Show more
        </Link>
      )}
    </div>
  );
}
