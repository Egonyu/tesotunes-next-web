'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Compass,
  Music,
  Mic2,
  Radio,
  TrendingUp,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhoToFollow } from '@/components/edula/who-to-follow';
import { useTrending, useSuggestedUsers, useFollowUser, useUnfollowUser } from '@/hooks/useFeed';
import type { TrendingItem } from '@/types/edula';

interface TrendingTopic {
  tag: string;
  posts: number;
  category: string;
}

// Mock suggested users for fallback
const mockSuggestedUsers = [
  { id: 1, name: 'Eddy Kenzo', username: '@eddykenzo', avatar: '/images/artists/kenzo.jpg', isVerified: true, bio: 'Award-winning Ugandan artist', followers: 850000, isFollowing: false },
  { id: 2, name: 'Sheebah Karungi', username: '@sheebah', avatar: '/images/artists/sheebah.jpg', isVerified: true, bio: 'Queen of Ugandan Music', followers: 720000, isFollowing: false },
  { id: 3, name: 'Fik Fameica', username: '@fikfameica', avatar: '/images/artists/fik.jpg', isVerified: true, bio: 'Fresh Boy | East Africa\'s Finest', followers: 650000, isFollowing: true },
  { id: 4, name: 'Vinka', username: '@vinkaofficial', avatar: '/images/artists/vinka.jpg', isVerified: true, bio: 'Singer | Dancer | Performer', followers: 580000, isFollowing: false },
];

const mockTrendingTopics: TrendingTopic[] = [
  { tag: '#AfrobeatsRising', posts: 45600, category: 'Music' },
  { tag: '#TesoTunesFest2026', posts: 32100, category: 'Events' },
  { tag: '#NewMusicFriday', posts: 28900, category: 'Music' },
  { tag: '#UgandanMusic', posts: 21500, category: 'Culture' },
  { tag: '#MusicProducers', posts: 18700, category: 'Industry' },
  { tag: '#LivePerformance', posts: 15400, category: 'Events' },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // API hooks
  const { data: trendingData } = useTrending();
  const { data: suggestedData } = useSuggestedUsers();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const categories = [
    { id: 'artists', label: 'Artists', icon: Mic2 },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'podcasts', label: 'Podcasts', icon: Radio },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  const suggestedUsers = useMemo(() => {
    if (suggestedData?.data) {
      return suggestedData.data.map((user: { id: number; name: string; username: string; avatar_url: string; is_verified: boolean; bio: string; followers_count: number; is_following: boolean }) => ({
        id: user.id,
        name: user.name,
        username: `@${user.username}`,
        avatar: user.avatar_url,
        isVerified: user.is_verified,
        bio: user.bio,
        followers: user.followers_count,
        isFollowing: user.is_following,
      }));
    }
    return mockSuggestedUsers;
  }, [suggestedData]);

  const trendingTopics: TrendingTopic[] = useMemo(() => {
    if (trendingData?.data && Array.isArray(trendingData.data)) {
      return trendingData.data
        .filter((item: TrendingItem) => item.type === 'hashtag' || item.type === 'topic')
        .map((item: TrendingItem) => ({
          tag: item.title.startsWith('#') ? item.title : `#${item.title}`,
          posts: item.count,
          category: item.subtitle || 'Trending',
        }));
    }
    return mockTrendingTopics;
  }, [trendingData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Compass className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Discover</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people, topics, and more..."
          className="w-full pl-12 pr-4 py-3 rounded-full border bg-background"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80',
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Suggested People — reusing shared WhoToFollow component */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Suggested for You</h2>
        <WhoToFollow
          users={suggestedUsers}
          onFollow={(userId, isFollowing) => {
            if (isFollowing) unfollowUser.mutate(userId);
            else followUser.mutate(userId);
          }}
          isPending={followUser.isPending || unfollowUser.isPending}
          showMore={false}
        />
      </section>

      {/* Trending Topics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Trending Topics</h2>
        <div className="grid gap-3">
          {trendingTopics.map((topic, index) => (
            <Link
              key={topic.tag}
              href={`/search?q=${encodeURIComponent(topic.tag)}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <span className="font-medium">{topic.tag.replace('#', '')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(topic.posts)} posts · {topic.category}
                  </p>
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Communities */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Popular Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Afrobeats Lovers', members: 25600, color: 'bg-orange-500' },
            { name: 'Producers Hub', members: 18200, color: 'bg-purple-500' },
            { name: 'Gospel Music', members: 15800, color: 'bg-blue-500' },
            { name: 'Hip Hop UG', members: 12400, color: 'bg-green-500' },
          ].map((community) => (
            <Link
              key={community.name}
              href={`/forums/${community.name.toLowerCase().replace(' ', '-')}`}
              className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={cn('h-12 w-12 rounded-xl', community.color)} />
              <div>
                <p className="font-semibold">{community.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(community.members)} members
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
