'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageCircle, 
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Pin,
  Lock,
  Flame,
  PlusCircle,
  Filter,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForumCategory, useForumTopics, transformTopic } from '@/hooks/useForums';

interface Topic {
  id: number;
  slug?: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  replies: number;
  views: number;
  lastReply?: {
    author: string;
    avatar: string;
    date: string;
  };
  createdAt: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isHot?: boolean;
  tags?: string[];
}

const categoryInfo: Record<string, { name: string; icon: string; color: string; description: string }> = {
  general: { name: 'General Discussion', icon: '💬', color: 'bg-blue-500', description: 'Talk about anything music-related' },
  production: { name: 'Music Production', icon: '🎛️', color: 'bg-purple-500', description: 'Discuss production techniques, DAWs, and plugins' },
  collaboration: { name: 'Collaboration', icon: '🤝', color: 'bg-green-500', description: 'Find artists, producers, and collaborators' },
  gear: { name: 'Gear & Equipment', icon: '🎸', color: 'bg-orange-500', description: 'Discuss instruments, mics, and studio gear' },
  marketing: { name: 'Marketing & Promotion', icon: '📈', color: 'bg-pink-500', description: 'Tips for promoting your music' },
  feedback: { name: 'Track Feedback', icon: '🎧', color: 'bg-teal-500', description: 'Share your tracks and get feedback' },
};

// Mock data for fallback
const mockTopics: Topic[] = [
  {
    id: 1,
    title: 'Best studios in Kampala?',
    excerpt: 'Looking for recommendations on professional studios in Kampala for recording vocals. Budget is around 200k per session.',
    author: { name: 'MusicLover99', avatar: '/images/avatars/1.jpg' },
    replies: 45,
    views: 1234,
    lastReply: { author: 'StudioGuru', avatar: '/images/avatars/10.jpg', date: '2026-02-06T10:30:00' },
    createdAt: '2026-02-01',
    isPinned: true,
    tags: ['studios', 'kampala', 'recording'],
  },
  {
    id: 2,
    title: 'How do you deal with creative block?',
    excerpt: 'I\'ve been struggling to finish any tracks lately. What are your strategies for overcoming creative block?',
    author: { name: 'BlockedArtist', avatar: '/images/avatars/2.jpg' },
    replies: 89,
    views: 2567,
    lastReply: { author: 'InspiredOne', avatar: '/images/avatars/11.jpg', date: '2026-02-06T09:15:00' },
    createdAt: '2026-01-28',
    isHot: true,
    tags: ['creativity', 'tips', 'mental-health'],
  },
  {
    id: 3,
    title: 'Official: Community Guidelines Update 2026',
    excerpt: 'We\'ve updated our community guidelines. Please read through the changes and feel free to ask questions.',
    author: { name: 'Admin', avatar: '/images/avatars/admin.jpg', role: 'Admin' },
    replies: 12,
    views: 5678,
    lastReply: { author: 'CuriousMember', avatar: '/images/avatars/12.jpg', date: '2026-02-05T22:00:00' },
    createdAt: '2026-01-15',
    isPinned: true,
    isLocked: true,
  },
];

