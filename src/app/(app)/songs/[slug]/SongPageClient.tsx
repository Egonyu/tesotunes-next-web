"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Pause,
  Share2,
  ListPlus,
  Download,
  Music,
  Calendar,
  Disc3,
  User,
  ExternalLink,
  Heart,
  BarChart3,
  Clock,
  ChevronRight,
  Coins,
  ShoppingCart,
  CheckCircle2,
  Megaphone,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatDuration, formatNumber, formatDate, resolveDurationSeconds } from "@/lib/utils";
import { toast } from "sonner";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentSection } from "@/components/social/CommentSection";
import { ShareBottomSheet, type SharePayload } from "@/components/social/ShareBottomSheet";
import { DownloadGate } from "@/components/social/DownloadGate";
import { SongPurchaseModal } from "@/components/music/SongPurchaseModal";
import { TipModal } from "@/components/music/TipModal";
import { AddToPlaylistAction } from "@/components/playlists/AddToPlaylistAction";
import { useCheckPurchase } from "@/hooks/api";
import { usePlayerStore } from "@/stores/player";
import { useSession } from "next-auth/react";
import type { Song } from "@/types";
import { PostOpportunityModal } from "@/components/promotions/PostOpportunityModal";

interface SongDetail {
  id: number;
  title: string;
  slug: string;
  duration_seconds?: number;
  duration_formatted?: string;
  play_count: number;
  release_date: string | null;
  artwork_url: string | null;
  is_explicit: boolean;
  is_free: boolean;
  is_featured: boolean;
  is_downloadable?: boolean;
  price?: number;
  like_count: number;
  download_count: number;
  audio_url?: string | null;
  stream_url?: string | null;
  preview_url?: string | null;
  lyrics?: string;
  description?: string;
  composer?: string;
  producer?: string;
  credits?: {
    role: string;
    name: string;
  }[];
  artist: {
    id: number;
    user_id?: number;
    name: string;
    slug: string;
    avatar_url: string | null;
    is_verified?: boolean;
    bio?: string;
    follower_count?: number;
    total_songs?: number;
  };
  album?: {
    id: number;
    title: string;
    slug: string;
    artwork_url: string | null;
  };
  genre?: {
    id: number;
    name: string;
    slug: string;
  };
  genres?: {
    id: number;
    name: string;
    slug: string;
  }[];
  moods?: {
    id: number;
    name: string;
    slug: string;
  }[];
  similar_songs?: {
    id: number;
    title: string;
    slug: string;
    artwork_url: string | null;
    duration_seconds?: number;
    artist: {
      name: string;
      slug: string;
    };
  }[];
  artist_top_songs?: {
    id: number;
    title: string;
    slug: string;
    artwork_url: string | null;
    play_count: number;
  }[];
}

/** Convert SongDetail to the Song type the player store expects */
function toPlayerSong(detail: SongDetail): Song {
  const durationSeconds = resolveDurationSeconds(undefined, detail.duration_seconds);

  return {
    id: detail.id,
    title: detail.title,
    slug: detail.slug,
    artist_id: detail.artist.id,
    album_id: detail.album?.id,
    duration: durationSeconds,
    duration_seconds: durationSeconds,
    duration_formatted: detail.duration_formatted,
    play_count: detail.play_count,
    download_count: detail.download_count,
    like_count: detail.like_count,
    is_downloadable: detail.is_downloadable,
    is_free: detail.is_free,
    is_explicit: detail.is_explicit,
    is_featured: detail.is_featured,
    status: "published",
    audio_url: detail.audio_url ?? detail.stream_url ?? detail.preview_url ?? null,
    stream_url: detail.stream_url ?? detail.audio_url ?? null,
    preview_url: detail.preview_url ?? null,
    artwork_url: detail.artwork_url ?? undefined,
    lyrics: detail.lyrics,
    artist: {
      id: detail.artist.id,
      name: detail.artist.name,
      slug: detail.artist.slug,
      avatar_url: detail.artist.avatar_url ?? undefined,
      follower_count: detail.artist.follower_count ?? 0,
      monthly_listeners: 0,
      is_verified: detail.artist.is_verified ?? false,
      status: "active" as const,
      genres: [],
    },
    album: detail.album
      ? {
          id: detail.album.id,
          title: detail.album.title,
          slug: detail.album.slug,
          artwork_url: detail.album.artwork_url ?? undefined,
        }
      : undefined,
    genre: detail.genre,
    created_at: "",
  } as Song;
}

