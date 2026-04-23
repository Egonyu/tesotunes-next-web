"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Minus,
  Music,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatNumber, formatResolvedDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores";
import type { Song, PaginatedResponse } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────
type ChartType = "top-50" | "most-liked" | "most-downloaded" | "new-releases";
type Trend = "up" | "down" | "stable" | "new";

// ── Config ─────────────────────────────────────────────────────────────────
const chartTabs = [
  {
    id: "top-50" as const,
    label: "Daily Top 50",
    title: "Teso Daily Top 50",
    description:
      "Soroti's finest are topping the charts. Experience the tracks defining the African soundscape today.",
    sort: "-play_count",
    metricKey: "play_count" as const,
    metricLabel: "PLAYS",
  },
  {
    id: "most-liked" as const,
    label: "Weekly Charts",
    title: "Weekly Charts",
    description:
      "This week's most loved tracks by the TesoTunes community. Vote with your heart.",
    sort: "-like_count",
    metricKey: "like_count" as const,
    metricLabel: "LIKES",
  },
  {
    id: "most-downloaded" as const,
    label: "Monthly Hits",
    title: "Monthly Hits",
    description:
      "The biggest downloads of the month — tracks fans keep coming back to.",
    sort: "-download_count",
    metricKey: "download_count" as const,
    metricLabel: "DOWNLOADS",
  },
  {
    id: "new-releases" as const,
    label: "Viral Teso",
    title: "Viral Teso",
    description:
      "The newest tracks taking the platform by storm. Fresh drops, heavy rotation.",
    sort: "-created_at",
    metricKey: "play_count" as const,
    metricLabel: "PLAYS",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function getMetric(song: Song, key: (typeof chartTabs)[0]["metricKey"]): number {
  return (song[key] as number) ?? 0;
}

function computeTrend(value: number, avg: number): Trend {
  if (value < 30) return "new";
  const ratio = avg > 0 ? value / avg : 1;
  if (ratio > 1.45) return "up";
  if (ratio < 0.55) return "down";
  return "stable";
}

// ── Trend badges (for podium artwork corner) ───────────────────────────────
function PodiumBadge({ trend, rank }: { trend: Trend; rank: number }) {
  const base = "absolute bottom-3 right-3 h-10 w-10 rounded-full flex items-center justify-center shadow-xl border-2 border-card";
  if (rank === 1 || trend === "stable") {
    return (
      <span className={`${base} bg-primary`}>
        <TrendingUp className="h-4 w-4 text-primary-foreground" />
      </span>
    );
  }
  if (trend === "up") {
    return (
      <span className={`${base} bg-amber-500`}>
        <TrendingUp className="h-4 w-4 text-black" />
      </span>
    );
  }
  if (trend === "new") {
    return (
      <span className={`${base} bg-blue-500`}>
        <TrendingUp className="h-4 w-4 text-white" />
      </span>
    );
  }
  return (
    <span className={`${base} bg-red-500`}>
      <TrendingDown className="h-4 w-4 text-white" />
    </span>
  );
}

// ── Trend cell (for table rows) ────────────────────────────────────────────
function TrendCell({ trend }: { trend: Trend }) {
  if (trend === "up") {
    return (
      <span className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
        <TrendingUp className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="flex items-center gap-1 text-red-500 font-bold text-xs">
        <TrendingDown className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (trend === "new") {
    return (
      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded">
        NEW
      </span>
    );
  }
  return <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />;
}

// ── Podium card ────────────────────────────────────────────────────────────
function PodiumCard({
  song,
  rank,
  trend,
  metric,
  metricLabel,
  featured,
  onPlay,
  isCurrentlyPlaying,
}: {
  song: Song;
  rank: number;
  trend: Trend;
  metric: number;
  metricLabel: string;
  featured?: boolean;
  onPlay: () => void;
  isCurrentlyPlaying: boolean;
}) {
  return (
    <div
      className={`relative group flex flex-col rounded-3xl border transition-all overflow-hidden ${
        featured
          ? "bg-card border-primary/20 hover:border-primary/40 p-6"
          : "bg-card/70 border-border hover:border-border/80 p-5 mt-10"
      }`}
    >
      {/* Rank — top right corner, italic #N */}
      <div
        className={`absolute top-4 right-5 font-black italic select-none pointer-events-none leading-none ${
          featured ? "text-6xl text-foreground/12" : "text-5xl text-foreground/10"
        }`}
      >
        #{rank}
      </div>

      {/* Artwork */}
      <div
        className={`relative self-center mb-5 overflow-hidden rounded-2xl shadow-xl group-hover:scale-[1.02] transition-transform duration-500 ${
          featured ? "h-60 w-60" : "h-52 w-52"
        }`}
      >
        {song.artwork_url ? (
          <Image
            src={song.artwork_url}
            alt={song.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Music className="h-14 w-14 text-muted-foreground/30" />
          </div>
        )}

        {/* Circular trend badge — bottom-right of artwork */}
        <PodiumBadge trend={trend} rank={rank} />
      </div>

      {/* Title */}
      <h3
        className={`font-black truncate mb-0.5 ${
          featured ? "text-xl text-primary" : "text-lg text-foreground"
        }`}
      >
        {song.title}
      </h3>
      <p className="text-sm text-muted-foreground truncate mb-5">
        {song.artist.name}
      </p>

      {/* Stats — two columns with pipe separator */}
      <div className="flex items-center gap-0 mb-5">
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
            {metricLabel}
          </span>
          <span className="text-base font-black tabular-nums">
            {formatNumber(metric)}
          </span>
        </div>
        <div className="w-px h-8 bg-border/60" />
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
            PEAK
          </span>
          <span className="text-base font-black tabular-nums">{rank}</span>
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={onPlay}
        className={`self-center flex items-center justify-center rounded-full transition-all shadow-lg group-hover:scale-110 ${
          featured
            ? "h-14 w-14 bg-primary shadow-primary/20"
            : "h-12 w-12 bg-foreground/10 hover:bg-primary hover:shadow-primary/20"
        }`}
        aria-label={isCurrentlyPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
      >
        {isCurrentlyPlaying ? (
          <svg
            className={`h-5 w-5 ${featured ? "fill-primary-foreground" : "fill-foreground group-hover:fill-primary-foreground"}`}
            viewBox="0 0 24 24"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg
            className={`h-5 w-5 ml-0.5 ${featured ? "fill-primary-foreground" : "fill-foreground group-hover:fill-primary-foreground"}`}
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ChartsPage() {
  const [activeChart, setActiveChart] = useState<ChartType>("top-50");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { play, pause, resume, currentSong, isPlaying } = usePlayerStore();

  const activeTab = chartTabs.find((t) => t.id === activeChart)!;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    // distinct key from the old useQuery cache to avoid shape mismatch
    queryKey: ["chart-songs-infinite", activeChart],
    queryFn: ({ pageParam }) =>
      apiGet<PaginatedResponse<Song>>("/songs", {
        params: { limit: 50, sort: activeTab.sort, page: pageParam },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage?.meta?.current_page;
      const last = lastPage?.meta?.last_page;
      if (!current || !last || current >= last) return undefined;
      return current + 1;
    },
    staleTime: 2 * 60 * 1000,
  });

  const songs = useMemo(
    () => data?.pages?.flatMap((p) => p?.data ?? []) ?? [],
    [data]
  );

  const avgMetric = useMemo(() => {
    if (songs.length === 0) return 1;
    return (
      songs.reduce((sum, s) => sum + getMetric(s, activeTab.metricKey), 0) /
      songs.length
    );
  }, [songs, activeTab.metricKey]);

  const filteredSongs = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.name.toLowerCase().includes(q)
    );
  }, [songs, search]);

  const totalMetric = songs.reduce(
    (sum, s) => sum + getMetric(s, activeTab.metricKey),
    0
  );

  const topSong = songs[0];
  const topThree = songs.slice(0, 3);

  // Table rows = rank 4+ (after podium), but show all when searching
  const tableStartIndex = search ? 0 : 3;
  const tableRows = filteredSongs.slice(tableStartIndex);
  const visibleRows = showAll ? tableRows : tableRows.slice(0, search ? 20 : 7);
  const hiddenCount = tableRows.length - visibleRows.length;

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      isPlaying ? pause() : resume();
    } else {
      play(song, songs);
    }
  };

  // Reset show-all & search when switching tabs
  const switchTab = (id: ChartType) => {
    setActiveChart(id);
    setSearch("");
    setShowAll(false);
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative h-[45vh] min-h-96 flex items-end px-8 pb-8 overflow-hidden">
        {/* Background */}
        {topSong?.artwork_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{
              backgroundImage: `url(${topSong.artwork_url})`,
              filter: "blur(3px) brightness(0.28)",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-primary/10 to-background" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/65 to-background/10" />

        <div className="relative z-10 w-full flex flex-col md:flex-row items-end justify-between gap-6">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-widest">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Trending Now
              </span>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-[10px] text-muted-foreground/50 font-medium">
                Last Updated: Today
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
              {activeTab.title}
            </h1>

            <p className="text-sm text-muted-foreground max-w-lg mb-6">
              {activeTab.description}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => topSong && handlePlay(topSong)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-full font-bold text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <svg className="h-4 w-4 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Listen Now
              </button>
              <button className="px-6 py-3 rounded-full border border-white/20 text-sm font-bold hover:bg-white/10 transition-colors">
                View Full Chart
              </button>
            </div>
          </div>

          {/* Right: featured top track card */}
          {topSong && (
            <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {topSong.artwork_url ? (
                  <Image
                    src={topSong.artwork_url}
                    alt={topSong.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Music className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                    Top {activeTab.metricLabel}
                  </span>
                  <p className="text-sm font-black text-white truncate leading-tight">
                    {topSong.title}
                  </p>
                  <p className="text-[10px] text-white/60 truncate">
                    {topSong.artist.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 mb-0.5">
                  Total Chart {activeTab.metricLabel}
                </p>
                <p className="text-3xl font-black text-primary">
                  {formatNumber(totalMetric)}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Sticky tabs + search ───────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {chartTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  activeChart === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative shrink-0 w-56 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chart..."
              className="w-full bg-muted/50 border border-border/50 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-muted placeholder:text-muted-foreground/40 text-foreground transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ───────────────────────────────────────── */}
      {isLoading && (
        <div className="px-8 pt-12 space-y-3">
          <div className="grid grid-cols-3 gap-5 max-w-3xl mx-auto mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-3xl bg-muted animate-pulse ${i === 1 ? "h-72 mt-8" : "h-64 mt-8"}`}
              />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!isLoading && songs.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Music className="h-14 w-14 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No songs in this chart yet</p>
          <p className="text-sm mt-1">Check back soon</p>
        </div>
      )}

      {/* ── Top 3 Podium ───────────────────────────────────────────── */}
      {!isLoading && topThree.length >= 3 && !search && (
        <section className="px-8 pt-12 pb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
              This Week&apos;s Top 3
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* #2 — left */}
            <div className="order-2 md:order-1">
              <PodiumCard
                song={topThree[1]}
                rank={2}
                trend={computeTrend(getMetric(topThree[1], activeTab.metricKey), avgMetric)}
                metric={getMetric(topThree[1], activeTab.metricKey)}
                metricLabel={activeTab.metricLabel}
                onPlay={() => handlePlay(topThree[1])}
                isCurrentlyPlaying={currentSong?.id === topThree[1].id && isPlaying}
              />
            </div>
            {/* #1 — center */}
            <div className="order-1 md:order-2">
              <PodiumCard
                song={topThree[0]}
                rank={1}
                trend={computeTrend(getMetric(topThree[0], activeTab.metricKey), avgMetric)}
                metric={getMetric(topThree[0], activeTab.metricKey)}
                metricLabel={activeTab.metricLabel}
                featured
                onPlay={() => handlePlay(topThree[0])}
                isCurrentlyPlaying={currentSong?.id === topThree[0].id && isPlaying}
              />
            </div>
            {/* #3 — right */}
            <div className="order-3">
              <PodiumCard
                song={topThree[2]}
                rank={3}
                trend={computeTrend(getMetric(topThree[2], activeTab.metricKey), avgMetric)}
                metric={getMetric(topThree[2], activeTab.metricKey)}
                metricLabel={activeTab.metricLabel}
                onPlay={() => handlePlay(topThree[2])}
                isCurrentlyPlaying={currentSong?.id === topThree[2].id && isPlaying}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Chart table ────────────────────────────────────────────── */}
      {!isLoading && tableRows.length > 0 && (
        <section className="px-4 md:px-8 pb-12">
          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
              {search ? "Search Results" : "Full Chart"}
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          {/* Column headers — desktop */}
          <div className="hidden md:grid grid-cols-[50px_50px_1fr_1fr_80px_110px_70px] gap-2 px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <span>Rank</span>
            <span>Trend</span>
            <span>Title &amp; Artist</span>
            <span>Album</span>
            <span className="text-center">Peak</span>
            <span className="text-right">{activeTab.metricLabel}</span>
            <span className="flex items-center justify-end">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v5l3 3" />
              </svg>
            </span>
          </div>

          {/* Rows */}
          <div className="space-y-0.5">
            {visibleRows.map((song, idx) => {
              const rank = tableStartIndex + idx + 1;
              const isCurrentTrack = currentSong?.id === song.id;
              const trend = computeTrend(
                getMetric(song, activeTab.metricKey),
                avgMetric
              );
              const metric = getMetric(song, activeTab.metricKey);

              return (
                <div
                  key={song.id}
                  className={`group grid grid-cols-[40px_1fr_60px] md:grid-cols-[50px_50px_1fr_1fr_80px_110px_70px] gap-2 items-center px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrentTrack
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  {/* Rank / Play */}
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-sm font-black group-hover:hidden ${
                        isCurrentTrack
                          ? "text-primary hidden"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {String(rank).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => handlePlay(song)}
                      className={`${
                        isCurrentTrack ? "flex" : "hidden group-hover:flex"
                      } items-center justify-center text-primary hover:scale-110 transition-transform`}
                      aria-label={
                        isCurrentTrack && isPlaying
                          ? `Pause ${song.title}`
                          : `Play ${song.title}`
                      }
                    >
                      {isCurrentTrack && isPlaying ? (
                        <svg className="h-5 w-5 fill-primary" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 fill-primary" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Trend — desktop */}
                  <div className="hidden md:flex items-center justify-center">
                    <TrendCell trend={trend} />
                  </div>

                  {/* Title & Artist */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted shadow-sm">
                      {song.artwork_url ? (
                        <Image
                          src={song.artwork_url}
                          alt={song.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/songs/${song.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-sm font-bold truncate block transition-colors ${
                          isCurrentTrack
                            ? "text-primary"
                            : "hover:text-primary group-hover:text-primary"
                        }`}
                      >
                        {song.title}
                      </Link>
                      <Link
                        href={`/artists/${song.artist.slug || song.artist.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted-foreground hover:underline truncate block"
                      >
                        {song.artist.name}
                      </Link>
                    </div>
                  </div>

                  {/* Album — desktop */}
                  <div className="hidden md:block min-w-0">
                    {song.album ? (
                      <Link
                        href={`/albums/${song.album.slug || song.album.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted-foreground hover:underline truncate block"
                      >
                        {song.album.title}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground/30">—</span>
                    )}
                  </div>

                  {/* Peak — desktop */}
                  <div className="hidden md:flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground/60 tabular-nums">
                      {rank}
                    </span>
                  </div>

                  {/* Metric — desktop */}
                  <div className="hidden md:flex items-center justify-end">
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {formatNumber(metric)}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-end">
                    <span className="text-xs text-muted-foreground font-mono tabular-nums">
                      {formatResolvedDuration(
                        undefined,
                        song.duration_seconds,
                        song.duration_formatted
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reveal hidden local tracks */}
          {hiddenCount > 0 && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setShowAll(true)}
                className="flex flex-col items-center gap-3 group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 group-hover:text-foreground transition-colors">
                  Show {hiddenCount} remaining track{hiddenCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center justify-center h-10 w-10 rounded-full border border-border group-hover:border-primary group-hover:text-primary text-muted-foreground/50 transition-all">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          )}

          {/* Load more from API */}
          {showAll && !hiddenCount && hasNextPage && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-border hover:border-primary/50 bg-card/60 hover:bg-card transition-all group disabled:opacity-60 disabled:pointer-events-none"
              >
                {isFetchingNextPage ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
                      Loading…
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground group-hover:text-foreground transition-colors">
                      Load More Songs
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
