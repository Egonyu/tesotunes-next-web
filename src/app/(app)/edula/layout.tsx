'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Users,
  TrendingUp,
  Compass,
  Settings,
  Megaphone,
  Rss,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhoToFollow } from '@/components/edula/who-to-follow';
import { TrendingSidebar } from '@/components/edula/trending-sidebar';
import {
  useSuggestedUsers,
  useTrending,
  useFollowUser,
  useUnfollowUser,
} from '@/hooks/useFeed';

const feedNav = [
  { href: '/edula', label: 'For You', icon: Sparkles, exact: true },
  { href: '/edula/following', label: 'Following', icon: Users },
  { href: '/edula/trending', label: 'Trending', icon: TrendingUp },
  { href: '/edula/discover', label: 'Discover', icon: Compass },
  { href: '/edula/announcements', label: 'Announcements', icon: Megaphone },
];

// Mock data for right sidebar (replaced when API is live)
const mockSuggestedUsers = [
  { id: 1, name: 'Sheebah Karungi', username: '@sheebah', avatar: '', isVerified: true, followers: 250_000, isFollowing: false },
  { id: 2, name: 'Fik Fameica', username: '@fikfameica', avatar: '', isVerified: true, followers: 180_000, isFollowing: false },
  { id: 3, name: 'Vinka', username: '@vinkaofficial', avatar: '', isVerified: true, followers: 120_000, isFollowing: false },
];

const mockTrending = [
  { tag: '#AfrobeatsRising', posts: 12_500, category: 'Music' },
  { tag: '#TesoTunesFest2026', posts: 8_200, category: 'Events' },
  { tag: '#NewMusicFriday', posts: 5_600, category: 'Music' },
];

export default function EdulaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // API data for right sidebar
  const { data: suggestedData } = useSuggestedUsers();
  const { data: trendingData } = useTrending();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const suggestedUsers = useMemo(() => {
    if (suggestedData?.data) {
      return suggestedData.data.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username.startsWith('@') ? u.username : `@${u.username}`,
        avatar: u.avatar_url,
        isVerified: u.is_verified,
        followers: u.followers_count,
        isFollowing: u.is_following,
      }));
    }
    return mockSuggestedUsers;
  }, [suggestedData]);

  const trendingTopics = useMemo(() => {
    if (trendingData?.data && Array.isArray(trendingData.data)) {
      return trendingData.data
        .filter((item) => item.type === 'hashtag' || item.type === 'topic')
        .slice(0, 5)
        .map((item) => ({
          tag: item.title.startsWith('#') ? item.title : `#${item.title}`,
          posts: item.count,
          category: item.subtitle || 'Trending',
        }));
    }
    return mockTrending;
  }, [trendingData]);

  const handleFollow = (userId: number, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowUser.mutate(userId);
    } else {
      followUser.mutate(userId);
    }
  };

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Left Sidebar Navigation ─── */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            {/* Edula Branding */}
            <div className="hidden lg:flex items-center gap-2 px-4 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Rss className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base leading-tight">Edula</h2>
                <p className="text-[10px] text-muted-foreground leading-tight">Community Hub</p>
              </div>
            </div>

            {/* Feed Nav */}
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {feedNav.map((item) => {
                const Icon = item.icon;
                const isActive = isLinkActive(item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Preferences - desktop only */}
            <div className="hidden lg:block mt-3 pt-3 border-t">
              <Link
                href="/edula/preferences"
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/edula/preferences'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Settings className="h-5 w-5" />
                Preferences
              </Link>
            </div>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 min-w-0 max-w-2xl">{children}</main>

        {/* ─── Right Sidebar ─── */}
        <aside className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <WhoToFollow
              users={suggestedUsers}
              onFollow={handleFollow}
              isPending={followUser.isPending || unfollowUser.isPending}
            />
            <TrendingSidebar topics={trendingTopics} />

            {/* Footer Links */}
            <div className="px-2 text-[11px] text-muted-foreground space-y-1">
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                <Link href="/privacy" className="hover:underline">Privacy</Link>
                <Link href="/terms" className="hover:underline">Terms</Link>
              </div>
              <p>&copy; {new Date().getFullYear()} TesoTunes</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