export default function SongDetailPage() {
  const rawParams = useParams();
  const slug = rawParams?.slug as string;
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const { data: session } = useSession();

  const { currentSong, isPlaying, play, pause, resume, addToQueue } = usePlayerStore();

  const { data: song, isLoading } = useQuery({
    queryKey: ["song", slug],
    queryFn: async () => {
      const res = await apiGet<{ data: SongDetail }>(`/songs/${slug}`);
      return res.data;
    },
  });

  const isCurrentSong = song && currentSong?.id === song.id;
  const { data: isPurchased } = useCheckPurchase(song?.id ?? 0);
  const isAuthenticated = !!session?.user;
  const isOwner =
    isAuthenticated &&
    song?.artist?.user_id != null &&
    session?.user?.id === String(song.artist.user_id);

  function handlePlay() {
    if (!song) return;
    if (isCurrentSong && isPlaying) {
      pause();
    } else if (isCurrentSong) {
      resume();
    } else {
      play(toPlayerSong(song));
    }
  }

  function handleAddToQueue() {
    if (!song) return;
    addToQueue(toPlayerSong(song));
    toast.success(`Added "${song.title}" to queue`);
  }

  function buildSongSharePayload(source?: Partial<SharePayload>): SharePayload {
    if (!song) {
      return {
        share_url: "",
        og_title: "",
        og_description: null,
        og_image: null,
        caption: "",
        platform_links: {
          copy: "",
          whatsapp: "",
          twitter: "",
          facebook: "",
          telegram: "",
          instagram: null,
        },
      };
    }

    const fallbackShareUrl = `${window.location.origin}/songs/${song.slug || song.id}`;
    const shareUrl = source?.share_url || fallbackShareUrl;
    const shareTitle = source?.og_title || `${song.title} — ${song.artist.name}`;
    const shareDescription = source?.og_description ?? `Listen to ${song.title} by ${song.artist.name} on TesoTunes`;
    const caption = source?.caption || `${shareUrl}\n\n🎵 ${song.title} — ${song.artist.name}\nListen on TesoTunes`;

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

  async function handleShare() {
    if (!song) return;
    setShareOpen(true);
    setShareLoading(true);
    setSharePayload(buildSongSharePayload());
    try {
      const res = await apiPost<{
        success: boolean;
        data: { share_payload: SharePayload; credits_earned?: number };
      }>("/shares", {
        shareable_type: "Song",
        shareable_id: song.id,
        platform: "internal",
      });
      setSharePayload(buildSongSharePayload(res.data.share_payload));
      if (res.data.credits_earned && res.data.credits_earned > 0) {
        toast.success(`+${res.data.credits_earned} credits for sharing!`, {
          duration: 3000,
          icon: "🔗",
        });
      }
    } catch {
      setSharePayload(buildSongSharePayload());
    } finally {
      setShareLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 aspect-square bg-muted rounded-xl" />
            <div className="flex-1 space-y-4">
              <div className="h-10 w-3/4 bg-muted rounded" />
              <div className="h-6 w-1/2 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Song Not Found</h1>
        <Link href="/browse" className="text-primary hover:underline">
          Browse Music
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Cover & Actions */}
        <div className="lg:w-80 shrink-0">
          {/* Cover Art */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-xl mb-6">
            {song.artwork_url ? (
              <Image
                src={song.artwork_url}
                alt={song.title}
                fill
                unoptimized
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                <Music className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
            {/* Price badge */}
            <div className="absolute top-3 right-3">
              {song.is_free ? (
                <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                  FREE
                </span>
              ) : song.price ? (
                <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full backdrop-blur-sm">
                  {song.price.toLocaleString()} Credits
                </span>
              ) : null}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePlay}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-colors"
            >
              {isCurrentSong && isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 ml-1" />
                  Play Now
                </>
              )}
            </button>

            {/* Buy Button — only for paid songs not yet purchased */}
            {!song.is_free && song.price && !isPurchased && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please sign in to purchase songs");
                    return;
                  }
                  setPurchaseModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-full font-bold hover:bg-yellow-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                Buy for {song.price.toLocaleString()} Credits
              </button>
            )}
            {!song.is_free && isPurchased && (
              <div className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500/10 text-green-600 rounded-full font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                Purchased
              </div>
            )}

            <div className="grid grid-cols-5 gap-2">
              <LikeButton
                likeableType="song"
                likeableId={song.id}
                initialCount={song.like_count}
                showCount
              />
              <button
                onClick={handleAddToQueue}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted transition-colors"
                title="Add to queue"
              >
                <ListPlus className="h-5 w-5" />
                <span className="text-xs">Queue</span>
              </button>
              <AddToPlaylistAction
                songId={song.id}
                songTitle={song.title}
                variant="card"
              />
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted transition-colors"
                title="Share song"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-xs">Share</span>
              </button>
              <DownloadGate
                songId={song.id}
                songTitle={song.title}
                isFree={song.is_free}
                isDownloadable={song.is_downloadable ?? false}
                isPurchased={isPurchased ?? false}
                price={song.price}
              />
            </div>

            {/* Tip Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please sign in to send tips");
                  return;
                }
                setTipModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm"
            >
              <Heart className="h-4 w-4" />
              Tip Artist
            </button>

            {/* Promote Button — owner only */}
            {isOwner && (
              <button
                onClick={() => setPromoteModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-full font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-sm"
              >
                <Megaphone className="h-4 w-4" />
                Promote this Track
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="mt-6 p-4 bg-card rounded-lg border">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{formatNumber(song.play_count)}</p>
                  <p className="text-xs text-muted-foreground">Plays</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{formatNumber(song.like_count)}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Download className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{formatNumber(song.download_count)}</p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                <p className="text-lg font-bold leading-tight">{song.duration_formatted || formatDuration(resolveDurationSeconds(undefined, song.duration_seconds))}</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="flex-1 min-w-0">
          {/* Title & Artist */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {song.is_explicit && (
                <span className="px-2 py-0.5 bg-muted text-xs font-bold rounded">E</span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold">{song.title}</h1>
            </div>

            <Link
              href={`/artists/${song.artist.slug}`}
              className="inline-flex items-center gap-3 group"
            >
              <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden">
                {song.artist.avatar_url ? (
                  <Image
                    src={song.artist.avatar_url}
                    alt={song.artist.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 m-2.5 text-muted-foreground" />
                )}
              </div>
              <span className="text-lg font-medium group-hover:text-primary transition-colors">
                {song.artist.name}
              </span>
              {song.artist.is_verified && (
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </Link>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
            {song.album && (
              <Link
                href={`/albums/${song.album.slug}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Disc3 className="h-4 w-4" />
                {song.album.title}
              </Link>
            )}
            {song.release_date && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(song.release_date)}
              </span>
            )}
          </div>

          {/* Genres & Moods */}
          {(song.genre || song.genres?.length || song.moods?.length) && (
            <div className="flex flex-wrap gap-2 mb-8">
              {song.genre && (
                <Link
                  href={`/genres/${song.genre.slug}`}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20"
                >
                  {song.genre.name}
                </Link>
              )}
              {song.genres?.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.slug}`}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20"
                >
                  {genre.name}
                </Link>
              ))}
              {song.moods?.map((mood) => (
                <Link
                  key={mood.id}
                  href={`/moods/${mood.slug}`}
                  className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80"
                >
                  {mood.name}
                </Link>
              ))}
            </div>
          )}

          {/* About the Artist - always visible to fill the space */}
          <div className="mb-8 p-5 bg-card rounded-lg border">
            <h2 className="text-lg font-bold mb-3">About the Artist</h2>
            <Link href={`/artists/${song.artist.slug}`} className="group">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full bg-muted overflow-hidden shrink-0">
                  {song.artist.avatar_url ? (
                    <Image
                      src={song.artist.avatar_url}
                      alt={song.artist.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 m-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg group-hover:text-primary transition-colors">
                      {song.artist.name}
                    </p>
                    {song.artist.is_verified && (
                      <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                  {song.artist.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {song.artist.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {song.artist.follower_count != null && (
                      <span>{formatNumber(song.artist.follower_count)} followers</span>
                    )}
                    {song.artist.total_songs != null && (
                      <span>{song.artist.total_songs} songs</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-5 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>

          {/* Song Description */}
          {song.description && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">About This Song</h2>
              <p className="text-muted-foreground leading-relaxed">{song.description}</p>
            </div>
          )}

          {/* Lyrics */}
          {song.lyrics && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Lyrics</h2>
              <div className="bg-card rounded-lg border p-6 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
                  {song.lyrics}
                </pre>
              </div>
            </div>
          )}

          {/* Credits */}
          {((song.credits && song.credits.length > 0) || song.composer || song.producer) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Credits</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {song.composer && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Music className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{song.composer}</p>
                      <p className="text-sm text-muted-foreground">Composer</p>
                    </div>
                  </div>
                )}
                {song.producer && (
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Disc3 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{song.producer}</p>
                      <p className="text-sm text-muted-foreground">Producer</p>
                    </div>
                  </div>
                )}
                {song.credits?.map((credit, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{credit.name}</p>
                      <p className="text-sm text-muted-foreground">{credit.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Album Info */}
          {song.album && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">From the Album</h2>
              <Link
                href={`/albums/${song.album.slug}`}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border hover:border-primary transition-colors"
              >
                <div className="relative w-20 h-20 rounded bg-muted overflow-hidden shrink-0">
                  {song.album.artwork_url ? (
                    <Image
                      src={song.album.artwork_url}
                      alt={song.album.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <Disc3 className="w-8 h-8 m-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{song.album.title}</p>
                  <p className="text-sm text-muted-foreground">Album</p>
                </div>
                <ExternalLink className="h-5 w-5 ml-auto text-muted-foreground" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Similar Songs */}
      {song.similar_songs && song.similar_songs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {song.similar_songs.map((similar) => (
              <Link
                key={similar.id}
                href={`/songs/${similar.slug}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                  {similar.artwork_url ? (
                    <Image
                      src={similar.artwork_url}
                      alt={similar.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Music className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="font-medium truncate">{similar.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {similar.artist.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* More from Artist */}
      {song.artist_top_songs && song.artist_top_songs.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">More from {song.artist.name}</h2>
            <Link
              href={`/artists/${song.artist.slug}`}
              className="text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {song.artist_top_songs.map((track) => (
              <Link
                key={track.id}
                href={`/songs/${track.slug}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                  {track.artwork_url ? (
                    <Image
                      src={track.artwork_url}
                      alt={track.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Music className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="font-medium truncate">{track.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(track.play_count)} plays
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <section className="mt-12">
        <CommentSection
          commentableType="song"
          commentableId={song.id}
          title="Comments"
        />
      </section>

      {/* Share Bottom Sheet */}
      <ShareBottomSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={sharePayload}
        isLoading={shareLoading}
      />

      {/* Purchase Modal */}
      {song && (
        <SongPurchaseModal
          open={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          songId={song.id}
          songTitle={song.title}
          artistName={song.artist.name}
          price={song.price ?? 0}
          artworkUrl={song.artwork_url}
        />
      )}

      {/* Tip Modal */}
      {song && (
        <TipModal
          open={tipModalOpen}
          onClose={() => setTipModalOpen(false)}
          recipientId={song.artist.id}
          recipientType="artist"
          recipientName={song.artist.name}
        />
      )}

      {/* Post Opportunity Modal — owner only */}
      {song && isOwner && (
        <PostOpportunityModal
          open={promoteModalOpen}
          onClose={() => setPromoteModalOpen(false)}
          promotableType="song"
          promotableId={song.id}
          title={song.title}
          artworkUrl={song.artwork_url}
        />
      )}
    </div>
  );
}
