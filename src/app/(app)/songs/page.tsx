import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Music, Filter, Play, Clock } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Song, PaginatedResponse } from "@/types";
import { formatDuration } from "@/lib/utils";

async function getSongs(page = 1, limit = 30) {
  try {
    return await serverFetch<PaginatedResponse<Song>>(
      `/api/songs?page=${page}&limit=${limit}`
    );
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  }
}

function SongRow({ song, index }: { song: Song; index: number }) {
  return (
    <Link
      href={`/songs/${song.slug || song.id}`}
      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      {/* Index */}
      <span className="w-8 text-center text-muted-foreground group-hover:hidden">
        {index + 1}
      </span>
      <span className="w-8 text-center hidden group-hover:block">
        <Play className="h-4 w-4 mx-auto" />
      </span>

      {/* Artwork */}
      <div className="relative w-12 h-12 overflow-hidden rounded bg-muted flex-shrink-0">
        {song.artwork_url ? (
          <Image
            src={song.artwork_url}
            alt={song.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate group-hover:text-primary transition-colors">
          {song.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist?.name}
          {song.featured_artists && song.featured_artists.length > 0 && (
            <span> feat. {song.featured_artists.map(a => a.name).join(", ")}</span>
          )}
        </p>
      </div>

      {/* Album */}
      <div className="hidden md:block w-48 truncate text-sm text-muted-foreground">
        {song.album?.title || "-"}
      </div>

      {/* Play Count */}
      <div className="hidden lg:block w-24 text-right text-sm text-muted-foreground">
        {song.play_count?.toLocaleString() || 0}
      </div>

      {/* Duration */}
      <div className="w-16 text-right text-sm text-muted-foreground flex items-center justify-end gap-1">
        <Clock className="h-3 w-3" />
        {formatDuration(song.duration || 0)}
      </div>
    </Link>
  );
}

function SongGridSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
          <div className="w-8 h-4 bg-muted rounded" />
          <div className="w-12 h-12 bg-muted rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
          <div className="hidden md:block w-24 h-4 bg-muted rounded" />
          <div className="w-12 h-4 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

async function SongList() {
  const { data: songs } = await getSongs();

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No songs available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Row */}
      <div className="flex items-center gap-4 px-3 py-2 text-sm text-muted-foreground border-b mb-2">
        <span className="w-8 text-center">#</span>
        <span className="w-12" />
        <span className="flex-1">Title</span>
        <span className="hidden md:block w-48">Album</span>
        <span className="hidden lg:block w-24 text-right">Plays</span>
        <span className="w-16 text-right">Duration</span>
      </div>

      {/* Song Rows */}
      <div className="space-y-1">
        {songs.map((song, index) => (
          <SongRow key={song.id} song={song} index={index} />
        ))}
      </div>
    </div>
  );
}

export default function SongsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Songs</h1>
          <p className="text-muted-foreground mt-1">
            Browse all songs from East African artists
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Trending", "New Releases", "Top Played", "This Week"].map(
          (filter) => (
            <button
              key={filter}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {/* Song List */}
      <Suspense fallback={<SongGridSkeleton />}>
        <SongList />
      </Suspense>
    </div>
  );
}
