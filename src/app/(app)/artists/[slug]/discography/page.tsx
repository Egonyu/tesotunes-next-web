"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Disc3, Loader2, Music, Play } from "lucide-react";
import { useArtist, usePublicArtistAlbums } from "@/hooks/api";
import { formatNumber } from "@/lib/utils";
import type { Album } from "@/types";
import { SafeImage } from "@/components/ui/safe-image";

function ReleaseCard({ release }: { release: Album }) {
  return (
    <Link href={`/albums/${release.slug || release.id}`} className="group min-w-0 overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary">
      <div className="relative aspect-square bg-muted">
        {release.artwork_url ? (
          <SafeImage src={release.artwork_url} alt={release.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" fallback={<Disc3 className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />} />
        ) : (
          <Disc3 className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary shadow-lg"><Play className="ml-0.5 h-5 w-5 text-primary-foreground" /></span>
        </div>
      </div>
      <div className="min-w-0 p-3 sm:p-4">
        <h2 className="truncate font-bold transition-colors group-hover:text-primary">{release.title}</h2>
        <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
          {release.release_date ? new Date(release.release_date).getFullYear() : "Release"} · {release.total_tracks || 0} tracks
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{formatNumber(release.play_count || 0)} plays</p>
      </div>
    </Link>
  );
}

export default function ArtistDiscographyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: artist, isLoading: artistLoading, isError: artistError } = useArtist(slug);
  const { data: albumsData, isLoading: albumsLoading } = usePublicArtistAlbums(artist?.id || 0, { enabled: Boolean(artist?.id) });
  const releases = albumsData?.data ?? [];

  if (artistLoading || albumsLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (artistError || !artist) {
    return (
      <div className="py-16 text-center">
        <Disc3 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Artist Not Found</h1>
        <Link href="/artists" className="text-primary hover:underline">Browse artists</Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 py-5 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <Link href={`/artists/${slug}`} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to {artist.name}
        </Link>
        <h1 className="break-words text-2xl font-bold [overflow-wrap:anywhere] sm:text-3xl">{artist.name}&apos;s discography</h1>
        <p className="mt-1 text-sm text-muted-foreground">{releases.length} release{releases.length === 1 ? "" : "s"}</p>
      </header>

      {releases.length > 0 ? (
        <section>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {releases.map((release) => <ReleaseCard key={release.id} release={release} />)}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border bg-card px-4 py-14 text-center">
          <Music className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-medium">No releases yet</h2>
          <p className="text-sm text-muted-foreground">{artist.name} hasn&apos;t released any albums or EPs yet.</p>
        </div>
      )}
    </div>
  );
}
