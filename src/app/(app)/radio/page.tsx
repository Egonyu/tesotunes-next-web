"use client";

import { useState } from "react";
import { Radio as RadioIcon, Play, Pause, Volume2, Heart, Loader2 } from "lucide-react";
import { useRadioStations, useFeaturedStation, type RadioStation } from "@/hooks/useRadio";

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
    <div className="group relative rounded-xl bg-card border overflow-hidden hover:border-primary transition-colors">
      <div className="aspect-square relative bg-linear-to-br from-primary/20 to-primary/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <RadioIcon className="h-16 w-16 text-primary/50" />
        </div>
        {station.isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <h3 className="font-semibold truncate">{station.name}</h3>
        <p className="text-sm text-muted-foreground">{station.genre}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {station.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {station.listeners.toLocaleString()} listening
          </span>
          <button className="p-1.5 rounded-full hover:bg-accent transition-colors">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RadioPage() {
  const [playingStation, setPlayingStation] = useState<string | null>(null);
  const { data: stations = [], isLoading } = useRadioStations();
  const { data: featured } = useFeaturedStation();

  const featuredStation = featured || stations[0];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <RadioIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Radio</h1>
          <p className="text-muted-foreground">
            Live radio stations curated for you
          </p>
        </div>
      </div>

      {/* Featured Station */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-primary to-primary/60 p-8 mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              NOW PLAYING
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {featuredStation?.name || 'TesoTunes Hits'}
          </h2>
          <p className="text-white/80 mb-6">
            {featuredStation?.description || 'The hottest tracks from around the world'}
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
            <button className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white/50 text-white font-semibold hover:bg-white/10 transition-colors">
              <Volume2 className="h-5 w-5" />
              {featuredStation?.listeners?.toLocaleString() || '12.5k'} listening
            </button>
          </div>
        </div>
      </div>

      {/* All Stations */}
      <h2 className="text-xl font-bold mb-4">All Stations</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
    </div>
  );
}
