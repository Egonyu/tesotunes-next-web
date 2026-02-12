'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Play, 
  Pause,
  Clock,
  Share2,
  Bell,
  BellOff,
  ChevronRight,
  ExternalLink,
  Twitter,
  Instagram,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

interface Episode {
  id: number;
  uuid: string;
  episode_number: number;
  title: string;
  description: string;
  duration_seconds: number;
  published_at: string;
  listen_count: number;
}

interface Podcast {
  id: number;
  uuid: string;
  title: string;
  description: string;
  long_description?: string;
  cover_url: string;
  host_name: string;
  host_bio?: string;
  host_avatar_url?: string;
  category: {
    id: number;
    name: string;
  };
  episode_count: number;
  subscriber_count: number;
  total_listen_count: number;
  frequency?: string;
  website_url?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  is_subscribed?: boolean;
}

interface PodcastResponse {
  data: Podcast;
}

interface EpisodesResponse {
  data: Episode[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function PodcastDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const [playingEpisodeId, setPlayingEpisodeId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch podcast details
  const { data: podcastData, isLoading } = useQuery({
    queryKey: ['podcast', id],
    queryFn: () => apiGet<PodcastResponse>(`/api/podcasts/${id}`),
  });
  
  // Fetch episodes
  const { data: episodesData, isLoading: episodesLoading } = useQuery({
    queryKey: ['podcast-episodes', id],
    queryFn: () => apiGet<EpisodesResponse>(`/api/podcasts/${id}/episodes`),
  });
  
  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: () => apiPost(`/api/podcasts/${id}/subscribe`, {}),
    onSuccess: () => {
      toast.success('Subscribed to podcast');
      queryClient.invalidateQueries({ queryKey: ['podcast', id] });
    },
    onError: () => toast.error('Failed to subscribe'),
  });
  
  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: () => apiDelete(`/api/podcasts/${id}/unsubscribe`),
    onSuccess: () => {
      toast.success('Unsubscribed from podcast');
      queryClient.invalidateQueries({ queryKey: ['podcast', id] });
    },
    onError: () => toast.error('Failed to unsubscribe'),
  });
  
  const podcast = podcastData?.data;
  const episodes = episodesData?.data || [];
  const isSubscribed = podcast?.is_subscribed || false;
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };
  
  const handleSubscribe = () => {
    if (isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!podcast) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Podcast not found</p>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="relative h-64 w-64 rounded-xl overflow-hidden flex-shrink-0 bg-muted mx-auto md:mx-0">
          <Image
            src={podcast.cover_url || '/images/podcast-placeholder.jpg'}
            alt={podcast.title}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-2">
            {podcast.category?.name}
          </span>
          <h1 className="text-3xl font-bold">{podcast.title}</h1>
          <p className="text-muted-foreground mt-1">by {podcast.host_name}</p>
          
          <p className="mt-4 text-muted-foreground">{podcast.description}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
            <span>{podcast.episode_count} episodes</span>
            <span>{(podcast.subscriber_count || 0).toLocaleString()} subscribers</span>
            {podcast.frequency && <span>{podcast.frequency}</span>}
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
            <button
              onClick={handleSubscribe}
              disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
              className={cn(
                'flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors',
                isSubscribed
                  ? 'bg-muted hover:bg-muted/80'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isSubscribed ? (
                <>
                  <BellOff className="h-4 w-4" />
                  Unsubscribe
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Subscribe
                </>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Episodes List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Episodes</h2>
          
          {episodesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {episodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/podcasts/${podcast.uuid}/episodes/${episode.uuid}`}
                  className="block p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setPlayingEpisodeId(playingEpisodeId === episode.id ? null : episode.id);
                      }}
                      className={cn(
                        'h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center transition-colors',
                        playingEpisodeId === episode.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {playingEpisodeId === episode.id ? (
                        <Pause className="h-5 w-5" fill="currentColor" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">EP {episode.episode_number}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(episode.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold mt-1">{episode.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{episode.description}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(episode.duration_seconds)}
                        </span>
                        <span>{(episode.listen_count || 0).toLocaleString()} plays</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 self-center" />
                </div>
              </Link>
            ))}
          </div>
          )}
          
          {!episodesLoading && episodes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No episodes available</p>
            </div>
          )}
          
          {episodes.length > 0 && (
            <button className="w-full mt-4 py-3 border rounded-lg hover:bg-muted text-center font-medium">
              Load More Episodes
            </button>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* About */}
          <div className="p-6 rounded-xl border bg-card">
            <h3 className="font-semibold mb-4">About</h3>
            <p className="text-sm text-muted-foreground">{podcast.long_description || podcast.description}</p>
          </div>
          
          {/* Host */}
          <div className="p-6 rounded-xl border bg-card">
            <h3 className="font-semibold mb-4">Host</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                {podcast.host_avatar_url ? (
                  <Image
                    src={podcast.host_avatar_url}
                    alt={podcast.host_name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {podcast.host_name?.charAt(0) || 'H'}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{podcast.host_name}</p>
                <p className="text-sm text-muted-foreground">Host</p>
              </div>
            </div>
            {podcast.host_bio && (
              <p className="text-sm text-muted-foreground mt-4">{podcast.host_bio}</p>
            )}
          </div>
          
          {/* Social Links */}
          {(podcast.website_url || podcast.twitter_handle || podcast.instagram_handle) && (
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="space-y-3">
                {podcast.website_url && (
                  <a 
                    href={podcast.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                )}
                {podcast.twitter_handle && (
                  <a 
                    href={`https://twitter.com/${podcast.twitter_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Twitter className="h-4 w-4" />
                    {podcast.twitter_handle}
                  </a>
                )}
                {podcast.instagram_handle && (
                  <a 
                    href={`https://instagram.com/${podcast.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Instagram className="h-4 w-4" />
                    {podcast.instagram_handle}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
