"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, User } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useRef } from "react";
import type { Artist, PaginatedResponse } from "@/types";
import { formatNumber } from "@/lib/utils";

export function ArtistCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["artists", "popular"],
    queryFn: () =>
      apiGet<PaginatedResponse<Artist>>("/artists/popular", {
        params: { limit: 12 },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const artists = data?.data || [];

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shrink-0 w-40 animate-pulse">
            <div className="aspect-square rounded-full bg-muted mb-3" />
            <div className="h-4 w-3/4 bg-muted rounded mx-auto" />
            <div className="h-3 w-1/2 bg-muted rounded mx-auto mt-2" />
          </div>
        ))}
      </div>
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
    <div className="relative group">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Artist Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {artists.map((artist) => (
          <Link
            key={artist.id}
            href={`/artists/${artist.slug || artist.id}`}
            className="group/card shrink-0 w-40 text-center"
          >
            {/* Artist Image */}
            <div className="relative aspect-square mb-3 overflow-hidden rounded-full bg-muted">
              {artist.profile_image_url ? (
                <Image
                  src={artist.profile_image_url}
                  alt={artist.name}
                  fill
                  className="object-cover transition-transform group-hover/card:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
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
            <p className="text-sm text-muted-foreground">
              {formatNumber(artist.follower_count || 0)} followers
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
