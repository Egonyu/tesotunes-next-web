import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, ListMusic, Lock, Play } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Playlist, PaginatedResponse } from "@/types";
import { formatNumber } from "@/lib/utils";
import { CreatePlaylistButton } from "./create-playlist-button";

export const dynamic = "force-dynamic";

async function getPlaylists(page = 1, limit = 24) {
  try {
    return await serverFetch<PaginatedResponse<Playlist>>(
      `/playlists?page=${page}&limit=${limit}`
    );
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  }
}

async function getFeaturedPlaylists(): Promise<Playlist[]> {
  try {
    const res = await serverFetch<{ data: Playlist[] }>("/playlists?limit=5&sort=-follower_count");
    return res.data ?? [];
  } catch {
    return [];
  }
}

const CATEGORY_TABS = ["All", "Featured", "Trending", "Chill", "Party", "Workout", "Focus"];

// ── Playlist card ──────────────────────────────────────────────────────────
function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const isPublic =
    playlist.visibility === "public" || playlist.is_public === true;
  const owner = playlist.owner ?? playlist.user;
  const songCount = playlist.song_count ?? playlist.track_count ?? 0;

  return (
    <Link
      href={`/playlists/${playlist.slug || playlist.id}`}
      className="group relative flex flex-col rounded-2xl bg-card/60 border border-border/50 hover:border-border hover:bg-card transition-all overflow-hidden"
    >
      {/* Artwork */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {playlist.artwork_url ? (
          <Image
            src={playlist.artwork_url}
            alt={playlist.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
            <ListMusic className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}

        {/* Hover play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
          {playlist.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isPublic ? <Globe className="h-3 w-3 shrink-0" /> : <Lock className="h-3 w-3 shrink-0" />}
          <span>{songCount} songs</span>
          {playlist.follower_count > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{formatNumber(playlist.follower_count)} followers</span>
            </>
          )}
        </div>
        {owner && (
          <p className="text-[11px] text-muted-foreground/60 truncate">by {owner.name}</p>
        )}
      </div>
    </Link>
  );
}

// ── Podium card ────────────────────────────────────────────────────────────
function PodiumPlaylistCard({
  playlist,
  rank,
  featured,
}: {
  playlist: Playlist;
  rank: number;
  featured?: boolean;
}) {
  const songCount = playlist.song_count ?? playlist.track_count ?? 0;

  return (
    <Link
      href={`/playlists/${playlist.slug || playlist.id}`}
      className={`relative group flex flex-col items-center text-center rounded-3xl border transition-all ${
        featured
          ? "bg-linear-to-br from-primary/15 to-card border-primary/30 hover:border-primary/50 p-8 scale-105 z-10"
          : "bg-card/60 border-border hover:border-border/80 p-6 mt-8"
      }`}
    >
      {/* Rank watermark */}
      <div
        className={`absolute select-none font-black italic pointer-events-none ${
          featured
            ? "-top-10 left-1/2 -translate-x-1/2 text-9xl text-primary/10"
            : "-top-7 left-1/2 -translate-x-1/2 text-7xl text-foreground/8"
        }`}
      >
        {rank}
      </div>

      {/* Artwork */}
      <div
        className={`relative mb-5 overflow-hidden rounded-2xl shadow-2xl group-hover:scale-[1.03] transition-transform duration-500 ${
          featured ? "h-52 w-52 border-2 border-primary/20" : "h-44 w-44"
        }`}
      >
        {playlist.artwork_url ? (
          <Image src={playlist.artwork_url} alt={playlist.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ListMusic className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        className={`font-black truncate w-full mb-1 ${
          featured ? "text-xl text-primary" : "text-lg"
        }`}
      >
        {playlist.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-1">{songCount} songs</p>
      {playlist.follower_count > 0 && (
        <p className="text-xs text-muted-foreground/50 mb-5">
          {formatNumber(playlist.follower_count)} followers
        </p>
      )}

      {/* Play button */}
      <div
        className={`flex items-center justify-center rounded-full transition-all shadow-lg group-hover:scale-110 ${
          featured
            ? "h-14 w-14 bg-primary shadow-primary/30"
            : "h-12 w-12 bg-foreground/10 hover:bg-primary"
        }`}
      >
        <Play className={`h-5 w-5 fill-current ml-0.5 ${featured ? "text-primary-foreground" : "text-foreground group-hover:text-primary-foreground"}`} />
      </div>
    </Link>
  );
}

// ── Featured podium section ────────────────────────────────────────────────
async function FeaturedPodium() {
  const playlists = await getFeaturedPlaylists();
  if (playlists.length < 3) return null;

  const [first, second, third] = playlists;

  return (
    <section className="px-8 pt-12 pb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
          Featured Playlists
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
        <div className="order-2 md:order-1">
          <PodiumPlaylistCard playlist={second} rank={2} />
        </div>
        <div className="order-1 md:order-2">
          <PodiumPlaylistCard playlist={first} rank={1} featured />
        </div>
        <div className="order-3">
          <PodiumPlaylistCard playlist={third} rank={3} />
        </div>
      </div>
    </section>
  );
}

// ── All playlists grid ─────────────────────────────────────────────────────
async function AllPlaylists() {
  const { data: playlists } = await getPlaylists();

  if (playlists.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <ListMusic className="h-14 w-14 mx-auto mb-4 opacity-30" />
        <p className="font-medium">No playlists yet</p>
        <p className="text-sm mt-1">Be the first to create one</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}

function PlaylistGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl overflow-hidden">
          <div className="aspect-square bg-muted" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PlaylistsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[42vh] min-h-80 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/8 to-background" />
        {/* Decorative ring */}
        <div className="absolute -top-32 -right-32 h-125 w-125 rounded-full border border-primary/10 opacity-60" />
        <div className="absolute -top-16 -right-16 h-80 w-80 rounded-full border border-primary/8 opacity-40" />

        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        <div className="relative z-10 px-8 pb-8 w-full flex flex-col md:flex-row items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded">
                Playlists
              </span>
              <span className="text-xs text-muted-foreground/60">Curated for you</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-3">
              Discover
              <br />
              <span className="text-primary">Playlists</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Find the perfect soundtrack for every moment — from morning vibes to late-night sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <CreatePlaylistButton />
          </div>
        </div>
      </section>

      {/* Sticky category tabs */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-8 py-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {CATEGORY_TABS.map((tab, i) => (
            <button
              key={tab}
              className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                i === 0
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Featured podium — only renders if there are ≥3 featured */}
      <Suspense
        fallback={
          <div className="h-72 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <FeaturedPodium />
      </Suspense>

      {/* All playlists grid */}
      <section className="px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-border/50" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Browse All
            </h2>
          </div>
        </div>

        <Suspense fallback={<PlaylistGridSkeleton />}>
          <AllPlaylists />
        </Suspense>
      </section>
    </div>
  );
}
