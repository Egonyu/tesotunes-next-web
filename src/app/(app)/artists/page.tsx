import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Filter, CheckCircle2 } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Artist, PaginatedResponse } from "@/types";

async function getArtists(page = 1, limit = 24) {
  try {
    return await serverFetch<PaginatedResponse<Artist>>(
      `/artists?page=${page}&limit=${limit}`
    );
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  }
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/artists/${artist.slug || artist.id}`}
      className="group p-4 rounded-lg bg-card/50 hover:bg-card transition-colors text-center"
    >
      <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40 mb-4 overflow-hidden rounded-full bg-muted shadow-md">
        {artist.avatar_url || artist.profile_image_url ? (
          <Image
            src={artist.avatar_url || artist.profile_image_url || ""}
            alt={artist.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-1">
        <h3 className="font-medium truncate group-hover:text-primary transition-colors">
          {artist.name}
        </h3>
        {artist.is_verified && (
          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {artist.follower_count?.toLocaleString() || 0} followers
      </p>
      {artist.genres && artist.genres.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {artist.genres.map(g => g.name).join(", ")}
        </p>
      )}
    </Link>
  );
}

function ArtistGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="p-4 animate-pulse text-center">
          <div className="mx-auto w-32 h-32 md:w-40 md:h-40 bg-muted rounded-full mb-4" />
          <div className="h-4 w-3/4 bg-muted rounded mx-auto mb-2" />
          <div className="h-3 w-1/2 bg-muted rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

async function ArtistGrid() {
  const { data: artists } = await getArtists();

  if (artists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No artists available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  );
}

export default function ArtistsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Artists</h1>
          <p className="text-muted-foreground mt-1">
            Discover talented East African artists and musicians
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Verified", "Trending", "New", "Most Followed"].map(
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

      {/* Artist Grid */}
      <Suspense fallback={<ArtistGridSkeleton />}>
        <ArtistGrid />
      </Suspense>
    </div>
  );
}
