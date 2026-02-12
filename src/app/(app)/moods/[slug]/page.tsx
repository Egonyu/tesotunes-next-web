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
import { formatDuration, formatNumber } from "@/lib/utils";

interface MoodDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  gradient?: string;
  image_url?: string;
  songs_count: number;
  total_duration: number;
  songs: {
    id: number;
    title: string;
    slug: string;
    duration: number;
    play_count: number;
    cover_url: string | null;
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
  related_playlists: {
    id: number;
    name: string;
    slug: string;
    cover_url: string | null;
    tracks_count: number;
  }[];
  related_moods: {
    id: number;
    name: string;
    slug: string;
    color: string;
  }[];
}

const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  energetic: "⚡",
  chill: "😌",
  romantic: "💕",
  focused: "🎯",
  party: "🎉",
  workout: "💪",
  sleep: "😴",
  angry: "😤",
  peaceful: "🕊️",
  nostalgic: "📷",
  confident: "👑",
  melancholic: "🌧️",
};

export default function MoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: mood, isLoading } = useQuery({
    queryKey: ["mood", slug],
    queryFn: () => apiGet<MoodDetail>(`/api/content/moods/${slug}`),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-muted" />
        <div className="container mx-auto px-4 py-8 space-y-4">
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
      <div className="container mx-auto py-16 px-4 text-center">
        <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Mood Not Found</h1>
        <Link href="/moods" className="text-primary hover:underline">
          Browse All Moods
        </Link>
      </div>
    );
  }

  const emoji = moodEmojis[mood.slug] || "🎵";

  return (
    <div>
      {/* Hero Header */}
      <div
        className="relative py-16 md:py-24"
        style={{
          background: mood.gradient || `linear-gradient(135deg, ${mood.color}, ${mood.color}80)`,
        }}
      >
        {mood.image_url && (
          <Image
            src={mood.image_url}
            alt={mood.name}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href="/moods"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            All Moods
          </Link>

          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-6xl md:text-8xl">
              {emoji}
            </div>

            <div className="text-white">
              <p className="text-sm uppercase tracking-wider opacity-80 mb-2">Mood</p>
              <h1 className="text-4xl md:text-6xl font-bold mb-3">{mood.name}</h1>
              <p className="text-white/80 max-w-xl mb-4">{mood.description}</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{formatNumber(mood.songs_count)} songs</span>
                <span>•</span>
                <span>{formatDuration(mood.total_duration)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <button className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform">
              <Play className="h-5 w-5 ml-1" />
              Play All
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30">
              <Shuffle className="h-5 w-5" />
              Shuffle
            </button>
            <button className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
                      {song.cover_url ? (
                        <Image
                          src={song.cover_url}
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
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Playlists */}
            {mood.related_playlists.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4">Related Playlists</h3>
                <div className="space-y-3">
                  {mood.related_playlists.map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={`/playlists/${playlist.slug}`}
                      className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        {playlist.cover_url ? (
                          <Image
                            src={playlist.cover_url}
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
            {mood.related_moods.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-4">Similar Moods</h3>
                <div className="flex flex-wrap gap-2">
                  {mood.related_moods.map((relatedMood) => {
                    const relatedEmoji = moodEmojis[relatedMood.slug] || "🎵";
                    return (
                      <Link
                        key={relatedMood.id}
                        href={`/moods/${relatedMood.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border hover:border-primary transition-colors"
                        style={{ borderColor: `${relatedMood.color}50` }}
                      >
                        <span>{relatedEmoji}</span>
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
