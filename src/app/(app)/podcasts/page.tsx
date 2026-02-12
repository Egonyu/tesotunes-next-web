'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, 
  Clock,
  Headphones,
  TrendingUp,
  Search,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/api';

interface Podcast {
  id: number;
  uuid: string;
  title: string;
  description: string;
  cover_url: string;
  host_name: string;
  category: {
    id: number;
    name: string;
  };
  episode_count: number;
  subscriber_count: number;
  total_listen_count: number;
  latest_episode?: {
    title: string;
    duration_seconds: number;
    published_at: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  podcast_count: number;
}

interface PodcastsResponse {
  data: Podcast[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface CategoriesResponse {
  data: Category[];
}

export default function PodcastsPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['podcast-categories'],
    queryFn: () => apiGet<CategoriesResponse>('/podcast-categories'),
  });
  
  // Fetch trending podcasts for featured section
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['podcasts-trending'],
    queryFn: () => apiGet<PodcastsResponse>('/podcasts-trending?limit=4'),
  });
  
  // Fetch all podcasts with filters
  const { data: podcastsData, isLoading } = useQuery({
    queryKey: ['podcasts', { category: selectedCategory, search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', String(selectedCategory));
      if (searchQuery) params.append('search', searchQuery);
      params.append('per_page', '20');
      return apiGet<PodcastsResponse>(`/api/podcasts?${params.toString()}`);
    },
  });
  
  const categories = categoriesData?.data || [];
  const featuredPodcasts = trendingData?.data?.slice(0, 2) || [];
  const allPodcasts = podcastsData?.data || [];
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Podcasts</h1>
        <p className="text-muted-foreground">
          Discover music podcasts from industry experts and artists
        </p>
      </div>
      
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search podcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Featured Podcasts */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Featured</h2>
        </div>
        {trendingLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {featuredPodcasts.map((podcast) => (
              <Link
                key={podcast.id}
                href={`/podcasts/${podcast.uuid}`}
                className="flex gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="relative h-32 w-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <Image
                    src={podcast.cover_url || '/images/podcast-placeholder.jpg'}
                    alt={podcast.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-primary font-medium">{podcast.category?.name}</span>
                  <h3 className="font-semibold mt-1">{podcast.title}</h3>
                  <p className="text-sm text-muted-foreground">by {podcast.host_name}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{podcast.description}</p>
                  
                  {podcast.latest_episode && (
                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Play className="h-3 w-3" />
                        Latest: {podcast.latest_episode.title}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(podcast.latest_episode.duration_seconds)}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      {/* All Podcasts */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Podcasts</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allPodcasts.map((podcast) => (
              <Link
                key={podcast.id}
                href={`/podcasts/${podcast.uuid}`}
                className="group p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
                  <Image
                    src={podcast.cover_url || '/images/podcast-placeholder.jpg'}
                    alt={podcast.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-6 w-6 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                <span className="text-xs text-primary font-medium">{podcast.category?.name}</span>
                <h3 className="font-semibold mt-1 truncate">{podcast.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{podcast.host_name}</p>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{podcast.episode_count} episodes</span>
                  <span className="flex items-center gap-1">
                    <Headphones className="h-3 w-3" />
                    {(podcast.subscriber_count || 0).toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!isLoading && allPodcasts.length === 0 && (
          <div className="text-center py-12">
            <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No podcasts found</p>
          </div>
        )}
      </section>
    </div>
  );
}
