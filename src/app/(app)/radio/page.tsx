"use client";

import { useState } from "react";
import Link from "next/link";
import { Radio as RadioIcon, Play, Pause, Volume2, Heart, Loader2, ArrowRight } from "lucide-react";
import { useRadioStations, useFeaturedStation, type RadioStation } from "@/hooks/useRadio";
import { SafeImage, InitialsAvatar } from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";

function RadioCard({
  station,
  isPlaying,
  onPlay,
}: {
  station: RadioStation;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-card/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
        {station.image ? (
          <SafeImage
            src={station.image}
            alt={station.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            fallback={<InitialsAvatar name={station.name} className="h-full w-full text-4xl" textClassName="text-4xl" />}
            sizes="320px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <RadioIcon className="h-16 w-16 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {station.isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </div>
        </button>
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold">{station.name}</h3>
        <p className="text-sm text-muted-foreground">{station.genre}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {station.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {station.listeners.toLocaleString()} listening
          </span>
          <div className="flex items-center gap-1">
            <button className="rounded-full p-1.5 transition-colors hover:bg-accent">
              <Heart className="h-4 w-4" />
            </button>
            <Link
              href={station.href}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
            >
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RadioPage() {
  const [playingStation, setPlayingStation] = useState<string | null>(null);
  const { data: stations = [], isLoading, isError } = useRadioStations();
  const { data: featured } = useFeaturedStation();

  const featuredStation = featured || stations[0];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <RadioIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Radio</h1>
            <p className="text-muted-foreground">Live radio stations curated for you</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <RadioIcon className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">No radio stations available</p>
          <p className="text-sm mt-1">Radio stations will appear here once configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <RadioIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Radio</h1>
          <p className="text-muted-foreground">
            Featured stations, lean-back mixes, and playlist radio built for long sessions
          </p>
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          Radio stations loaded with fallback data only. Some live metadata may be unavailable right now.
        </div>
      ) : null}

      {/* Featured Station */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-primary via-primary/80 to-primary/55 p-8 text-white shadow-[0_24px_80px_rgba(16,185,129,0.18)]">
        {featuredStation?.image ? (
          <div className="absolute inset-0 opacity-20">
            <SafeImage
              src={featuredStation.image}
              alt={featuredStation.name}
              fill
              className="object-cover"
              fallback={<div className="h-full w-full bg-transparent" />}
              sizes="1200px"
            />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,0,0,0.1),rgba(0,0,0,0.55))]" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
              featuredStation?.isLive ? "bg-red-500 text-white" : "bg-white/20 text-white"
            )}>
              <span className={cn("h-2 w-2 rounded-full", featuredStation?.isLive ? "bg-white animate-pulse" : "bg-white/80")} />
              {featuredStation?.isLive ? "LIVE STATION" : "FEATURED MIX"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {featuredStation?.name || 'Now Playing'}
          </h2>
          <p className="mb-2 text-white/90">
            {featuredStation?.genre || 'Tune in to radio-inspired programming'}
          </p>
          <p className="text-white/80 mb-6">
            {featuredStation?.description || 'Tune in to live radio'}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setPlayingStation(playingStation === (featuredStation?.id || "1") ? null : (featuredStation?.id || "1"))
              }
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition-colors"
            >
              {playingStation === (featuredStation?.id || "1") ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Listen Now
                </>
              )}
                </button>
            <Link
              href={featuredStation?.href || "/playlists"}
              className="flex items-center gap-2 rounded-full border-2 border-white/50 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Volume2 className="h-5 w-5" />
              {featuredStation?.listeners?.toLocaleString() || '0'} listening
            </Link>
          </div>
        </div>
      </section>

      {/* All Stations */}
      <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">All Stations</h2>
          <p className="text-sm text-muted-foreground">
            Browse featured radio playlists and always-on mixes from across the catalog
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {stations.map((station) => (
          <RadioCard
            key={station.id}
            station={station}
            isPlaying={playingStation === station.id}
            onPlay={() =>
              setPlayingStation(
                playingStation === station.id ? null : station.id
              )
            }
          />
        ))}
      </div>
      </section>
    </div>
  );
}
