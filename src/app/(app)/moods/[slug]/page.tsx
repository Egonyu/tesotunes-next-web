"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Pause,
  Shuffle,
  Heart,
  Share2,
  MoreHorizontal,
  Clock,
  Music,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDuration, formatNumber, formatResolvedDuration } from "@/lib/utils";
import { moodIcon } from "@/lib/mood-icons";

interface MoodDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  artwork_url?: string | null;
  song_count: number;
  songs: {
    id: number;
    title: string;
    slug: string;
    duration_seconds?: number;
    duration_formatted?: string;
    play_count: number;
    artwork_url?: string | null;
    artist: {
      id: number;
      name: string;
      slug: string;
    };
    album?: {
      id: number;
      title: string;
      slug: string;
    };
  }[];
  related_playlists?: {
    id: number;
    name: string;
    slug: string;
    artwork_url?: string | null;
    tracks_count: number;
  }[];
  related_moods?: {
    id: number;
    name: string;
    slug: string;
    color: string;
  }[];
}

export default function MoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: mood, isLoading } = useQuery({
    queryKey: ["mood", slug],
    queryFn: () => apiGet<{ data: MoodDetail }>(`/content/moods/${slug}`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-muted" />
        <div className="container mx-auto py-8 space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!mood) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Mood Not Found</h1>
        <Link href="/moods" className="text-primary hover:underline">
          Browse All Moods
        </Link>
      </div>
    );
  }

  const Icon = moodIcon(mood.slug);
  const totalDuration = mood.songs.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);

  return (
    <div>
      {/* Hero Header */}
      <div
        className="relative py-10 md:py-24"
        style={{
          background: `linear-gradient(135deg, ${mood.color}, ${mood.color}80)`,
        }}
      >
        {mood.artwork_url && (
          <Image
            src={mood.artwork_url}
            alt={mood.name}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="container mx-auto relative z-10">
          <Link
            href="/moods"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-5 md:mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            All Moods
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end md:gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur md:h-48 md:w-48">
              <Icon className="h-10 w-10 md:h-24 md:w-24" strokeWidth={1.5} />
            </div>

            <div className="min-w-0 text-white">
              <p className="mb-1 text-xs uppercase tracking-wider opacity-80 md:mb-2 md:text-sm">Mood</p>
              <h1 className="mb-2 break-words text-3xl font-bold md:mb-3 md:text-6xl">{mood.name}</h1>
              {mood.description && (
                <p className="mb-3 max-w-xl text-sm text-white/80 md:mb-4 md:text-base">{mood.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
                <span>{formatNumber(mood.song_count)} songs</span>
                {totalDuration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(totalDuration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
            <button className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-2.5 font-bold text-black transition-transform hover:scale-105 md:px-8 md:py-3">
              <Play className="ml-0.5 h-5 w-5" />
              Play All
            </button>
            <button className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white/20 px-5 py-2.5 text-white hover:bg-white/30 md:px-6 md:py-3">
              <Shuffle className="h-5 w-5" />
              Shuffle
            </button>
            <button className="shrink-0 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/30 md:p-3">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Songs List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 border-b text-sm text-muted-foreground">
                <span className="w-10 text-center">#</span>
                <span>Title</span>
                <span className="hidden sm:block w-32">Album</span>
                <span className="w-16 text-right">
                  <Clock className="h-4 w-4 inline" />
                </span>
              </div>

              {/* Songs */}
              {mood.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 hover:bg-muted/50 group items-center"
                >
                  <div className="w-10 text-center">
                    <span className="group-hover:hidden text-muted-foreground">
                      {index + 1}
                    </span>
                    <button className="hidden group-hover:block">
                      <Play className="h-4 w-4 mx-auto" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden">
                      {song.artwork_url ? (
                        <Image
                          src={song.artwork_url}
                          alt={song.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Music className="w-4 h-4 m-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/songs/${song.slug}`}
                        className="font-medium truncate block hover:underline"
                      >
                        {song.title}
                      </Link>
                      <Link
                        href={`/artists/${song.artist.slug}`}
                        className="text-sm text-muted-foreground truncate block hover:underline"
                      >
                        {song.artist.name}
                      </Link>
                    </div>
                  </div>

                  <div className="hidden sm:block w-32 truncate text-sm text-muted-foreground">
                    {song.album && (
                      <Link
                        href={`/albums/${song.album.slug}`}
                        className="hover:underline"
                      >
                        {song.album.title}
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-16 justify-end">
                    <button className="opacity-0 group-hover:opacity-100">
                      <Heart className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {formatResolvedDuration(undefined, song.duration_seconds, song.duration_formatted)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Playlists */}
            {(mood.related_playlists?.length ?? 0) > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4">Related Playlists</h3>
                <div className="space-y-3">
                  {(mood.related_playlists ?? []).map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={`/playlists/${playlist.slug}`}
                      className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        {playlist.artwork_url ? (
                          <Image
                            src={playlist.artwork_url}
                            alt={playlist.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Music className="w-5 h-5 m-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{playlist.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {playlist.tracks_count} tracks
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Moods */}
            {(mood.related_moods?.length ?? 0) > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4">Similar Moods</h3>
                <div className="flex flex-wrap gap-2">
                  {(mood.related_moods ?? []).map((relatedMood) => {
                    const RelatedIcon = moodIcon(relatedMood.slug);
                    return (
                      <Link
                        key={relatedMood.id}
                        href={`/moods/${relatedMood.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border hover:border-primary transition-colors"
                        style={{ borderColor: `${relatedMood.color}50` }}
                      >
                        <RelatedIcon className="h-4 w-4" strokeWidth={1.75} style={{ color: relatedMood.color }} />
                        <span>{relatedMood.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
