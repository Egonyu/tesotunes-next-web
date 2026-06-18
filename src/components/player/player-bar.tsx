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
  Maximize2,
  Minimize2,
  ChevronUp,
  X,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDuration, cn } from "@/lib/utils";
import { StreamingQualityPicker } from "@/components/player/StreamingQualityPicker";

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
    resumePosition,
    showResumePrompt,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    clearQueue,
    setShowResumePrompt,
  } = usePlayerStore();

  const { togglePlayerExpanded, playerMinimized, setPlayerMinimized } = useUIStore();

  if (!currentSong) {
    return null;
  }

  const currentArtwork = currentSong.artwork_url || currentSong.album?.artwork_url;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  // Resume marker as a percentage of total duration
  const resumeMarkerPct =
    resumePosition && duration > 0
      ? Math.min((resumePosition / duration) * 100, 100)
      : null;
  // Only show resume marker if it's meaningfully ahead of current playhead and not at the very end
  const showResumeMarker =
    resumeMarkerPct !== null &&
    resumeMarkerPct > progress + 1 &&
    resumeMarkerPct < 92;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleDismiss = () => {
    setPlayerMinimized(true);
  };

  const handleResumeAccept = () => {
    if (resumePosition) {
      seek(resumePosition);
    }
    setShowResumePrompt(false);
  };

  const handleResumeDismiss = () => {
    setShowResumePrompt(false);
  };

  // Minimized: small floating pill above mobile nav
  if (playerMinimized) {
    return (
      <div className="fixed bottom-[5.5rem] right-4 lg:bottom-4 z-40 flex items-center gap-2 rounded-full bg-background/95 border shadow-lg px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
          {currentArtwork ? (
            <Image
              src={currentArtwork}
              alt={currentSong.title}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ListMusic className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block">
          {currentSong.title}
        </span>
        <button
          onClick={isPlaying ? pause : resume}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
        <button
          onClick={() => setPlayerMinimized(false)}
          className="text-muted-foreground hover:text-foreground"
          title="Expand player"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile expanded player: horizontal lane beside FAB */}
      <div className="fixed bottom-[5.5rem] left-[calc(1rem+3.5rem+0.75rem)] right-4 z-40 rounded-2xl border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">

        {/* Mobile resume prompt */}
        {showResumePrompt && resumePosition && resumePosition > 5 && (
          <div className="flex items-center justify-between gap-2 rounded-t-2xl border-b border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <RotateCcw className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="truncate text-[11px] text-amber-700 dark:text-amber-400">
                Stopped at {formatDuration(resumePosition)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleResumeAccept}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Resume
              </button>
              <button
                onClick={handleResumeDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile progress bar with resume marker */}
        <div
          className="relative h-0.5 bg-muted cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Resume position marker */}
          {showResumeMarker && (
            <div
              className="pointer-events-none absolute top-0 h-full w-0.5 rounded-full bg-amber-400/80"
              style={{ left: `${resumeMarkerPct}%` }}
            />
          )}
        </div>

        <div className="flex h-12 items-center gap-2 px-2.5">
          <div
            className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-muted cursor-pointer group"
            onClick={togglePlayerExpanded}
          >
            {currentArtwork ? (
              <Image
                src={currentArtwork}
                alt={currentSong.title}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ListMusic className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/songs/${currentSong.slug || currentSong.id}`}
              className="block truncate text-xs font-semibold hover:underline"
            >
              {currentSong.title}
            </Link>
            {currentSong.artist && (
              <Link
                href={`/artists/${currentSong.artist.slug || currentSong.artist.id}`}
                className="block truncate text-[11px] text-muted-foreground hover:underline"
              >
                {currentSong.artist.name}
              </Link>
            )}
          </div>
          <button
            onClick={previous}
            className="text-muted-foreground hover:text-foreground"
            title="Previous"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
          <button
            onClick={next}
            className="text-muted-foreground hover:text-foreground"
            title="Next"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            title="Minimize player"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Desktop full player bar */}
      <div className="fixed hidden lg:block bottom-[4.5rem] left-0 right-0 lg:bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-xl lg:rounded-none shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">

        {/* Desktop resume prompt — sits above the main bar content */}
        {showResumePrompt && resumePosition && resumePosition > 5 && (
          <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-1">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-400">
                You stopped at {formatDuration(resumePosition)} last time — continue from there?
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResumeAccept}
                className="text-xs font-semibold text-amber-700 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Resume
              </button>
              <button
                onClick={handleResumeDismiss}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        <div className="flex h-[72px] items-center justify-between px-3 lg:px-4">
          {/* Song Info */}
          <div className="flex flex-1 lg:w-[30%] min-w-0 items-center gap-3">
            <div
              className="relative h-12 w-12 lg:h-14 lg:w-14 shrink-0 overflow-hidden rounded-md bg-muted cursor-pointer group"
              onClick={togglePlayerExpanded}
            >
              {currentArtwork ? (
                <Image
                  src={currentArtwork}
                  alt={currentSong.title}
                  fill
                  unoptimized
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
                className="block truncate text-sm font-medium hover:underline"
              >
                {currentSong.title}
              </Link>
              {currentSong.artist && (
                <Link
                  href={`/artists/${currentSong.artist.slug || currentSong.artist.id}`}
                  className="block truncate text-xs text-muted-foreground hover:underline"
                >
                  {currentSong.artist.name}
                </Link>
              )}
            </div>
            <button className="ml-1 shrink-0 text-muted-foreground hover:text-foreground hidden sm:block">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Player Controls - Desktop */}
          <div className="hidden lg:flex w-[40%] flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isShuffled && "text-primary"
                )}
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
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  repeatMode !== "off" && "text-primary"
                )}
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
                className="relative h-1 flex-1 cursor-pointer rounded-full bg-muted group"
                onClick={handleProgressClick}
              >
                {/* Playback fill */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
                {/* Resume position marker — amber tick, non-blocking */}
                {showResumeMarker && (
                  <div
                    className="pointer-events-none absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-amber-400/90"
                    style={{ left: `${resumeMarkerPct}%` }}
                    title={`Last stopped at ${formatDuration(resumePosition!)}`}
                  />
                )}
                {/* Hover playhead handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>
              <span className="w-10 text-xs text-muted-foreground">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Additional Controls */}
          <div className="hidden lg:flex w-[30%] items-center justify-end gap-3">
            <StreamingQualityPicker />
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
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
              title="Minimize player"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => { clearQueue(); }}
              className="text-muted-foreground hover:text-red-500"
              title="Close player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
