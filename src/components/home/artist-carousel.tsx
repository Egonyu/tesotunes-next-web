"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Play, User, Headphones } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Artist, PaginatedResponse } from "@/types";
import { formatNumber } from "@/lib/utils";
import { InitialsAvatar, SafeImage } from "@/components/ui/safe-image";
import { pickMediaUrl } from "@/lib/media";
import { SnapCarousel } from "@/components/ui/snap-carousel";

export function ArtistCarousel() {
  const { data, isLoading } = useQuery({
    queryKey: ["artists", "popular"],
    queryFn: () =>
      apiGet<PaginatedResponse<Artist>>("/artists", {
        params: { limit: 12, sort: "-followers_count" },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const artists = data?.data || [];

  if (isLoading) {
    return (
      <SnapCarousel variant="compact" arrows>
        {Array.from({ length: 6 }).map((_, i) => (
          <SnapCarousel.Item key={i} className="sm:w-40">
            <div className="animate-pulse">
              <div className="aspect-square rounded-full bg-muted mb-3" />
              <div className="h-4 w-3/4 bg-muted rounded mx-auto" />
              <div className="h-3 w-1/2 bg-muted rounded mx-auto mt-2" />
            </div>
          </SnapCarousel.Item>
        ))}
      </SnapCarousel>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No artists available</p>
      </div>
    );
  }

  return (
    <SnapCarousel variant="compact" arrows>
      {artists.map((artist) => {
        const imageSrc = pickMediaUrl(
          artist.avatar_url,
          artist.profile_image_url,
          artist.cover_image_url,
          artist.cover_url
        );

        return (
          <SnapCarousel.Item key={artist.id} className="sm:w-40">
          <Link
            href={`/artists/${artist.slug || artist.id}`}
            className="group/card block text-center"
          >
            {/* Artist Image */}
            <div className="relative aspect-square mb-3 overflow-hidden rounded-full bg-muted">
              {imageSrc ? (
                <SafeImage
                  src={imageSrc}
                  alt={artist.name}
                  fill
                  className="object-cover transition-transform group-hover/card:scale-105"
                  fallback={<InitialsAvatar name={artist.name} textClassName="text-5xl font-normal" />}
                />
              ) : (
                <InitialsAvatar name={artist.name} textClassName="text-5xl font-normal" />
              )}

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Play className="h-5 w-5 ml-0.5" />
                </div>
              </div>
            </div>

            {/* Artist Info */}
            <h3 className="font-medium truncate group-hover/card:text-primary transition-colors">
              {artist.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Headphones className="h-3 w-3" />
              {formatNumber(artist.total_plays || 0)} plays
            </p>
          </Link>
          </SnapCarousel.Item>
        )})}
    </SnapCarousel>
  );
}
