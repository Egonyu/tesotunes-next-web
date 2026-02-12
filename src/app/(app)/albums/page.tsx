import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Disc, Filter } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Album, PaginatedResponse } from "@/types";

async function getAlbums(page = 1, limit = 20) {
  try {
    return await serverFetch<PaginatedResponse<Album>>(
      `/api/albums?page=${page}&limit=${limit}`
    );
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  }
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`/albums/${album.slug || album.id}`}
      className="group p-3 rounded-lg bg-card/50 hover:bg-card transition-colors"
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted shadow-md">
        {album.artwork_url ? (
          <Image
            src={album.artwork_url}
            alt={album.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Disc className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <h3 className="font-medium truncate group-hover:text-primary transition-colors">
        {album.title}
      </h3>
      <p className="text-sm text-muted-foreground truncate">
        {album.artist?.name}
      </p>
      {album.release_date && (
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(album.release_date).getFullYear()}
        </p>
      )}
    </Link>
  );
}

function AlbumGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="p-3 animate-pulse">
          <div className="aspect-square bg-muted rounded-md mb-3" />
          <div className="h-4 w-3/4 bg-muted rounded mb-2" />
          <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

async function AlbumGrid() {
  const { data: albums } = await getAlbums();

  if (albums.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Disc className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No albums available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
  );
}

export default function AlbumsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Albums</h1>
          <p className="text-muted-foreground mt-1">
            Browse the latest albums from East African artists
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "New Releases", "Popular", "This Week", "This Month"].map(
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

      {/* Album Grid */}
      <Suspense fallback={<AlbumGridSkeleton />}>
        <AlbumGrid />
      </Suspense>
    </div>
  );
}
