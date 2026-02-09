import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ListMusic, Plus, Globe, Lock } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Playlist, PaginatedResponse } from "@/types";

async function getPlaylists(page = 1, limit = 20) {
  try {
    return await serverFetch<PaginatedResponse<Playlist>>(
      `/playlists?page=${page}&limit=${limit}`
    );
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  }
}

async function getFeaturedPlaylists() {
  try {
    return await serverFetch<Playlist[]>("/playlists/featured");
  } catch {
    return [];
  }
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link
      href={`/playlists/${playlist.slug || playlist.id}`}
      className="group p-3 rounded-lg bg-card/50 hover:bg-card transition-colors"
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted shadow-md">
        {playlist.artwork_url ? (
          <Image
            src={playlist.artwork_url}
            alt={playlist.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
            <ListMusic className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <h3 className="font-medium truncate group-hover:text-primary transition-colors">
        {playlist.name}
      </h3>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {playlist.is_public ? (
          <Globe className="h-3 w-3" />
        ) : (
          <Lock className="h-3 w-3" />
        )}
        <span>{playlist.song_count || 0} songs</span>
      </div>
      {playlist.user && (
        <p className="text-xs text-muted-foreground mt-1 truncate">
          by {playlist.user.name}
        </p>
      )}
    </Link>
  );
}

function PlaylistGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="p-3 animate-pulse">
          <div className="aspect-square bg-muted rounded-md mb-3" />
          <div className="h-4 w-3/4 bg-muted rounded mb-2" />
          <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

async function FeaturedPlaylists() {
  const playlists = await getFeaturedPlaylists();

  if (playlists.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">Featured Playlists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.slice(0, 3).map((playlist) => (
          <Link
            key={playlist.id}
            href={`/playlists/${playlist.slug || playlist.id}`}
            className="group relative h-40 rounded-xl overflow-hidden"
          >
            {playlist.artwork_url ? (
              <Image
                src={playlist.artwork_url}
                alt={playlist.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-primary to-primary/50" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-bold text-white">{playlist.name}</h3>
              <p className="text-sm text-white/70">
                {playlist.song_count || 0} songs
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function AllPlaylists() {
  const { data: playlists } = await getPlaylists();

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ListMusic className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No playlists available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}

export default function PlaylistsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Playlists</h1>
          <p className="text-muted-foreground mt-1">
            Discover curated playlists for every mood
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Create Playlist
        </button>
      </div>

      {/* Featured Playlists */}
      <Suspense
        fallback={
          <div className="h-40 bg-muted rounded-xl animate-pulse mb-8" />
        }
      >
        <FeaturedPlaylists />
      </Suspense>

      {/* Category Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "All",
          "Trending",
          "Workout",
          "Party",
          "Chill",
          "Focus",
          "Romance",
          "Throwback",
        ].map((category) => (
          <button
            key={category}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* All Playlists */}
      <section>
        <h2 className="text-xl font-bold mb-4">Browse Playlists</h2>
        <Suspense fallback={<PlaylistGridSkeleton />}>
          <AllPlaylists />
        </Suspense>
      </section>
    </div>
  );
}
