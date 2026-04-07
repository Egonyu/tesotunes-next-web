'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import {
  Play,
  MoreHorizontal,
  Loader2,
  Disc3,
  Share2,
} from 'lucide-react';
import { cn, formatResolvedDuration } from '@/lib/utils';
import { LikeButton } from '@/components/social/LikeButton';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ShareBottomSheet, type SharePayload } from '@/components/social/ShareBottomSheet';
import { AddToPlaylistAction } from '@/components/playlists/AddToPlaylistAction';
import type { Song, PaginatedResponse } from '@/types';

function buildSongSharePayload(song: Song, source?: Partial<SharePayload>): SharePayload {
  const fallbackShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/songs/${song.slug || song.id}`
    : `/songs/${song.slug || song.id}`;
  const shareUrl = source?.share_url || fallbackShareUrl;
  const artistName = song.artist?.name || 'Unknown Artist';
  const shareTitle = source?.og_title || `${song.title} — ${artistName}`;
  const shareDescription = source?.og_description ?? `Listen to ${song.title} by ${artistName} on TesoTunes`;
  const caption = source?.caption || `${shareUrl}\n\n🎵 ${song.title} — ${artistName}\nListen on TesoTunes`;

  return {
    share_url: shareUrl,
    og_title: shareTitle,
    og_description: shareDescription,
    og_image: source?.og_image ?? song.artwork_url ?? null,
    caption,
    platform_links: {
      copy: source?.platform_links?.copy || shareUrl,
      whatsapp: source?.platform_links?.whatsapp || `https://wa.me/?text=${encodeURIComponent(`${shareUrl}\n\n${shareTitle}`)}`,
      twitter: source?.platform_links?.twitter || `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}&hashtags=TesoTunes`,
      facebook: source?.platform_links?.facebook || `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      telegram: source?.platform_links?.telegram || `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      instagram: source?.platform_links?.instagram ?? null,
    },
  };
}

export default function NewReleasesPage() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const latestShareRequest = useRef(0);

  const { data, isLoading } = useQuery({
    queryKey: ['songs', 'new-releases', timeFilter],
    queryFn: () => apiGet<PaginatedResponse<Song>>(`/songs`, { params: { sort: '-created_at', period: timeFilter } }),
  });

  const songs = data?.data || [];

  const handleShare = async (song: Song) => {
    const requestId = ++latestShareRequest.current;
    const fallbackPayload = buildSongSharePayload(song);
    setSharePayload(fallbackPayload);
    setShareOpen(true);
    setShareLoading(true);

    try {
      const res = await apiPost<{
        success: boolean;
        data: { share_payload: SharePayload };
      }>('/shares', {
        shareable_type: 'Song',
        shareable_id: song.id,
        platform: 'internal',
      });

      if (requestId === latestShareRequest.current) {
        setSharePayload(buildSongSharePayload(song, res.data.share_payload));
      }
    } catch {
      if (requestId === latestShareRequest.current) {
        setSharePayload(fallbackPayload);
      }
    } finally {
      if (requestId === latestShareRequest.current) {
        setShareLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Disc3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">New Releases</h1>
            <p className="text-muted-foreground">Fresh music just dropped</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {([
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'all', label: 'All Time' },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeFilter(value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                timeFilter === value ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Song List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : songs.length > 0 ? (
        <div className="space-y-1">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="w-8 text-center text-sm text-muted-foreground group-hover:hidden">
                {index + 1}
              </span>
              <button className="w-8 hidden group-hover:flex items-center justify-center">
                <Play className="h-4 w-4" />
              </button>

              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                {song.artwork_url ? (
                  <Image src={song.artwork_url} alt={song.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Disc3 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {song.artist?.name || 'Unknown Artist'}
                </p>
              </div>

              <span className="text-sm text-muted-foreground hidden md:block">
                {song.album?.title || '-'}
              </span>

              <span className="text-xs text-muted-foreground hidden lg:block">
                {song.release_date || song.released_at
                  ? new Date(song.release_date || song.released_at || song.created_at).toLocaleDateString()
                  : new Date(song.created_at).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                <span className="opacity-0 group-hover:opacity-100 transition-all">
                  <LikeButton
                    likeableType="song"
                    likeableId={song.id}
                    variant="inline"
                    showCount={false}
                    iconSize={4}
                  />
                </span>
                <span className="text-sm text-muted-foreground w-12 text-right">
                    {formatResolvedDuration(undefined, song.duration_seconds, song.duration_formatted)}
                </span>
                <DropdownMenu
                  align="end"
                  trigger={(
                    <button
                      type="button"
                      className="p-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-accent transition-all"
                      aria-label={`More actions for ${song.title}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  )}
                >
                  <AddToPlaylistAction
                    songId={song.id}
                    songTitle={song.title}
                  />
                  <DropdownMenuItem
                    onClick={() => {
                      void handleShare(song);
                    }}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Disc3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No new releases</h3>
          <p className="text-muted-foreground">Check back soon for fresh music!</p>
        </div>
      )}

      <ShareBottomSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={sharePayload}
        isLoading={shareLoading}
      />
    </div>
  );
}
