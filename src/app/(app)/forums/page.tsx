'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageCircle, 
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  PlusCircle,
  Search,
  Pin,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForumCategories, useTrendingTopics, transformCategory, transformTopic } from '@/hooks/useForums';

interface ForumCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  topicCount: number;
  postCount: number;
  lastPost?: {
    topic: string;
    author: string;
    avatar: string;
    date: string;
  };
}

interface TrendingTopic {
  id: number;
  slug?: string;
  title: string;
  category: string;
  categorySlug: string;
  replies: number;
  views: number;
  author: {
    name: string;
    avatar: string;
  };
}

// Mock data for fallback
const mockCategories: ForumCategory[] = [
  {
    id: 1,
    slug: 'general',
    name: 'General Discussion',
    description: 'Talk about anything music-related',
    icon: '💬',
    color: 'bg-blue-500',
    topicCount: 1245,
    postCount: 15678,
    lastPost: { topic: 'Best studios in Kampala?', author: 'MusicLover99', avatar: '/images/avatars/1.jpg', date: '2026-02-06T10:30:00' },
  },
  {
    id: 2,
    slug: 'production',
    name: 'Music Production',
    description: 'Discuss production techniques, DAWs, and plugins',
    icon: '🎛️',
    color: 'bg-purple-500',
    topicCount: 892,
    postCount: 12340,
    lastPost: { topic: 'FL Studio vs Ableton for Afrobeats', author: 'BeatMaker', avatar: '/images/avatars/2.jpg', date: '2026-02-06T09:15:00' },
  },
  {
    id: 3,
    slug: 'collaboration',
    name: 'Collaboration',
    description: 'Find artists, producers, and collaborators',
    icon: '🤝',
    color: 'bg-green-500',
    topicCount: 567,
    postCount: 4532,
    lastPost: { topic: 'Looking for a vocalist for dancehall track', author: 'ProducerX', avatar: '/images/avatars/3.jpg', date: '2026-02-06T08:45:00' },
  },
  {
    id: 4,
    slug: 'gear',
    name: 'Gear & Equipment',
    description: 'Discuss instruments, mics, and studio gear',
    icon: '🎸',
    color: 'bg-orange-500',
    topicCount: 423,
    postCount: 5678,
    lastPost: { topic: 'Affordable condenser mics under $200', author: 'GearHead', avatar: '/images/avatars/4.jpg', date: '2026-02-05T22:30:00' },
  },
  {
    id: 5,
    slug: 'marketing',
    name: 'Marketing & Promotion',
    description: 'Tips for promoting your music and building an audience',
    icon: '📈',
    color: 'bg-pink-500',
    topicCount: 334,
    postCount: 4123,
    lastPost: { topic: 'TikTok strategies that work in 2026', author: 'MarketingPro', avatar: '/images/avatars/5.jpg', date: '2026-02-05T20:15:00' },
  },
  {
    id: 6,
    slug: 'feedback',
    name: 'Track Feedback',
    description: 'Share your tracks and get constructive feedback',
    icon: '🎧',
    color: 'bg-teal-500',
    topicCount: 678,
    postCount: 8901,
    lastPost: { topic: 'New single - need mixing feedback', author: 'NewArtist', avatar: '/images/avatars/6.jpg', date: '2026-02-05T18:00:00' },
  },
];

const mockTrendingTopics: TrendingTopic[] = [
  { id: 1, title: 'How to get your music on Spotify playlists', category: 'Marketing & Promotion', categorySlug: 'marketing', replies: 234, views: 5678, author: { name: 'PlaylistGuru', avatar: '/images/avatars/7.jpg' } },
  { id: 2, title: 'Best free VST plugins for 2026', category: 'Music Production', categorySlug: 'production', replies: 189, views: 4532, author: { name: 'PluginMaster', avatar: '/images/avatars/8.jpg' } },
  { id: 3, title: 'Copyright basics every artist should know', category: 'General Discussion', categorySlug: 'general', replies: 156, views: 3890, author: { name: 'LegalEagle', avatar: '/images/avatars/9.jpg' } },
];

export default function ForumsPage() {
  // API hooks
  const { data: categoriesData, isLoading: categoriesLoading } = useForumCategories();
  const { data: trendingData, isLoading: trendingLoading } = useTrendingTopics(5);
  
  // Transform API data or use mock
  const categories: ForumCategory[] = useMemo(() => {
    if (categoriesData?.data) {
      return categoriesData.data.map(transformCategory);
    }
    return mockCategories;
  }, [categoriesData]);
  
  const trendingTopics: TrendingTopic[] = useMemo(() => {
    if (trendingData?.data) {
      return trendingData.data.map(topic => {
        const t = transformTopic(topic);
        return {
          id: t.id,
          slug: t.slug,
          title: t.title,
          category: t.category,
          categorySlug: t.categorySlug,
          replies: t.replies,
          views: t.views,
          author: {
            name: t.author.name,
            avatar: t.author.avatar,
          },
        };
      });
    }
    return mockTrendingTopics;
  }, [trendingData]);
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  if (categoriesLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Forums</h1>
          <p className="text-muted-foreground">
            Connect, learn, and grow with fellow artists
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search forums..."
              className="pl-10 pr-4 py-2 rounded-lg border bg-background w-64"
            />
          </div>
          <Link
            href="/forums/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            New Topic
          </Link>
        </div>
      </div>
      
      {/* Trending Topics */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Trending Discussions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {trendingTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/forums/${topic.categorySlug}/${topic.id}`}
              className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                  <Image
                    src={topic.author.avatar}
                    alt={topic.author.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2">{topic.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{topic.category}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {topic.replies}
                    </span>
                    <span>{topic.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Categories */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="space-y-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/forums/${category.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center text-2xl', category.color)}>
                {category.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              
              <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                <div className="text-center">
                  <p className="font-semibold text-foreground">{category.topicCount.toLocaleString()}</p>
                  <p className="text-xs">Topics</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{category.postCount.toLocaleString()}</p>
                  <p className="text-xs">Posts</p>
                </div>
              </div>
              
              {category.lastPost && (
                <div className="hidden lg:block w-64">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      <Image
                        src={category.lastPost.avatar}
                        alt={category.lastPost.author}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{category.lastPost.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.lastPost.author} • {formatTimeAgo(category.lastPost.date)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>
      
      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="p-4 rounded-xl border bg-card text-center">
          <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">45,678</p>
          <p className="text-sm text-muted-foreground">Total Posts</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">12,345</p>
          <p className="text-sm text-muted-foreground">Members</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">4,139</p>
          <p className="text-sm text-muted-foreground">Topics</p>
        </div>
        <div className="p-4 rounded-xl border bg-card text-center">
          <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">234</p>
          <p className="text-sm text-muted-foreground">Online Now</p>
        </div>
      </section>
    </div>
  );
}
