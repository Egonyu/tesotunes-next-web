"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Disc3, Music, Play, Calendar, Clock, ChevronLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDuration, formatDate, formatNumber } from "@/lib/utils";

interface Album {
  id: number;
  title: string;
  slug: string;
  cover_url: string | null;
  release_date: string;
  type: "album" | "single" | "ep" | "compilation";
  tracks_count: number;
  total_duration: number;
  play_count: number;
}

interface ArtistDiscography {
  artist: {
    id: number;
    name: string;
    slug: string;
    avatar_url: string | null;
  };
  albums: Album[];
  singles: Album[];
  eps: Album[];
  compilations: Album[];
  total_releases: number;
}

function ReleaseCard({ release }: { release: Album }) {
  return (
    <Link
      href={`/albums/${release.slug}`}
      className="group bg-card rounded-lg border overflow-hidden hover:border-primary transition-colors"
    >
      <div className="relative aspect-square bg-muted">
        {release.cover_url ? (
          <Image
            src={release.cover_url}
            alt={release.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Disc3 className="absolute inset-0 m-auto h-16 w-16 text-muted-foreground" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Play className="h-6 w-6 text-primary-foreground ml-1" />
          </div>
        </div>
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded capitalize">
          {release.type}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold truncate group-hover:text-primary transition-colors">
          {release.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span>{new Date(release.release_date).getFullYear()}</span>
          <span>•</span>
          <span>{release.tracks_count} tracks</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {formatNumber(release.play_count)} plays
        </p>
      </div>
    </Link>
  );
}

export default function ArtistDiscographyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: discography, isLoading } = useQuery({
    queryKey: ["artist-discography", slug],
    queryFn: () => apiGet<ArtistDiscography>(`/api/artists/${slug}/discography`),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!discography) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Disc3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Artist Not Found</h1>
        <Link href="/browse" className="text-primary hover:underline">
          Browse Music
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/artists/${slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {discography.artist.name}
        </Link>
        <h1 className="text-3xl font-bold">Discography</h1>
        <p className="text-muted-foreground mt-1">
          {discography.total_releases} releases
        </p>
      </div>

      {/* Albums */}
      {discography.albums.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Disc3 className="h-6 w-6" />
            Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {discography.albums.map((album) => (
              <ReleaseCard key={album.id} release={album} />
            ))}
          </div>
        </section>
      )}

      {/* EPs */}
      {discography.eps.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Music className="h-6 w-6" />
            EPs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {discography.eps.map((ep) => (
              <ReleaseCard key={ep.id} release={ep} />
            ))}
          </div>
        </section>
      )}

      {/* Singles */}
      {discography.singles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Singles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {discography.singles.map((single) => (
              <ReleaseCard key={single.id} release={single} />
            ))}
          </div>
        </section>
      )}

      {/* Compilations */}
      {discography.compilations.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Compilations & Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {discography.compilations.map((comp) => (
              <ReleaseCard key={comp.id} release={comp} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {discography.total_releases === 0 && (
        <div className="text-center py-16 bg-card rounded-lg border">
          <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No releases yet</h2>
          <p className="text-muted-foreground">
            This artist hasn't released any music yet.
          </p>
        </div>
      )}
    </div>
  );
}
