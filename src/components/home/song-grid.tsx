"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Heart, MoreHorizontal, Music, Download, Headphones, Megaphone, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { usePlayerStore } from "@/stores";
import { formatNumber } from "@/lib/utils";
import type { Song, PaginatedResponse } from "@/types";
import { useToggleLike, useLikeStatus } from "@/hooks/useSocial";
import { useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ShareBottomSheet, type SharePayload } from "@/components/social/ShareBottomSheet";
import { AddToPlaylistAction } from "@/components/playlists/AddToPlaylistAction";
import { SnapCarousel } from "@/components/ui/snap-carousel";

function buildSongSharePayload(song: Song, source?: Partial<SharePayload>): SharePayload {
  const fallbackShareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/songs/${song.slug || song.id}`
    : `/songs/${song.slug || song.id}`;
  const shareUrl = source?.share_url || fallbackShareUrl;
  const artistName = song.artist?.name || "Unknown Artist";
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

interface SongGridProps {
  type: "trending" | "new" | "recent" | "top";
  limit?: number;
  /**
   * "compact" (default) — multi-card horizontal snap scroller on mobile, grid on desktop.
   * "featured" — one large artwork centered with neighbor halves peeking on mobile.
   */
  variant?: "compact" | "featured";
}

const SONG_GRID_COLS = "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

export function SongGrid({ type, limit = 10, variant = "compact" }: SongGridProps) {
  const { play, currentSong, isPlaying, pause, resume } = usePlayerStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const latestShareRequest = useRef(0);

  const sortMap: Record<string, string> = {
    trending: "-play_count",
    new: "-created_at",
    recent: "-updated_at",
    top: "-play_count",
  };

  const { data, isLoading } = useQuery({
    queryKey: ["songs", type, limit],
    queryFn: () =>
      apiGet<PaginatedResponse<Song>>("/songs", { params: { limit, sort: sortMap[type] } }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const songs = data?.data || [];

  if (isLoading) {
    return (
      <SnapCarousel variant={variant} mdGridClassName={SONG_GRID_COLS}>
        {Array.from({ length: limit }).map((_, i) => (
          <SnapCarousel.Item key={i}>
            <div className="space-y-2 animate-pulse">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </SnapCarousel.Item>
        ))}
      </SnapCarousel>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No songs available</p>
      </div>
    );
  }

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      isPlaying ? pause() : resume();
    } else {
      play(song, songs);
    }
  };

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
      }>("/shares", {
        shareable_type: "Song",
        shareable_id: song.id,
        platform: "internal",
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
    <>
      <SnapCarousel variant={variant} mdGridClassName={SONG_GRID_COLS}>
        {songs.map((song) => {
          const isCurrentSong = currentSong?.id === song.id;
          const isCurrentlyPlaying = isCurrentSong && isPlaying;

          return (
            <SnapCarousel.Item key={song.id}>
            <div
              className="group relative rounded-lg bg-card/50 p-3 transition-colors hover:bg-card"
            >
            {/* Artwork - entire area is clickable to play */}
            <button
              onClick={() => handlePlay(song)}
              className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted w-full cursor-pointer"
              aria-label={isCurrentlyPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
            >
              {song.artwork_url ? (
                <Image
                  src={song.artwork_url}
                  alt={song.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Full overlay on hover / always visible when playing */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                  isCurrentlyPlaying
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  {isCurrentlyPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </div>
              </div>
            </button>

            {/* Song Info */}
            <div className="min-w-0">
              <Link
                href={`/songs/${song.slug || song.id}`}
                className="block truncate font-medium hover:underline"
              >
                {song.title}
              </Link>
              {song.artist && (
                <Link
                  href={`/artists/${song.artist.slug || song.artist.id}`}
                  className="block truncate text-sm text-muted-foreground hover:underline"
                >
                  {song.artist.name}
                </Link>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Headphones className="h-3 w-3" />
                  {formatNumber(song.play_count || 0)}
                </span>
                <div className="flex items-center gap-1">
                  {(song.is_free || song.is_downloadable) && song.audio_url && (
                    <a
                      href={song.audio_url}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <SongLikeButton songId={song.id} />
                  <DropdownMenu
                    align="end"
                    trigger={(
                      <button
                        type="button"
                        className="p-1 hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
                    {session?.user && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/artist/promotions/opportunities/create?promotable_type=song&promotable_id=${song.id}&promotable_title=${encodeURIComponent(song.title)}`
                          );
                        }}
                        className="gap-2"
                      >
                        <Megaphone className="h-4 w-4" />
                        Promote this song
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
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
            </div>
            </div>
            </SnapCarousel.Item>
          );
        })}
      </SnapCarousel>

      <ShareBottomSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={sharePayload}
        isLoading={shareLoading}
      />
    </>
  );
}

function SongLikeButton({ songId }: { songId: number }) {
  const { data: session } = useSession();
  const { data: likeData } = useLikeStatus('song', songId, {
    enabled: !!session?.user,
  });
  const toggleLike = useToggleLike('song', songId);
  const isLiked = (likeData as { data?: { is_liked?: boolean } })?.data?.is_liked;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (session?.user) toggleLike.mutate();
      }}
      className={`p-1 transition-colors ${
        isLiked
          ? 'text-red-500 hover:text-red-600'
          : 'text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100'
      }`}
      title={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
    </button>
  );
}
