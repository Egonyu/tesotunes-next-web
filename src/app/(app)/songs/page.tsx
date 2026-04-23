"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Minus, Music, Search, TrendingDown, TrendingUp } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatNumber, formatResolvedDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores";
import type { Song, PaginatedResponse } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────
type FilterType = "all" | "trending" | "new-releases" | "top-played" | "most-liked";
type Trend = "up" | "down" | "stable" | "new";

// ── Config ─────────────────────────────────────────────────────────────────
const filterTabs = [
  {
    id: "all" as const,
    label: "All Songs",
    sort: "-id",
    description: "Every track from East African artists, freshest first.",
  },
  {
    id: "trending" as const,
    label: "Trending",
    sort: "-play_count",
    description: "The hottest tracks being streamed right now.",
  },
  {
    id: "new-releases" as const,
    label: "New Releases",
    sort: "-created_at",
    description: "Fresh drops — the newest music to hit TesoTunes.",
  },
  {
    id: "top-played" as const,
    label: "Top Played",
    sort: "-play_count",
    description: "All-time most streamed tracks on the platform.",
  },
  {
    id: "most-liked" as const,
    label: "Most Liked",
    sort: "-like_count",
    description: "Fan favourites — the tracks your people love most.",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function computeTrend(value: number, avg: number): Trend {
  if (value < 30) return "new";
  const ratio = avg > 0 ? value / avg : 1;
  if (ratio > 1.45) return "up";
  if (ratio < 0.55) return "down";
  return "stable";
}

// ── Trend cell ─────────────────────────────────────────────────────────────
function TrendCell({ trend }: { trend: Trend }) {
  if (trend === "up")
    return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (trend === "down")
    return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  if (trend === "new")
    return (
      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded">
        NEW
      </span>
    );
  return <Minus className="h-3.5 w-3.5 text-muted-foreground/30" />;
}

// ── Featured song card ─────────────────────────────────────────────────────
function FeaturedCard({
  song,
  onPlay,
  isCurrentlyPlaying,
}: {
  song: Song;
  onPlay: () => void;
  isCurrentlyPlaying: boolean;
}) {
  return (
    <div
      onClick={onPlay}
      className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer border border-border/50 hover:border-primary/30 transition-all"
    >
      {/* Artwork */}
      {song.artwork_url ? (
        <Image
          src={song.artwork_url}
          alt={song.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Music className="h-10 w-10 text-muted-foreground/30" />
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      {/* Play count — top right */}
      {song.play_count > 0 && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-[10px] font-black text-white/80">
          {formatNumber(song.play_count)}
        </div>
      )}

      {/* Explicit badge */}
      {song.is_explicit && (
        <div className="absolute top-3 left-3 px-1.5 py-0.5 rounded bg-white/20 text-[8px] font-black text-white uppercase tracking-wide">
          E
        </div>
      )}

      {/* Centre play button on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-100 scale-90 duration-300 ${isCurrentlyPlaying ? "bg-primary" : "bg-white/90"}`}>
          {isCurrentlyPlaying ? (
            <svg className="h-6 w-6 fill-primary-foreground" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-6 w-6 fill-black ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Link
          href={`/songs/${song.slug || song.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block font-black text-white truncate text-sm leading-tight hover:text-primary transition-colors"
        >
          {song.title}
        </Link>
        <Link
          href={`/artists/${song.artist?.slug || song.artist?.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block text-xs text-white/60 truncate mt-0.5 hover:text-white/80 transition-colors"
        >
          {song.artist?.name}
        </Link>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="px-8 space-y-2 pt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function SongsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { play, pause, resume, currentSong, isPlaying } = usePlayerStore();

  const activeTab = filterTabs.find((t) => t.id === activeFilter)!;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["browse-songs-infinite", activeFilter],
    queryFn: ({ pageParam }) =>
      apiGet<PaginatedResponse<Song>>("/songs", {
        params: { limit: 30, sort: activeTab.sort, page: pageParam },
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

  const avgPlayCount = useMemo(() => {
    if (songs.length === 0) return 1;
    return songs.reduce((sum, s) => sum + (s.play_count ?? 0), 0) / songs.length;
  }, [songs]);

  // Top 4 by plays for the featured cards section
  const featuredSongs = useMemo(
    () =>
      [...songs]
        .sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0))
        .slice(0, 4),
    [songs]
  );

  const filteredSongs = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist?.name.toLowerCase().includes(q)
    );
  }, [songs, search]);

  const topSong = songs[0];
  const totalSongs = data?.pages?.[0]?.meta?.total ?? 0;

  const INITIAL_ROWS = 12;
  const visibleSongs = showAll
    ? filteredSongs
    : filteredSongs.slice(0, search ? filteredSongs.length : INITIAL_ROWS);
  const hiddenCount = filteredSongs.length - visibleSongs.length;

  const showFeatured =
    !search &&
    featuredSongs.length >= 4 &&
    (activeFilter === "all" || activeFilter === "trending" || activeFilter === "top-played");

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      isPlaying ? pause() : resume();
    } else {
      play(song, songs);
    }
  };

  const switchFilter = (id: FilterType) => {
    setActiveFilter(id);
    setSearch("");
    setShowAll(false);
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative h-[38vh] min-h-72 flex items-end px-8 pb-8 overflow-hidden">
        {topSong?.artwork_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{
              backgroundImage: `url(${topSong.artwork_url})`,
              filter: "blur(4px) brightness(0.25)",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/5 to-background" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-background/10" />

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full border border-primary/10 -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute top-0 right-16 h-40 w-40 rounded-full border border-primary/8 -translate-y-1/3 opacity-30" />

        <div className="relative z-10 w-full flex flex-col md:flex-row items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Music Library
              </span>
              {totalSongs > 0 && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-[10px] text-muted-foreground/50 font-medium">
                    {formatNumber(totalSongs)} tracks
                  </span>
                </>
              )}
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-3">
              {activeTab.id === "all" ? (
                <>Browse <span className="text-primary">Songs</span></>
              ) : (
                <span>{activeTab.label}</span>
              )}
            </h1>

            <p className="text-sm text-muted-foreground max-w-lg">
              {activeTab.description}
            </p>
          </div>

          {topSong && (
            <div className="hidden md:block text-right shrink-0">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 mb-0.5">
                Top Track Plays
              </p>
              <p className="text-3xl font-black text-primary">
                {formatNumber(topSong.play_count ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1 truncate max-w-40 text-right">
                {topSong.title}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Sticky filter + search ─────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchFilter(tab.id)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  activeFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative shrink-0 w-56 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowAll(true); }}
              placeholder="Search songs..."
              className="w-full bg-muted/50 border border-border/50 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-muted placeholder:text-muted-foreground/40 text-foreground transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ───────────────────────────────────────── */}
      {isLoading && <Skeleton />}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!isLoading && songs.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Music className="h-14 w-14 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No songs found</p>
        </div>
      )}

      {/* ── Featured cards (2 × 2 grid) ────────────────────────────── */}
      {!isLoading && showFeatured && (
        <section className="px-8 pt-10 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
              Featured
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featuredSongs.map((song) => (
              <FeaturedCard
                key={song.id}
                song={song}
                onPlay={() => handlePlay(song)}
                isCurrentlyPlaying={currentSong?.id === song.id && isPlaying}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Song table ─────────────────────────────────────────────── */}
      {!isLoading && filteredSongs.length > 0 && (
        <section className="px-4 md:px-8 pb-12 pt-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
              {search ? `Results for "${search}"` : "All Tracks"}
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          {/* Column headers — desktop */}
          <div className="hidden md:grid grid-cols-[50px_50px_1fr_1fr_110px_70px] gap-2 px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <span>#</span>
            <span>Trend</span>
            <span>Title &amp; Artist</span>
            <span>Album</span>
            <span className="text-right">Plays</span>
            <span className="flex items-center justify-end">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v5l3 3" />
              </svg>
            </span>
          </div>

          {/* Rows */}
          <div className="space-y-0.5">
            {visibleSongs.map((song, idx) => {
              const rank = idx + 1;
              const isCurrentTrack = currentSong?.id === song.id;
              const trend = computeTrend(song.play_count ?? 0, avgPlayCount);

              return (
                <div
                  key={song.id}
                  className={`group grid grid-cols-[40px_1fr_60px] md:grid-cols-[50px_50px_1fr_1fr_110px_70px] gap-2 items-center px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrentTrack
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  {/* Rank / Play */}
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-sm font-black group-hover:hidden ${
                        isCurrentTrack ? "text-primary hidden" : "text-muted-foreground/50"
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
                          <Music className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link
                          href={`/songs/${song.slug || song.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-sm font-bold truncate transition-colors ${
                            isCurrentTrack
                              ? "text-primary"
                              : "hover:text-primary group-hover:text-primary"
                          }`}
                        >
                          {song.title}
                        </Link>
                        {song.is_explicit && (
                          <span className="shrink-0 px-1 py-0.5 text-[8px] font-black bg-muted text-muted-foreground rounded uppercase">
                            E
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <Link
                          href={`/artists/${song.artist?.slug || song.artist?.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-muted-foreground hover:underline truncate"
                        >
                          {song.artist?.name}
                        </Link>
                        {song.featured_artists && song.featured_artists.length > 0 && (
                          <span className="text-xs text-muted-foreground/50 truncate">
                            ft. {song.featured_artists.map((a) => a.name).join(", ")}
                          </span>
                        )}
                      </div>
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

                  {/* Plays — desktop */}
                  <div className="hidden md:flex items-center justify-end">
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {formatNumber(song.play_count ?? 0)}
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

          {/* Reveal hidden local rows */}
          {hiddenCount > 0 && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setShowAll(true)}
                className="flex flex-col items-center gap-3 group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 group-hover:text-foreground transition-colors">
                  Show {hiddenCount} more track{hiddenCount !== 1 ? "s" : ""}
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
