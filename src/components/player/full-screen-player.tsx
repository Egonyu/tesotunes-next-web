"use client";

import { useState, useRef, useEffect } from "react";
import { usePlayerStore, useUIStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
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
  ChevronDown,
  Share2,
  MoreHorizontal,
  Music,
  X,
  Mic2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ActivePanel = "none" | "queue" | "lyrics";

export function FullScreenPlayer() {
  const {
    currentSong,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    queue,
    queueIndex,
    playbackRate,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    play,
    removeFromQueue,
    setPlaybackRate,
  } = usePlayerStore();

  const { playerExpanded, setPlayerExpanded, queueVisible, toggleQueue, setQueueVisible } = useUIStore();

  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>("none");
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Fetch lyrics for the current song from API (song detail includes lyrics)
  const { data: songDetail } = useQuery({
    queryKey: ["song-lyrics", currentSong?.id],
    queryFn: () =>
      apiGet<{ data: { lyrics?: string } }>(`/api/songs/${currentSong?.slug || currentSong?.id}`).then(
        (res) => res.data
      ),
    enabled: !!currentSong && activePanel === "lyrics",
    staleTime: 5 * 60 * 1000,
  });

  const lyrics = songDetail?.lyrics || currentSong?.lyrics;

  // Sync queue panel visibility with activePanel
  useEffect(() => {
    if (queueVisible && activePanel !== "queue") {
      setActivePanel("queue");
    }
  }, [queueVisible, activePanel]);

  if (!currentSong || !playerExpanded) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(percent * duration, duration)));
  };

  const handleProgressTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const percent = (touch.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(percent * duration, duration)));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleClose = () => {
    setPlayerExpanded(false);
    setQueueVisible(false);
    setShowSpeedPicker(false);
    setActivePanel("none");
  };

  const toggleLyricsPanel = () => {
    if (activePanel === "lyrics") {
      setActivePanel("none");
    } else {
      setActivePanel("lyrics");
      setQueueVisible(false);
    }
  };

  const toggleQueuePanel = () => {
    if (activePanel === "queue") {
      setActivePanel("none");
      setQueueVisible(false);
    } else {
      setActivePanel("queue");
      setQueueVisible(true);
    }
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const upcomingQueue = queue.slice(queueIndex + 1);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col transition-transform duration-300 ease-in-out",
        "bg-linear-to-b from-zinc-900 via-zinc-950 to-black text-white",
        playerExpanded ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={handleClose}
          className="rounded-full p-2 hover:bg-white/10 transition-colors"
          aria-label="Minimize player"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-400">
            Now Playing
          </p>
          {currentSong.album && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {currentSong.album.title}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setShowSpeedPicker(false);
              toggleLyricsPanel();
            }}
            className={cn(
              "rounded-full p-2 transition-colors",
              activePanel === "lyrics"
                ? "bg-white/10 text-primary"
                : "hover:bg-white/10 text-zinc-400 hover:text-white"
            )}
            aria-label="Toggle lyrics"
          >
            <Mic2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              setShowSpeedPicker(false);
              toggleQueuePanel();
            }}
            className={cn(
              "rounded-full p-2 transition-colors",
              activePanel === "queue"
                ? "bg-white/10 text-primary"
                : "hover:bg-white/10 text-zinc-400 hover:text-white"
            )}
            aria-label="Toggle queue"
          >
            <ListMusic className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Player Content */}
        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center px-8 transition-all duration-300",
            activePanel !== "none" ? "w-1/2" : "w-full"
          )}
        >
          {/* Artwork */}
          <div className="relative mb-8 aspect-square w-full max-w-[min(400px,50vh)] overflow-hidden rounded-lg shadow-2xl shadow-black/50">
            {currentSong.artwork_url ? (
              <Image
                src={currentSong.artwork_url}
                alt={currentSong.title}
                fill
                className={cn(
                  "object-cover transition-transform duration-700",
                  isPlaying && "scale-105"
                )}
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                <Music className="h-24 w-24 text-zinc-600" />
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="mb-6 w-full max-w-md text-center">
            <Link
              href={`/songs/${currentSong.slug || currentSong.id}`}
              onClick={handleClose}
              className="block text-xl font-bold hover:underline truncate"
            >
              {currentSong.title}
            </Link>
            {currentSong.artist && (
              <Link
                href={`/artists/${currentSong.artist.slug || currentSong.artist.id}`}
                onClick={handleClose}
                className="mt-1 block text-base text-zinc-400 hover:text-zinc-200 truncate"
              >
                {currentSong.artist.name}
              </Link>
            )}
            {currentSong.genres && currentSong.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {currentSong.genres.slice(0, 3).map((genre: { id: number; name: string }) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-zinc-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6 w-full max-w-md">
            <div
              className="group relative h-1.5 cursor-pointer rounded-full bg-white/20"
              onClick={handleProgressClick}
              onTouchMove={handleProgressTouch}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="mb-6 flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={cn(
                "p-2 transition-colors",
                isShuffled
                  ? "text-primary"
                  : "text-zinc-400 hover:text-white"
              )}
              aria-label={isShuffled ? "Disable shuffle" : "Enable shuffle"}
            >
              <Shuffle className="h-5 w-5" />
            </button>
            <button
              onClick={previous}
              className="p-2 text-zinc-300 hover:text-white transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="h-7 w-7" />
            </button>
            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7" />
              ) : (
                <Play className="h-7 w-7 ml-1" />
              )}
            </button>
            <button
              onClick={next}
              className="p-2 text-zinc-300 hover:text-white transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="h-7 w-7" />
            </button>
            <button
              onClick={toggleRepeat}
              className={cn(
                "p-2 transition-colors",
                repeatMode !== "off"
                  ? "text-primary"
                  : "text-zinc-400 hover:text-white"
              )}
              aria-label={`Repeat: ${repeatMode}`}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="h-5 w-5" />
              ) : (
                <Repeat className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Bottom Controls Row */}
          <div className="flex w-full max-w-md items-center justify-between">
            {/* Heart / Like */}
            <button
              className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Like"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* Playback Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedPicker((v) => !v)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  playbackRate !== 1
                    ? "bg-primary/20 text-primary"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                )}
                aria-label="Playback speed"
              >
                {playbackRate}x
              </button>
              {showSpeedPicker && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg bg-zinc-800 border border-zinc-700 py-1 shadow-xl">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackRate(speed);
                        setShowSpeedPicker(false);
                      }}
                      className={cn(
                        "block w-full px-6 py-1.5 text-sm text-left hover:bg-white/10 transition-colors whitespace-nowrap",
                        playbackRate === speed
                          ? "text-primary font-semibold"
                          : "text-zinc-300"
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
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
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/20 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            {/* Share */}
            <button
              className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Lyrics Panel */}
        {activePanel === "lyrics" && (
          <div className="w-1/2 max-w-md border-l border-white/10 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="font-semibold text-lg">Lyrics</h3>
              <button
                onClick={() => setActivePanel("none")}
                className="rounded-full p-1 hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div ref={lyricsRef} className="flex-1 overflow-y-auto px-6 py-4">
              {lyrics ? (
                <div className="space-y-4">
                  {lyrics.split("\n\n").map((verse, i) => (
                    <p
                      key={i}
                      className="text-base leading-relaxed text-zinc-300 whitespace-pre-wrap"
                    >
                      {verse}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Mic2 className="h-12 w-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-400 font-medium">No lyrics available</p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Lyrics haven&apos;t been added to this track yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Queue Panel */}
        {activePanel === "queue" && (
          <div className="w-1/2 max-w-md border-l border-white/10 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="font-semibold text-lg">Queue</h3>
              <button
                onClick={() => { setActivePanel("none"); setQueueVisible(false); }}
                className="rounded-full p-1 hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Now Playing */}
            <div className="border-b border-white/10 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Now Playing
              </p>
              <div className="flex items-center gap-3 rounded-md bg-white/5 p-2">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-800">
                  {currentSong.artwork_url ? (
                    <Image
                      src={currentSong.artwork_url}
                      alt={currentSong.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-4 w-4 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {currentSong.title}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {currentSong.artist?.name}
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {formatDuration(duration)}
                </span>
              </div>
            </div>

            {/* Up Next */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Up Next · {upcomingQueue.length} tracks
              </p>
              {upcomingQueue.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-500">
                  No tracks in queue
                </p>
              ) : (
                <div className="space-y-1">
                  {upcomingQueue.map((song, index) => (
                    <div
                      key={`${song.id}-${index}`}
                      className="group flex items-center gap-3 rounded-md p-2 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => play(song, queue)}
                    >
                      <span className="w-5 text-center text-xs text-zinc-500 group-hover:hidden">
                        {index + 1}
                      </span>
                      <button
                        className="hidden w-5 group-hover:flex items-center justify-center"
                        aria-label={`Play ${song.title}`}
                      >
                        <Play className="h-3 w-3 text-white" />
                      </button>
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-zinc-800">
                        {song.artwork_url ? (
                          <Image
                            src={song.artwork_url}
                            alt={song.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Music className="h-3 w-3 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-200">
                          {song.title}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {song.artist?.name}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(queueIndex + 1 + index);
                        }}
                        className="hidden shrink-0 rounded p-1 text-zinc-500 hover:text-white group-hover:block"
                        aria-label="Remove from queue"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
