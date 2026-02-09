"use client";

import { usePlayerStore, useUIStore } from "@/stores";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  Heart,
  MoreHorizontal,
  Maximize2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();

  const { togglePlayerExpanded } = useUIStore();

  if (!currentSong) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        {/* Song Info */}
        <div className="flex w-[30%] min-w-0 items-center gap-3">
          <div
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted cursor-pointer group"
            onClick={togglePlayerExpanded}
          >
            {currentSong.artwork_url ? (
              <Image
                src={currentSong.artwork_url}
                alt={currentSong.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ListMusic className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <Link
              href={`/songs/${currentSong.slug || currentSong.id}`}
              className="block truncate font-medium hover:underline"
            >
              {currentSong.title}
            </Link>
            {currentSong.artist && (
              <Link
                href={`/artists/${currentSong.artist.slug || currentSong.artist.id}`}
                className="block truncate text-sm text-muted-foreground hover:underline"
              >
                {currentSong.artist.name}
              </Link>
            )}
          </div>
          <button className="ml-2 shrink-0 text-muted-foreground hover:text-foreground">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex w-[40%] flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`text-muted-foreground hover:text-foreground ${
                isShuffled ? "text-primary" : ""
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              onClick={previous}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-5 w-5" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`text-muted-foreground hover:text-foreground ${
                repeatMode !== "off" ? "text-primary" : ""
              }`}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex w-full max-w-md items-center gap-2">
            <span className="w-10 text-right text-xs text-muted-foreground">
              {formatDuration(currentTime)}
            </span>
            <div
              className="relative h-1 flex-1 cursor-pointer rounded-full bg-muted"
              onClick={handleProgressClick}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-foreground opacity-0 hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <span className="w-10 text-xs text-muted-foreground">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Additional Controls */}
        <div className="flex w-[30%] items-center justify-end gap-3">
          <button className="text-muted-foreground hover:text-foreground">
            <ListMusic className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
            />
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
