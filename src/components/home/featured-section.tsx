"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import type { Song, PaginatedResponse } from "@/types";
import { usePlayerStore } from "@/stores";
import { FEATURED_CONTENT_ENABLED } from "@/lib/features";

interface FeaturedItem {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  type: "song" | "album" | "artist" | "playlist" | "event";
  song?: Song;
}

export function FeaturedSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { play } = usePlayerStore();

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const res = await apiGet<{ data: FeaturedItem[] }>("/featured");
      return res.data;
    },
    enabled: FEATURED_CONTENT_ENABLED,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Fallback: fetch top songs when /featured has no data
  const { data: topSongs, isLoading: songsLoading } = useQuery({
    queryKey: ["featured-fallback-songs"],
    queryFn: async () => {
      const res = await apiGet<PaginatedResponse<Song>>("/songs", {
        params: { limit: 5, sort: "-play_count" },
      });
      return res.data;
    },
    enabled: !featuredLoading && (!featured || featured.length === 0),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = featuredLoading || (!featured?.length && songsLoading);

  // Build items from API featured data, or fall back to top songs
  const items: FeaturedItem[] = featured?.length
    ? featured
    : (topSongs || []).map((song) => ({
        id: song.id,
        title: song.title,
        subtitle: `${song.artist.name} · ${new Intl.NumberFormat().format(song.play_count)} plays`,
        image_url: song.artwork_url || "",
        link: `/songs/${song.slug}`,
        type: "song" as const,
        song,
      }));

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  };

  // Auto-advance every 6 seconds, pause on hover
  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, items.length, nextSlide]);

  if (isLoading) {
    return (
      <div className="relative h-64 md:h-80 lg:h-96 rounded-xl bg-muted animate-pulse" />
    );
  }

  if (items.length === 0) {
    return (
      <section className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-linear-to-br from-primary/20 to-primary/5">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome to TesoTunes
          </h2>
          <p className="text-muted-foreground max-w-md">
            Discover the best East African music, artists, and playlists
          </p>
        </div>
      </section>
    );
  }

  const currentItem = items[currentSlide];

  return (
    <section
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {currentItem.image_url ? (
            <Image
              src={currentItem.image_url}
              alt={currentItem.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-primary/20 to-primary/5" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-wider text-white/70 mb-2 block">
              {currentItem.type}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              {currentItem.title}
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-4">
              {currentItem.subtitle}
            </p>
            <div className="flex items-center gap-3">
              {currentItem.song && (
                <button
                  onClick={() => currentItem.song && play(currentItem.song)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  <Play className="h-5 w-5" />
                  Play Now
                </button>
              )}
              <Link
                href={currentItem.link}
                className="px-6 py-2.5 rounded-full font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                View More
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
