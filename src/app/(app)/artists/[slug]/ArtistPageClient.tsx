'use client';

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Play,
  Pause,
  Share2,
  User,
  Music,
  Disc3,
  CalendarDays,
  Users,
  TrendingUp,
  CheckCircle,
  Loader2,
  Shuffle,
  ExternalLink,
  Heart,
} from "lucide-react";
import { useArtist, useArtistSongs, usePublicArtistAlbums } from "@/hooks/api";
import { usePlayerStore } from "@/stores";
import { formatNumber, cn, formatDuration, resolveDurationSeconds } from "@/lib/utils";
import type { Song, Artist } from "@/types";
import { FollowButton } from "@/components/social/FollowButton";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentSection } from "@/components/social/CommentSection";
import { ShareBottomSheet } from "@/components/social/ShareBottomSheet";
import { TipModal } from "@/components/music/TipModal";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { pickMediaUrl, resolvePlayableAudioUrl } from "@/lib/media";
import { InitialsAvatar, SafeImage } from "@/components/ui/safe-image";

export default function ArtistPage({
  initialArtist,
  slug: slugProp,
}: {
  initialArtist?: Artist;
  slug?: string;
} = {}) {
  const params = useParams();
  const pathname = usePathname();
  const slug = slugProp ?? (params?.slug as string);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { data: session } = useSession();

  const { data: artist, isLoading: artistLoading, error: artistError } = useArtist(slug, { initialData: initialArtist });
  const { data: songsData, isLoading: songsLoading } = useArtistSongs(artist?.id || 0, { enabled: !!artist?.id });
  const { data: albumsData, isLoading: albumsLoading } = usePublicArtistAlbums(artist?.id || 0, { enabled: !!artist?.id });

  const { play, currentSong, isPlaying, resume, pause } = usePlayerStore();

  const songs: Song[] = songsData?.data || [];
  const albums = albumsData?.data || [];

  // Loading state
  if (artistLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (artistError || !artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Artist Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The artist you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/artists" className="text-primary hover:underline">
          Browse Artists
        </Link>
      </div>
    );
  }

  // Play handlers
  const handlePlayAll = () => {
    if (songs.length === 0) return;
    const isPlayingThisArtist = currentSong?.artist?.id === artist.id;
    if (isPlayingThisArtist && isPlaying) {
      pause();
    } else if (isPlayingThisArtist && !isPlaying) {
      resume();
    } else {
      play(songs[0], songs);
    }
  };

  const handlePlaySong = (song: Song) => {
    const playableUrl = resolvePlayableAudioUrl(song);
    if (!playableUrl) {
      toast.error('This track is not currently streamable for your account.');

      return;
    }

    if (currentSong?.id === song.id) {
      if (isPlaying) pause();
      else resume();
    } else {
      play(song, songs);
    }
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    // Fisher-Yates shuffle for uniform distribution
    const shuffled = [...songs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    play(shuffled[0], shuffled);
  };

  // Image URLs
  const avatarUrl = pickMediaUrl(artist.avatar_url, artist.profile_image_url);
  const bannerUrl = pickMediaUrl(artist.banner_url, artist.cover_url, artist.cover_image_url);

  const isCurrentArtistPlaying = currentSong?.artist?.id === artist.id && isPlaying;

  return (
    <div className="min-w-0 overflow-hidden pb-28">
      {/* Hero Section */}
      <div className="relative min-h-[22rem] overflow-hidden sm:min-h-80 lg:min-h-96">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background">
          {bannerUrl && (
            <SafeImage
              src={bannerUrl}
              alt=""
              fill
              className="object-cover opacity-30"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-end sm:gap-6 sm:p-6">
          {/* Profile Image */}
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted shadow-xl ring-4 ring-background sm:h-32 sm:w-32 md:h-48 md:w-48">
            {avatarUrl ? (
              <SafeImage
                src={avatarUrl}
                alt={artist.name}
                fill
                className="object-cover"
                priority
                fallback={<InitialsAvatar name={artist.name} className="bg-primary/10" textClassName="text-5xl font-normal" />}
              />
            ) : (
              <InitialsAvatar name={artist.name} className="bg-primary/10" textClassName="text-5xl font-normal" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-primary">Artist</span>
              {artist.is_verified && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </div>
            <h1 className="mb-3 mt-1 break-words text-2xl font-bold [overflow-wrap:anywhere] sm:text-3xl md:mb-4 md:text-5xl lg:text-7xl">
              {artist.name}
            </h1>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:items-center sm:text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {formatNumber(artist.follower_count || 0)} followers
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Music className="h-4 w-4" />
                {artist.total_songs || songs.length} songs
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Disc3 className="h-4 w-4" />
                {artist.total_albums || albums.length} albums
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {formatNumber(artist.total_plays || 0)} plays
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex min-w-0 flex-wrap items-center gap-2 p-4 sm:gap-4 sm:p-6">
        {/* Play Button */}
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:h-14 sm:w-14",
            songs.length === 0 ? "bg-muted cursor-not-allowed" : "bg-primary"
          )}
        >
          {isCurrentArtistPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </button>

        {/* Shuffle Button */}
        <button
          onClick={handleShufflePlay}
          disabled={songs.length === 0}
          className="shrink-0 p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-50 sm:p-3"
          title="Shuffle Play"
        >
          <Shuffle className="h-6 w-6" />
        </button>

        {/* Follow Button — universal social component */}
        <FollowButton
          followableType="artist"
          followableId={artist.id}
          initialCount={artist.follower_count || 0}
          showCount={false}
        />

        {/* Like Button — universal social component */}
        <LikeButton
          likeableType="artist"
          likeableId={artist.id}
          variant="inline"
          showCount={false}
          iconSize={7}
        />

        {/* Share Button */}
        <button
          onClick={() => setShareOpen(true)}
          className="shrink-0 p-2.5 text-muted-foreground hover:text-foreground sm:p-3"
          aria-label="Share artist"
        >
          <Share2 className="h-6 w-6" />
        </button>

        {/* Tip Button */}
        <button
          onClick={() => {
            if (!session?.user) {
              toast.error("Please sign in to send tips");
              return;
            }
            setTipModalOpen(true);
          }}
          className="flex shrink-0 items-center gap-2 rounded-full border-2 border-pink-500/30 px-3 py-2 font-semibold text-pink-500 transition-colors hover:bg-pink-500/10 sm:px-4"
        >
          <Heart className="h-5 w-5" />
          <span className="hidden sm:inline">Tip</span>
        </button>

      </div>

      <nav aria-label="Artist profile sections" className="grid grid-cols-2 gap-2 px-1 pb-6 sm:max-w-md sm:px-6">
        <Link href={`/artists/${slug}/discography`} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm font-semibold hover:border-primary/40 hover:bg-muted">
          <Disc3 className="h-4 w-4 shrink-0 text-primary" />
          Discography
        </Link>
        <Link href={`/artists/${slug}/events`} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm font-semibold hover:border-primary/40 hover:bg-muted">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
          Events
        </Link>
      </nav>

      {/* Genre Badge */}
      {artist.genre && (
        <div className="px-1 pb-4 sm:px-6">
          <Link
            href={`/genres/${artist.genre.slug || artist.genre.id}`}
            className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
          >
            {artist.genre.name}
          </Link>
        </div>
      )}

      {artist.is_placeholder && artist.claim_status === 'unclaimed' && (
        <section className="px-1 pb-6 sm:px-6">
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 dark:bg-amber-950/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Claimable Artist Profile</p>
                <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-200/80">
                  This profile was uploaded on behalf of an offline artist and can be claimed by its rightful owner.
                </p>
              </div>
              <Link
                href={`/claim-artist?artist=${artist.id}&from=${encodeURIComponent(pathname || `/artists/${slug}`)}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Claim This Artist
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bio */}
      {artist.bio && (
        <section className="min-w-0 px-1 pb-8 sm:px-6">
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="max-w-3xl whitespace-pre-line break-words text-muted-foreground [overflow-wrap:anywhere]">{artist.bio}</p>
        </section>
      )}

      {/* Social Links */}
      {artist.social_links && Object.keys(artist.social_links).length > 0 && (
        <section className="min-w-0 px-1 pb-8 sm:px-6">
          <h2 className="text-xl font-bold mb-3">Connect</h2>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {Object.entries(artist.social_links).map(([platform, url]) =>
              url && (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2.5 transition-colors hover:bg-muted/80 sm:justify-start sm:px-4 sm:py-2"
                >
                  <span className="truncate capitalize">{platform.replaceAll('_', ' ')}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              )
            )}
          </div>
        </section>
      )}

      {/* Popular Songs */}
      {songs.length > 0 && (
        <section id="popular" className="min-w-0 px-1 pb-8 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Popular</h2>
            {songsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <div className="space-y-1">
            {songs.slice(0, 10).map((song, index) => {
              const songArtworkUrl = pickMediaUrl(song.artwork_url, song.album?.artwork_url);
              const isCurrentSong = currentSong?.id === song.id;
              const isSongPlaying = isCurrentSong && isPlaying;

              return (
                <button
                  type="button"
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  aria-label={`${isSongPlaying ? 'Pause' : 'Play'} ${song.title}`}
                  className={cn(
                    "group flex w-full min-w-0 items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-muted sm:gap-4",
                    isCurrentSong && "bg-primary/10"
                  )}
                >
                  {/* Track Number / Play Icon */}
                  <span className="w-6 text-center text-muted-foreground text-sm group-hover:hidden">
                    {isCurrentSong ? (
                      isSongPlaying ? (
                        <Pause className="h-4 w-4 mx-auto text-primary" />
                      ) : (
                        <Play className="h-4 w-4 mx-auto text-primary" />
                      )
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="w-6 text-center hidden group-hover:block">
                    {isSongPlaying ? (
                      <Pause className="h-4 w-4 mx-auto" />
                    ) : (
                      <Play className="h-4 w-4 mx-auto" />
                    )}
                  </span>

                  {/* Artwork */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {songArtworkUrl ? (
                      <SafeImage
                        src={songArtworkUrl}
                        alt={song.title}
                        fill
                        className="object-cover"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center">
                            <Music className="h-4 w-4 text-muted-foreground" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Music className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-medium truncate", isCurrentSong && "text-primary")}>
                      {song.title}
                    </p>
                  </div>

                  {/* Play Count */}
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {formatNumber(song.play_count || 0)} plays
                  </span>

                  {/* Duration */}
                  <span className="text-sm text-muted-foreground w-12 text-right">
                          {song.duration_formatted || formatDuration(resolveDurationSeconds(undefined, song.duration_seconds))}
                  </span>
                </button>
              );
            })}
          </div>

          {/* See All Link */}
          {songs.length > 10 && (
            <Link
              href={`/artists/${slug}/discography`}
              className="inline-block mt-4 text-primary hover:underline"
            >
              View full discography
            </Link>
          )}
        </section>
      )}

      {/* Albums / Discography */}
      {albums.length > 0 && (
        <section className="min-w-0 px-1 pb-8 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Discography</h2>
            <div className="flex items-center gap-3">
              {albumsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Link href={`/artists/${slug}/discography`} className="text-sm font-medium text-primary hover:underline">See all</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {albums.map((album) => {
              const albumArtworkUrl = pickMediaUrl(album.artwork_url);
              return (
                <Link
                  key={album.id}
                  href={`/albums/${album.slug || album.id}`}
                  className="group min-w-0 rounded-xl bg-card/50 p-2 transition-colors hover:bg-card sm:p-3"
                >
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted">
                    {albumArtworkUrl ? (
                      <SafeImage
                        src={albumArtworkUrl}
                        alt={album.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center">
                            <Disc3 className="h-12 w-12 text-muted-foreground" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Disc3 className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                        <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="font-medium truncate">{album.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {album.release_date
                      ? new Date(album.release_date).getFullYear()
                      : "Album"} • {album.total_tracks || 0} tracks
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {songs.length === 0 && albums.length === 0 && !songsLoading && !albumsLoading && (
        <div className="px-1 py-12 text-center sm:px-6">
          <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No music yet</h3>
          <p className="text-muted-foreground">
            {artist.name} hasn&apos;t uploaded any music yet. Check back later!
          </p>
        </div>
      )}

      {/* Comments Section — universal social component */}
      <section className="min-w-0 px-1 pb-8 sm:px-6">
        <CommentSection
          commentableType="artist"
          commentableId={artist.id}
          title={`Comments on ${artist.name}`}
        />
      </section>

      {/* Tip Modal */}
      <TipModal
        open={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        recipientId={artist.id}
        recipientType="artist"
        recipientName={artist.name}
      />

      {/* Share Bottom Sheet */}
      <ShareBottomSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={artist ? {
          share_url: typeof window !== 'undefined' ? window.location.href : '',
          og_title: artist.name,
          og_description: artist.bio || `Listen to ${artist.name} on TesoTunes`,
          og_image: avatarUrl || null,
          caption: `🎵 ${artist.name}\n\nListen on TesoTunes\n\n${typeof window !== 'undefined' ? window.location.href : ''}`,
          platform_links: {
            copy: typeof window !== 'undefined' ? window.location.href : '',
            whatsapp: `https://wa.me/?text=${encodeURIComponent(`🎵 ${artist.name} — Listen on TesoTunes ${typeof window !== 'undefined' ? window.location.href : ''}`)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎵 ${artist.name} — Listen on TesoTunes`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(`🎵 ${artist.name} — Listen on TesoTunes`)}`,
            instagram: null,
          },
        } : null}
      />
    </div>
  );
}
