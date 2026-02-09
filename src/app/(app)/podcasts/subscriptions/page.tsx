'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Headphones,
  Play,
  Bell,
  BellOff,
  Clock,
  ChevronRight,
  Mic,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSubscribedPodcasts,
  useUnsubscribeFromPodcast,
  formatDuration,
  formatEpisodeDate,
} from '@/hooks/usePodcasts';
import { toast } from 'sonner';

export default function PodcastSubscriptionsPage() {
  const [search, setSearch] = useState('');
  const { data: podcasts, isLoading } = useSubscribedPodcasts();
  const unsubscribe = useUnsubscribeFromPodcast();

  const filteredPodcasts = (podcasts || []).filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.host_name.toLowerCase().includes(search.toLowerCase())
  );

  const newEpisodePodcasts = filteredPodcasts.filter(p => p.has_new_episodes || p.latest_episode);
  const otherPodcasts = filteredPodcasts.filter(p => !p.has_new_episodes && !p.latest_episode);

  const handleUnsubscribe = async (podcastId: number, title: string) => {
    try {
      await unsubscribe.mutateAsync(podcastId);
      toast.success(`Unsubscribed from "${title}"`);
    } catch {
      toast.error('Failed to unsubscribe');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-12 bg-muted rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="h-6 w-6" />
            My Podcasts
          </h1>
          <p className="text-muted-foreground">
            {filteredPodcasts.length} subscribed podcast{filteredPodcasts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/podcasts"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Discover Podcasts
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your subscriptions..."
          className="w-full pl-10 pr-4 py-3 border rounded-xl bg-background"
        />
      </div>

      {filteredPodcasts.length === 0 ? (
        <div className="text-center py-16">
          <Mic className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search ? 'No matching podcasts' : 'No subscriptions yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {search
              ? 'Try a different search term'
              : 'Subscribe to podcasts to get notified about new episodes and keep up with your favorites'}
          </p>
          {!search && (
            <Link
              href="/podcasts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              <Search className="h-4 w-4" />
              Browse Podcasts
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* New Episodes Section */}
          {newEpisodePodcasts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                New Episodes
              </h2>
              <div className="space-y-3">
                {newEpisodePodcasts.map((podcast) => (
                  <PodcastSubscriptionCard
                    key={podcast.id}
                    podcast={podcast}
                    isNew
                    onUnsubscribe={handleUnsubscribe}
                    isUnsubscribing={unsubscribe.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Subscriptions */}
          {otherPodcasts.length > 0 && (
            <div>
              {newEpisodePodcasts.length > 0 && (
                <h2 className="text-lg font-semibold mb-4">All Subscriptions</h2>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherPodcasts.map((podcast) => (
                  <PodcastSubscriptionCard
                    key={podcast.id}
                    podcast={podcast}
                    onUnsubscribe={handleUnsubscribe}
                    isUnsubscribing={unsubscribe.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PodcastSubscriptionCard({
  podcast,
  isNew,
  onUnsubscribe,
  isUnsubscribing,
}: {
  podcast: {
    id: number;
    title: string;
    cover_url: string;
    host_name: string;
    category: { name: string };
    episode_count: number;
    frequency?: string;
    latest_episode?: { title: string; duration_seconds: number; published_at: string };
    has_new_episodes?: boolean;
  };
  isNew?: boolean;
  onUnsubscribe: (id: number, title: string) => void;
  isUnsubscribing: boolean;
}) {
  const [showActions, setShowActions] = useState(false);

  if (isNew && podcast.latest_episode) {
    // Full-width card with latest episode info
    return (
      <div className="bg-card rounded-xl border overflow-hidden hover:border-primary transition-colors">
        <div className="flex gap-4 p-4">
          <Link href={`/podcasts/${podcast.id}`} className="shrink-0">
            <div
              className="w-20 h-20 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${podcast.cover_url || '/images/placeholder.jpg'})` }}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/podcasts/${podcast.id}`}>
                <h3 className="font-semibold truncate hover:text-primary">{podcast.title}</h3>
                <p className="text-sm text-muted-foreground">{podcast.host_name}</p>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                {podcast.has_new_episodes && (
                  <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full font-medium">
                    NEW
                  </span>
                )}
              </div>
            </div>

            {/* Latest Episode */}
            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
              <Link
                href={`/podcasts/${podcast.id}`}
                className="flex items-center gap-2 group"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20">
                  <Play className="h-3 w-3 text-primary ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{podcast.latest_episode.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(podcast.latest_episode.duration_seconds)}</span>
                    <span>•</span>
                    <span>{formatEpisodeDate(podcast.latest_episode.published_at)}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact card
  return (
    <div
      className="bg-card rounded-xl border p-4 hover:border-primary transition-colors relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Link href={`/podcasts/${podcast.id}`} className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${podcast.cover_url || '/images/placeholder.jpg'})` }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{podcast.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{podcast.host_name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{podcast.episode_count} episodes</span>
            {podcast.frequency && (
              <>
                <span>•</span>
                <span>{podcast.frequency}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Hover actions */}
      {showActions && (
        <button
          onClick={() => onUnsubscribe(podcast.id, podcast.title)}
          disabled={isUnsubscribing}
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors',
            'bg-muted hover:bg-red-100 hover:text-red-600 text-muted-foreground'
          )}
          title="Unsubscribe"
        >
          {isUnsubscribing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <BellOff className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}
