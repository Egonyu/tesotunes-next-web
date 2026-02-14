"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Heart,
  MoreHorizontal,
  Music,
  Clock,
  Trophy,
  Flame,
  Star,
  Calendar,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDuration, formatNumber } from "@/lib/utils";

interface ChartSong {
  id: number;
  position: number;
  previous_position: number | null;
  peak_position: number;
  weeks_on_chart: number;
  song: {
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
  };
}

interface ChartData {
  title: string;
  description: string;
  updated_at: string;
  songs: ChartSong[];
}

type ChartType = "top-50" | "trending" | "new-releases" | "viral";

const chartTabs = [
  { id: "top-50", label: "Top 50", icon: Trophy },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "new-releases", label: "New Releases", icon: Star },
  { id: "viral", label: "Viral", icon: TrendingUp },
];

function PositionChange({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) {
    return (
      <span className="flex items-center gap-1 text-green-500 text-sm">
        <Star className="h-3 w-3" />
        NEW
      </span>
    );
  }

  const change = previous - current;

  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-green-500 text-sm">
        <TrendingUp className="h-3 w-3" />
        {change}
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="flex items-center gap-0.5 text-red-500 text-sm">
        <TrendingDown className="h-3 w-3" />
        {Math.abs(change)}
      </span>
    );
  }

  return (
    <span className="flex items-center text-muted-foreground text-sm">
      <Minus className="h-3 w-3" />
    </span>
  );
}

export default function ChartsPage() {
  const [activeChart, setActiveChart] = useState<ChartType>("top-50");

  const { data: chart, isLoading } = useQuery({
    queryKey: ["chart", activeChart],
    queryFn: () => apiGet<ChartData>(`/music/charts/${activeChart}`),
  });

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
        {chart && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Updated {new Date(chart.updated_at).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Chart Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {chartTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id as ChartType)}
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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[60px_1fr_auto_auto_auto] gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="hidden md:block w-20 text-center">Peak</span>
            <span className="hidden md:block w-20 text-center">Weeks</span>
            <span className="w-16 text-right">
              <Clock className="h-4 w-4 inline" />
            </span>
          </div>

          {/* Chart Songs */}
          {chart?.songs.map((entry, index) => (
            <div
              key={entry.id}
              className="grid grid-cols-[60px_1fr_auto_auto_auto] gap-4 px-4 py-3 hover:bg-muted/50 group items-center border-t"
            >
              {/* Position */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-xl font-bold ${
                    entry.position <= 3 ? "text-yellow-500" : ""
                  }`}
                >
                  {entry.position}
                </span>
                <PositionChange
                  current={entry.position}
                  previous={entry.previous_position}
                />
              </div>

              {/* Song Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden group-hover:shadow-lg transition-shadow">
                  {entry.song.cover_url ? (
                    <Image
                      src={entry.song.cover_url}
                      alt={entry.song.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Music className="w-5 h-5 m-3.5 text-muted-foreground" />
                  )}
                  <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  </button>
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/songs/${entry.song.slug}`}
                    className="font-medium truncate block hover:underline"
                  >
                    {entry.song.title}
                  </Link>
                  <Link
                    href={`/artists/${entry.song.artist.slug}`}
                    className="text-sm text-muted-foreground truncate block hover:underline"
                  >
                    {entry.song.artist.name}
                  </Link>
                </div>
                {entry.position <= 3 && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-linear-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 text-xs rounded-full font-medium">
                    {entry.position === 1 && "🥇"}
                    {entry.position === 2 && "🥈"}
                    {entry.position === 3 && "🥉"}
                    Top {entry.position}
                  </span>
                )}
              </div>

              {/* Peak Position */}
              <div className="hidden md:flex flex-col items-center w-20">
                <span className="text-sm font-medium">{entry.peak_position}</span>
                <span className="text-xs text-muted-foreground">Peak</span>
              </div>

              {/* Weeks on Chart */}
              <div className="hidden md:flex flex-col items-center w-20">
                <span className="text-sm font-medium">{entry.weeks_on_chart}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.weeks_on_chart === 1 ? "Week" : "Weeks"}
                </span>
              </div>

              {/* Duration & Actions */}
              <div className="flex items-center gap-3 w-16 justify-end">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground">
                  {formatDuration(entry.song.duration)}
                </span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <div className="bg-card rounded-lg border p-6 text-center">
          <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold">{chart?.songs.filter((s) => s.previous_position === null).length || 0}</p>
          <p className="text-sm text-muted-foreground">New Entries</p>
        </div>
        <div className="bg-card rounded-lg border p-6 text-center">
          <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
          <p className="text-2xl font-bold">
            {chart?.songs[0]?.weeks_on_chart || 0}
          </p>
          <p className="text-sm text-muted-foreground">Weeks at #1</p>
        </div>
        <div className="bg-card rounded-lg border p-6 text-center">
          <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{chart?.songs.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total Tracks</p>
        </div>
      </div>
    </div>
  );
}
