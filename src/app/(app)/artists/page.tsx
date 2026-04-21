import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { User, Filter, CheckCircle2, Sparkles } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Artist, PaginatedResponse } from "@/types";
import { pickMediaUrl } from "@/lib/media";
import { InitialsAvatar, SafeImage } from "@/components/ui/safe-image";

// Render on-demand so the build doesn't depend on the API being available
export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const { page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const isPaginated = currentPage > 1

  return {
    title: isPaginated ? `Artists — Page ${currentPage}` : 'Artists',
    description: 'Discover East African artists on TesoTunes — stream their music, follow their journey.',
    alternates: { canonical: '/artists' },
    robots: isPaginated ? { index: false, follow: true } : { index: true, follow: true },
  }
}

async function getArtists(page = 1, limit = 24) {
  try {
    return await serverFetch<PaginatedResponse<Artist>>(
      `/artists?page=${page}&per_page=${limit}`
    );
  } catch (error) {
    console.error('Failed to fetch artists:', error);
    return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  }
}

async function getClaimableArtists(limit = 6) {
  try {
    return await serverFetch<PaginatedResponse<Artist>>(
      `/catalog/claimable-artists?claimable_only=1&per_page=${limit}`
    );
  } catch (error) {
    console.error('Failed to fetch claimable artists:', error);
    return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  }
}

function ArtistCard({ artist }: { artist: Artist }) {
  const imageSrc = pickMediaUrl(
    artist.avatar_url,
    artist.profile_image_url,
    artist.cover_url,
    artist.cover_image_url
  );

  return (
    <Link
      href={`/artists/${artist.slug || artist.id}`}
      className="group p-4 rounded-lg bg-card/50 hover:bg-card transition-colors text-center"
    >
      <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40 mb-4 overflow-hidden rounded-full bg-muted shadow-md">
        {imageSrc ? (
          <SafeImage
            src={imageSrc}
            alt={artist.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            fallback={<InitialsAvatar name={artist.name} textClassName="text-5xl font-normal" />}
          />
        ) : (
          <InitialsAvatar name={artist.name} textClassName="text-5xl font-normal" />
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
      {artist.is_placeholder && artist.claim_status === "unclaimed" && (
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-amber-600">
          Claimable profile
        </p>
      )}
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
  const { data: claimableArtists } = await getClaimableArtists();

  if (artists.length === 0 && claimableArtists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No artists available</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {claimableArtists.length > 0 && (
        <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Claimable Profiles
              </div>
              <h2 className="text-2xl font-bold">Artists uploaded on behalf of offline talent</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                If one of these profiles belongs to you, open it and submit a claim request for review.
              </p>
            </div>
            <Link href="/claim-artist" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Start a claim
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
            {claimableArtists.map((artist) => (
              <ArtistCard key={`claimable-${artist.id}`} artist={artist} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">All Artists</h2>
          <Link href="/claim-artist" className="text-sm font-medium text-primary hover:underline">
            Need to claim a profile?
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>
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
        <div className="flex items-center gap-2">
          <Link
            href="/claim-artist"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Claim Artist
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
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
