"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Music,
  Clock,
  Trophy,
  Flame,
  Star,
  TrendingUp,
  Download,
  Headphones,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDuration, formatNumber } from "@/lib/utils";
import { usePlayerStore } from "@/stores";
import type { Song, PaginatedResponse } from "@/types";

type ChartType = "top-50" | "most-liked" | "new-releases" | "most-downloaded";

const chartTabs = [
  { id: "top-50" as const, label: "Most Played", icon: Trophy, sort: "-play_count" },
  { id: "most-liked" as const, label: "Most Liked", icon: Heart, sort: "-like_count" },
  { id: "new-releases" as const, label: "New Releases", icon: Star, sort: "-created_at" },
  { id: "most-downloaded" as const, label: "Most Downloaded", icon: Download, sort: "-download_count" },
];

function getStatLabel(type: ChartType): string {
  switch (type) {
    case "top-50": return "plays";
    case "most-liked": return "likes";
    case "most-downloaded": return "downloads";
    case "new-releases": return "plays";
  }
}

function getStatValue(song: Song, type: ChartType): number {
  switch (type) {
    case "top-50": return song.play_count;
    case "most-liked": return song.like_count;
    case "most-downloaded": return song.download_count;
    case "new-releases": return song.play_count;
  }
}

export default function ChartsPage() {
  const [activeChart, setActiveChart] = useState<ChartType>("top-50");
  const { play, pause, resume, currentSong, isPlaying } = usePlayerStore();

  const activeTab = chartTabs.find((t) => t.id === activeChart)!;

  const { data, isLoading } = useQuery({
    queryKey: ["chart-songs", activeChart],
    queryFn: () =>
      apiGet<PaginatedResponse<Song>>("/songs", {
        params: { limit: 50, sort: activeTab.sort },
      }),
    staleTime: 2 * 60 * 1000,
  });

  const songs = data?.data || [];

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      isPlaying ? pause() : resume();
    } else {
      play(song, songs);
    }
  };

  // Stats from real data
  const totalPlays = songs.reduce((sum, s) => sum + s.play_count, 0);
  const totalLikes = songs.reduce((sum, s) => sum + s.like_count, 0);
  const totalDownloads = songs.reduce((sum, s) => sum + s.download_count, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
            Music Charts
          </h1>
          <p className="text-muted-foreground mt-2">
            The most played and trending songs on TesoTunes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {songs.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-6 text-center">
            <Headphones className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{formatNumber(totalPlays)}</p>
            <p className="text-sm text-muted-foreground">Total Plays</p>
          </div>
          <div className="bg-card rounded-lg border p-6 text-center">
            <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">{formatNumber(totalLikes)}</p>
            <p className="text-sm text-muted-foreground">Total Likes</p>
          </div>
          <div className="bg-card rounded-lg border p-6 text-center">
            <Download className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{formatNumber(totalDownloads)}</p>
            <p className="text-sm text-muted-foreground">Total Downloads</p>
          </div>
        </div>
      )}

      {/* Chart Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {chartTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeChart === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No songs available yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[50px_1fr_100px_80px] md:grid-cols-[50px_1fr_100px_100px_80px] gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="text-right">{getStatLabel(activeChart) === "plays" ? "Plays" : getStatLabel(activeChart) === "likes" ? "Likes" : "Downloads"}</span>
            <span className="hidden md:block text-right">{activeChart === "top-50" ? "Likes" : "Plays"}</span>
            <span className="text-right">
              <Clock className="h-4 w-4 inline" />
            </span>
          </div>

          {/* Chart Songs */}
          {songs.map((song, index) => {
            const position = index + 1;
            const isCurrentSong = currentSong?.id === song.id;
            const isCurrentlyPlaying = isCurrentSong && isPlaying;

            return (
              <div
                key={song.id}
                className="grid grid-cols-[50px_1fr_100px_80px] md:grid-cols-[50px_1fr_100px_100px_80px] gap-4 px-4 py-3 hover:bg-muted/50 group items-center border-t"
              >
                {/* Position */}
                <div className="text-center">
                  <span
                    className={`text-lg font-bold ${
                      position <= 3 ? "text-yellow-500" : "text-muted-foreground"
                    }`}
                  >
                    {position}
                  </span>
                </div>

                {/* Song Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded bg-muted shrink-0 overflow-hidden group-hover:shadow-lg transition-shadow">
                    {song.artwork_url ? (
                      <Image
                        src={song.artwork_url}
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Music className="w-5 h-5 m-3.5 text-muted-foreground" />
                    )}
                    <button
                      onClick={() => handlePlay(song)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="h-5 w-5 text-white" />
                      ) : (
                        <Play className="h-5 w-5 text-white ml-0.5" />
                      )}
                    </button>
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
                  {position <= 3 && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-linear-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 text-xs rounded-full font-medium">
                      {position === 1 && "🥇"}
                      {position === 2 && "🥈"}
                      {position === 3 && "🥉"}
                    </span>
                  )}
                </div>

                {/* Primary Stat */}
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {formatNumber(getStatValue(song, activeChart))}
                  </span>
                </div>

                {/* Play Count (always visible on md+) */}
                {activeChart !== "top-50" ? (
                  <div className="hidden md:block text-right">
                    <span className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                      <Headphones className="h-3 w-3" />
                      {formatNumber(song.play_count)}
                    </span>
                  </div>
                ) : (
                  <div className="hidden md:block text-right">
                    <span className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                      <Heart className="h-3 w-3" />
                      {formatNumber(song.like_count)}
                    </span>
                  </div>
                )}

                {/* Duration */}
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(song.duration_seconds || song.duration || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
