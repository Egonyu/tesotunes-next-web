"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, MoreHorizontal, Music } from "lucide-react";
import { apiGet } from "@/lib/api";
import { usePlayerStore } from "@/stores";
import { formatDuration } from "@/lib/utils";
import type { Song, PaginatedResponse } from "@/types";

interface SongGridProps {
  type: "trending" | "new" | "recent" | "top";
  limit?: number;
}

export function SongGrid({ type, limit = 10 }: SongGridProps) {
  const { play, currentSong, isPlaying, pause, resume } = usePlayerStore();

  const sortMap: Record<string, string> = {
    trending: "-play_count",
    new: "-created_at",
    recent: "-updated_at",
    top: "-play_count",
  };

  const { data, isLoading } = useQuery({
    queryKey: ["songs", type, limit],
    queryFn: () =>
      apiGet<PaginatedResponse<Song>>("/api/songs", { params: { limit, sort: sortMap[type] } }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const songs = data?.data || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {songs.map((song) => {
        const isCurrentSong = currentSong?.id === song.id;
        const isCurrentlyPlaying = isCurrentSong && isPlaying;

        return (
          <div
            key={song.id}
            className="group relative rounded-lg bg-card/50 p-3 transition-colors hover:bg-card"
          >
            {/* Artwork */}
            <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted">
              {song.artwork_url ? (
                <Image
                  src={song.artwork_url}
                  alt={song.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Play Button Overlay */}
              <button
                onClick={() => handlePlay(song)}
                className={`absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all ${
                  isCurrentlyPlaying
                    ? "opacity-100"
                    : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                }`}
              >
                {isCurrentlyPlaying ? (
                  <span className="flex items-center gap-0.5">
                    <span className="w-0.5 h-3 bg-primary-foreground animate-pulse" />
                    <span className="w-0.5 h-4 bg-primary-foreground animate-pulse delay-75" />
                    <span className="w-0.5 h-2 bg-primary-foreground animate-pulse delay-150" />
                  </span>
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </button>
            </div>

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
                <span className="text-xs text-muted-foreground">
                  {formatDuration(song.duration || 0)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:text-primary">
                    <Heart className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:text-primary">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