export default function ForumCategoryPage({ 
  params 
}: { 
  params: Promise<{ category: string }> 
}) {
  const { category } = use(params);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unanswered'>('latest');
  
  // API hooks
  const { data: categoryData } = useForumCategory(category);
  const { data: topicsData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useForumTopics(category, sortBy);
  
  const info = useMemo(() => {
    if (categoryData?.data) {
      return {
        name: categoryData.data.name,
        icon: categoryData.data.icon,
        color: categoryData.data.color,
        description: categoryData.data.description,
      };
    }
    return categoryInfo[category] || { 
      name: category.charAt(0).toUpperCase() + category.slice(1), 
      icon: '💬', 
      color: 'bg-gray-500',
      description: 'Forum category' 
    };
  }, [categoryData, category]);
  
  // Transform API data or use mock
  const topics: Topic[] = useMemo(() => {
    if (topicsData?.pages) {
      return topicsData.pages.flatMap(page => 
        page.data.map(topic => {
          const t = transformTopic(topic);
          return {
            id: t.id,
            slug: t.slug,
            title: t.title,
            excerpt: t.content.substring(0, 150) + (t.content.length > 150 ? '...' : ''),
            author: { name: t.author.name, avatar: t.author.avatar },
            replies: t.replies,
            views: t.views,
            lastReply: t.lastReply,
            createdAt: t.createdAt,
            isPinned: t.isPinned,
            isLocked: t.isLocked,
            isHot: t.views > 1000,
          };
        })
      );
    }
    return mockTopics;
  }, [topicsData]);
  
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
  
  const pinnedTopics = topics.filter(t => t.isPinned);
  const regularTopics = topics.filter(t => !t.isPinned);
  
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/forums" className="text-muted-foreground hover:text-foreground">
          Forums
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{info.name}</span>
      </div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn('h-14 w-14 rounded-xl flex items-center justify-center text-3xl', info.color)}>
            {info.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{info.name}</h1>
            <p className="text-muted-foreground">{info.description}</p>
          </div>
        </div>
        <Link
          href={`/forums/${category}/new`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 w-fit"
        >
          <PlusCircle className="h-4 w-4" />
          New Topic
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4 border-b pb-4">
        <button
          onClick={() => setSortBy('latest')}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            sortBy === 'latest' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          Latest
        </button>
        <button
          onClick={() => setSortBy('popular')}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            sortBy === 'popular' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          Popular
        </button>
        <button
          onClick={() => setSortBy('unanswered')}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            sortBy === 'unanswered' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          Unanswered
        </button>
      </div>
      
      {/* Pinned Topics */}
      {pinnedTopics.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Pin className="h-4 w-4" />
            Pinned
          </h2>
          <div className="space-y-2">
            {pinnedTopics.map((topic) => (
              <TopicRow key={topic.id} topic={topic} category={category} formatTimeAgo={formatTimeAgo} />
            ))}
          </div>
        </div>
      )}
      
      {/* Regular Topics */}
      <div className="space-y-2">
        {pinnedTopics.length > 0 && (
          <h2 className="text-sm font-medium text-muted-foreground">All Topics</h2>
        )}
        <div className="space-y-2">
          {regularTopics.map((topic) => (
            <TopicRow key={topic.id} topic={topic} category={category} formatTimeAgo={formatTimeAgo} />
          ))}
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <button className="px-3 py-2 rounded-lg border hover:bg-muted disabled:opacity-50" disabled>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">1</button>
        <button className="px-4 py-2 rounded-lg hover:bg-muted">2</button>
        <button className="px-4 py-2 rounded-lg hover:bg-muted">3</button>
        <span className="px-2">...</span>
        <button className="px-4 py-2 rounded-lg hover:bg-muted">12</button>
        <button className="px-3 py-2 rounded-lg border hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function TopicRow({ 
  topic, 
  category, 
  formatTimeAgo 
}: { 
  topic: Topic; 
  category: string; 
  formatTimeAgo: (date: string) => string;
}) {
  return (
    <Link
      href={`/forums/${category}/${topic.id}`}
      className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
    >
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
        <div className="flex items-center gap-2 flex-wrap">
          {topic.isPinned && <Pin className="h-4 w-4 text-primary" />}
          {topic.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          {topic.isHot && <Flame className="h-4 w-4 text-orange-500" />}
          <h3 className="font-medium truncate">{topic.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{topic.excerpt}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{topic.author.name}</span>
          {topic.author.role && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px]">
              {topic.author.role}
            </span>
          )}
          {topic.tags && topic.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-muted rounded">#{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
        <div className="text-center">
          <p className="font-semibold text-foreground flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {topic.replies}
          </p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {topic.views.toLocaleString()}
          </p>
        </div>
      </div>
      
      {topic.lastReply && (
        <div className="hidden lg:flex items-center gap-2 w-48">
          <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
            <Image
              src={topic.lastReply.avatar}
              alt={topic.lastReply.author}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm truncate">{topic.lastReply.author}</p>
            <p className="text-xs text-muted-foreground">{formatTimeAgo(topic.lastReply.date)}</p>
          </div>
        </div>
      )}
    </Link>
  );
}
