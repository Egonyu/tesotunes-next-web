"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play,
  Pause,
  Heart,
  Share2,
  MoreHorizontal,
  Plus,
  Download,
  Radio,
  Music,
  Clock,
  Calendar,
  Disc3,
  User,
  ListMusic,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatDuration, formatNumber, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface SongDetail {
  id: number;
  title: string;
  slug: string;
  duration: number;
  play_count: number;
  release_date: string;
  cover_url: string | null;
  explicit: boolean;
  is_liked: boolean;
  lyrics?: string;
  credits: {
    role: string;
    name: string;
  }[];
  artist: {
    id: number;
    name: string;
    slug: string;
    avatar_url: string | null;
    is_verified: boolean;
    followers_count: number;
  };
  album?: {
    id: number;
    title: string;
    slug: string;
    cover_url: string | null;
    release_date: string;
    tracks_count: number;
  };
  genres: {
    id: number;
    name: string;
    slug: string;
  }[];
  moods: {
    id: number;
    name: string;
    slug: string;
  }[];
  similar_songs: {
    id: number;
    title: string;
    slug: string;
    cover_url: string | null;
    duration: number;
    artist: {
      name: string;
      slug: string;
    };
  }[];
  artist_top_songs: {
    id: number;
    title: string;
    slug: string;
    cover_url: string | null;
    play_count: number;
  }[];
}

export default function SongDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const queryClient = useQueryClient();

  const { data: song, isLoading } = useQuery({
    queryKey: ["song", slug],
    queryFn: () => apiGet<SongDetail>(`/music/songs/${slug}`),
  });

  const toggleLike = useMutation({
    mutationFn: () => apiPost(`/engagement/likes/song/${song?.id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song", slug] });
      toast.success(song?.is_liked ? "Removed from liked songs" : "Added to liked songs");
    },
  });

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
        <div className="lg:w-80 flex-shrink-0">
          {/* Cover Art */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-xl mb-6">
            {song.cover_url ? (
              <Image
                src={song.cover_url}
                alt={song.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <Music className="absolute inset-0 m-auto h-24 w-24 text-muted-foreground" />
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90">
              <Play className="h-5 w-5 ml-1" />
              Play Now
            </button>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => toggleLike.mutate()}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted ${
                  song.is_liked ? "text-red-500 border-red-500/30" : ""
                }`}
              >
                <Heart className={`h-5 w-5 ${song.is_liked ? "fill-current" : ""}`} />
                <span className="text-xs">Like</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted">
                <Plus className="h-5 w-5" />
                <span className="text-xs">Add</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted">
                <Share2 className="h-5 w-5" />
                <span className="text-xs">Share</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted">
                <Radio className="h-5 w-5" />
                <span className="text-xs">Radio</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 p-4 bg-card rounded-lg border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{formatNumber(song.play_count)}</p>
                <p className="text-sm text-muted-foreground">Plays</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDuration(song.duration)}</p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="flex-1 min-w-0">
          {/* Title & Artist */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {song.explicit && (
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
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(song.release_date)}
            </span>
          </div>

          {/* Genres & Moods */}
          <div className="flex flex-wrap gap-2 mb-8">
            {song.genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/genres/${genre.slug}`}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20"
              >
                {genre.name}
              </Link>
            ))}
            {song.moods.map((mood) => (
              <Link
                key={mood.id}
                href={`/moods/${mood.slug}`}
                className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80"
              >
                {mood.name}
              </Link>
            ))}
          </div>

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
          {song.credits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Credits</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {song.credits.map((credit, i) => (
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
                <div className="relative w-20 h-20 rounded bg-muted overflow-hidden flex-shrink-0">
                  {song.album.cover_url ? (
                    <Image
                      src={song.album.cover_url}
                      alt={song.album.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Disc3 className="w-8 h-8 m-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{song.album.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {song.album.tracks_count} tracks • {formatDate(song.album.release_date)}
                  </p>
                </div>
                <ExternalLink className="h-5 w-5 ml-auto text-muted-foreground" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Similar Songs */}
      {song.similar_songs.length > 0 && (
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
                  {similar.cover_url ? (
                    <Image
                      src={similar.cover_url}
                      alt={similar.title}
                      fill
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
      {song.artist_top_songs.length > 0 && (
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
                  {track.cover_url ? (
                    <Image
                      src={track.cover_url}
                      alt={track.title}
                      fill
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
    </div>
  );
}
